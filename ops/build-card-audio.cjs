// 手本の音声（カード・場面・聞き取り教材）を公開用MP3として作る。学習者が入力した文は含めない。
// 使い方：node ops/build-card-audio.cjs   （作成済みのファイルは作り直さない。--dry で件数だけ）
const fs=require('node:fs'),crypto=require('node:crypto');
global.window=global;global.self=global;
['data','trip','visit','gutnutri','me','basics','conversation','patterns','parts','listen','practice-core','scenes-data','personal-scenes'].forEach(f=>require('../'+f+'.js'));
// 教材ファイルは packs/ の中身を全部読む（足したら自動で対象になる）
fs.readdirSync(require('node:path').join(__dirname,'..','packs')).filter(f=>f.endsWith('.js')).sort().forEach(f=>require('../packs/'+f));
const VOICES={'en-US':'en-US-Standard-F','en-GB':'en-GB-Standard-A'};
const texts=new Map();   // text -> lang（先に入れた声を優先）
const norm=t=>String(t==null?'':t).replace(/___/g,'…').trim();
const add=(t,lang)=>{t=norm(t);if(t&&t.length<=1200&&/[A-Za-z]/.test(t)&&!texts.has(t)&&!((global.HANASERU_SCENES||[]).filter(c=>c.voices).some(c=>c.turns.concat([c.challenge]).some(u=>norm(u.en)===t||norm(u.heard)===t))))texts.set(t,lang||'en-US');};
const Core=global.HanaseruPracticeCore;
// 聞き取り教材（英国の声の単元を先に）
(global.HANASERU_LISTEN||[]).forEach(u=>{
  u.passages.forEach(p=>add(p.en,u.voice));
  (u.phrases||[]).forEach(id=>{const c=global.HANASERU_CARDS.find(c=>c.id===id||c===id);if(c&&c.en)add(c.en,u.voice);});
});
// カード本体・一文ずつ・相手の問い
global.HANASERU_CARDS.forEach(c=>{add(c.en);const s=Core.sentences(c.en);if(s.length>1)s.forEach(x=>add(x));(c.prompts||[]).forEach(x=>add(x));});
Object.values(global.HANASERU_RESPONSE_CUES||{}).forEach(list=>list.forEach(x=>add(x)));
['Could you explain that to me in simple words?','What would you like me to understand?','Could you tell me what you mean?','Could you explain that a little more?'].forEach(x=>add(x));
// 場面の会話（相手の言葉・手本・区切り）
(global.HANASERU_SCENES||[]).forEach(s=>s.turns.concat(s.challenge?[s.challenge]:[]).forEach(t=>{
  add(t.heard);add(t.en);(t.chunks||String(t.en||'').match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).forEach(x=>add(x));
}));
// そのほか、教材データの中の英文（型・部品など）
(function walk(v,key){
  if(typeof v==='string'){if(key==='en'||key==='heard')add(v);return;}
  if(v&&typeof v==='object')Object.keys(v).forEach(k=>walk(v[k],Array.isArray(v)?key:k));
})(Object.keys(global).filter(k=>/^HANASERU_/.test(k)).map(k=>global[k]),'');

