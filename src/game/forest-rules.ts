/** Forest pilot tuning shared by simulation and presentation. Times are seconds. */
export const forestRules={oxygen:22,oxygenRecovery:8,diveTankOxygen:90,stepHeight:.36,bodyRadius:.27,jumpHeight:1.15,jumpRise:.34,jumpFall:.62};
export function forestJump(age:number,height=forestRules.jumpHeight){if(age<0||age>forestRules.jumpRise+forestRules.jumpFall)return 0;if(age<=forestRules.jumpRise){const t=age/forestRules.jumpRise;return height*(1-(1-t)**2);}const t=(age-forestRules.jumpRise)/forestRules.jumpFall;return height*(1-t*t);}
