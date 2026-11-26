/* Pure scheduling for the personal 30; self-ratings are not speech recognition. */
(function(root){
'use strict';
function today(now){return Math.floor(((now==null?Date.now():now)+9*3600000)/86400000);}
function clean(raw,ids){
 const s={items:{},unlocked:10,session:null};
 if(!raw||typeof raw!=='object')return s;
 for(const id of ids){const r=raw.items&&raw.items[id];if(!r||typeof r!=='object')continue;
  s.items[id]={days:[...new Set(Array.isArray(r.days)?r.days.filter(Number.isInteger):[])].sort((a,b)=>a-b).slice(-3),due:Number.isInteger(r.due)?r.due:0,last:Number.isInteger(r.last)?r.last:0,outcome:r.outcome==='pass'?'pass':'again'};
 }
 if([10,20,30].includes(raw.unlocked))s.unlocked=raw.unlocked;
 const q=raw.session;
 if(q&&Number.isInteger(q.day)&&Array.isArray(q.queue)&&q.queue.length>0&&q.queue.length<=3&&new Set(q.queue).size===q.queue.length&&q.queue.every(id=>ids.includes(id))&&Number.isInteger(q.index)&&q.index>=0&&q.index<=q.queue.length&&[0,1,2,3].includes(q.step))s.session={day:q.day,queue:q.queue,index:q.index,step:q.step};
 return s;
}
function stable(r){return !!r&&r.days.length>=2;}
function unlock(s,ids){
 if(ids.slice(0,10).every(id=>stable(s.items[id])))s.unlocked=Math.max(s.unlocked,20);
 if(ids.slice(0,20).every(id=>stable(s.items[id])))s.unlocked=30;
 return s.unlocked;
}
function select(s,ids,day,extra){
 const active=ids.slice(0,unlock(s,ids));
 const due=active.filter(id=>s.items[id]&&s.items[id].due<=day&&s.items[id].last!==day).sort((a,b)=>s.items[a].due-s.items[b].due);
 const fresh=active.filter(id=>!s.items[id]);
 // One review first, then new material; at most three turns, never a backlog counter.
 const result=[...due.slice(0,1),...fresh,...due.slice(1)].slice(0,3);
 if(!result.length&&extra)return active.slice().sort((a,b)=>(s.items[a]?.last||0)-(s.items[b]?.last||0)).slice(0,3);
 return result;
}
function begin(s,ids,day,extra){
 if(!extra&&s.session){if(s.session.index<s.session.queue.length||s.session.day===day)return s.session;}
 const queue=select(s,ids,day,extra);
 s.session=queue.length?{day,queue,index:0,step:0}:null;
 return s.session;
}
function grade(s,id,pass,day){
 const prev=s.items[id]||{days:[]};
 const days=pass?[...new Set([...prev.days,day])].sort((a,b)=>a-b).slice(-3):[];
 s.items[id]={days,due:day+(pass&&days.length>=2?3:1),last:day,outcome:pass?'pass':'again'};
}
const api={today,clean,stable,unlock,select,begin,grade};
root.HanaseruPriorityCore=api;if(typeof module!=='undefined')module.exports=api;
}(typeof window!=='undefined'?window:globalThis));