// 🩺 診察を英語で：保護者と医師で声を分ける。通しの会話は1本につなぐ。
// 短い区切り（I see. など）が既存の教材と同じ文なら、既存の声をそのまま使う。
const custom=new Map();   // text -> {path, parts:[{text,voice,rate,pause}]}
const hashOf=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const addCustom=(t,voice,rate)=>{t=norm(t);if(t&&!custom.has(t))custom.set(t,{path:'audio/cards/'+hashOf(voice+':'+rate+':'+t)+'.mp3',parts:[{text:t,voice,rate,pause:0}]});};
(global.HANASERU_SCENES||[]).filter(s=>s.voices).forEach(s=>{
  const all=s.turns.concat([s.challenge]);
  all.forEach(t=>{addCustom(t.heard,s.voices.heard,1);addCustom(t.en,s.voices.en,0.9);(String(t.en).match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).forEach(x=>{if(!texts.has(norm(x)))addCustom(x,s.voices.en,0.9);});});
  if(s.track!=='consult'&&s.track!=='dubai')return;   // 通しの1本は、診察とドバイだけ
  const parts=[];s.turns.forEach(t=>{parts.push({text:t.heard,voice:s.voices.heard,rate:1,pause:350});parts.push({text:t.en,voice:s.voices.en,rate:1,pause:450});});
  const key=norm(s.turns.map(t=>t.heard+' '+t.en).join(' '));
  custom.set(key,{path:'audio/cards/'+hashOf('consult-dialogue:'+parts.map(p=>p.voice+':'+p.text).join('|'))+'.mp3',parts});
});
// 🧩 熟語の耳トレと 📏 現在地チェック：問題ごとの声で、自然な速さ
(global.HANASERU_PHRASALS||[]).forEach(p=>addCustom(p.en,p.voice,1));
((global.HANASERU_ASSESS||{}).forms||[]).forEach(f=>{f.listening.forEach(x=>addCustom(x.en,x.voice,1));f.speaking.forEach(x=>addCustom(x.promptEn,x.voice,1));});
// 🎯 基礎トレ：音の変化（自然な速さ＋ゆっくり版）と、文にする（院長の手本の声）
(global.HANASERU_SOUNDS||[]).forEach(x=>{addCustom(x.en,x.voice,1.05);if(x.slow)addCustom(x.slow,x.voice,0.85);});
(global.HANASERU_BUILDS||[]).forEach(x=>{addCustom(x.model,'en-US-Neural2-D',0.9);addCustom(x.longer,'en-US-Neural2-D',0.9);});
const file=(t,lang)=>'audio/cards/'+crypto.createHash('sha256').update(VOICES[lang]+':0.9:'+t).digest('hex').slice(0,20)+'.mp3';
const list=[...texts].filter(([text])=>!custom.has(text)).map(([text,lang])=>({text,lang,path:file(text,lang)})).concat([...custom].map(([text,c])=>({text,path:c.path,parts:c.parts})));
const chars=list.reduce((n,x)=>n+x.text.length,0),todo=list.filter(x=>!fs.existsSync(x.path));
console.log('texts',list.length,'chars',chars,'to create',todo.length);
if(process.argv.includes('--dry'))process.exit(0);
(async()=>{
  fs.mkdirSync('audio/cards',{recursive:true});
  if(todo.length){
    const root=require('node:child_process').execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/firebase-tools/lib/';
    const a=require(root+'auth'),o={project:'komori-clinic-platform',nonInteractive:true};a.setActiveAccount(o,a.getGlobalDefaultAccount());await require(root+'requireAuth').requireAuth(o);
    const client=new(require(root+'apiv2').Client)({urlPrefix:'https://texttospeech.googleapis.com',apiVersion:'v1'});
    let next=0,done=0;
    await Promise.all(Array.from({length:5},async()=>{
      while(next<todo.length){
        const x=todo[next++];
        const parts=x.parts||[{text:x.text,voice:VOICES[x.lang],rate:0.9,plain:true}],bufs=[];
        const xml=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
        for(const p of parts){
          const r=await client.post('/text:synthesize',{input:p.plain?{text:p.text}:{ssml:'<speak>'+xml(p.text)+(p.pause?'<break time="'+p.pause+'ms"/>':'')+'</speak>'},voice:{languageCode:p.voice.slice(0,5),name:p.voice},audioConfig:{audioEncoding:'MP3',speakingRate:p.rate}},{headers:{'x-goog-user-project':o.project}});
          if(!r.body.audioContent)throw Error('Missing audio: '+p.text.slice(0,40));
          bufs.push(Buffer.from(r.body.audioContent,'base64'));
        }
        fs.writeFileSync(x.path,Buffer.concat(bufs));
        if(++done%100===0)console.log('created',done,'/',todo.length);
      }
    }));
  }
  const map={};list.forEach(x=>{map[x.text]='./'+x.path;});
  // 使わなくなったファイルを消す
  const keep=new Set(list.map(x=>x.path.split('/').pop()));
  fs.readdirSync('audio/cards').forEach(f=>{if(!keep.has(f))fs.unlinkSync('audio/cards/'+f);});
  fs.writeFileSync('card-audio.js','/* Generated model audio for built-in materials; see ops/build-card-audio.cjs. */\nself.HANASERU_CARD_AUDIO='+JSON.stringify(map,null,1)+';\n');
  console.log('Audio files ready:',list.length);
})().catch(e=>{console.error(e.message);process.exit(1)});
