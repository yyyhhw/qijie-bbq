"use strict";
// ================= 配置 =================
const TEST=/[?&]test=1/.test(location.search);
const ROUND=90,MAX_SLOTS=6,MAX_CUST=4;
// p0=烤熟需要的秒数；win=「刚好」窗口；warn=「快糊了」宽限（这段时间也能卖）；调好料且熟了的串会自动「保温」（升温变慢）
const TYPES={
  potato:{name:'土豆片',price:3,p0:7,win:24,warn:8,raw:'#f6e7b0',cook:'#efb048',over:'#b8742a',burn:'#3a2a1c'},
  wing:{name:'烤鹅翅',price:7,p0:10,win:26,warn:8,raw:'#f7d9c4',cook:'#de8a2c',over:'#9a521c',burn:'#2e1c10'},
  gut:{name:'牛肠',price:5,p0:12,win:28,warn:8,raw:'#f3c6b8',cook:'#d98744',over:'#9a4c22',burn:'#33221a'}};
const TYPE_KEYS=['potato','wing','gut'];
const STEPS=['salt','flip','chili'],STEP_NAME={salt:'撒盐',flip:'翻面',chili:'撒辣椒'};
const KEEPWARM=0.4;
// ================= 存档（版本化 + 迁移 + 备份）=================
const SAVE_KEY='qijie-bbq-save-v1',SAVE_VER=2;
function defSave(){return {v:SAVE_VER,savings:0,best:0,rounds:0,bossWins:0,day:1,owned:{outfit:['apron'],hat:['bandana']},outfit:'apron',hat:'bandana',muted:false,music:true,grant1000:false,burnt:0,served:0,helpSeen:false};}
let storageOK=true,saveNote='';
const MIGRATIONS={1:d=>{d.day=Math.max(1,(Number(d.rounds)||0)+1);d.muted=false;d.music=true;d.grant1000=false;return d;}};
function sanitizeSave(d){const s=defSave();if(!d||typeof d!=='object'||Array.isArray(d))return s;const num=v=>{v=Number(v);return Number.isFinite(v)&&v>=0?Math.min(1e9,Math.floor(v)):0;};
  let v=Number(d.v)||1;while(v<SAVE_VER&&MIGRATIONS[v]){d=MIGRATIONS[v](d);v++;}
  s.savings=num(d.savings);s.best=num(d.best);s.rounds=num(d.rounds);s.bossWins=num(d.bossWins);s.day=Math.max(1,num(d.day)||1);s.burnt=num(d.burnt);s.served=num(d.served);
  s.muted=!!d.muted;s.music=d.music!==false;s.grant1000=!!d.grant1000;s.helpSeen=!!d.helpSeen;
  for(const k of['outfit','hat']){const valid=k==='outfit'?OUTFITS:HATS,list=d.owned&&Array.isArray(d.owned[k])?d.owned[k]:[];for(const id of list)if(typeof id==='string'&&Object.prototype.hasOwnProperty.call(valid,id)&&!s.owned[k].includes(id))s.owned[k].push(id);}
  if(typeof d.outfit==='string'&&s.owned.outfit.includes(d.outfit))s.outfit=d.outfit;
  if(d.hat==='none'||(typeof d.hat==='string'&&s.owned.hat.includes(d.hat)))s.hat=d.hat;return s;}
function loadSave(){let raw=null;try{raw=window.localStorage.getItem(SAVE_KEY);}catch(e){storageOK=false;saveNote='浏览器不能保存进度，关掉页面后存款会消失';return defSave();}
  if(raw==null)return defSave();let d=null;try{d=JSON.parse(raw);}catch(e){d=null;}
  if(!d||typeof d!=='object'){let b=null;try{b=JSON.parse(localStorage.getItem(SAVE_KEY+'-bak'));}catch(e){b=null;}
    if(b&&typeof b==='object'){saveNote='存档读取失败，已用备份恢复';return sanitizeSave(b);}
    saveNote='存档损坏，已重新开始～';try{localStorage.setItem(SAVE_KEY+'-bad',String(raw).slice(0,5000));}catch(e){}}
  return sanitizeSave(d);}
