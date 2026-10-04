"use strict";
// ================= 界面：首页 / 玩法 / 暂停 / 收摊 / 衣橱 / 主循环 =================
const OV_MAIN=['title','pause','over'],OV_SUB=['help','wardrobe','dlg'];
const ovEl=id=>$('ov-'+id);
function isOpen(id){return ovEl(id).classList.contains('show');}
function openOv(id){ovEl(id).classList.add('show');}
function closeOv(id){ovEl(id).classList.remove('show');}
function showOv(id){for(const k of OV_MAIN)ovEl(k).classList.toggle('show',k===id);if(id===null||id==='pause')for(const k of OV_SUB)if(k!=='dlg'||id===null)closeOv(k);if(id==='title')renderTitle();musicSyncSafe();}
function ovOpen(){for(const k of['dlg','wardrobe','help','pause','over','title'])if(isOpen(k))return k;return null;}
function closeTopOverlay(){const k=ovOpen();if(k==='dlg'){dlgAnswer(false);return true;}if(k==='wardrobe'){closeWardrobe();return true;}if(k==='help'){closeHelp();return true;}if(k==='pause'){sfx('click');setPause(false);return true;}return false;}
function musicSyncSafe(){try{musicSync();}catch(e){}}
function gameMusicWant(){if(state==='play')return paused?null:(bossRound?'boss':'play');return 'menu';}
// 遮罩点击关闭 + [data-close]
for(const id of['help','wardrobe','dlg','pause']){const el=ovEl(id);el.addEventListener('click',e=>{if(e.target===el){if(id==='dlg')dlgAnswer(false);else if(id==='wardrobe')closeWardrobe();else if(id==='help')closeHelp();else{sfx('click');setPause(false);}}});
  el.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>{sfx('click');if(id==='wardrobe')closeWardrobe();else if(id==='help')closeHelp();}));}
// ---------- 首页 ----------
let grantShown=false;
function renderTitle(){$('saveBar').innerHTML='第 <b>'+SAVE.day+'</b> 天 · 存款 <b>¥'+SAVE.savings+'</b>'+(SAVE.best?' · 单日最高 ¥'+SAVE.best:'');
  const g=$('grant');if(GRANTED>0&&!grantShown){g.hidden=false;g.textContent=SAVE.rounds?'送你 ¥'+GRANTED+' 零花钱，去衣橱买新衣服嘛～':'开张大礼包：送你 ¥1000 买衣服！';}else g.hidden=true;
  $('bStart').textContent=SAVE.day>1?'第'+SAVE.day+'天 开张':'开张营业';$('saveNote').textContent=saveNote||'';syncMuteUI();}
function syncMuteUI(){const t='声音：'+(SAVE.muted?'关':'开');$('bMuteT').textContent=t;$('bMuteP').textContent=t;}
let pendingStart=false;
function tryStart(){if(!SAVE.helpSeen){pendingStart=true;openHelp();return;}grantShown=GRANTED>0||grantShown;startGame();}
$('bStart').addEventListener('click',()=>{sfx('click');tryStart();});
$('bHelp').addEventListener('click',()=>{sfx('click');pendingStart=false;openHelp();});
$('bWardrobe').addEventListener('click',()=>{sfx('click');openWardrobe();});
$('bMuteT').addEventListener('click',()=>setMuted(!SAVE.muted));
$('bMuteP').addEventListener('click',()=>setMuted(!SAVE.muted));
$('bFS').addEventListener('click',()=>{sfx('click');toggleFS();});
$('bResume').addEventListener('click',()=>{sfx('click');setPause(false);});
$('bQuit').addEventListener('click',()=>{sfx('click');paused=false;state='title';resetGame();sizzleLevel(0);showOv('title');});
function openHelp(){openOv('help');}
function closeHelp(){closeOv('help');if(!SAVE.helpSeen){SAVE.helpSeen=true;persist();}if(pendingStart){pendingStart=false;startGame();}}
const mascot=$('mascot'),mctx=mascot.getContext('2d');let titleSayT=0;
mascot.addEventListener('click',()=>{q7Act(Math.random()<0.5?'happy':'twirl',1);const l=Q_IDLE[Math.floor(Math.random()*Q_IDLE.length)];$('titleSay').textContent=l;sfx('happy');speak(l);});
function drawMascot(dt){const old=ctx;ctx=mctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,mascot.width,mascot.height);
  ctx.globalCompositeOperation='lighter';glow(260,330,250,'rgba(255,150,90,.35)');ctx.globalCompositeOperation='source-over';
  drawQ7(260,548,2.35);
  // 小柜台 + 串串
  let g=ctx.createLinearGradient(0,540,0,620);g.addColorStop(0,'#c27a44');g.addColorStop(1,'#6e3a1e');ctx.fillStyle=g;rr(20,540,480,80,16);ctx.fill();ctx.fillStyle='#e6a466';rr(20,540,480,8,4);ctx.fill();
  for(let k=0;k<5;k++){const tp=TYPE_KEYS[k%3];ctx.save();ctx.translate(90+k*85,582);ctx.rotate(-1.35+k*0.04);drawChunks(tp,0,-40,80,TYPES[tp].cook,0.62,null,{marks:0.8,gloss:0.5});ctx.restore();}
  ctx=old;titleSayT-=dt;if(titleSayT<=0){titleSayT=rand(4,7);if(Math.random()<0.5)q7Act('wave',1.1);$('titleSay').textContent=Q_IDLE[Math.floor(Math.random()*Q_IDLE.length)];}}
