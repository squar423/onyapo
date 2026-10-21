export type Setting='home'|'gym';
export type Phase='warmup'|'strength'|'cooldown';
export interface Exercise {id:string;name:string;region:string;setting:Setting;category:string;primary:string[];assisting:string[];stabilizers:string[];stretched:string[];tendons:string;ligamentContext:string;instructions:string;equipment:string;sourceDosage:string;safety:string;reference:string;evidence:string}
export interface Muscle {name:string;compartment:string;roles:string;actions:string;origin:string;insertion:string;nerve:string;roots:string;tendons:string;ligaments:string;typeI:string;typeII:string;fiberProfile:string;fiberCaveat:string;reference:string}
export interface SetMetrics {weightKg?:number;bandLevel?:'light'|'medium'|'heavy';bandCount?:number}
export interface Slot {slotId:string;exerciseId:string;phase:Phase;setDone:boolean[];metrics:SetMetrics[];skipped?:string}
export interface Session {id:string;createdAt:string;setting:Setting;slots:Slot[];completedAt?:string;abandoned?:boolean}
export interface AvatarConfig {skin:string;hairColor:string;hairStyle:string;texture:string;height:number;width:number;facialHair:string;glasses:string;hat:string;eyeStyle:string;expression:string;faceShape:string;eyebrowStyle:string;eyeColor:string;earrings:string}
export interface Profile {id:string;username:string;friend_code:string;bio:string;avatar:AvatarConfig;tutorial_done:boolean;share_activity:boolean}
export interface Stats {xp:number;completed_workouts:number}
export interface Friend {id:string;username:string;friend_code:string;bio:string;avatar:AvatarConfig}
export interface FriendRequest {id:string;from_user:string;to_user:string;status:string;created_at:string}
export interface FriendActivity {id:string;user_id:string;username:string;setting:Setting;completed_at:string;exercise_count:number}
export interface Encouragement {id:string;from_user:string;to_user:string;template_key:string;workout_summary:string|null;created_at:string}