function persist(){try{const old=localStorage.getItem(SAVE_KEY);if(old)localStorage.setItem(SAVE_KEY+'-bak',old);localStorage.setItem(SAVE_KEY,JSON.stringify(SAVE));storageOK=true;}catch(e){storageOK=false;saveNote='浏览器不能保存进度，关掉页面后存款会消失';}}
let SAVE=loadSave(),GRANTED=0;
// 一次性：存款补到至少 ¥1000（新玩家直接 1000 开局；老存档只补一次，不动已买的衣服和纪录）
if(!SAVE.grant1000){GRANTED=Math.max(0,1000-SAVE.savings);SAVE.savings=Math.max(SAVE.savings,1000);SAVE.grant1000=true;SAVE.v=SAVE_VER;persist();}
function curLook(){return {outfit:SAVE.outfit,hat:SAVE.hat};}
// ================= 难度：按「第几天」平缓上升 =================
function diff(){const d=clamp((SAVE.day-1)/9,0,1);return {d,win:1-0.28*d,warn:1-0.25*d,heat:1+0.12*d,pat:1.3-0.32*d,spawn:1-0.3*d,big:d};}
let DF=diff();
// ================= 画布 / 布局 =================
const cvs=$('c');const mainCtx=cvs.getContext('2d');ctx=mainCtx;
let W=1280,H=720,L=null,scale=1,DPR=1,safe={t:0,r:0,b:0,l:0};
function readSafe(){const cs=getComputedStyle($('safeProbe'));safe={t:parseFloat(cs.paddingTop)||0,r:parseFloat(cs.paddingRight)||0,b:parseFloat(cs.paddingBottom)||0,l:parseFloat(cs.paddingLeft)||0};}
function buildLayout(){readSafe();const aw=Math.max(200,innerWidth-safe.l-safe.r),ah=Math.max(200,innerHeight-safe.t-safe.b),asp=aw/ah,port=asp<1;
  if(!port){H=720;W=Math.round(clamp(720*asp,1180,1560));const gx=262,gw=W-262*2,sw=(gw-40)/6,py=356;
    L={port:false,hud:{h:72},counterY:306,counterH:42,q7:{x:146,base:330,s:1.1,sayX:226,sayY:118,sayW:250},
      spots:[0,1,2,3].map(i=>{const x0=300,w=(W-24-x0)/4;return {cx:x0+w*(i+0.5),base:306,sc:0.8,w};}),
      trays:[0,1,2].map(i=>({x:14,y:py+i*120,w:234,h:112})),grill:{x:gx,y:py,w:gw,h:H-py-10},
      tools:['salt','flip','chili','bin'].map((id,i)=>({id,x:W-248,y:py+i*90,w:234,h:82})),
      prepY:py-14,toastY:338,bossSpot:{cx:(300+W)/2+40,base:306,sc:0.9}};}
  else{H=1480;W=Math.round(clamp(1480*asp,680,860));const ox=(W-720)/2,gy=700;
    L={port:true,ox,hud:{h:96},counterY:440,counterH:52,q7:{x:ox+156,base:722,s:1.05,sayX:ox+262,sayY:560,sayW:420},
      spots:[0,1,2,3].map(i=>({cx:ox+92+i*179,base:440,sc:0.8,w:176})),
      trays:[0,1,2].map(i=>({x:ox+10+i*236,y:1094,w:228,h:150})),grill:{x:ox+10,y:gy,w:700,h:380},
      tools:['salt','flip','chili','bin'].map((id,i)=>({id,x:ox+10+i*177.5,y:1256,w:170,h:140})),
      prepY:684,toastY:1436,bossSpot:{cx:ox+380,base:440,sc:0.98}};}
  const G=L.grill,iw=G.w-40,sw=iw/MAX_SLOTS;
  L.slots=[];for(let i=0;i<MAX_SLOTS;i++)L.slots.push({cx:G.x+20+sw*(i+0.5),w:sw,ringY:G.y+44,top:G.y+(L.port?104:96),len:L.port?200:180,labelY:G.y+G.h-(L.port?30:26)});
  if(!L.port){const h=L.hud.h;L.ui={avatar:{x:44,y:h/2,r:29},day:{x:84,y:h/2},time:{x:W/2-110,y:10,w:220,h:h-20},coin:{x:W-372,y:10,w:180,h:h-20},mute:{x:W-176,y:8,w:76,h:h-16},pause:{x:W-92,y:8,w:80,h:h-16}};}
  else{const h=L.hud.h,o=L.ox;L.ui={avatar:{x:o+50,y:h/2,r:36},day:{x:o+94,y:h/2},time:{x:o+224,y:14,w:160,h:h-28},coin:{x:o+394,y:14,w:166,h:h-28},mute:{x:o+570,y:12,w:68,h:h-24},pause:{x:o+644,y:12,w:68,h:h-24}};}
  L.coinPos={x:L.ui.coin.x+28,y:L.ui.coin.y+L.ui.coin.h/2};
  bgCache=null;}
function resize(){buildLayout();DPR=Math.min(2,window.devicePixelRatio||1);const aw=innerWidth-safe.l-safe.r,ah=innerHeight-safe.t-safe.b;
  scale=Math.min(aw/W,ah/H);const cw=Math.floor(W*scale),ch=Math.floor(H*scale);
  cvs.width=Math.floor(cw*DPR);cvs.height=Math.floor(ch*DPR);cvs.style.width=cw+'px';cvs.style.height=ch+'px';
  cvs.style.left=(safe.l+(aw-cw)/2)+'px';cvs.style.top=(safe.t+(ah-ch)/2)+'px';}
let rsT=0;addEventListener('resize',()=>{clearTimeout(rsT);rsT=setTimeout(resize,60);});addEventListener('orientationchange',()=>setTimeout(resize,250));
// ================= 状态 =================
let state='title',paused=false,time=ROUND,coins=0,shownCoins=0,served=0,lost=0,burntCount=0,sold=0,rejected=0,perfectCount=0,selected=-1,nextCust=1.5,elapsed=0,lastTick=99;
let idleSay=12,combo=0,comboT=0,bestCombo=0,coinPop=0,overT=0;
const fx={flash:0,ring:0,slow:0,shake:0,callout:null,banner:null,sweep:null,trauma:0};
let flyers=[],coinFlys=[],ultT=0,bossRound=false,bossResult='none',bossSpawnT=0,bossEndT=0,bossType='potato',warnSaid=0;
let slots=new Array(MAX_SLOTS).fill(null),spots=new Array(MAX_CUST).fill(null),particles=[],floats=[],toast=null,drag=null,custId=0,now=0;
const HOOK={forceSkillA:null,forceSkillB:null,forceBoss:null,stats:{rolls:0,a:0,b:0}};
const KINDS=['cat','bear','rabbit','panda','boy','granny','girl'];
function newSkewer(type){const dots=[];for(let i=0;i<26;i++)dots.push([rand(-1,1),rand(-1,1),Math.floor(rand(0,4))]);
  return {type,t:0,step:0,flipped:false,flipAnim:0,salt:0,chili:0,burnt:false,warned:false,amber:false,dots,pop:0,shake:0,squash:0,fromX:null,fromY:null,fly:1};}
