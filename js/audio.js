"use strict";
// ================= 声音：WebAudio 合成（沿用羽毛球版 / 太空金币版的 iOS 保守解锁方案）=================
// 规则：只在用户点按里解锁/恢复（含 iOS 'interrupted'）；audioSession 仅在前台且点按后设为 'playback'；
// 切后台（hidden/pagehide/blur）→ 暂停游戏、静音、停音乐、挂起上下文、audioSession 'auto'；回来后等下一次点按才恢复。
const AU={ctx:null,master:null,sfx:null,mus:null,noise:null,track:null,seq:null,broken:false,lastTry:0,bg:false,sizzle:null};
const MASTER=0.9,MUSVOL=0.26;
const setSession=t=>{try{if(navigator.audioSession&&navigator.audioSession.type!==t)navigator.audioSession.type=t;}catch(e){}};
function isMuted(){return !!(typeof SAVE!=='undefined'&&SAVE.muted);}
function audioBuild(){
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;
  try{AU.ctx=new AC({latencyHint:'interactive'});}catch(e){try{AU.ctx=new AC();}catch(e2){AU.ctx=null;return false;}}
  const c=AU.ctx;
  const comp=c.createDynamicsCompressor();comp.threshold.value=-14;comp.knee.value=10;comp.ratio.value=4;comp.attack.value=0.003;comp.release.value=0.2;comp.connect(c.destination);
  AU.master=c.createGain();AU.master.gain.value=isMuted()?0:MASTER;AU.master.connect(comp);
  AU.sfx=c.createGain();AU.sfx.gain.value=1;AU.sfx.connect(AU.master);
  AU.mus=c.createGain();AU.mus.gain.value=MUSVOL;AU.mus.connect(AU.master);
  AU.noise=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=AU.noise.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  // 烤架滋滋声：循环噪声 → 带通 → 增益（随烤串数量变化）
  try{const s=c.createBufferSource();s.buffer=AU.noise;s.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=5200;f.Q.value=0.7;
    const g=c.createGain();g.gain.value=0;s.connect(f).connect(g).connect(AU.sfx);s.start();AU.sizzle=g;}catch(e){AU.sizzle=null;}
  c.onstatechange=()=>{if(c.state!=='running')return;AU.broken=false;if(AU.bg||document.hidden){c.suspend().catch(()=>{});return;}musicSync();};
  return true;}
// 只能在用户手势（touchend/click/pointerdown/keydown）里调用
function audioUnlock(){
  if(document.hidden)return;
  setSession('playback');
  if(AU.bg){AU.bg=false;if(AU.master){const t=AU.ctx.currentTime;AU.master.gain.cancelScheduledValues(t);AU.master.gain.setValueAtTime(isMuted()?0:MASTER,t);}}
  if(AU.broken&&AU.ctx){try{AU.ctx.close();}catch(e){}AU.ctx=null;if(AU.seq)AU.seq.stop();AU.seq=null;AU.track=null;AU.sizzle=null;}
  if(AU.ctx&&AU.ctx.state==='closed')AU.ctx=null;
  if(!AU.ctx&&!audioBuild())return;
  const c=AU.ctx;
  try{const b=c.createBufferSource();b.buffer=c.createBuffer(1,1,22050);b.connect(c.destination);b.start(0);}catch(e){}
  if(c.state!=='running'){// 'suspended' 或 iOS 的 'interrupted'
    const p=c.resume();if(p&&p.then)p.then(musicSync).catch(()=>{});
    const t=performance.now();AU.lastTry=t;
    setTimeout(()=>{if(AU.ctx===c&&c.state!=='running'&&!document.hidden&&AU.lastTry===t)AU.broken=true;},600);
  }else musicSync();}
