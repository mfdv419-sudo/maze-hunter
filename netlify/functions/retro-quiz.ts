import type {Handler} from '@netlify/functions';
import {getApps,initializeApp,cert} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import {getFirestore} from 'firebase-admin/firestore';
import bankData from '../private/questions_2000_master.json';
import {PACK_VERSION,levelQuestions,validQuizLevel,publicSession,verifyGate,answerQuestion,settleKnowledge,type Question,type QuizSession,type KnowledgeProgress} from '../lib/retro-quiz-core';
const bank=bankData as Question[];
export const handler:Handler=async event=>{const headers={'Content-Type':'application/json','Cache-Control':'no-store'};const reply=(statusCode:number,data:unknown)=>({statusCode,headers,body:JSON.stringify(data)});try{
 if(event.httpMethod!=='POST')return reply(405,{error:'POST required'});if((event.body?.length||0)>750000)return reply(413,{error:'Request too large'});
 if(!getApps().length){const raw=process.env.FIREBASE_SERVICE_ACCOUNT_JSON;if(!raw)throw Error('Quiz backend is not configured');initializeApp({credential:cert(JSON.parse(raw))});}
 const token=(event.headers.authorization||'').replace(/^Bearer /,'');if(!token)return reply(401,{error:'Login required'});const {uid}=await getAuth().verifyIdToken(token,true),body=JSON.parse(event.body||'{}'),profileId=String(body.profileId||'');if(!/^[a-zA-Z0-9-]{1,64}$/.test(profileId))return reply(400,{error:'Invalid profile'});
 const db=getFirestore(),profile=db.doc(`families/${uid}/profiles/${profileId}`),progressRef=db.doc(`families/${uid}/retroKnowledge/${profileId}`);if(!(await profile.get()).exists)return reply(404,{error:'Profile not found'});
 const draft=false,pool=bank.filter(q=>q.status==='active'),subjects=[...new Set(pool.filter(q=>q.level===body.level).map(q=>q.subject_code))];
 if(body.action==='availability')return reply(200,{available:validQuizLevel(body.level)&&subjects.length===10,subjects,version:PACK_VERSION,draft});
 const id=String(body.sessionId||'');if(!/^[a-zA-Z0-9-]{16,80}$/.test(id))return reply(400,{error:'Invalid attempt ID'});const ref=db.doc(`families/${uid}/retroQuizSessions/${id}`),now=Date.now();
 const response=await db.runTransaction(async tx=>{const [snapshot,pSnap,kSnap]=await Promise.all([tx.get(ref),tx.get(profile),tx.get(progressRef)]);const p=pSnap.data()!,old=kSnap.data() as KnowledgeProgress|undefined;let s=snapshot.data() as QuizSession|undefined;let delta=0;
 if(body.action==='start'){if(s){if(s.profileId!==profileId||s.subject!==body.subject||s.level!==body.level)throw Error('Attempt mismatch');return{...publicSession(s,bank),progress:old,draft};}if(!validQuizLevel(body.level)||!subjects.length)throw Error('Quiz level unavailable');const selected=levelQuestions(pool,String(body.subject),body.level);s={version:PACK_VERSION,profileId,level:body.level,subject:String(body.subject),createdAt:now,stage:'maze_running',questions:selected.map(q=>q.id),answers:{},baseReward:0,correct:0};tx.create(ref,s);return{...publicSession(s,bank),draft};}
 if(!s||s.profileId!==profileId)throw Error('Attempt not found');if(s.version!==PACK_VERSION)throw Error('Pack version changed');if(now-s.createdAt>86400000&&s.stage!=='quiz_finished'&&s.stage!=='quiz_skipped')throw Error('Attempt expired');
 if(body.action==='finish'&&s.stage==='maze_running'){s.baseReward=verifyGate(s.level,body.path,body.seconds,body.errors,(now-s.createdAt)/1000);s.completedAt=now;s.stage='quiz_active';const key=String(s.level),previous=p.retro?.[key];tx.update(profile,{[`retro.${key}`]:{stars:Math.max(previous?.stars||0,s.baseReward),seconds:Math.min(previous?.seconds??Infinity,body.seconds),errors:Math.min(previous?.errors??Infinity,body.errors)},updatedAt:now});}
 else if(body.action==='answers'){
  if(!Array.isArray(body.answers)||body.answers.length!==2||new Set(body.answers.map((a:any)=>a.questionId)).size!==2||body.answers.some((a:any)=>!s!.questions.includes(a.questionId)||!Number.isInteger(a.index)||a.index<0||a.index>2))throw Error('Two valid answers required');
  for(const answer of body.answers){if(s.stage==='quiz_finished'){if(s.answers[answer.questionId]!==answer.index)throw Error('Answer already final');}else answerQuestion(s,bank,String(answer.questionId),answer.index,now);}
 }
 else if(body.action==='answer'){if(s.stage==='quiz_finished'&&s.answers[body.questionId]===body.index){}else answerQuestion(s,bank,String(body.questionId),body.index,now);}
 else if(body.action==='skip'&&s.stage!=='quiz_finished'){s.stage='quiz_skipped';s.totalReward=s.baseReward;s.scoredAt=now;}
 else if(!['resume','finish','skip'].includes(body.action))throw Error('Unknown action');
 if(s.baseReward>0){const settled=settleKnowledge(old,s,Math.max(p.retro?.[String(s.level)]?.stars||0,s.baseReward));delta=settled.delta;tx.set(progressRef,settled.progress);tx.set(ref,s);return{...publicSession(s,bank),progress:settled.progress,delta,draft};}
 tx.set(ref,s);return{...publicSession(s,bank),progress:old,delta,draft};});return reply(200,response);
 }catch(e){return reply(400,{error:e instanceof Error?e.message:'Quiz request failed'});}};