function stagesOf(type){const T=TYPES[type],p0=T.p0,p1=p0+T.win*DF.win,p2=p1+T.warn*DF.warn;return {p0,p1,p2};}
function doneness(s){if(s.burnt)return 'burnt';const P=stagesOf(s.type);return s.t>=P.p2?'burnt':s.t>=P.p1?'warn':s.t>=P.p0?'perfect':s.t>=P.p0*0.5?'half':'raw';}
const sellable=s=>s&&!s.burnt&&s.step>=3&&(doneness(s)==='perfect'||doneness(s)==='warn');
function resetGame(){DF=diff();time=ROUND;coins=0;shownCoins=0;served=0;lost=0;burntCount=0;sold=0;rejected=0;perfectCount=0;selected=-1;nextCust=1.5;elapsed=0;lastTick=99;combo=0;comboT=0;bestCombo=0;
  slots.fill(null);spots.fill(null);particles=[];floats=[];toast=null;drag=null;flyers=[];coinFlys=[];ultT=0;bossRound=false;bossResult='none';bossSpawnT=0;bossEndT=0;warnSaid=0;
  Object.assign(fx,{flash:0,ring:0,slow:0,shake:0,callout:null,banner:null,sweep:null,trauma:0});}
function startGame(){audioUnlock();unlockSpeech();resetGame();state='play';paused=false;showOv(null);
  showToast('第'+SAVE.day+'天开张！点生串托盘上架～','#fff');sfx('happy');q7Act('wave',1.2);q7Say(SAVE.day===1?'开张咯！大哥大姐来尝一下嘛～':'第'+SAVE.day+'天，开张咯！',2.4);musicSync();}
function showToast(text,color,warn){toast={text,color:color||'#fff',t:0,dur:1.9,warn:!!warn};}
function addFloat(text,x,y,color,size,dur){floats.push({text,x,y,color:color||'#ffd23f',size:size||30,t:0,dur:dur||1.2});}
function earn(n,x,y,label,col){if(n<=0)return;coins+=n;addFloat(label||('+¥'+n),x,y,col||'#ffd23f',label?26:32);const k=Math.min(8,2+n);for(let i=0;i<k;i++)coinFlys.push({x:x+rand(-14,14),y:y+rand(-10,10),vx:rand(-160,160),vy:rand(-260,-120),t:-i*0.04,dur:0.75+rand(0,0.15),val:i===k-1?n:0});}
function addTrauma(a){fx.trauma=Math.min(1,fx.trauma+a);}
// ================= 顾客 =================
function spawnCustomer(){const free=[];spots.forEach((s,i)=>{if(!s)free.push(i);});if(!free.length)return;
  const idx=free[Math.floor(Math.random()*free.length)],prog=elapsed/ROUND,big=DF.big;
  const r=Math.random(),p1=0.55-0.25*big-0.1*prog,p3=0.05+0.2*big+0.05*prog,n=r<p1?1:r<1-p3?2:3;
  const counts={};for(let i=0;i<n;i++){const k=TYPE_KEYS[Math.floor(Math.random()*3)];counts[k]=(counts[k]||0)+1;}
  const order=Object.keys(counts).map(k=>({type:k,need:counts[k],got:0}));const maxP=(48+16*n)*DF.pat*(1-0.08*prog);
  spots[idx]={id:++custId,kind:KINDS[Math.floor(Math.random()*KINDS.length)],order,patience:maxP,maxP,phase:'enter',anim:0,bob:rand(0,6),mood:0,react:0,reactText:'',reactGood:false,pending:0,
    col:['#ff9aa2','#a0d8ef','#b5e48c','#ffd166','#cdb4db','#f4a261','#9ad1c8'][Math.floor(Math.random()*7)],hop:0};
  sfx('arrive');}
function custWants(c,type){return c&&c.phase==='wait'&&c.order.some(o=>o.type===type&&o.got+(o.inbound||0)<o.need);}
// ================= 烤串操作 =================
function freeSlot(){return slots.findIndex(s=>!s);}
function placeSkewer(type,at,fromRect){let i=at!=null&&!slots[at]?at:freeSlot();if(i<0){showToast('烤架满咯！先卖掉或者扔掉几串','#ffd0c0',true);sfx('warn');q7Say('烤架摆满咯～',1.2);return false;}
  const s=newSkewer(type);slots[i]=s;const S=L.slots[i];
  if(fromRect){s.fromX=fromRect.x+fromRect.w/2;s.fromY=fromRect.y+fromRect.h/2;s.fly=0;}else{s.fly=1;s.squash=1;puffAt(S.cx,S.top+S.len*0.5,6,'rgba(255,240,210,.9)');}
  sfx('place');return true;}
function stepFx(s,i,st){const S=L.slots[i];s.squash=1;
  if(st==='salt'){s.salt++;sfx('salt');sprinkle(S.cx,S.top+30,'#ffffff');}
  else if(st==='chili'){s.chili++;sfx('chili');sprinkle(S.cx,S.top+30,'#ff3b2a');}
  else{s.flipped=!s.flipped;s.flipAnim=1;sfx('flip');puffAt(S.cx,S.top+S.len*0.5,5,'rgba(255,230,200,.8)');}
  if(s.step===3){addFloat('调好咯',S.cx,S.ringY-36,'#7cff7a',22,0.9);}}
function doStep(i,st){const s=slots[i];if(!s||s.burnt||s.step>=3)return false;if(st&&STEPS[s.step]!==st)return false;const cur=STEPS[s.step];s.step++;stepFx(s,i,cur);return cur;}
function batchTool(st){let n=0,last=-1;slots.forEach((s,i)=>{if(s&&!s.burnt&&s.step<3&&STEPS[s.step]===st){doStep(i,st);n++;last=i;}});
  if(!n){const nxt=slots.filter(s=>s&&!s.burnt&&s.step<3);showToast(nxt.length?'现在没有串要「'+STEP_NAME[st]+'」，下一步看串上的图标哦':'先放几串上烤架嘛～','#ffe0a0');sfx('soft');return 0;}
  q7Act(st==='flip'?'flip':st,0.55);if(st!=='flip')rollSkill(st,last);if(n>1)addFloat(STEP_NAME[st]+' ×'+n,L.grill.x+L.grill.w/2,L.grill.y+24,'#fff3c4',24,0.9);return n;}