function audioToBackground(){AU.bg=true;
  if(AU.seq){AU.seq.stop();AU.seq=null;}AU.track=null;
  if(AU.ctx&&AU.master){const t=AU.ctx.currentTime;AU.master.gain.cancelScheduledValues(t);AU.master.gain.value=0;AU.master.gain.setValueAtTime(0,t);}
  if(AU.ctx&&AU.ctx.state!=='closed'&&AU.ctx.state!=='suspended'){const p=AU.ctx.suspend();if(p&&p.catch)p.catch(()=>{});}
  try{if(window.speechSynthesis)speechSynthesis.cancel();}catch(e){}
  setSession('auto');}
const aok=()=>AU.ctx&&AU.ctx.state==='running'&&!AU.bg&&!document.hidden;
const NOTE=m=>440*Math.pow(2,(m-69)/12);
function envG(g,t,a,peak,dur){g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(peak,t+a);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);}
function tone(freq,dur,type,vol,delay,f2,dest){const c=AU.ctx,t=c.currentTime+(delay||0);const o=c.createOscillator(),g=c.createGain();
  o.type=type||'sine';o.frequency.setValueAtTime(freq,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+dur);
  envG(g,t,0.006,vol,dur);o.connect(g).connect(dest||AU.sfx);o.start(t);o.stop(t+dur+0.03);}
function noise(dur,fq,q,vol,type,delay,f2,dest){const c=AU.ctx,t=c.currentTime+(delay||0);const s=c.createBufferSource();s.buffer=AU.noise;
  const f=c.createBiquadFilter();f.type=type||'bandpass';f.frequency.setValueAtTime(fq,t);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+dur);f.Q.value=q||1;const g=c.createGain();
  g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);s.connect(f).connect(g).connect(dest||AU.sfx);s.start(t,Math.random()*0.6);s.stop(t+dur+0.03);}
