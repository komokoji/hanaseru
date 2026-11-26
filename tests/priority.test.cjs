const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const C=require('../priority-core');
global.window=global;global.self=global;require('../scenes-data');require('../personal-scenes');fs.readdirSync(__dirname+'/../packs').filter(f=>f.endsWith('.js')).forEach(f=>require('../packs/'+f));require('../priority-data');require('../card-audio');require('../priority-audio');
const list=HANASERU_PRIORITY,ids=list.map(x=>x.id);
test('30 stable references resolve to existing turns and offline audio, no response duplication',()=>{
 assert.equal(list.length,30);assert.equal(new Set(ids).size,30);assert.equal(new Set(list.map(x=>x.scene+':'+x.turn)).size,30);
 for(const x of list){assert(!x.en);let s=HANASERU_SCENES.find(s=>s.id===x.scene),t=s.turns[x.turn];for(const en of [t.heard,t.en,x.alternate.heard]){const path=HANASERU_CARD_AUDIO[en];assert(path,en);assert(HANASERU_PRIORITY_AUDIO.includes(path));assert(fs.statSync(__dirname+'/../'+path).size>1000);}}
});
test('new learner starts at top10; queue is capped at 3; listening and opening never graduate',()=>{
 const s=C.clean(null,ids);assert.equal(C.unlock(s,ids),10);assert.deepEqual(C.begin(s,ids,100).queue,ids.slice(0,3));assert.equal(Object.keys(s.items).length,0);
});
test('unfinished session survives next day; finished same-day sessions do not create obligations',()=>{
 const s=C.clean(null,ids);C.begin(s,ids,100);s.session.step=2;
 let resumed=C.clean(JSON.parse(JSON.stringify(s)),ids);assert.equal(C.begin(resumed,ids,101).step,2);
 s.session.index=3;assert.equal(C.begin(s,ids,100).index,3);assert.equal(C.begin(s,ids,101).index,0);
});
test('same-day repeated passes do not unlock, two separate days do, failure resets evidence',()=>{
 const s=C.clean(null,ids);
 for(const id of ids.slice(0,10)){C.grade(s,id,true,100);C.grade(s,id,true,100);}
 assert.equal(C.unlock(s,ids),10);
 for(const id of ids.slice(0,10))C.grade(s,id,true,101);
 assert.equal(C.unlock(s,ids),20);
 C.grade(s,ids[0],false,102);assert(!C.stable(s.items[ids[0]]));assert.equal(C.unlock(s,ids),20,'earned stage is preserved');
});
test('due review precedes fresh items but never consumes the entire session when new items remain',()=>{
 const s=C.clean(null,ids);ids.slice(0,3).forEach(id=>C.grade(s,id,false,100));
 assert.deepEqual(C.select(s,ids,101),[ids[0],ids[3],ids[4]]);
 assert.deepEqual(C.select(s,ids,100),ids.slice(3,6),'failed item waits for next day');
});
test('fully stable course revisits due items, no false empty curriculum; JST day boundary',()=>{
 const s=C.clean(null,ids);ids.forEach(id=>{C.grade(s,id,true,100);C.grade(s,id,true,101);});
 assert.equal(C.unlock(s,ids),30);assert.equal(C.select(s,ids,102).length,0);assert.equal(C.select(s,ids,104).length,3);assert.equal(C.select(s,ids,102,true).length,3);
 assert.equal(C.today(Date.parse('2026-11-26T15:00:00Z'))-C.today(Date.parse('2026-11-26T14:59:59Z')),1);
});
test('corrupt storage is normalized; invalid queues cannot render missing items',()=>{
 assert.deepEqual(C.clean({session:{day:1,queue:['bad'],index:0,step:0},unlocked:99},ids),C.clean(null,ids));
 assert.equal(C.clean({session:{day:1,queue:['p01','p01'],index:0,step:0}},ids).session,null);
});

test('priority and existing practice have distinct DOM targets',()=>{
 const html=fs.readFileSync(__dirname+'/../index.html','utf8');
 const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(new Set(ids).size,ids.length,'duplicate HTML ids would cross-wire practice routes');
 for(const id of ['priorityHome','p30Title','p30Body','prTitle','prBody'])assert(ids.includes(id));
});
