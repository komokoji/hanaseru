// Explicit build-time generation of public, original travel lesson audio. No learner text.
const fs=require('node:fs'),vm=require('node:vm'),crypto=require('node:crypto');
const root=require('node:child_process').execFileSync('npm',['root','-g'],{encoding:'utf8'}).trim()+'/firebase-tools/lib/';
const source=fs.readFileSync('listening-route.js','utf8');
const lessons=vm.runInNewContext(source.slice(source.indexOf('const lessons='),source.indexOf('window.HANASERU_LISTENING_LESSONS'))+';lessons');
const texts=[...new Set(lessons.flatMap(l=>[l.lines.map(x=>x[1]).join(' '),...l.chunks.map(x=>x[0])]))];
(async()=>{
 const a=require(root+'auth'),o={project:'komori-clinic-platform',nonInteractive:true};a.setActiveAccount(o,a.getGlobalDefaultAccount());await require(root+'requireAuth').requireAuth(o);
 const client=new(require(root+'apiv2').Client)({urlPrefix:'https://texttospeech.googleapis.com',apiVersion:'v1'}),map={};
 for(const text of texts){
  const path='audio/listening/'+crypto.createHash('sha256').update('en-US-Standard-F:0.9:'+text).digest('hex').slice(0,20)+'.mp3';
  if(!fs.existsSync(path)){const r=await client.post('/text:synthesize',{input:{text},voice:{languageCode:'en-US',name:'en-US-Standard-F'},audioConfig:{audioEncoding:'MP3',speakingRate:0.9}},{headers:{'x-goog-user-project':o.project}});if(!r.body.audioContent)throw Error('Missing audio');fs.writeFileSync(path,Buffer.from(r.body.audioContent,'base64'));}
  map[text]='./'+path;
 }
 fs.writeFileSync('listening-audio.js','/* Generated original lesson audio; see ops/build-listening-audio.cjs. */\nself.HANASERU_LISTENING_AUDIO='+JSON.stringify(map,null,2)+';\n');console.log('Audio files ready:',texts.length);
})().catch(e=>{console.error(e.message);process.exit(1)});