// 点烤串 = 做它的下一步；调好又熟了 = 直接上给要它的顾客
function tapSkewer(i){const s=slots[i];if(!s)return;
  if(s.burnt||doneness(s)==='burnt'){throwAway(i);return;}
  if(s.step<3){const st=doStep(i);q7Act(st==='flip'?'flip':st,0.5);if(st!=='flip')rollSkill(st,i);return;}
  if(sellable(s)){const ci=bestCustomerFor(s.type);if(ci>=0){serve(i,ci);return;}
    selected=selected===i?-1:i;sfx('pick');showToast('还没有人点「'+TYPES[s.type].name+'」，先放到起保温～','#fff');return;}
  s.shake=0.35;sfx('soft');showToast('还没烤熟，等一哈哈儿～看圆圈变绿就好咯','#ffe0a0');}
function bestCustomerFor(type){let best=-1,bp=9;spots.forEach((c,i)=>{if(custWants(c,type)){const pf=c.patience/c.maxP;if(pf<bp){bp=pf;best=i;}}});return best;}
function throwAway(i){const s=slots[i];if(!s)return;const S=L.slots[i];slots[i]=null;if(selected===i)selected=-1;sfx('trash');
  const b=L.tools.find(t=>t.id==='bin');flyers.push({kind:'trash',s,x0:S.cx,y0:S.top+S.len*0.4,tx:b.x+b.w/2,ty:b.y+b.h/2,t:0,dur:0.45,spin:rand(6,9)});}
function serve(i,ci){const s=slots[i],c=spots[ci];if(!s||!c||c.phase!=='wait')return false;
  const react=(t)=>{c.react=1.4;c.reactText=t;c.reactGood=false;sfx('reject');rejected++;s.shake=0.35;};
  const d=doneness(s);
  if(s.burnt||d==='burnt'){react('糊了！不要！');return false;}
  if(s.step<3){react('还没调味呢');return false;}
  if(d==='raw'||d==='half'){react('还是生的！');return false;}
  const o=c.order.find(o=>o.type===s.type&&o.got+(o.inbound||0)<o.need);if(!o){react('我没点这个哦');return false;}
  o.inbound=(o.inbound||0)+1;c.pending++;slots[i]=null;if(selected===i)selected=-1;const S=L.slots[i];
  flyers.push({kind:'serve',s,ci,cid:c.id,o,x0:S.cx,y0:S.top+S.len*0.45,t:0,dur:0.42,spin:rand(4,6),perfect:d==='perfect'});sfx('whoosh');
  return true;}
function deliver(f){const c=spots[f.ci];if(!c||c.id!==f.cid)return;const T=TYPES[f.s.type],sp=custPos(f.ci);
  f.o.inbound--;f.o.got++;c.pending--;sold++;c.hop=1;
  const hx=sp.cx,hy=sp.base-150*sp.sc;
  earn(T.price+(f.perfect?1:0),hx+rand(-16,16),hy,f.perfect?'+¥'+(T.price+1)+' 完美！':null,f.perfect?'#7cff7a':null);if(f.perfect)perfectCount++;
  sfx('ding');sparkBurst(hx,sp.base-100*sp.sc,10,['#ffd23f','#fff3a0']);
  if(c.pending===0&&c.order.every(o=>o.got>=o.need))completeCustomer(c,f.ci);
  else{c.react=0.9;c.reactText=c.isBoss?'还要还要！':f.perfect?'好香！':'有点焦，也好吃';c.reactGood=true;if(ultT<=0){q7Act('happy',0.7);q7Say(c.isBoss?'马上就来！':'来咯～',1.1);}}}
function completeCustomer(c,ci){const sp=custPos(ci);if(c.isBoss){bossWin(c);return;}
  combo=comboT>0?combo+1:1;comboT=9;bestCombo=Math.max(bestCombo,combo);
  const tip=Math.ceil(3*c.patience/c.maxP)+(combo>=2?Math.min(5,combo-1):0);served++;c.phase='leaveHappy';c.anim=0;c.mood=1;
  setTimeout(()=>sfx('happy'),150);if(ultT<=0){q7Act('happy',1.1);q7Say(Q_HAPPY[Math.floor(Math.random()*Q_HAPPY.length)]);}
  earn(tip,sp.cx,sp.base-205*sp.sc,'小费 +¥'+tip,'#7cff7a');
  if(combo>=2){fx.callout={text:'连击 ×'+combo+'！',t:0,dur:1.2,kind:'C'};sfx('combo',combo);addTrauma(0.12);}
  coinBurst(sp.cx,sp.base-120*sp.sc);}
// ================= 绝技 =================
function rollSkill(st,i){HOOK.stats.rolls++;const r=Math.random();
  const B=HOOK.forceSkillB!=null?!!HOOK.forceSkillB:r<0.06;if(B){HOOK.stats.b++;skillB();return 'B';}
  const A=HOOK.forceSkillA!=null?!!HOOK.forceSkillA:(r>=0.06&&r<0.2);if(A){HOOK.stats.a++;skillA(st,i);return 'A';}return null;}
function skillA(st,i){const col=st==='salt'?'#ffffff':'#ff3b2a';let n=0;
  slots.forEach((s,j)=>{if(!s||j===i||s.burnt||s.step>=3)return;const cur=STEPS[s.step];s.step++;stepFx(s,j,cur);n++;s.pop=0.75;const S=L.slots[j];sparkBurst(S.cx,S.top+S.len*0.45,14,['#fff7b0','#ffd23f',col]);});
  if(i>=0){const S=L.slots[i];sparkBurst(S.cx,S.top+S.len*0.45,12,['#fff7b0','#ffd23f',col]);}
  fx.sweep={t:0,dur:0.8,col};fx.callout={text:'全场撒料！',t:0,dur:1.5,kind:'A',st,n};sfx('skillA');
  q7Act('bigSprinkle',1.2,st);q7Say(st==='salt'?'撒盐咯～人人有份！':'辣椒管够哈！',1.5);return n;}
