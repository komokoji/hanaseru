const {test}=require('node:test');
const assert=require('node:assert/strict');
const VoiceLoop=require('../voice-loop.js');
function fixture(){
  const sent=[],states=[],drafts=[];let visible=true;
  class R {start(){R.last=this;} abort(){this.aborted=true;}}
  const v=new VoiceLoop({Recognition:R,visible:()=>visible,state:(...x)=>states.push(x),draft:x=>drafts.push(x),text:x=>sent.push(x)});
  return {v,R,sent,states,drafts,hide:()=>{visible=false;}};
}
function finish(r,text='I run a clinic.'){
  r.onresult({results:[Object.assign([{transcript:text}],{isFinal:true})]});r.onend();
}
test('automatic conversation sends recognized text once and waits for reply, stops at five',()=>{
 const f=fixture();f.v.start();for(let i=0;i<5;i++){finish(f.R.last);assert.equal(f.sent.length,i+1);assert.equal(f.v.rec,null);if(i<4)f.v.afterReply();}
 assert.equal(f.v.active,false);f.v.afterReply();assert.equal(f.sent.length,5);
});
test('stop invalidates delayed recognition and cannot send a hidden conversation',()=>{
 const f=fixture();f.v.start();const r=f.R.last,result=r.onresult,end=r.onend;f.v.stop();result({results:[Object.assign([{transcript:'late'}],{isFinal:true})]});end();assert.deepEqual(f.sent,[]);assert.equal(r.aborted,true);
 f.hide();f.v.start();assert.equal(f.v.active,false);
});
test('permission denial and empty speech stop rather than restart forever',()=>{
 const f=fixture();f.v.start();const r=f.R.last,end=r.onend;r.onerror({error:'not-allowed'});end();assert.equal(f.v.active,false);assert.equal(f.sent.length,0);
 f.v.start();f.R.last.onend();assert.equal(f.v.active,false);assert.equal(f.sent.length,0);
});
test('single microphone mode never automatically listens again',()=>{
 const f=fixture();f.v.start(false);finish(f.R.last);assert.equal(f.v.active,false);assert.equal(f.sent.length,1);f.v.afterReply();assert.equal(f.v.rec,null);
});

test('unstarted recognition reports waiting then exits rather than falsely listening',async()=>{
 const f=fixture();f.v.o.startTimeoutMs=10;f.v.start();assert.match(f.states.at(-1)[0],/開始を待って/);await new Promise(r=>setTimeout(r,25));assert.equal(f.v.active,false);assert.match(f.states.at(-1)[0],/開始しません/);assert.equal(f.R.last.aborted,true);
});
test('started but silent recognition exits with no accidental send',async()=>{
 const f=fixture();f.v.o.silenceTimeoutMs=10;f.v.start();f.R.last.onstart();assert.match(f.states.at(-1)[0],/聞いています/);await new Promise(r=>setTimeout(r,25));assert.equal(f.v.active,false);assert.equal(f.sent.length,0);
});
test('final result without browser end is sent once, and stop cancels a pending final',async()=>{
 const f=fixture();f.v.o.finalTimeoutMs=10;f.v.start();const r=f.R.last,end=r.onend;r.onresult({results:[Object.assign([{transcript:'Hello there'}],{isFinal:true})]});await new Promise(r=>setTimeout(r,25));assert.deepEqual(f.sent,['Hello there']);end();assert.equal(f.sent.length,1);f.v.stop();
 f.v.start();f.R.last.onresult({results:[Object.assign([{transcript:'Do not send'}],{isFinal:true})]});f.v.stop();await new Promise(r=>setTimeout(r,25));assert.equal(f.sent.length,1);
});
