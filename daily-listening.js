/* Daily selection uses Japan time, matching the 20:00 reminder. No missed-day backlog. */
(function(root){
'use strict';
const day=ms=>Math.floor((ms+9*3600000)/86400000);
function prepare(raw,now,lessons){
 const today=day(now),count=lessons.length;
 const valid=raw&&Number.isInteger(raw.index)&&raw.index>=0&&raw.index<count&&Number.isInteger(raw.step)&&raw.step>=0&&raw.step<=4;
 let s=valid?{...raw}:{index:0,step:0,issue:'',answer:'',heard:false,results:[]};
 s.results=Array.isArray(s.results)?s.results.slice(-60):[];
 if(!Number.isInteger(s.planDay)){
  const last=s.results[s.results.length-1];
  s.planDay=s.step===4&&last&&Number.isFinite(last.at)?day(last.at):today;
 }
 if(s.planDay<today){
  const marked=Number.isInteger(s.markedChunk)&&s.markedChunk>=0&&s.markedChunk<lessons[s.index].chunks.length;
  const struggled=['sound','structure','memory'].includes(s.issue);
  const review=today-s.planDay===1&&(marked||struggled)?{index:s.index,chunk:marked?s.markedChunk:Math.min(1,lessons[s.index].chunks.length-1),explicit:marked,fromDay:s.planDay}:null;
  s={index:(s.index+1)%count,step:0,issue:'',answer:'',heard:false,results:s.results,planDay:today,markedChunk:null,review,reviewDone:false};
 }
 // Never render stale or corrupt indices from local storage.
 if(s.review&&(!Number.isInteger(s.review.index)||!lessons[s.review.index]||!Number.isInteger(s.review.chunk)||!lessons[s.review.index].chunks[s.review.chunk]))s.review=null;
 if(!Number.isInteger(s.markedChunk)||!lessons[s.index].chunks[s.markedChunk])s.markedChunk=null;
 return s;
}
const api={day,prepare};
if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.HanaseruDailyListening=api;
})(typeof window!=='undefined'?window:globalThis);