function skillB(){ultT=2.2;fx.slow=1.0;fx.flash=1;fx.ring=0.001;addTrauma(0.45);fx.callout={text:'看我的噻！',t:0,dur:2.1,kind:'B'};
  sfx('skillB');q7Act('ult',2.1);q7Say('看我的噻！巴适得板！',2.4);speak('看我的噻！',false);
  const G=L.grill,gcx=G.x+G.w/2,gcy=G.y+G.h/2;
  for(let k=0;k<70;k++)particles.push({type:'swirl',cx:gcx,cy:gcy,a:rand(0,6.28),rad:rand(90,G.w*0.62),w:rand(3,6),vr:rand(-170,-60),x:gcx,y:gcy,vx:0,vy:0,life:rand(0.9,1.5),max:1.5,r:rand(2.5,5),col:['#ffd23f','#fff3a0','#ff9f1c','#ffffff'][k%4]});
  let sent=0,kept=0;
  slots.forEach((s,i)=>{if(!s||s.burnt)return;const P=stagesOf(s.type);s.salt=Math.max(1,s.salt);s.chili=Math.max(1,s.chili);if(s.step<2)s.flipped=!s.flipped;s.step=3;if(s.t<P.p0+0.4)s.t=P.p0+0.4;if(s.t>P.p1-1)s.t=P.p1-1;s.flipAnim=1;s.warned=false;
    const S=L.slots[i];sparkBurst(S.cx,S.top+S.len*0.45,14,['#fff7b0','#ffd23f','#ff9f1c']);
    const ci=bestCustomerFor(s.type);if(ci>=0&&serve(i,ci))sent++;else kept++;});
  return {sent,kept};}
function custPos(i){const c=spots[i];return c&&c.isBoss?L.bossSpot:L.spots[i];}
// ================= BOSS 大胃王 =================
const BOSS_NEED=5,BOSS_TIME=22;
function bossThreshold(){return 70+Math.min(40,SAVE.day*5);}
function startBossRound(){bossRound=true;bossResult='pending';time=BOSS_TIME;lastTick=99;bossType=TYPE_KEYS[Math.floor(Math.random()*3)];
  spots.forEach(c=>{if(c&&(c.phase==='wait'||c.phase==='enter')){c.phase='leaveHappy';c.anim=0;c.mood=0;}});
  bossSpawnT=1.1;fx.banner={t:0,dur:2.3};addTrauma(0.5);sfx('bossIn');q7Act('shock',1.0);q7Say('大胃王来咯！莫慌莫慌！',2);showToast('BOSS 加时赛 +'+BOSS_TIME+' 秒！','#ffe066');musicSync();}
function spawnBoss(){spots.fill(null);spots[0]={id:++custId,isBoss:true,kind:'boss',order:[{type:bossType,need:BOSS_NEED,got:0}],patience:BOSS_TIME,maxP:BOSS_TIME,phase:'enter',anim:0,bob:0,mood:0,react:0,reactText:'',pending:0,hop:0};}
function bossWin(c){bossResult='win';served++;c.phase='cry';c.anim=0;c.mood=1;c.react=3.2;c.reactText='太好吃了！';c.reactGood=true;bossEndT=3.2;
  const sp=L.bossSpot;sfx('bossWin');speak('太好吃了！',true);earn(30,sp.cx,sp.base-175*sp.sc,'击败Boss！+¥30','#ffe066');coinBurst(sp.cx-120*sp.sc,sp.base-60*sp.sc);coinBurst(sp.cx+120*sp.sc,sp.base-60*sp.sc);
  fx.flash=Math.max(fx.flash,0.5);addTrauma(0.4);setTimeout(()=>{if(state==='play'){q7Act('happy',1.6);q7Say('谢谢大王，巴适噻～',2);}},ultT>0?1200:0);}
function bossCustUpdate(c,i,dt){const sp=L.bossSpot;
  if(c.phase==='enter'){c.anim+=dt*0.9;if(c.anim>=1){c.anim=1;c.phase='wait';addTrauma(0.35);sfx('thud');}}
  else if(c.phase==='wait'){c.patience=Math.max(0,time);}
  else if(c.phase==='cry'){c.anim+=dt;const S=sp.sc;if(Math.random()<dt*26)for(const d of[-1,1])particles.push({x:sp.cx+d*40*S,y:sp.base-150*S,vx:d*rand(70,170),vy:rand(-170,-60),life:rand(.5,.8),max:.8,r:rand(3.5,6),col:'#8fd3ff',type:'dot',g:600});}
  else if(c.phase==='leaveAngry'){c.anim+=dt*0.75;if(c.anim>=1)spots[i]=null;}}