// ---------- 收摊 ----------
const OVER_SAY=['莫得事，明天再来嘛！','还可以哦，慢慢来～','今天生意巴适得很！','安逸惨咯！你就是烧烤王噻！'];
function renderOver(day,st,goal,nb){const R=window.__bbqResult||{};
  let boss='';if(R.bossRound)boss='<div class="boss-res">'+(R.bossResult==='win'?'打败了BOSS大胃王！奖励 ¥30':'BOSS大胃王没吃饱…下次加油')+'</div>';
  $('overPanel').innerHTML='<div class="over-day">第 '+day+' 天 · 收摊咯</div>'+
    '<div class="stars">'+[0,1,2].map(k=>'<span class="'+(k<st?'on':'')+'" style="animation-delay:'+(0.35+k*0.25)+'s">★</span>').join('')+'</div>'+
    '<div class="earn">¥'+coins+'</div><div class="muted">星级目标 ¥'+goal.join(' / ¥')+(nb?' · <b style="color:#d8261c">新纪录！</b>':'')+'</div>'+boss+
    '<div class="stats"><div><b>'+sold+'</b>卖出串串</div><div><b>'+served+'</b>满意顾客</div><div><b>'+perfectCount+'</b>完美火候</div><div><b>'+burntCount+'</b>烤糊</div><div><b>'+lost+'</b>气走</div><div><b>'+bestCombo+'</b>最高连击</div></div>'+
    '<div class="qsay">77：'+OVER_SAY[st]+'</div><div class="muted">存款 ¥'+SAVE.savings+' · 衣橱里有新衣服等你哦</div>'+
    '<div class="btns" style="margin:12px auto 0"><button class="btn primary big" id="bNext">第'+SAVE.day+'天 开张</button><div class="row"><button class="btn" id="bOverW">77的衣橱</button><button class="btn" id="bHome">回首页</button></div></div>';
  $('bNext').onclick=()=>{sfx('click');startGame();};$('bOverW').onclick=()=>{sfx('click');openWardrobe();};$('bHome').onclick=()=>{sfx('click');state='title';showOv('title');};
  q7Act(st>=2?'happy':'wave',1.4);q7Say(OVER_SAY[st],2.6);}
