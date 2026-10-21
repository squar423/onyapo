import type {AvatarConfig} from './types';

/** Keep older saved profiles compatible when avatar customization grows. */
export const DEFAULT_AVATAR:AvatarConfig={
 skin:'#AD7356',hairColor:'#22252B',hairStyle:'rounded',texture:'curly',
 height:50,width:50,facialHair:'none',glasses:'none',hat:'none',
 eyeStyle:'almond',expression:'smile',faceShape:'oval',eyebrowStyle:'soft',eyeColor:'#354e4e',earrings:'none'
};
export function normalizeAvatar(config?:Partial<AvatarConfig>|null):AvatarConfig{
 return {...DEFAULT_AVATAR,...(config||{})};
}
