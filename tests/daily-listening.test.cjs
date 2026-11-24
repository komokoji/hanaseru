const {test}=require('node:test'),assert=require('node:assert/strict');
const {day,prepare}=require('../daily-listening');
const lessons=[{chunks:[['one'],['two'],['three']]},{chunks:[['next']]}];
const now=Date.parse('2026-11-24T11:00:00Z'),today=day(now);
test('same day preserves fixed lesson, progress and completed review',()=>{
 const s={index:0,step:2,planDay:today,issue:'sound',markedChunk:2,reviewDone:true};
 const next=prepare(s,now,lessons);assert.equal(next.index,0);assert.equal(next.step,2);assert.equal(next.reviewDone,true);
});
test('yesterday explicit phrase carries forward once even from unfinished practice',()=>{
 const next=prepare({index:0,step:2,planDay:today-1,issue:'sound',markedChunk:2},now,lessons);
 assert.equal(next.index,1);assert.equal(next.step,0);assert.deepEqual(next.review,{index:0,chunk:2,explicit:true,fromDay:today-1});
 assert.deepEqual(prepare(next,now,lessons),next);
});
test('general struggle gets labelled sample, clear or absent days never create invented failures',()=>{
 const base={index:0,step:2,planDay:today-1,issue:'structure'};
 assert.equal(prepare(base,now,lessons).review.explicit,false);
 assert.equal(prepare({...base,issue:'clear'},now,lessons).review,null);
 assert.equal(prepare({...base,planDay:today-4},now,lessons).review,null);
 assert.equal(prepare({...base,planDay:today-4},now,lessons).index,1);
});
test('JST midnight, legacy state and corrupt indices are handled',()=>{
 assert.equal(day(Date.parse('2026-11-24T14:59:59Z')),today);
 assert.equal(day(Date.parse('2026-11-24T15:00:00Z')),today+1);
 assert.equal(prepare({index:1,step:4,results:[{at:now-86400000}]},now,lessons).index,0);
 const s=prepare({index:0,step:0,review:{index:999,chunk:4}},now,lessons);assert.equal(s.review,null);
 assert.equal(prepare(null,now,lessons).planDay,today);
});
