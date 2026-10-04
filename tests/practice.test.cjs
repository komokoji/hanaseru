const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const Core = require('../practice-core.js');
const card = (id, domain='medical') => ({id, domain, ja:'説明します', en:'Let me explain.'});
test('due reviews and a new personal phrase coexist; signs, listener lines and blanks excluded', () => {
  const cards = [card('old1'),card('old2'),card('old3'),card('new'),card('mine-a','mine'),{...card('trip-w01'),en:'Departures'}, {...card('q'),ja:'（相手）何ですか？'}, {...card('blank'),en:'I want ___.'}];
  const states = Object.fromEntries(['old1','old2','old3'].map((id)=>[id,{box:0,due:8}]));
  assert.deepEqual(Core.select(cards,states,10,'all').map(c=>c.id),['old1','old2','mine-a']);
  assert.equal(Core.select(cards,states,10,'mine').length,1);
  assert.deepEqual(Core.select(cards,states,10,'travel'),[]);
});
test('retry today does not inflate retention; failure tomorrow survives an early retry', () => {
  const first = Core.grade(undefined,'transfer',10,100);
  assert.equal(first.box,1); assert.equal(first.due,11);
  const repeat = Core.grade(first,'transfer',10,200);
  assert.equal(repeat.box,1); assert.equal(repeat.due,11);
  const failed = Core.grade({box:5,due:10},'again',10,300);
  assert.equal(failed.box,0); assert.equal(failed.due,11);
  assert.equal(Core.grade(failed,'recalled',10,400).box,0);
  assert.equal(Core.grade(failed,'recalled',11,500).box,1);
  assert.equal(Core.grade({box:4,due:20},'transfer',10,600).box,4);
});
// Exercise the actual sync function, with Firebase calls excluded.
const cloud = fs.readFileSync(require.resolve('../cloud.js'),'utf8');
const merge = vm.runInNewContext(cloud.slice(cloud.indexOf('function mergeStates'), cloud.indexOf('async function pull')) + '\nmergeStates;', {window:{HanaseruPracticeCore:Core}});
test('sync keeps newer failed recall, including when the other device had a high box', () => {
  const local={cards:{x:{box:5,due:40,updatedAt:100}}};
  const remote={cards:{x:{box:0,due:11,updatedAt:200,practiceOutcome:'again'}}};
  assert.equal(merge(local,remote).cards.x.box,0);
  assert.equal(merge(remote,local).cards.x.box,0);
});
test('sync retains capture to phrase linkage and supports legacy records', () => {
  const local={cards:{},captures:[{ts:1,ja:'hello'}]};
  const remote={cards:{},captures:[{ts:1,ja:'hello',phraseId:'mine-a',updatedAt:200}]};
  assert.equal(merge(local,remote).captures.length,1);
  assert.equal(merge(local,remote).captures[0].phraseId,'mine-a');
  assert.equal(merge(remote,local).captures[0].phraseId,'mine-a');
});
test('all lesson references and new offline assets are present', () => {
  const context={window:{}}; vm.createContext(context);
  for(const f of ['data','trip','visit','gutnutri','me','basics','conversation','parts','listen']) vm.runInContext(fs.readFileSync(require.resolve('../'+f+'.js'),'utf8'),context);
  const H=context.window, ids=new Set(H.HANASERU_CARDS.map(c=>c.id));
  assert.equal(ids.size,H.HANASERU_CARDS.length);
  for(const p of H.HANASERU_PARTS) for(const id of p.ids) assert.ok(ids.has(id),id);
  for(const f of H.HANASERU_FLOWS) for(const id of f.parts) assert.ok(H.HANASERU_PART_BY_ID[id],id);
  for(const c of H.HANASERU_CASES) for(const id of c.model) assert.ok(H.HANASERU_PART_BY_ID[id],id);
  const sw=fs.readFileSync(require.resolve('../sw.js'),'utf8');
  for(const f of ['practice.js','practice-core.js','conversation.js']) assert.ok(sw.includes('"./'+f+'"'));
});
test('shelf separates a saved intention, previous practice, real use and a pause',()=>{
  const c=card('x');
  assert.equal(Core.stage(c,undefined),'want');
  assert.equal(Core.stage(c,{box:0,due:10}),'learning'); // legacy failed card
  assert.equal(Core.stage(c,{box:0,due:10,plannedAt:100}),'want');
  assert.equal(Core.stage(c,{box:0,due:10,plannedAt:100,lastPracticeDay:10}),'learning');
  assert.equal(Core.stage(c,{usedAt:100}),'used');
  assert.equal(Core.stage(c,{usedAt:100,paused:true}),'paused');
});
test('paused cards stay out of auto practice and planned phrases are prioritized',()=>{
  const cards=[card('paused'),card('new'),card('planned'),{...card('personal','mine'),ja:'（診療）説明します'}];
  const states={paused:{box:0,due:0,paused:true},planned:{box:0,due:10,plannedAt:100}};
  const selected=Core.select(cards,states,10,'clinic').map(c=>c.id);
  assert.equal(selected[0],'planned');
  assert.ok(!selected.includes('paused'));
  assert.ok(selected.includes('personal'));
});
test('practice days merge as a union, keeping nonconsecutive effort',()=>{
  const result=merge({cards:{},practiceDays:[10,12]},{cards:{},practiceDays:[12,14]});
  assert.equal(JSON.stringify(result.practiceDays),'[10,12,14]');
});
test('default practice never substitutes untouched stock lessons when personal work is done',()=>{
  const cards=[card('stock'),card('personal','mine')];
  assert.equal(Core.select(cards,{personal:{box:2,due:20}},10,'all').length,0);
  assert.equal(Core.select(cards,{personal:{box:2,due:20}},10,'clinic')[0].id,'stock');
});
test('daily activity counts once, retains yesterday streak, and resets only after a missed day',()=>{
  const state={practiceDays:[8,9,10,10],lastDone:10,streak:3};
  assert.equal(Core.activity(state,10).streak,3);
  assert.equal(Core.activity(state,10).week,3);
  assert.equal(Core.activity(state,11).streak,3);
  assert.equal(Core.activity(state,11).done,false);
  assert.equal(Core.activity(state,12).streak,0);
  assert.equal(Core.activity({...state,practiceDays:[8,9,10,12]},12).streak,1);
});
test('legacy streak and separate-device activity days join without losing continuity',()=>{
  const result=merge({cards:{},lastDone:9,streak:5},{cards:{},practiceDays:[10],lastDone:10,streak:1});
  assert.equal(Core.activity(result,10).streak,6);
  assert.equal(Core.activity({lastDone:200,streak:150},200).streak,150);
});