// ================= 粒子 =================
function puffAt(x,y,n,col){for(let i=0;i<n;i++){const a=rand(0,6.28),v=rand(30,140);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-30,life:rand(.3,.6),max:.6,r:rand(4,9),col,type:'puff'});}}
function sprinkle(x,y,col){for(let i=0;i<22;i++)particles.push({x:x+rand(-22,22),y:y-rand(40,80),vx:rand(-20,20),vy:rand(80,220),life:rand(.4,.7),max:.7,r:rand(1.5,3),col,type:'dot',g:500});}
function sparkBurst(x,y,n,cols){for(let k=0;k<n;k++){const a=rand(0,6.28),v=rand(60,220);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-40,life:rand(.45,.85),max:.85,r:rand(2.5,5),col:cols[k%cols.length],type:'spark',g:120});}}
function coinBurst(x,y){for(let i=0;i<10;i++){const a=rand(-2.8,-0.3),v=rand(150,300);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rand(.5,.8),max:.8,r:6,col:'#ffd23f',type:'coin',g:700});}}
function smoke(x,y,kind){particles.push({x:x+rand(-12,12),y,vx:rand(-10,10),vy:rand(-60,-30),life:rand(1,1.6),max:1.6,r:rand(9,15),col:kind,type:'smoke'});}
function ember(G){particles.push({x:G.x+rand(30,G.w-30),y:G.y+G.h-rand(30,60),vx:rand(-15,15),vy:rand(-110,-60),life:rand(.6,1.2),max:1.2,r:rand(1.2,2.4),col:Math.random()<0.5?'#ffb347':'#ff7a2a',type:'ember'});}
// ================= 更新 =================
function update(dt){q7Update(dt);
  for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.life-=dt;if(p.type==='swirl'){p.a+=p.w*dt;p.rad=Math.max(10,p.rad+p.vr*dt);p.x=p.cx+Math.cos(p.a)*p.rad;p.y=p.cy+Math.sin(p.a)*p.rad*0.55;if(p.life<=0)particles.splice(i,1);continue;}
    if(p.g)p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='smoke'){p.r+=dt*16;p.vx*=0.98;}if(p.type==='ember')p.vx+=Math.sin(now*6+p.y*0.05)*20*dt;if(p.life<=0)particles.splice(i,1);}
  if(particles.length>420)particles.splice(0,particles.length-420);
  for(let i=floats.length-1;i>=0;i--){floats[i].t+=dt;if(floats[i].t>floats[i].dur)floats.splice(i,1);}
  if(toast){toast.t+=dt;if(toast.t>toast.dur)toast=null;}
  for(let i=coinFlys.length-1;i>=0;i--){const c=coinFlys[i];c.t+=dt;if(c.t<0)continue;if(c.t<0.18){c.x+=c.vx*dt;c.y+=c.vy*dt;c.vy+=900*dt;c.sx=c.x;c.sy=c.y;}
    if(c.t>=c.dur){coinFlys.splice(i,1);coinPop=1;sfx('coin',Math.floor(shownCoins/3));if(c.val)shownCoins=Math.min(coins,shownCoins+c.val);}}
  if(!coinFlys.length)shownCoins=coins;coinPop=Math.max(0,coinPop-dt*4);
  comboT=Math.max(0,comboT-dt);if(comboT<=0)combo=0;
  const G=L.grill;if(state!=='title'&&Math.random()<dt*6)ember(G);
  let cooking=0;
  slots.forEach((s,i)=>{if(!s)return;const S=L.slots[i];s.pop=Math.min(1,s.pop+dt*4);s.flipAnim=Math.max(0,s.flipAnim-dt*4);s.shake=Math.max(0,s.shake-dt);s.squash=Math.max(0,s.squash-dt*4);if(s.fly<1)s.fly=Math.min(1,s.fly+dt*4.5);
    if(state!=='play')return;cooking++;const P=stagesOf(s.type);
    const rate=DF.heat*((s.step>=3&&s.t>=P.p0&&!s.burnt)?KEEPWARM:1);s.t+=dt*rate;
    if(!s.burnt&&!s.amber&&s.t>=P.p0+(P.p1-P.p0)*0.8){s.amber=true;}
    if(!s.burnt&&!s.warned&&s.t>=P.p1){s.warned=true;sfx('warn');s.shake=0.5;addFloat('快糊了！',S.cx,S.ringY-34,'#ffb347',24,1.1);if(now-warnSaid>6){warnSaid=now;q7Act('worry',1);q7Say(s.step>=3?'快卖掉嘛，要糊咯！':'莫糊咯莫糊咯！',1.6);}}
    if(!s.burnt&&s.t>=P.p2){s.burnt=true;burntCount++;sfx('burnt');addFloat('糊咯…',S.cx,S.ringY-30,'#ff8a7a',24);
      if(selected===i)selected=-1;showToast('有一串烤糊咯，点它就扔掉','#ffd0c0',true);q7Act('worry',1.2);q7Say('哎呀，烤糊咯！',1.4);}
    const d=doneness(s);
    if(s.burnt){if(Math.random()<dt*10)smoke(S.cx,S.top+rand(20,S.len*0.8),'#3a3330');}
    else if(d==='warn'){if(Math.random()<dt*9)smoke(S.cx,S.top+rand(20,S.len*0.7),'#8a7a70');}
    else if(s.t>2&&Math.random()<dt*1.6)smoke(S.cx,S.top+rand(20,S.len*0.7),'#e8e2dc');});
  sizzleLevel(Math.min(0.07,cooking*0.013));
  updateFlyers(dt);
  spots.forEach((c,i)=>{if(!c)return;c.bob+=dt;c.react=Math.max(0,c.react-dt);c.hop=Math.max(0,c.hop-dt*3);if(c.isBoss){bossCustUpdate(c,i,dt);return;}
    if(c.phase==='enter'){c.anim+=dt*1.5;if(c.anim>=1){c.anim=1;c.phase='wait';}}
    else if(c.phase==='wait'){if(state==='play'&&!(c.pending>0)){c.patience-=dt;
      if(c.patience<=0){c.phase='leaveAngry';c.anim=0;c.mood=-1;lost++;combo=0;comboT=0;q7Act('worry',1.4);q7Say('莫走嘛～等一哈哈儿！');sfx('sad');const sp=L.spots[i];addFloat('生气走了',sp.cx,sp.base-170*sp.sc,'#ff8a7a',24);}}}
    else{c.anim+=dt*1.3;if(c.anim>=1)spots[i]=null;}});
  if(state!=='play')return;
  if(bossEndT>0){bossEndT-=dt;if(bossEndT<=0)endGame();return;}
  if(bossSpawnT>0){bossSpawnT-=dt;if(bossSpawnT<=0)spawnBoss();return;}
  if(spots[0]&&spots[0].isBoss&&spots[0].phase==='enter')return;
  elapsed+=dt;time-=dt;
  const sec=Math.ceil(time);if(sec<=10&&sec!==lastTick&&sec>0){lastTick=sec;sfx('tick');}
  if(!bossRound){nextCust-=dt;const waiting=spots.filter(c=>c&&c.phase==='wait').length;
    if(nextCust<=0||(waiting===0&&nextCust>1.2&&elapsed>4)){if(nextCust<=0||Math.random()<dt*0.8){spawnCustomer();const prog=elapsed/ROUND;nextCust=rand(6,9)*DF.spawn*(1-0.15*prog);}}}
  idleSay-=dt;if(idleSay<=0){idleSay=rand(14,22);if(Q.sayT<=0&&Q.act==='idle'&&ultT<=0)q7Say(Q_IDLE[Math.floor(Math.random()*Q_IDLE.length)],1.8);}
  if(time<=0){time=0;
    if(!bossRound){const want=HOOK.forceBoss!=null?!!HOOK.forceBoss:coins>=bossThreshold();if(want){startBossRound();return;}endGame();return;}
    const b=spots.find(c=>c&&c.isBoss);if(b&&b.phase==='wait'){b.phase='leaveAngry';b.anim=0;b.react=2.2;b.reactText='没吃饱…下次吧';b.reactGood=false;sfx('bossSad');q7Act('worry',1.4);q7Say('大王慢走哈～');}
    if(bossResult!=='win')bossResult='fail';endGame();}}
