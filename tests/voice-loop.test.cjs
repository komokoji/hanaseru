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