function duck(amount,hold){if(!AU.mus)return;const t=AU.ctx.currentTime,g=AU.mus.gain;g.cancelScheduledValues(t);g.setTargetAtTime(MUSVOL*amount,t,0.02);g.setTargetAtTime(MUSVOL,t+hold,0.25);}
const PENTA=[0,2,4,7,9];
let lastCoinSfx=0;
function sfx(n,p){if(!aok()||isMuted())return;const now=AU.ctx.currentTime;switch(n){
  case 'place':tone(180,0.12,'sine',0.3,0,90);noise(0.5,4500,0.8,0.3);for(let i=0;i<5;i++)noise(0.03,6000,2,0.2,'bandpass',0.05+Math.random()*0.4);break;
  case 'salt':for(let i=0;i<8;i++)noise(0.025,7000+Math.random()*3000,3,0.2,'bandpass',i*0.035+Math.random()*0.02);break;
  case 'chili':for(let i=0;i<6;i++)noise(0.035,2500+Math.random()*1500,2,0.22,'bandpass',i*0.045);tone(900,0.06,'triangle',0.05,0.05,1300);break;
  case 'flip':noise(0.15,1500,0.8,0.22,'bandpass');tone(300,0.08,'triangle',0.22,0.1,160);noise(0.35,5000,0.8,0.22,'bandpass',0.12);break;
  case 'ding':tone(1318,0.7,'sine',0.26);tone(1760,0.7,'sine',0.15,0.1);tone(2637,0.4,'sine',0.05,0.1);break;
  case 'coin':{if(now-lastCoinSfx<0.035)return;lastCoinSfx=now;const s=Math.min(p||0,9);const m=81+PENTA[s%5]+12*Math.floor(s/5);tone(NOTE(m),0.05,'square',0.035);tone(NOTE(m+7),0.12,'triangle',0.08,0.03);break;}
  case 'happy':[784,988,1175,1568].forEach((f,i)=>tone(f,0.16,'triangle',0.16,i*0.07));break;
  case 'combo':{const b=74+(p||0)*2;[0,4,7,12].forEach((d,i)=>tone(NOTE(b+d),0.12,'square',0.045,i*0.05));break;}
  case 'sad':tone(440,0.3,'triangle',0.2,0,330);tone(370,0.45,'triangle',0.2,0.28,220);break;
  case 'burnt':noise(0.6,900,0.6,0.3,'lowpass');tone(110,0.4,'sawtooth',0.07,0,70);break;
  case 'warn':tone(NOTE(84),0.09,'sine',0.12);tone(NOTE(81),0.14,'sine',0.12,0.11);break;
  case 'soft':tone(NOTE(88),0.08,'sine',0.07);break;
  case 'pick':tone(660,0.06,'triangle',0.13,0,880);break;
  case 'tool':tone(520,0.05,'triangle',0.11);break;
  case 'trash':noise(0.18,700,1,0.32,'bandpass');tone(220,0.2,'square',0.05,0.02,110);break;
  case 'arrive':tone(NOTE(88),0.08,'sine',0.1);tone(NOTE(91),0.12,'sine',0.1,0.08);break;
  case 'reject':tone(300,0.12,'square',0.05);tone(240,0.16,'square',0.05,0.12);break;
  case 'tick':tone(1500,0.04,'square',0.04);break;
  case 'click':tone(NOTE(84),0.05,'triangle',0.09);break;
  case 'skillA':noise(0.6,3800,0.6,0.3,'bandpass');[1047,1319,1568,2093,2637].forEach((f,i)=>tone(f,0.15,'triangle',0.13,0.05+i*0.055));break;
  case 'skillB':tone(95,0.8,'sine',0.5,0,38);noise(0.9,420,0.7,0.4,'lowpass');[523,659,784,1047,1319,1568].forEach((f,i)=>tone(f,0.3,'square',0.06,0.18+i*0.07));[2093,2637,3136].forEach((f,i)=>tone(f,0.6,'sine',0.08,0.65+i*0.06));duck(0.3,1.6);break;
  case 'jingle':[1319,1568,1760,2093,2637].forEach((f,i)=>tone(f,0.12,'sine',0.18,i*0.07,f*1.08));break;
  case 'jingleDeep':[392,330,262,392,523].forEach((f,i)=>tone(f,0.22,'triangle',0.2,i*0.13));break;
  case 'bossIn':for(let i=0;i<8;i++)noise(0.08,180,1,0.45,'lowpass',i*0.07);[196,247,294].forEach(f=>tone(f,1,'sawtooth',0.06,0.6));duck(0.2,1.4);break;
  case 'thud':tone(70,0.45,'sine',0.55,0,35);noise(0.3,200,1,0.45,'lowpass');break;
  case 'fly':tone(700,0.16,'sine',0.08,0,1600);break;
  case 'bossWin':[523,659,784,1047,784,1047,1319].forEach((f,i)=>tone(f,0.3,'triangle',0.2,i*0.1));break;
  case 'bossSad':tone(392,0.4,'triangle',0.22,0,370);tone(349,0.4,'triangle',0.22,0.35,330);tone(294,0.8,'triangle',0.22,0.7,220);break;
  case 'end':[523,659,784,659,784,1047].forEach((f,i)=>tone(f,0.22,'triangle',0.18,i*0.11));break;
  case 'buy':[0,4,7,12,16].forEach((d,i)=>tone(NOTE(79+d),0.14,'triangle',0.12,i*0.05));noise(0.3,9000,0.7,0.05,'highpass',0.05);break;
  case 'whoosh':noise(0.25,800,0.8,0.12,'bandpass',0,4000);break;
}}
function sizzleLevel(v){if(!AU.sizzle||!AU.ctx)return;AU.sizzle.gain.setTargetAtTime(isMuted()||!aok()?0:v,AU.ctx.currentTime,0.25);}
// ---- 背景音乐：前瞻式步进音序器（五声音阶的夜市小调）；后台绝不排音符 ----
const CH_PLAY=[[60,64,67],[57,60,64],[62,65,69],[55,59,62]];
const CH_MENU=[[57,60,64,67],[53,57,60,64],[55,59,62,67],[52,55,60,64]];
const CH_BOSS=[[57,60,64],[53,57,60],[55,59,62],[52,56,59]];
const MA=[72,0,74,76,79,0,76,74, 72,0,69,0,72,74,0,0, 76,0,79,81,79,76,74,0, 72,74,76,0,74,0,0,0];
const MB=[79,0,81,79,76,0,74,76, 79,0,84,0,81,79,76,0, 74,0,76,74,72,0,69,72, 74,0,76,0,72,0,0,0];
const MC=[84,81,79,0,81,79,76,0, 79,76,74,0,76,74,72,0, 74,76,79,81,79,76,74,72, 69,0,72,0,74,0,0,0];
const MEL_PLAY=[MA,MB,MA,MC];
const MEL_MENU=[[76,0,0,79,0,0,81,0, 79,0,0,76,0,0,0,0, 74,0,0,76,0,0,72,0, 69,0,0,0,0,0,0,0],[72,0,0,74,0,0,76,0, 79,0,0,81,79,0,0,0, 76,0,0,74,0,0,72,0, 74,0,0,0,0,0,0,0]];
const MEL_BOSS=[[69,0,72,69,76,0,74,72, 69,0,72,69,77,0,76,72, 71,0,74,71,79,0,77,74, 76,0,75,0,76,0,0,0],[81,0,79,0,77,0,76,0, 77,0,76,0,74,0,72,0, 74,0,72,0,71,0,69,0, 68,0,71,0,76,0,0,0]];
function startSeq(kind){const c=AU.ctx,bpm=kind==='play'?100:kind==='boss'?136:78,step=60/bpm/2;let next=c.currentTime+0.08,i=0,stopped=false,timer=null,self=null;
  const mel=kind==='play'?MEL_PLAY:kind==='boss'?MEL_BOSS:MEL_MENU,CH=kind==='play'?CH_PLAY:kind==='boss'?CH_BOSS:CH_MENU;
  function note(m,t,dur,type,vol,lpf){const o=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type=type;o.frequency.setValueAtTime(NOTE(m),t);
    f.type='lowpass';f.frequency.value=lpf;g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol,t+0.008);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(f).connect(g).connect(AU.mus);o.start(t);o.stop(t+dur+0.02);}
  function pluck(m,t,vol){note(m,t,0.5,'triangle',vol,3200);note(m+12,t,0.18,'sine',vol*0.35,4000);}// 有点像古筝/琵琶的拨弦
  function shaker(t,vol){const s=c.createBufferSource();s.buffer=AU.noise;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=6500;const g=c.createGain();
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.05);s.connect(f).connect(g).connect(AU.mus);s.start(t,Math.random()*0.5);s.stop(t+0.06);}
  function block(t,vol,f0){const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(f0||900,t);o.frequency.exponentialRampToValueAtTime((f0||900)*0.7,t+0.05);
    g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.07);o.connect(g).connect(AU.mus);o.start(t);o.stop(t+0.08);}
  function kick(t,v){const o=c.createOscillator(),g=c.createGain();o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(45,t+0.12);
    g.gain.setValueAtTime(v||0.45,t);g.gain.exponentialRampToValueAtTime(0.0001,t+0.16);o.connect(g).connect(AU.mus);o.start(t);o.stop(t+0.18);}
  function tick(){if(stopped)return;
    if(document.hidden||AU.bg||c.state!=='running'){stopped=true;if(AU.seq===self){AU.seq=null;AU.track=null;}return;}
    if(next<c.currentTime-0.2)next=c.currentTime+0.05;
    while(next<c.currentTime+0.12){const bar=Math.floor(i/8)%4,ch=CH[bar],s=i%8,ph=Math.floor(i/32)%mel.length;
      if(kind==='menu'){if(s===0)ch.forEach(m=>note(m,next,step*7.5,'sine',0.05,900));if(s===0||s===4)note(ch[0]-12,next,step*3,'triangle',0.24,500);if(s%2===1)shaker(next,0.03);}
      else{const boss=kind==='boss';
        if(s===0||s===4||(boss&&s===6))kick(next,boss?0.5:0.32);if(s===2||s===6)block(next,boss?0.12:0.09,boss?700:1000);if(s%2===1)shaker(next,0.05);
        if(s===0||s===3||s===4||s===6)note(ch[0]-12+(s===6?7:0),next,step*1.6,boss?'sawtooth':'triangle',boss?0.1:0.32,boss?520:700);
        if(s===2||s===6)ch.forEach(m=>note(m+12,next,step*0.9,'triangle',0.035,1800));}
      const m=mel[ph][i%32];if(m){if(kind==='play')pluck(m,next,0.085);else note(m,next,step*(kind==='menu'?2.4:1.1),kind==='menu'?'triangle':'square',kind==='menu'?0.08:0.045,kind==='menu'?3000:2400);}
      i++;next+=step;}
    timer=setTimeout(tick,25);}
  self={stop(){stopped=true;clearTimeout(timer);}};tick();return self;}