test('response cues rotate, match a known intent, and classify referral/bridge cards correctly',()=>{
  const ctx={window:{HANASERU_CARDS:[]}};vm.createContext(ctx);
  vm.runInContext(fs.readFileSync(require.resolve('../conversation.js'),'utf8'),ctx);
  const added=ctx.window.HANASERU_CARDS;
  assert.equal(added.length,18);
  assert.equal(Core.topic({domain:'refer'}),'clinic');
  for(const c of added){
    assert.equal(Core.topic(c),c.topic);
    assert.equal(Core.eligible(c,'bridge'),true);
    assert.notEqual(Core.responseCue(c,0).en,Core.responseCue(c,1).en);
  }
  assert.equal(Core.eligible({id:'trip-t03',en:'How long are you staying?',ja:'（相手に）どのくらい滞在？'},'all'),true);
  assert.equal(Core.eligible({id:'trip-t13',en:'Just getting started!',ja:'（相手）始まったばかりですね'},'all'),false);
  assert.equal(Core.eligible({id:'ls',domain:'listen',en:'Please remain seated.',ja:'座ったままで'},'all'),false);
  assert.deepEqual(Core.sentences('Dr. Komori gave 2.5 ml. Thank you.'),['Dr. Komori gave 2.5 ml.','Thank you.']);
  assert.deepEqual(Core.sentences("He's doing well. Could you tell me more?"),["He's doing well.","Could you tell me more?"]);
});
