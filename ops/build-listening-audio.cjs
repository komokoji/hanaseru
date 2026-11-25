// 今日の耳トレの音声を作る（創作会話・学習者の文は含めない）。話し手ごとに男女の声を分ける。
// 使い方：node ops/build-listening-audio.cjs   （作成済みは作り直さない）
const fs=require('node:fs'),crypto=require('node:crypto');
global.window=global;global.HANASERU_SCENES=[];require('../listening-lessons.js');
// 耳トレの会話を足す教材ファイル（packs/）も対象にする
fs.readdirSync(require('node:path').join(__dirname,'..','packs')).filter(f=>f.endsWith('.js')).sort().forEach(f=>require('../packs/'+f));
const lessons=globalThis.HANASERU_LISTENING_LESSONS;
const hash=s=>crypto.createHash('sha256').update(s).digest('hex').slice(0,20);
const esc=t=>t.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const jobs=[];   // {key, path, parts:[{text,voice,rate,pause}]}
lessons.forEach(l=>{
  const full=l.lines.map(x=>x[1]).join(' ');
  const parts=l.lines.map(x=>({text:x[1],voice:l.voices[x[0]],rate:1,pause:350}));
  jobs.push({key:full,path:'audio/listening/'+hash('dialogue-v2:'+parts.map(p=>p.voice+':'+p.text).join('|'))+'.mp3',parts});
  l.chunks.forEach(c=>{
    const line=l.lines.find(x=>x[1].includes(c[0]));
    if(!line)throw Error('区切りの英文がどの行にも無い：'+l.title+' / '+c[0]);
    const voice=l.voices[line[0]];
    jobs.push({key:c[0],path:'audio/listening/'+hash('chunk-v2:'+voice+':0.9:'+c[0])+'.mp3',parts:[{text:c[0],voice,rate:0.9,pause:0}]});
  });
});
const todo=jobs.filter(j=>!fs.existsSync(j.path));
console.log('audio',jobs.length,'to create',todo.length);
if(process.argv.includes('--dry'))process.exit(0);
(async()=>{
  if(todo.length){
    const root=require('node:child_process').execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/firebase-tools/lib/';
    const a=require(root+'auth'),o={project:'komori-clinic-platform',nonInteractive:true};a.setActiveAccount(o,a.getGlobalDefaultAccount());await require(root+'requireAuth').requireAuth(o);
    const client=new(require(root+'apiv2').Client)({urlPrefix:'https://texttospeech.googleapis.com',apiVersion:'v1'});
    const synth=async p=>{
      const r=await client.post('/text:synthesize',{input:{ssml:'<speak>'+esc(p.text)+(p.pause?'<break time="'+p.pause+'ms"/>':'')+'</speak>'},voice:{languageCode:p.voice.slice(0,5),name:p.voice},audioConfig:{audioEncoding:'MP3',speakingRate:p.rate}},{headers:{'x-goog-user-project':o.project}});
      if(!r.body.audioContent)throw Error('Missing audio');return Buffer.from(r.body.audioContent,'base64');
    };
    let next=0;
    await Promise.all(Array.from({length:4},async()=>{
      while(next<todo.length){const j=todo[next++];const bufs=[];for(const p of j.parts)bufs.push(await synth(p));fs.writeFileSync(j.path,Buffer.concat(bufs));}
    }));
  }
  const map={};jobs.forEach(j=>{map[j.key]='./'+j.path;});
  const keep=new Set(jobs.map(j=>j.path.split('/').pop()));
  fs.readdirSync('audio/listening').forEach(f=>{if(!keep.has(f))fs.unlinkSync('audio/listening/'+f);});
  fs.writeFileSync('listening-audio.js','/* Generated original lesson audio; see ops/build-listening-audio.cjs. */\nself.HANASERU_LISTENING_AUDIO='+JSON.stringify(map,null,2)+';\n');console.log('Audio files ready:',jobs.length);
})().catch(e=>{console.error(e.message);process.exit(1)});
