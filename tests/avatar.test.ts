import {describe,it,expect} from 'vitest';
import {DEFAULT_AVATAR,normalizeAvatar} from '../src/lib/avatar';

describe('Onyapo avatar compatibility',()=>{
 it('preserves older saved customizations and fills new fields',()=>{
  const old={skin:'#69412E',hairColor:'#161b21',hairStyle:'short',texture:'wavy',height:74,width:41};
  const updated=normalizeAvatar(old);
  expect(updated).toMatchObject(old);
  expect(updated.facialHair).toBe('none');
  expect(updated.glasses).toBe('none');
  expect(updated.hat).toBe('none');
  expect(updated.eyeStyle).toBe('almond');
  expect(updated.expression).toBe('smile');
 });
 it('new personalization survives normalizing',()=>{
  const avatar={...DEFAULT_AVATAR,hairStyle:'cornrows',glasses:'round',hat:'beanie',facialHair:'goatee',expression:'excited',eyeStyle:'wink'};
  expect(normalizeAvatar(avatar)).toEqual(avatar);
 });
});
