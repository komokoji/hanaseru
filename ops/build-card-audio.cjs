// 手本の音声（カード・場面・聞き取り教材）を公開用MP3として作る。学習者が入力した文は含めない。
// 使い方：node ops/build-card-audio.cjs   （作成済みのファイルは作り直さない。--dry で件数だけ）
const fs=require('node:fs'),crypto=require('node:crypto');
global.window=global;global.self=global;
['data','trip','visit','gutnutri','me','basics','conversation','patterns','parts','listen','practice-core','scenes-data','personal-scenes'].forEach(f=>require('../'+f+'.js'));
const VOICES={'en-US':'en-US-Standard-F','en-GB':'en-GB-Standard-A'};
const texts=new Map();   // text -> lang（先に入れた声を優先）
const norm=t=>String(t==null?'':t).replace(/___/g,'…').trim();
const add=(t,lang)=>{t=norm(t);if(t&&t.length<=1200&&/[A-Za-z]/.test(t)&&!texts.has(t))texts.set(t,lang||'en-US');};
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

const file=(t,lang)=>'audio/cards/'+crypto.createHash('sha256').update(VOICES[lang]+':0.9:'+t).digest('hex').slice(0,20)+'.mp3';
const list=[...texts].map(([text,lang])=>({text,lang,path:file(text,lang)}));
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
        const r=await client.post('/text:synthesize',{input:{text:x.text},voice:{languageCode:x.lang,name:VOICES[x.lang]},audioConfig:{audioEncoding:'MP3',speakingRate:0.9}},{headers:{'x-goog-user-project':o.project}});
        if(!r.body.audioContent)throw Error('Missing audio: '+x.text.slice(0,40));
        fs.writeFileSync(x.path,Buffer.from(r.body.audioContent,'base64'));
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
