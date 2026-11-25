/* 教材の骨格の試験：packs/ の点検と登録が通ること、型に合わない教材は止まること、量の集計が読めること。 */
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.join(__dirname,'..'),run=(args)=>spawnSync('node',args,{cwd:root,encoding:'utf8'});
test('packs/ の教材は、型・出典・声・音声・登録がそろっている',()=>{
  const r=run(['ops/sync-content.cjs','--check']);assert.equal(r.status,0,r.stdout);assert.match(r.stdout,/OK 教材 \d+ ファイル/);
});
test('出典の無い診察・登録されていない教材は、点検で止まる',()=>{
  const bad=path.join(root,'packs','zz-test-bad.js');
  fs.writeFileSync(bad,"(function(r){var t={heard:'Hi.',heardJa:'こんにちは',intent:'返す',en:'Hello.',note:'x'};r.HANASERU_SCENES.push({id:'consult-zz-test',track:'consult',group:'便秘外来',title:'t',role:'母親',context:'c',goal:'g',voices:{heard:'en-US-Neural2-F',en:'en-US-Neural2-D'},turns:[t,t,t],challenge:t});}(typeof window!=='undefined'?window:globalThis));");
  try{const r=run(['ops/sync-content.cjs','--check']);assert.equal(r.status,1);assert.match(r.stdout,/source（元にした院長の説明文・原稿）が無い/);assert.match(r.stdout,/合っていない/);}
  finally{fs.unlinkSync(bad);}
  assert.equal(run(['ops/sync-content.cjs','--check']).status,0);
});
test('量の集計：柱ごとの数と目標が出る',()=>{
  const r=run(['ops/coverage.cjs','--json']);assert.equal(r.status,0);const o=JSON.parse(r.stdout);
  assert(o.rows.length>=10);assert(o.rows.every(x=>Number.isFinite(x.n)&&x.target>0));assert(o.totals.audioFiles>3000);
  const c=o.rows.find(x=>/便秘外来/.test(x.name));assert(c.n>=13);
});