// ---------- 通用确认框 ----------
let dlgCb=null;
function confirmDlg(t,m,yes,cb){$('dlgT').textContent=t;$('dlgM').innerHTML=m;$('dlgYes').textContent=yes||'要得！';dlgCb=cb;openOv('dlg');setTimeout(()=>$('dlgYes').focus(),30);}
function dlgAnswer(v){closeOv('dlg');const cb=dlgCb;dlgCb=null;if(cb)cb(v);}
$('dlgYes').addEventListener('click',()=>dlgAnswer(true));$('dlgNo').addEventListener('click',()=>{sfx('click');dlgAnswer(false);});
// ---------- 衣橱 ----------
const wd={tab:'outfit',look:{outfit:'apron',hat:'bandana'},focus:{kind:'outfit',id:'apron'}};
const isNew=(k,id)=>k==='outfit'?Object.prototype.hasOwnProperty.call(NEW_OUTFITS,id):Object.prototype.hasOwnProperty.call(NEW_HATS,id);
const owns=(k,id)=>id==='none'||SAVE.owned[k].includes(id);
const itemOf=(k,id)=>id==='none'?{name:'不戴帽子',price:0}:(k==='outfit'?OUTFITS:HATS)[id];
function openWardrobe(){Q.sayT=0;if(Q.act==='ult'||Q.act==='bigSprinkle')q7Act('idle',0.1);wd.look={outfit:SAVE.outfit,hat:SAVE.hat};wd.focus={kind:wd.tab,id:SAVE[wd.tab]};buildGrid();updateWd();openOv('wardrobe');}
function closeWardrobe(){closeOv('wardrobe');if(dlgCb)dlgAnswer(false);if(state==='title')renderTitle();}
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{sfx('click');wd.tab=b.dataset.tab;document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('on',x===b));wd.focus={kind:wd.tab,id:wd.look[wd.tab]};buildGrid();updateWd();}));
function drawCard(cv,k,id){const old=ctx;ctx=cv.getContext('2d');ctx.setTransform(2,0,0,2,0,0);ctx.clearRect(0,0,120,150);const look=k==='outfit'?{outfit:id,hat:'none'}:{outfit:wd.look.outfit,hat:id};
  try{drawQ7(60,152,0.56,look,true);}catch(e){}ctx=old;}
function buildGrid(){const k=wd.tab,ids=k==='outfit'?OUTFIT_IDS:['none'].concat(HAT_IDS),G=$('wdGrid');G.innerHTML='';
  for(const id of ids){const it=itemOf(k,id),c=document.createElement('button');c.className='card';c.dataset.id=id;c.type='button';
    const cv=document.createElement('canvas');cv.width=240;cv.height=300;c.appendChild(cv);drawCard(cv,k,id);
    c.insertAdjacentHTML('beforeend','<div class="nm">'+it.name+'</div><div class="pr '+(owns(k,id)?'own':'')+'">'+(owns(k,id)?'已拥有':'¥'+it.price)+'</div>'+(isNew(k,id)&&!owns(k,id)?'<span class="new">新</span>':''));
    c.addEventListener('click',()=>{sfx('pick');wd.focus={kind:k,id};wd.look[k]=id;if(k==='outfit'&&wd.tab==='outfit'){}updateWd();q7Act('twirl',0.8);});G.appendChild(c);}
  markCards();}
function markCards(){const k=wd.tab;$('wdGrid').querySelectorAll('.card').forEach(c=>{c.classList.toggle('sel',c.dataset.id===wd.focus.id);c.classList.toggle('wear',SAVE[k]===c.dataset.id);});}
function updateWd(){const f=wd.focus,it=itemOf(f.kind,f.id),b=$('wdBtn');$('wdName').textContent=it.name;$('wdMoney').textContent='存款 ¥'+SAVE.savings;
  if(!owns(f.kind,f.id)){if(SAVE.savings>=it.price){b.disabled=false;b.textContent='¥'+it.price+' 买下';}else{b.disabled=true;b.textContent='还差 ¥'+(it.price-SAVE.savings);}}
  else if(SAVE[f.kind]===f.id){b.disabled=true;b.textContent='已经穿着咯';}else{b.disabled=false;b.textContent='穿上';}
  $('wdReset').disabled=wd.look.outfit===SAVE.outfit&&wd.look.hat===SAVE.hat;markCards();}
$('wdReset').addEventListener('click',()=>{sfx('click');wd.look={outfit:SAVE.outfit,hat:SAVE.hat};wd.focus={kind:wd.tab,id:SAVE[wd.tab]};if(wd.tab==='hat')buildGrid();updateWd();});
$('wdBtn').addEventListener('click',()=>{const f=wd.focus,it=itemOf(f.kind,f.id);
  if(owns(f.kind,f.id)){equip(f.kind,f.id);return;}
  if(SAVE.savings<it.price)return;sfx('click');
  confirmDlg('买下「'+it.name+'」？','花 <b>¥'+it.price+'</b>，存款还剩 ¥'+(SAVE.savings-it.price)+'。','买！',ok=>{if(!ok)return;
    if(owns(f.kind,f.id)||SAVE.savings<it.price)return;SAVE.savings-=it.price;SAVE.owned[f.kind].push(f.id);persist();sfx('buy');sparkles(26);equip(f.kind,f.id,true);buildGrid();updateWd();});});
