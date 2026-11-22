import type {Handler} from '@netlify/functions';
import bankData from '../private/questions_2000_master.json';
import {PACK_VERSION} from '../lib/retro-quiz-core';

type Question={level:number;subject_code:string;status:string};
const bank=bankData as Question[];
export const handler:Handler=async event=>{
 const headers={'Content-Type':'application/json','Cache-Control':'no-store'};
 const reply=(statusCode:number,data:unknown)=>({statusCode,headers,body:JSON.stringify(data)});
 if(!['GET','POST'].includes(event.httpMethod))return reply(405,{error:'GET or POST required'});
 try{
  const body=event.httpMethod==='POST'?JSON.parse(event.body||'{}'):{};
  const level=Number(body.level??event.queryStringParameters?.level);
  if(!Number.isInteger(level)||level<1||level>100)return reply(200,{available:false,subjects:[],version:PACK_VERSION,draft:false});
  const pool=bank.filter(q=>q.status==='active'&&q.level===level),subjects=[...new Set(pool.map(q=>q.subject_code))];
  return reply(200,{available:subjects.length>0,subjects,version:PACK_VERSION,draft:false,count:pool.length});
 }catch(e){return reply(400,{error:e instanceof Error?e.message:'Availability check failed'});}
};
