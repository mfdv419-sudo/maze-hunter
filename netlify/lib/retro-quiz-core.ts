import {RetroState} from '../../src/game/retro-state';
import type {Point} from '../../src/game/maze';
export const PACK_VERSION='retro-levels-001-100-two-v3';
export const SUBJECTS=['MTK','IPA','IPS','IDN','ENG','FRA','ARB','ZHO','PP','TIK'] as const;
export interface Question{id:string;level:number;grade:number;subject_code:string;subject:string;topic:string;question:string;options:string[];correct_index:number;explanation:string;status:string;language:string;answer_language:string;education_stage:string;difficulty:string}
export interface QuizSession{version:string;profileId:string;level:number;subject:string;createdAt:number;stage:'maze_running'|'quiz_active'|'quiz_finished'|'quiz_skipped';questions:string[];answers:Record<string,number>;baseReward:number;correct:number;scoredAt?:number;completedAt?:number;totalReward?:number}
export interface KnowledgeProgress{version:1;bestRewards:Record<string,number>;bonusByLevel:Record<string,number>}
export function validQuizLevel(level:number){return Number.isInteger(level)&&level>=1&&level<=100;}
export function validateBank(bank:Question[]){
 if(bank.length!==2000||new Set(bank.map(q=>q.id)).size!==2000||new Set(bank.map(q=>q.question.trim())).size!==2000)throw Error('Expected 2000 unique questions');
 for(const q of bank){const grade=q.level<=16?1:q.level<=33?2:q.level<=50?3:q.level<=66?4:q.level<=83?5:6;if(!validQuizLevel(q.level)||q.grade!==grade||!SUBJECTS.includes(q.subject_code as any)||q.status!=='active'||q.options.length!==3||new Set(q.options.map(v=>v.trim())).size!==3||!Number.isInteger(q.correct_index)||q.correct_index<0||q.correct_index>2||!q.question.trim()||!q.explanation.trim())throw Error('Invalid question '+q.id);}
 for(let level=1;level<=100;level++)for(const code of SUBJECTS)if(bank.filter(q=>q.level===level&&q.subject_code===code).length!==2)throw Error('Expected two questions per level/subject');return bank;
}
/** Both questions belong to the requested level; no borrowing from other levels. */
export function levelQuestions(bank:Question[],subject:string,level:number,random:()=>number=Math.random){
 if(!validQuizLevel(level))throw Error('Quiz level unavailable');return selectQuestions(bank.filter(q=>q.level===level),subject,random);
}
function selectShuffled<T>(items:T[],random:()=>number){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function selectQuestions(bank:Question[],subject:string,random:()=>number=Math.random){
 if(![...SUBJECTS,'MIX'].includes(subject as any))throw Error('Unknown subject');
 if(subject==='MIX'){const codes=selectShuffled([...new Set(bank.map(q=>q.subject_code))],random);if(codes.length<2)throw Error('Bank unavailable');return codes.slice(0,2).map(code=>selectShuffled(bank.filter(q=>q.subject_code===code),random)[0]);}
 const pool=selectShuffled(bank.filter(q=>q.subject_code===subject),random);if(pool.length<2)throw Error('Bank unavailable');return pool.slice(0,2);
}
export function publicSession(s:QuizSession,bank:Question[]){const finished=s.stage==='quiz_finished';return{stage:s.stage,version:s.version,level:s.level,baseReward:s.baseReward,...(finished?{correct:s.correct}:{}),totalReward:s.totalReward??s.baseReward,questions:s.questions.map(id=>{const q=bank.find(q=>q.id===id)!;return{id:q.id,subject:q.subject,question:q.question,options:q.options,answer:s.answers[id]??null,...(finished?{correct_index:q.correct_index,explanation:q.explanation}:{})};})};}
export function verifyGate(level:number,path:Point[],seconds:number,errors:number,wallSeconds:number){if(!validQuizLevel(level)||!Array.isArray(path)||path.length<2||path.length>15000||!Number.isFinite(seconds)||seconds<0||seconds>wallSeconds+2||!Number.isInteger(errors)||errors<0||errors>2)throw Error('Invalid completion');const s=new RetroState(level);s.start();s.tick(seconds);for(const p of path){if(!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)||!s.trace(p))throw Error('Invalid maze path');}if(s.phase!=='won')throw Error('Golden Gate not reached');s.errors=errors;return s.rating;}
export function answerQuestion(s:QuizSession,bank:Question[],id:string,index:number,now:number){if(s.stage!=='quiz_active')throw Error('Quiz inactive');const position=s.questions.indexOf(id);if(position<0||!Number.isInteger(index)||index<0||index>2)throw Error('Invalid answer');if(Object.prototype.hasOwnProperty.call(s.answers,id)){if(s.answers[id]!==index)throw Error('Answer already final');return;}if(position!==Object.keys(s.answers).length)throw Error('Answer previous question first');const q=bank.find(q=>q.id===id);if(!q)throw Error('Question missing');s.answers[id]=index;if(index===q.correct_index)s.correct++;if(Object.keys(s.answers).length===2){s.stage='quiz_finished';s.totalReward=s.baseReward*(s.correct===2?2:1);s.scoredAt=now;}}
export function settleKnowledge(old:KnowledgeProgress|undefined,s:QuizSession,baseBest:number){const p:KnowledgeProgress=structuredClone(old||{version:1,bestRewards:{},bonusByLevel:{}}),key=String(s.level),reward=s.totalReward??s.baseReward;const previous=p.bestRewards[key]||0;p.bestRewards[key]=Math.max(previous,reward,baseBest);p.bonusByLevel[key]=Math.max(0,p.bestRewards[key]-Math.max(baseBest,s.baseReward));return{progress:p,delta:p.bestRewards[key]-Math.max(previous,baseBest,s.baseReward)};}