const WEAR_SAY=['安逸！好看噻～','巴适得板！','要得，就穿这身！','嘿嘿，漂不漂亮嘛？','新衣服，美滋滋～'];
function equip(k,id,bought){SAVE[k]=id;wd.look[k]=id;persist();if(!bought)sfx('pick');sparkles(bought?0:10);q7Act('twirl',1.2);q7Say(WEAR_SAY[Math.floor(Math.random()*WEAR_SAY.length)],2);updateWd();}
function sparkles(n){const box=document.querySelector('.wd-left');for(let i=0;i<n;i++){const s=document.createElement('span');s.className='sparkle';s.style.left=(30+Math.random()*40)+'%';s.style.top=(30+Math.random()*40)+'%';
  s.style.setProperty('--dx',(Math.random()*240-120)+'px');s.style.setProperty('--dy',(Math.random()*240-150)+'px');s.style.animationDelay=(Math.random()*0.25)+'s';box.appendChild(s);setTimeout(()=>s.remove(),1300);}}
const wdPrev=$('wdPrev'),wctx=wdPrev.getContext('2d');
function drawWdPrev(){const old=ctx;ctx=wctx;ctx.setTransform(1,0,0,1,0,0);ctx.clearRect(0,0,wdPrev.width,wdPrev.height);ctx.fillStyle='rgba(255,255,255,.45)';ell(210,500,150,18);ctx.fill();
  drawQ7(210,470,1.85,wd.look);ctx.save();ctx.translate(24,46);ctx.scale(1.6,1.6);drawQ7Say(0,0,230);ctx.restore();ctx=old;}
// ---------- 主循环 ----------
let lastT=performance.now(),fpsAcc=0,fpsN=0,fps=60;
function step(dt){now+=dt;fxUpdate(dt);if(state==='play'&&paused){q7Update(0);return;}const gdt=fx.slow>0?dt*0.45:dt;update(gdt);}
function draw(dt){render();if(isOpen('title'))drawMascot(dt);if(isOpen('wardrobe'))drawWdPrev();}
function frame(t){requestAnimationFrame(frame);let dt=(t-lastT)/1000;lastT=t;if(TEST)return;if(document.hidden)return;dt=clamp(dt,0,0.05);fpsAcc+=dt;fpsN++;if(fpsAcc>=1){fps=Math.round(fpsN/fpsAcc);fpsAcc=0;fpsN=0;}step(dt);draw(dt);}
window.advanceTime=ms=>{const n=Math.max(1,Math.round(ms/(1000/60)));for(let i=0;i<n;i++)step(1/60);draw(1/60);};
window.render_game_to_text=()=>{const r=x=>Math.round(x*10)/10;return JSON.stringify({coord:'logical '+W+'x'+H+', origin top-left, y down',state,paused,overlay:ovOpen(),day:SAVE.day,time:r(time),coins,savings:SAVE.savings,combo,bossRound,
  slots:slots.map((s,i)=>s?{i,type:s.type,t:r(s.t),step:s.step,next:s.step<3?STEPS[s.step]:null,done:doneness(s),ready:sellable(s),x:r(L.slots[i].cx),y:r(L.slots[i].top+L.slots[i].len/2)}:null),
  customers:spots.map((c,i)=>c?{i,boss:!!c.isBoss,phase:c.phase,patience:r(c.patience),order:c.order.map(o=>({type:o.type,need:o.need,got:o.got})),x:r(custPos(i).cx)}:null),
  stats:{sold,served,lost,burnt:burntCount,perfect:perfectCount},q7:{act:Q.act,say:Q.sayT>0?Q.say:''},look:curLook(),fps});};
window.__bbq={get W(){return W;},get H(){return H;},get state(){return state;},get slots(){return slots;},get spots(){return spots;},get L(){return L;},get SAVE(){return SAVE;},get coins(){return coins;},get time(){return time;},set time(v){time=v;},
  startGame,tap,placeSkewer,tapSkewer,serve,batchTool,serveAllReady,trashBurnt,setPause,setMuted,openWardrobe,closeWardrobe,toBackground,doneness,sellable,stagesOf,custWants,bestCustomerFor,hit,
  HOOK,persist,setDay(n){SAVE.day=n;DF=diff();},get AU(){return AU;},SPEECH_LOG,get speechLog(){return SPEECH_LOG;},get GRANTED(){return GRANTED;}};
resize();renderTitle();syncMuteUI();showOv('title');requestAnimationFrame(frame);
if(TEST)draw(0);
