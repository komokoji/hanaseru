/* Turn-taking voice input. No background listening; stop invalidates all callbacks. */
(function(root){
  'use strict';
  class VoiceLoop {
    constructor(o){this.o=o;this.active=false;this.rec=null;this.serial=0;this.turns=0;this.timer=null;}
    stop(message='音声入力を停止しました。'){
      this.active=false;this.serial++;clearTimeout(this.timer);this.timer=null;
      const r=this.rec;this.rec=null;
      if(r){r.onend=r.onresult=r.onerror=null;try{r.abort();}catch(_){}}
      this.o.state(message,false);
    }
    start(continuous=true){
      this.stop('');
      if(!this.o.Recognition){this.o.state('このブラウザでは音声入力を利用できません。文字で返せます。',false);return;}
      this.continuous=continuous;this.active=true;this.turns=0;
      this.timer=setTimeout(()=>this.stop('5分で一区切りにしました。続ける場合はもう一度開始してください。'),300000);
      this.listen();
    }
    listen(){
      if(!this.active||!this.o.visible()){this.stop('');return;}
      const token=++this.serial;let finalText='',draft='',failed=false;
      const r=new this.o.Recognition();this.rec=r;r.lang='en-US';r.interimResults=true;r.continuous=false;
      this.o.state(this.continuous?'聞いています。話し終わると送信します。停止は「音声対話を停止」。':'聞いています。話し終わると送信します。',true);
      r.onresult=e=>{
        if(token!==this.serial||!this.active)return;
        finalText='';draft='';
        for(let i=0;i<e.results.length;i++){
          if(e.results[i].isFinal)finalText+=e.results[i][0].transcript+' ';
          else draft+=e.results[i][0].transcript+' ';
        }
        this.o.draft((finalText+draft).trim());
      };
      r.onerror=e=>{
        if(token!==this.serial)return;failed=true;
        this.stop(e.error==='not-allowed'?'マイクが許可されていません。ブラウザの設定を確認するか、文字で返してください。':'音声を取得できませんでした。文字で返すか、もう一度開始してください。');
      };
      r.onend=()=>{
        if(token!==this.serial||!this.active||failed)return;
        this.rec=null;
        const text=finalText.trim();
        if(!text){this.stop('声が確定しませんでした。入力欄を確認し、文字で送るかもう一度開始してください。');return;}
        this.turns++;
        if(!this.continuous||this.turns>=5)this.stop(this.continuous?'5回話したので一区切りです。返答を聞いて、使いたい表現を保存しましょう。':'');
        else this.o.state('AIの返答を待っています。',true);
        this.o.text(text);
      };
      try{r.start();}catch(_){this.stop('マイクを開始できませんでした。文字で返すか、もう一度開始してください。');}
    }
    afterReply(){if(this.active)this.listen();}
  }
  if(typeof module!=='undefined'&&module.exports)module.exports=VoiceLoop;
  else root.HanaseruVoiceLoop=VoiceLoop;
}(typeof window!=='undefined'?window:globalThis));
