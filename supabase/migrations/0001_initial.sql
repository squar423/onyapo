-- Onyapo: run once in Supabase Dashboard > SQL Editor.
-- IMPORTANT: also enable Confirm email in Authentication > Providers > Email.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 username text not null unique check (username ~ '^[A-Za-z0-9_]{3,24}$'),
 friend_code text not null unique,
 bio text not null default '' check (char_length(bio)<=200),
 avatar jsonb not null default '{"skin":"#AD7356","hairColor":"#22252B","hairStyle":"rounded","texture":"curly","height":50,"width":50}'::jsonb,
 tutorial_done boolean not null default false,
 created_at timestamptz not null default now()
);
create index if not exists idx_profiles_username on public.profiles(username);
create index if not exists idx_profiles_friend_code on public.profiles(friend_code);
create table if not exists public.profile_stats (
 id uuid primary key references auth.users(id) on delete cascade,
 xp integer not null default 0 check (xp>=0),
 completed_workouts integer not null default 0 check (completed_workouts>=0)
);
create table if not exists public.workouts (
 id uuid primary key,
 user_id uuid not null references auth.users(id) on delete cascade,
 setting text not null check (setting in ('home','gym')),
 plan jsonb not null,
 created_at timestamptz not null default now(),
 completed_at timestamptz,
 exp_awarded boolean not null default false
);
create index if not exists idx_workouts_user_time on public.workouts(user_id,created_at desc);
create table if not exists public.friend_requests (
 id uuid primary key default gen_random_uuid(),
 from_user uuid not null references public.profiles(id) on delete cascade,
 to_user uuid not null references public.profiles(id) on delete cascade,
 status text not null default 'pending' check (status in ('pending','accepted','declined')),
 created_at timestamptz not null default now(),
 check (from_user<>to_user)
);
create unique index if not exists idx_friend_pair on public.friend_requests (least(from_user,to_user),greatest(from_user,to_user));
create table if not exists public.encouragements (
 id uuid primary key default gen_random_uuid(),
 from_user uuid not null references public.profiles(id) on delete cascade,
 to_user uuid not null references public.profiles(id) on delete cascade,
 template_key text not null check (template_key in ('proud','keep_going','you_got_this','workout_share')),
 workout_summary text check (char_length(workout_summary)<=180),
 created_at timestamptz not null default now(),
 check (from_user<>to_user)
);
create index if not exists idx_encouragements_recipient on public.encouragements(to_user,created_at desc);

create or replace function public.on_new_user() returns trigger language plpgsql security definer set search_path='' as $$
declare n text;
begin
 n:=coalesce(new.raw_user_meta_data->>'username','');
 if n !~ '^[A-Za-z0-9_]{3,24}$' or exists(select 1 from public.profiles where username=n) then
   n:='member_'||substring(replace(new.id::text,'-',''),1,12);
 end if;
 insert into public.profiles (id,username,friend_code) values
 (new.id,n,'VM-'||upper(substring(encode(gen_random_bytes(6),'hex'),1,10)));
 insert into public.profile_stats (id) values (new.id);
 return new;
end;$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.on_new_user();

alter table public.profiles enable row level security;
alter table public.profile_stats enable row level security;
alter table public.workouts enable row level security;
alter table public.friend_requests enable row level security;
alter table public.encouragements enable row level security;

