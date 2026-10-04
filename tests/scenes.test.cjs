const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('scenes-data.js','utf8'),ctx);
const scenes=ctx.window.HANASERU_SCENES;
test('two goals have complete, distinct partner exchanges and transfer questions',()=>{
  assert.equal(scenes.filter(s=>s.track==='clinic').length,4);
  assert.equal(scenes.filter(s=>s.track==='travel').length,7);
  assert.equal(new Set(scenes.map(s=>s.id)).size,scenes.length);
  for(const s of scenes){
    assert.equal(s.turns.length,4);assert.ok(s.context&&s.goal&&s.role);
    for(const t of [...s.turns,s.challenge])for(const field of ['heard','heardJa','intent','en','note'])assert.ok(t[field]?.trim(),s.id+':'+field);
    assert.ok(!s.turns.some(t=>t.heard===s.challenge.heard));
  }
  assert.doesNotMatch(fs.readFileSync('scenes-data.js','utf8'),/slack\.com|@lifecrescendo|\d{3}-\d{4}|\d+\s*(mg|滴|錠)/);
});
const cloud=fs.readFileSync('cloud.js','utf8');
const merge=vm.runInNewContext(cloud.slice(cloud.indexOf('function mergeStates'),cloud.indexOf('async function pull'))+'\nmergeStates;',{window:{HanaseruPracticeCore:require('../practice-core.js')}});
test('cross-device merge preserves latest restart, hints, and other scenes',()=>{
  const l={scenes:{a:{index:5,updatedAt:10},b:{index:2,updatedAt:30,hinted:true}}};
  const r={scenes:{a:{index:0,updatedAt:20,results:[]},b:{index:4,updatedAt:15},c:{index:1,updatedAt:5}}};
  const m=merge(l,r);
  assert.equal(m.scenes.a.index,0);assert.equal(m.scenes.b.index,2);assert.equal(m.scenes.b.hinted,true);assert.equal(m.scenes.c.index,1);
  assert.equal(l.scenes.a.index,5,'merge must not mutate source');
});
