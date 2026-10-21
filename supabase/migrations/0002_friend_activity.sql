-- Onyapo optional friend activity. RUN ONCE in the existing Supabase project.
-- Existing accounts/workouts/XP are preserved. Sharing defaults OFF.
ALTER TABLE public.profiles
 ADD COLUMN IF NOT EXISTS share_activity boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.friend_activity_feed(p_limit integer DEFAULT 30)
RETURNS TABLE(
 id uuid,
 user_id uuid,
 username text,
 setting text,
 completed_at timestamptz,
 exercise_count integer
)
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = ''
AS $$
 SELECT w.id,w.user_id,p.username,w.setting,w.completed_at,
  (SELECT count(*)::integer FROM jsonb_array_elements(
    CASE WHEN jsonb_typeof(w.plan->'slots')='array' THEN w.plan->'slots' ELSE '[]'::jsonb END
  ) slot WHERE slot->>'phase'='strength' AND NOT slot ? 'skipped')
 FROM public.workouts w
 JOIN public.profiles p ON p.id=w.user_id
 WHERE auth.uid() IS NOT NULL
   AND w.completed_at IS NOT NULL
   AND p.share_activity=true
   AND w.user_id <> auth.uid()
   AND EXISTS (
    SELECT 1 FROM public.friend_requests fr
    WHERE fr.status='accepted' AND
      ((fr.from_user=auth.uid() AND fr.to_user=w.user_id)
        OR (fr.to_user=auth.uid() AND fr.from_user=w.user_id))
   )
 ORDER BY w.completed_at DESC
 LIMIT LEAST(GREATEST(coalesce(p_limit,30),1),50);
$$;
REVOKE ALL ON FUNCTION public.friend_activity_feed(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.friend_activity_feed(integer) TO authenticated;
COMMENT ON FUNCTION public.friend_activity_feed(integer) IS
 'Recent completed sessions from accepted friends who opted into sharing. No set metrics or health detail is shared.';