create policy "profiles discoverable to signed in users" on public.profiles for select to authenticated using (true);
create policy "profiles editable by owner" on public.profiles for update to authenticated using (auth.uid()=id) with check (auth.uid()=id);
create policy "stats readable by owner" on public.profile_stats for select to authenticated using (auth.uid()=id);
create policy "workouts readable by owner" on public.workouts for select to authenticated using (auth.uid()=user_id);
create policy "workouts insertable by owner" on public.workouts for insert to authenticated with check (auth.uid()=user_id and completed_at is null and not exp_awarded);
create policy "incomplete workouts editable by owner" on public.workouts for update to authenticated using (auth.uid()=user_id and completed_at is null and not exp_awarded) with check (auth.uid()=user_id and completed_at is null and not exp_awarded);
create policy "request participants read" on public.friend_requests for select to authenticated using (auth.uid()=from_user or auth.uid()=to_user);
create policy "requests sent by owner" on public.friend_requests for insert to authenticated with check (auth.uid()=from_user and status='pending');
create policy "recipient answers request" on public.friend_requests for update to authenticated using (auth.uid()=to_user and status='pending') with check (auth.uid()=to_user and status in ('accepted','declined'));
create policy "encouragements visible to participants" on public.encouragements for select to authenticated using (auth.uid()=from_user or auth.uid()=to_user);
create policy "encouragements only to friends" on public.encouragements for insert to authenticated with check (
 auth.uid()=from_user and exists(
  select 1 from public.friend_requests fr where fr.status='accepted'
   and ((fr.from_user=auth.uid() and fr.to_user=encouragements.to_user)
     or (fr.to_user=auth.uid() and fr.from_user=encouragements.to_user))
 )
);

-- Friend codes are assigned by the database and should remain unique, stable identifiers.
create or replace function public.protect_profile_identity() returns trigger language plpgsql set search_path='' as $$
begin
 if new.friend_code<>old.friend_code or new.created_at<>old.created_at then
   raise exception 'Friend codes and creation dates are immutable';
 end if;
 return new;
end;$$;
drop trigger if exists protect_profile_identity on public.profiles;
create trigger protect_profile_identity before update on public.profiles for each row execute function public.protect_profile_identity();

-- Prevent users from rewriting an existing friend request's participants.
create or replace function public.protect_request() returns trigger language plpgsql set search_path='' as $$
begin
 if new.from_user<>old.from_user or new.to_user<>old.to_user or new.created_at<>old.created_at then
  raise exception 'Friend request participants cannot change';
 end if;
 if old.status<>'pending' or new.status not in ('accepted','declined') then
  raise exception 'Only pending requests may be answered';
 end if;
 return new;
end;$$;
drop trigger if exists protect_friend_request on public.friend_requests;
create trigger protect_friend_request before update on public.friend_requests for each row execute function public.protect_request();

-- Award exactly 20 XP once and only after a complete, minimally substantial session.
-- Game XP is motivational, not a fraud-resistant financial or competition system.
create or replace function public.finish_workout(p_workout_id uuid)
returns void language plpgsql security definer set search_path='' as $$
declare w record; count_strength int; is_unfinished boolean;
begin
 if auth.uid() is null then raise exception 'Authentication required'; end if;
 select * into w from public.workouts where id=p_workout_id and user_id=auth.uid() for update;
 if not found then raise exception 'Workout not found'; end if;
 if w.exp_awarded then raise exception 'XP already awarded for this workout'; end if;
 if jsonb_typeof(w.plan->'slots')<>'array' then raise exception 'Invalid workout plan'; end if;
 select count(*) into count_strength from jsonb_array_elements(w.plan->'slots') slot
 where slot->>'phase'='strength' and not (slot ? 'skipped') and
 jsonb_typeof(slot->'setDone')='array' and jsonb_array_length(slot->'setDone')=3 and
 not exists(select 1 from jsonb_array_elements(slot->'setDone') done where done<>'true'::jsonb);
 if count_strength<4 then raise exception 'At least four completed strength exercises are required'; end if;
 select exists(select 1 from jsonb_array_elements(w.plan->'slots') slot
 where not (slot ? 'skipped') and (
  jsonb_typeof(slot->'setDone')<>'array' or
  jsonb_array_length(slot->'setDone')=0 or
  exists(select 1 from jsonb_array_elements(slot->'setDone') done where done<>'true'::jsonb)
 )) into is_unfinished;
 if is_unfinished then raise exception 'Not all sets completed'; end if;
 update public.workouts set completed_at=now(),exp_awarded=true,plan=jsonb_set(plan,'{completedAt}',to_jsonb(now()::text),true) where id=p_workout_id;
 update public.profile_stats set xp=xp+20,completed_workouts=completed_workouts+1 where id=auth.uid();
end;$$;
revoke all on function public.finish_workout(uuid) from public;
grant execute on function public.finish_workout(uuid) to authenticated;