function updateFlyers(dt){for(let k=flyers.length-1;k>=0;k--){const f=flyers[k];f.t+=dt;
  if(f.kind==='serve'&&Math.random()<dt*40){const p=flyPos(f);particles.push({x:p.x+rand(-6,6),y:p.y+rand(-6,6),vx:rand(-20,20),vy:rand(-20,20),life:.4,max:.4,r:rand(2,3.5),col:Math.random()<.5?'#ffd23f':'#fff3a0',type:'spark'});}
  if(f.t>=f.dur){flyers.splice(k,1);if(f.kind==='serve')deliver(f);else{const b=L.tools.find(t=>t.id==='bin');puffAt(b.x+b.w/2,b.y+b.h/2,8,'#9a8a80');}}}}
function flyTarget(f){if(f.kind==='trash')return {x:f.tx,y:f.ty};const sp=custPos(f.ci);return {x:sp.cx,y:sp.base-(spots[f.ci]&&spots[f.ci].isBoss?110:95)*sp.sc};}
function flyPos(f){const k=clamp(f.t/f.dur,0,1),e=k*k*(3-2*k),tg=flyTarget(f),cx=(f.x0+tg.x)/2,cy=Math.min(f.y0,tg.y)-(f.kind==='trash'?90:150);
  return {x:(1-e)*(1-e)*f.x0+2*e*(1-e)*cx+e*e*tg.x,y:(1-e)*(1-e)*f.y0+2*e*(1-e)*cy+e*e*tg.y,k};}
function endGame(){state='over';overT=0;selected=-1;drag=null;sfx('end');
  const goal=starGoals(),st=coins>=goal[2]?3:coins>=goal[1]?2:coins>=goal[0]?1:0;const day=SAVE.day;
  SAVE.savings+=coins;SAVE.rounds++;SAVE.day++;const nb=coins>SAVE.best;if(nb)SAVE.best=coins;if(bossResult==='win')SAVE.bossWins++;SAVE.burnt+=burntCount;SAVE.served+=served;persist();
  window.__bbqResult={day,coins,served,lost,burntCount,sold,stars:st,rejected,perfectCount,bestCombo,bossRound,bossResult};
  renderOver(day,st,goal,nb);sizzleLevel(0);setTimeout(()=>{if(state==='over')showOv('over');},700);musicSync();}
function starGoals(){const d=DF.d;return [Math.round(25+15*d),Math.round(50+30*d),Math.round(90+50*d)];}

// ================= 输入：点按 / 拖拽 / 键盘 =================
function toLogical(e){const r=cvs.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*W,y:(e.clientY-r.top)/r.height*H};}
const inR=(p,r)=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h;
function slotRect(i){const S=L.slots[i],G=L.grill;return {x:S.cx-S.w/2,y:G.y,w:S.w,h:G.h};}
function spotRect(i){if(spots[i]&&spots[i].isBoss){const a=L.spots[0],b=L.spots[3];return {x:a.cx-a.w/2,y:L.hud.h+4,w:b.cx+b.w/2-(a.cx-a.w/2),h:L.counterY+L.counterH-L.hud.h-4};}const sp=L.spots[i];return {x:sp.cx-sp.w/2,y:L.hud.h+4,w:sp.w,h:L.counterY+L.counterH-L.hud.h-4};}
function hit(p){const U=L.ui;if(inR(p,U.pause))return {k:'pause'};if(inR(p,U.mute))return {k:'mute'};
  for(let i=0;i<3;i++)if(inR(p,L.trays[i]))return {k:'tray',i};
  for(const t of L.tools)if(inR(p,t))return {k:t.id==='bin'?'bin':'tool',id:t.id};
  for(let i=0;i<MAX_SLOTS;i++)if(inR(p,slotRect(i)))return {k:'slot',i};
  for(let i=0;i<MAX_CUST;i++)if(spots[i]&&inR(p,spotRect(i)))return {k:'cust',i};
  return {k:'none'};}
let down=null,pointer=null,press=null;
cvs.addEventListener('pointerdown',e=>{e.preventDefault();if(state!=='play'||paused||down)return;
  const p=toLogical(e);down={id:e.pointerId,x:p.x,y:p.y,h:hit(p)};press={h:down.h,t:0};try{cvs.setPointerCapture(e.pointerId);}catch(_){}});
cvs.addEventListener('pointermove',e=>{const p=toLogical(e);pointer=p;if(!down||e.pointerId!==down.id)return;
  if(!drag&&Math.hypot(p.x-down.x,p.y-down.y)>12/scale){const h=down.h;
    if(h.k==='tray')drag={kind:'tray',type:TYPE_KEYS[h.i],x:p.x,y:p.y,from:L.trays[h.i]};
    else if(h.k==='slot'&&slots[h.i])drag={kind:'slot',i:h.i,x:p.x,y:p.y};
    if(drag){press=null;sfx('pick');}}
  if(drag){drag.x=p.x;drag.y=p.y;}});