function musicSync(){if(!AU.ctx)return;const want=aok()&&!isMuted()&&SAVE.music!==false?gameMusicWant():null;if(want===AU.track&&(!want||AU.seq))return;
  if(AU.seq){AU.seq.stop();AU.seq=null;}AU.track=want;if(want)AU.seq=startSeq(want);}
// ---- 语音（浏览器 TTS 没有四川话口音，只把台词写成四川话；音调稍高一点）----
let voices=[];
function loadVoices(){try{voices=window.speechSynthesis?speechSynthesis.getVoices()||[]:[];}catch(e){voices=[];}}
if(window.speechSynthesis){loadVoices();try{speechSynthesis.addEventListener?speechSynthesis.addEventListener('voiceschanged',loadVoices):(speechSynthesis.onvoiceschanged=loadVoices);}catch(e){}}
function pickVoice(deep){if(!voices.length)loadVoices();const zh=voices.filter(v=>/^zh|^cmn/i.test(v.lang)||/中文|普通话|Chinese|Mandarin/i.test(v.name));if(!zh.length)return null;
  const cn=zh.filter(v=>/zh[-_]CN|cmn|普通话|Mainland/i.test(v.lang+' '+v.name)),pool=cn.length?cn:zh;
  const fem=/female|女|xiaoxiao|xiaoyi|xiaohan|xiaomo|xiaorui|xiaoxuan|xiaoyan|xiaomeng|huihui|yaoyao|ting-?ting|mei-?jia|sin-?ji|lili|google/i,mal=/(^|[^e])male|男|kangkang|yunxi|yunjian|yunyang|yunye|li-?mu/i;
  if(deep)return pool.find(v=>mal.test(v.name))||pool[0];return pool.find(v=>fem.test(v.name)&&!mal.test(v.name))||pool.find(v=>!mal.test(v.name))||pool[0];}
const SPEECH_LOG=[];
function speak(t,deep){let ok=false;try{if(aok()&&!isMuted()&&window.speechSynthesis&&window.SpeechSynthesisUtterance){const u=new SpeechSynthesisUtterance(t);u.lang='zh-CN';const v=pickVoice(deep);if(v)u.voice=v;
    u.pitch=deep?0.55:1.45;u.rate=deep?0.9:1.12;u.volume=1;if(speechSynthesis.speaking||speechSynthesis.pending)speechSynthesis.cancel();speechSynthesis.speak(u);ok=true;}}catch(e){ok=false;}
  if(!ok)sfx(deep?'jingleDeep':'jingle');SPEECH_LOG.push({t,deep:!!deep,ok});return ok;}
function unlockSpeech(){try{if(window.speechSynthesis&&window.SpeechSynthesisUtterance&&!isMuted()){const u=new SpeechSynthesisUtterance(' ');u.volume=0;u.lang='zh-CN';speechSynthesis.speak(u);}}catch(e){}}
