// MP3 playback is independent of the device's SpeechSynthesis voices.
export function createSpeechPlayer(load) {
  const cache=new Map();let serial=0,current=null,currentButton=null;
  function stop(){serial++;if(currentButton){currentButton.disabled=false;currentButton=null;}if(current){current.pause();current.removeAttribute('src');current.load();current=null;}}
  async function play(text,button){
    stop();const id=serial;
    let panel=button.parentElement.querySelector('.speech-player');
    if(!panel){panel=document.createElement('div');panel.className='speech-player';button.parentElement.append(panel);}
    panel.replaceChildren();
    const status=document.createElement('p');status.setAttribute('role','status');status.textContent='音声を準備しています…';panel.append(status);
    const audio=document.createElement('audio');audio.controls=true;audio.preload='auto';audio.style.width='100%';audio.setAttribute('aria-label','相手の声の再生と停止');panel.append(audio);
    current=audio;currentButton=button;button.disabled=true;
    try{
      let content=cache.get(text);
      if(!content){let timeout;try{content=await Promise.race([load(text),new Promise((_,reject)=>{timeout=setTimeout(()=>reject(new Error("音声の準備に時間がかかっています。もう一度押してください。")),25000);})]);}finally{clearTimeout(timeout);}if(typeof content!=='string'||!content)throw new Error('音声データがありません。');cache.set(text,content);if(cache.size>20)cache.delete(cache.keys().next().value);}
      if(id!==serial)return;
      audio.src='data:audio/mpeg;base64,'+content;
      audio.onplaying=()=>{if(id===serial)status.textContent='再生中です。聞こえない場合は音量とBluetoothの出力先を確認してください。';};
      audio.onended=()=>{if(id===serial)status.textContent='もう一度聞くには ▶ を押してください。';};
      audio.onerror=()=>{if(id===serial)status.textContent='音声を再生できませんでした。「相手の声を聞く」をもう一度押してください。';};
      try{await audio.play();}catch(e){if(id===serial)status.textContent='音声の準備ができました。下の ▶ を押すと再生します。';}
    }catch(e){if(id===serial){audio.remove();status.textContent=e.message||'音声を準備できませんでした。もう一度押してください。';}}
    finally{button.disabled=false;}
  }
  return {play,stop};
}