function endPointer(e,cancel){if(!down||e.pointerId!==down.id)return;const p=toLogical(e);const h=hit(p);press=null;
  if(drag){const d=drag;drag=null;if(!cancel){
      if(d.kind==='tray'){if(h.k==='slot')placeSkewer(d.type,slots[h.i]?null:h.i,{x:p.x-1,y:p.y-1,w:2,h:2});else if(inR(p,L.grill))placeSkewer(d.type,null,{x:p.x-1,y:p.y-1,w:2,h:2});}
      else if(slots[d.i]){if(h.k==='cust')serve(d.i,h.i);else if(h.k==='bin')throwAway(d.i);
        else if(h.k==='slot'&&h.i!==d.i&&!slots[h.i]){slots[h.i]=slots[d.i];slots[d.i]=null;if(selected===d.i)selected=h.i;slots[h.i].squash=1;sfx('place');}}}}
  else if(!cancel&&h.k===down.h.k&&h.i===down.h.i&&h.id===down.h.id)tap(h);
  down=null;}
cvs.addEventListener('pointerup',e=>endPointer(e,false));cvs.addEventListener('pointercancel',e=>endPointer(e,true));
cvs.addEventListener('lostpointercapture',e=>{if(down&&e.pointerId===down.id){drag=null;down=null;press=null;}});
function tapCustomer(ci){const c=spots[ci];if(!c||c.phase!=='wait')return;
  if(selected>=0&&slots[selected]){serve(selected,ci);return;}
  for(let i=0;i<MAX_SLOTS;i++){const s=slots[i];if(sellable(s)&&custWants(c,s.type)){serve(i,ci);return;}}
  const need=c.order.filter(o=>o.got+(o.inbound||0)<o.need).map(o=>TYPES[o.type].name+'×'+(o.need-o.got-(o.inbound||0))).join('、');
  showToast('要：'+need+'，烤好调好再点我～','#fff');sfx('soft');}
function serveAllReady(){let n=0;for(let i=0;i<MAX_SLOTS;i++){const s=slots[i];if(sellable(s)){const ci=bestCustomerFor(s.type);if(ci>=0&&serve(i,ci))n++;}}if(!n){showToast('还没有能上的串','#fff');sfx('soft');}return n;}
function trashBurnt(){let n=0;slots.forEach((s,i)=>{if(s&&(s.burnt||doneness(s)==='burnt')){throwAway(i);n++;}});return n;}
function tap(h){
  if(h.k==='pause'){sfx('click');setPause(true);return;}
  if(h.k==='mute'){setMuted(!SAVE.muted);return;}
  if(h.k==='tray'){placeSkewer(TYPE_KEYS[h.i],null,L.trays[h.i]);return;}
  if(h.k==='tool'){sfx('tool');pressT[h.id]=1;batchTool(h.id);return;}
  if(h.k==='bin'){pressT.bin=1;if(selected>=0&&slots[selected])throwAway(selected);else if(!trashBurnt()){showToast('没有糊串要扔；也可以把串拖进来','#fff');sfx('soft');}return;}
  if(h.k==='slot'){if(!slots[h.i]){if(selected>=0){selected=-1;return;}showToast('点左边的生串托盘就能上架','#fff');return;}tapSkewer(h.i);return;}
  if(h.k==='cust'){tapCustomer(h.i);return;}
  selected=-1;}
const pressT={};
['gesturestart','gesturechange','dblclick','contextmenu','selectstart'].forEach(n=>document.addEventListener(n,e=>e.preventDefault(),{passive:false}));
document.addEventListener('touchmove',e=>{if(!e.target.closest||!e.target.closest('.scroll'))e.preventDefault();},{passive:false});
// 音频解锁：iOS 在 touchend 里最稳；click/pointerdown/keydown 兜底
document.addEventListener('touchend',()=>audioUnlock(),{passive:true});
document.addEventListener('click',()=>audioUnlock(),true);
document.addEventListener('pointerdown',()=>audioUnlock(),true);
document.addEventListener('keydown',()=>audioUnlock(),true);
// 后台：暂停游戏 + 静音 + 停音乐 + 挂起 + audioSession 'auto'；回来后等下一次点按
function toBackground(){if(state==='play'&&!paused)setPause(true);drag=null;down=null;audioToBackground();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)toBackground();});
addEventListener('pagehide',toBackground);addEventListener('blur',toBackground);
function setMuted(v){SAVE.muted=!!v;persist();if(AU.master){const t=AU.ctx.currentTime;AU.master.gain.cancelScheduledValues(t);AU.master.gain.setTargetAtTime(v?0:MASTER,t,0.03);}
  if(v){try{speechSynthesis.cancel();}catch(e){}}else audioUnlock();musicSync();syncMuteUI();if(!v)sfx('click');}
function setPause(v){if(state!=='play')return;paused=v;showOv(v?'pause':null);musicSync();}
addEventListener('keydown',e=>{const k=e.code;
  if(k==='Escape'){if(closeTopOverlay())return;if(state==='play'){setPause(!paused);return;}}
  if(k==='KeyM'){setMuted(!SAVE.muted);return;}
  if(k==='KeyF'){toggleFS();return;}
  if(state!=='play'){if((k==='Enter'||k==='Space')&&ovOpen()==='title'&&!(document.activeElement&&document.activeElement.tagName==='BUTTON')){e.preventDefault();startGame();}return;}
  if(k==='KeyP'){setPause(!paused);return;}
  if(paused)return;
  if(k==='Digit1')tap({k:'tray',i:0});else if(k==='Digit2')tap({k:'tray',i:1});else if(k==='Digit3')tap({k:'tray',i:2});
  else if(k==='KeyQ')tap({k:'tool',id:'salt'});else if(k==='KeyW')tap({k:'tool',id:'flip'});else if(k==='KeyE')tap({k:'tool',id:'chili'});
  else if(k==='Space'){e.preventDefault();serveAllReady();}else if(k==='KeyX')tap({k:'bin'});});
function toggleFS(){try{if(document.fullscreenElement)document.exitFullscreen();else document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen().catch(()=>{});}catch(e){}}
