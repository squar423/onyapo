export const milestones=[0,100,500,1500,3000,5000,10000];
export function levelInfo(xp:number){
 let level=1,lower=0,upper=100;
 for(let i=1;i<milestones.length;i++){if(xp>=milestones[i]){level=i+1;lower=milestones[i];upper=milestones[i+1]??15000;}}
 if(xp>=10000){level=7+Math.floor((xp-10000)/5000);lower=10000+Math.floor((xp-10000)/5000)*5000;upper=lower+5000;}
 return {level,lower,upper,progress:Math.max(0,Math.min(100,((xp-lower)/(upper-lower))*100)),remaining:upper-xp};
}
