"use strict";
// ================= 宠物 / 帮手：自动上架、调味、上菜（不碰 BOSS，绝不烤糊）=================
const PET_PRICE=500,PET_MAX=2,PET_INT=0.9;
const PETS={
  orange:{name:'橘猫·大橘',kind:'cat',col:'#f0a040',dark:'#c86a18',belly:'#fff4e0',eye:'#5a8a2a',say:['喵～','喵呜！','来咯喵～']},
  cow:{name:'奶牛猫·黑白',kind:'cat',col:'#ffffff',dark:'#2a2a30',belly:'#ffffff',eye:'#d8a020',say:['喵！','喵喵～','嘿咻喵～']},
  ragdoll:{name:'布偶猫·雪球',kind:'cat',col:'#f6eee0',dark:'#8a6248',belly:'#ffffff',eye:'#4a90e8',say:['喵～','咪～','好嘞喵～']},
  corgi:{name:'柯基·短短',kind:'dog',col:'#e88a38',dark:'#b86a20',belly:'#ffffff',say:['汪！','汪汪～','嘿嘿汪！']},
  shiba:{name:'柴犬·小柴',kind:'dog',col:'#d8a060',dark:'#a85a1c',belly:'#fff4e8',say:['汪～','嗷呜！','汪汪！']},
  bichon:{name:'比熊·棉花糖',kind:'dog',col:'#ffffff',dark:'#e6dccc',belly:'#ffffff',say:['汪～','嘤～','汪呜！']},
  salary:{name:'社畜小王',kind:'human',col:'#ffffff',dark:'#2a3a5a',skin:'#ffe2c8',hair:'#2a2228',say:['来了来了！','收到！','马上安排！']},
  rider:{name:'外卖小哥',kind:'human',col:'#ffc81a',dark:'#2a6ad8',skin:'#f6d0b0',hair:'#3a2a20',say:['您的串到咯！','准时送达！','跑起来～']},
  tea:{name:'奶茶店小妹',kind:'human',col:'#ff9ab8',dark:'#c84a7a',skin:'#ffe6d4',hair:'#6a3a2a',say:['好嘞～','请慢用！','甜甜的来咯～']}};
const PET_IDS=Object.keys(PETS);
const HIRE_SAY={cat:'喵喵来上班咯，莫偷吃串串哈！',dog:'汪汪来帮忙，安逸惨咯！',human:'辛苦咯，下班请你吃串串噻！'};
// ---------- 绘制（原点=脚底中心，身高约 100）----------
function drawPet(id,x,base,s,A){const P=PETS[id];if(!P)return;A=A||{};const t=A.t||0,work=A.work||0,sleep=A.sleep,hop=A.hop||0,blink=!sleep&&Math.sin(t*1.3+x)>0.985;
  ctx.save();ctx.translate(x,base-Math.sin(Math.PI*hop)*14);const br=1+Math.sin(t*2.6)*0.015;ctx.scale(s*(1+0.05*Math.sin(Math.PI*hop)),s*br*(1-0.05*Math.sin(Math.PI*hop)));
  ctx.fillStyle='rgba(0,0,0,.18)';ell(0,0,30,6);ctx.fill();
  if(P.kind==='human')drawWorker(id,P,t,work,sleep,blink);else drawAnimal(id,P,t,work,sleep,blink);
  if(sleep){ctx.globalAlpha=0.7+0.3*Math.sin(t*3);text('z',30,-104-(t*12%14),16,'#bfe6ff','900');text('Z',40,-118-(t*12%14),20,'#bfe6ff','900');ctx.globalAlpha=1;}
  ctx.restore();}
function spatula(ang){ctx.save();ctx.rotate(ang);ctx.strokeStyle='#8a5a2a';ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-20);ctx.stroke();ctx.fillStyle='#cfd8e0';rr(-6,-32,12,13,3);ctx.fill();ctx.strokeStyle='#8a98a8';ctx.lineWidth=1.2;ctx.stroke();ctx.restore();}
function drawAnimal(id,P,t,work,sleep,blink){const OL='rgba(60,30,30,.5)',dog=P.kind==='dog',fluffy=id==='bichon',wag=Math.sin(t*(work?10:4))*(sleep?0.05:0.35);
  // 尾巴
  ctx.save();ctx.translate(20,-20);ctx.rotate(wag);ctx.lineCap='round';
  if(id==='shiba'){ctx.strokeStyle=P.col;ctx.lineWidth=10;ctx.beginPath();ctx.arc(8,-14,10,1.2,5.6);ctx.stroke();ctx.strokeStyle='#fff4e8';ctx.lineWidth=4;ctx.beginPath();ctx.arc(8,-14,10,4.6,5.6);ctx.stroke();}
  else if(id==='corgi'){ctx.fillStyle=P.col;ell(6,-4,8,6);ctx.fill();}
  else if(fluffy){ctx.fillStyle='#fff';ell(8,-10,10,10);ctx.fill();ctx.strokeStyle='#e6dccc';ctx.lineWidth=1.5;ctx.stroke();}
  else{ctx.strokeStyle=id==='ragdoll'?P.dark:P.col;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(22,-8,18,-38);ctx.stroke();if(id==='orange'){ctx.strokeStyle=P.dark;ctx.lineWidth=8;ctx.setLineDash([4,6]);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(22,-8,18,-38);ctx.stroke();ctx.setLineDash([]);}
    if(id==='cow'){ctx.strokeStyle=P.dark;ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(19,-26);ctx.lineTo(18,-38);ctx.stroke();}}
  ctx.restore();
  // 身体
  ctx.fillStyle=P.col;if(fluffy){for(const [a,b,r] of[[-14,-22,14],[14,-22,14],[0,-30,16],[0,-14,16]]){ell(a,b,r,r);ctx.fill();}}else{ell(0,-24,25,21);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();}
  ctx.fillStyle=P.belly;ell(0,-18,14,13);ctx.fill();if(id==='cow'){ctx.fillStyle=P.dark;ell(-14,-30,9,7);ctx.fill();}
  if(id==='orange'){ctx.strokeStyle=P.dark;ctx.lineWidth=2.5;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*22,-34);ctx.quadraticCurveTo(d*16,-28,d*22,-22);ctx.stroke();}}
  ctx.fillStyle=fluffy?'#fff':P.col;for(const d of[-1,1]){ell(d*12,-4,8,5);ctx.fill();}ctx.fillStyle='#ffb0b8';for(const d of[-1,1]){ell(d*12,-3,3,2);ctx.fill();}
  // 手（干活时挥锅铲）
  const arm=work?Math.sin(t*16)*0.6:0;ctx.save();ctx.translate(20,-30);ctx.rotate(-0.6+arm);ctx.fillStyle=fluffy?'#fff':P.col;ell(0,-6,6,9);ctx.fill();if(work){ctx.translate(0,-12);spatula(0.3);}ctx.restore();
  // 头
  const hy=-62;
  if(dog&&!fluffy){for(const d of[-1,1]){ctx.fillStyle=P.col;ctx.beginPath();ctx.moveTo(d*8,hy-20);ctx.lineTo(d*(id==='corgi'?30:24),hy-(id==='corgi'?50:42));ctx.lineTo(d*28,hy-10);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffc8c8';ctx.beginPath();ctx.moveTo(d*13,hy-20);ctx.lineTo(d*(id==='corgi'?27:22),hy-(id==='corgi'?42:36));ctx.lineTo(d*24,hy-14);ctx.fill();}}
  if(P.kind==='cat'){for(const d of[-1,1]){ctx.fillStyle=id==='ragdoll'?P.dark:P.col;ctx.beginPath();ctx.moveTo(d*8,hy-20);ctx.lineTo(d*24,hy-42);ctx.lineTo(d*28,hy-10);ctx.closePath();ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();ctx.fillStyle='#ffb8c4';ctx.beginPath();ctx.moveTo(d*13,hy-19);ctx.lineTo(d*22,hy-34);ctx.lineTo(d*24,hy-14);ctx.fill();}}
  if(fluffy){ctx.fillStyle='#fff';for(let k=0;k<9;k++){const a=k/9*TAU;ell(Math.cos(a)*24,hy+Math.sin(a)*21,11,11);ctx.fill();}ctx.fillStyle='#f4ece0';for(const d of[-1,1]){ell(d*28,hy+4,10,16);ctx.fill();}}
  const hg=ctx.createRadialGradient(-8,hy-10,4,0,hy,32);hg.addColorStop(0,'#ffffff');hg.addColorStop(0.35,P.col);hg.addColorStop(1,mix(P.col,'#806050',0.18));ctx.fillStyle=hg;ell(0,hy,29,25);ctx.fill();if(!fluffy){ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();}
  if(id==='cow'){ctx.save();ell(0,hy,29,25);ctx.clip();ctx.fillStyle=P.dark;ell(-18,hy-14,16,13);ctx.fill();ell(20,hy-20,10,8);ctx.fill();ctx.restore();}
  if(id==='ragdoll'){ctx.fillStyle='rgba(138,98,72,.45)';for(const d of[-1,1]){ell(d*11,hy-2,10,8);ctx.fill();}}
  if(id==='orange'){ctx.strokeStyle=P.dark;ctx.lineWidth=2.5;for(const d of[-6,0,6]){ctx.beginPath();ctx.moveTo(d,hy-24);ctx.lineTo(d*1.2,hy-15);ctx.stroke();}}
  if(dog&&!fluffy){ctx.fillStyle=P.belly;ell(0,hy+9,15,11);ctx.fill();for(const d of[-1,1]){ell(d*14,hy+4,8,7);ctx.fill();}}
  if(id==='corgi'){ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-4,hy-24);ctx.quadraticCurveTo(0,hy-28,4,hy-24);ctx.lineTo(7,hy+2);ctx.lineTo(-7,hy+2);ctx.closePath();ctx.fill();}
  if(id==='shiba'){ctx.fillStyle='#fff4e8';for(const d of[-1,1]){ell(d*11,hy-11,4,2.6);ctx.fill();}ctx.fillStyle='#fff4e8';ell(0,hy+12,20,10);ctx.fill();}
  // 脸
  ctx.fillStyle='#2b1f1f';ctx.strokeStyle='#2b1f1f';ctx.lineWidth=2.4;ctx.lineCap='round';
  if(sleep||blink){for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*11,hy-2,4.5,0.2,Math.PI-0.2);ctx.stroke();}}
  else if(work>0.5){for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*11,hy,4.5,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}}
  else{for(const d of[-1,1]){ctx.fillStyle=P.eye||'#2b1f1f';ell(d*11,hy-1,4.6,5.6);ctx.fill();ctx.fillStyle='#1a1010';ell(d*11,hy-0.5,2.6,3.6);ctx.fill();ctx.fillStyle='#fff';ell(d*11-1.5,hy-3,1.6,1.8);ctx.fill();}}
  ctx.fillStyle=dog?'#2b1f1f':'#ff8aa0';ell(0,hy+6,dog?4.5:3,dog?3.4:2.2);ctx.fill();
  ctx.strokeStyle='#5a2a2a';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-3.5,hy+9,3.5,0.1,Math.PI-0.1);ctx.arc(3.5,hy+9,3.5,0.1,Math.PI-0.1);ctx.stroke();
  if(dog&&work>0.3){ctx.fillStyle='#ff7a8a';ell(0,hy+14,3.5,4);ctx.fill();}
  ctx.fillStyle='rgba(255,120,140,.4)';for(const d of[-1,1]){ell(d*19,hy+6,5,3);ctx.fill();}
  if(P.kind==='cat'){ctx.strokeStyle='rgba(80,50,40,.5)';ctx.lineWidth=1;for(const d of[-1,1])for(const k of[-1,1]){ctx.beginPath();ctx.moveTo(d*18,hy+6+k*2);ctx.lineTo(d*34,hy+4+k*5);ctx.stroke();}}
  if(id==='corgi'||id==='shiba'){ctx.fillStyle='#e8452c';rr(-14,hy+20,28,6,3);ctx.fill();ctx.fillStyle='#ffd23f';ell(0,hy+27,3.5,3.5);ctx.fill();}}
function drawWorker(id,P,t,work,sleep,blink){const OL='rgba(50,30,30,.5)',arm=work?Math.sin(t*16)*0.7:Math.sin(t*2)*0.08;
  if(id==='rider'){ctx.fillStyle='#ffc81a';rr(-30,-66,24,30,4);ctx.fill();ctx.strokeStyle='#b88a00';ctx.lineWidth=1.5;ctx.stroke();text('外卖',-18,-51,8,'#2a6ad8','900');}
  ctx.fillStyle='#3a3a4a';rr(-13,-20,11,18,4);ctx.fill();rr(2,-20,11,18,4);ctx.fill();ctx.fillStyle='#2a2a30';ell(-8,-2,8,4);ctx.fill();ell(8,-2,8,4);ctx.fill();
  // 身体
  ctx.fillStyle=P.col;rr(-19,-52,38,36,12);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
  if(id==='salary'){ctx.fillStyle='#e8452c';ctx.beginPath();ctx.moveTo(-3,-50);ctx.lineTo(3,-50);ctx.lineTo(5,-28);ctx.lineTo(0,-22);ctx.lineTo(-5,-28);ctx.closePath();ctx.fill();ctx.fillStyle='#2a3a5a';rr(-17,-30,9,10,2);ctx.fill();ctx.fillStyle='#fff';rr(-15,-28,5,4,1);ctx.fill();}
  if(id==='rider'){ctx.fillStyle=P.dark;ctx.fillRect(-19,-38,38,5);}
  if(id==='tea'){ctx.fillStyle='#fff';rr(-13,-44,26,28,6);ctx.fill();ctx.fillStyle=P.dark;ell(0,-32,4,4);ctx.fill();}
  // 手
  for(const d of[-1,1]){ctx.save();ctx.translate(d*19,-46);ctx.rotate(d>0?-0.5+arm:0.25+ (work?0:Math.sin(t*2)*0.06));ctx.fillStyle=P.col;rr(-5,-2,10,20,5);ctx.fill();ctx.fillStyle=P.skin;ell(0,20,5,5);ctx.fill();
    if(d>0&&work){ctx.translate(0,20);spatula(-2.6);}
    if(d<0&&id==='tea'&&!work){ctx.translate(0,22);ctx.fillStyle='rgba(255,240,220,.9)';rr(-6,-12,12,15,3);ctx.fill();ctx.fillStyle='#8a5a3a';ctx.fillRect(-6,-4,12,7);ctx.fillStyle='#2a1a10';for(const q of[-3,0,3]){ell(q,1,1.6,1.6);ctx.fill();}ctx.strokeStyle='#ff6a8a';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(2,-12);ctx.lineTo(4,-20);ctx.stroke();}
    ctx.restore();}
  // 头
  const hy=-76;ctx.fillStyle=P.skin;ell(0,hy,25,24);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle=P.hair;
  if(id==='salary'){ctx.beginPath();ctx.arc(0,hy-4,26,Math.PI*1.02,Math.PI*1.98);ctx.quadraticCurveTo(4,hy-14,-24,hy-6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.15)';ell(10,hy-22,8,3);ctx.fill();}
  if(id==='rider'){ctx.fillStyle='#ffc81a';ctx.beginPath();ctx.arc(0,hy-4,28,Math.PI,TAU);ctx.closePath();ctx.fill();ctx.strokeStyle='#b88a00';ctx.lineWidth=2;ctx.stroke();ctx.fillStyle=P.dark;ctx.fillRect(-28,hy-6,56,5);ctx.fillStyle='rgba(255,255,255,.4)';ell(-10,hy-20,8,4);ctx.fill();}
  if(id==='tea'){ctx.beginPath();ctx.arc(0,hy-2,26,Math.PI*0.95,Math.PI*2.05);ctx.fill();ctx.save();ctx.translate(22,hy-6);ctx.rotate(Math.sin(t*3)*0.15);ell(8,10,8,16);ctx.fill();ctx.restore();
    ctx.fillStyle=P.col;ctx.beginPath();ctx.arc(0,hy-10,25,Math.PI*1.05,Math.PI*1.95);ctx.closePath();ctx.fill();ctx.fillStyle=P.dark;rr(-28,hy-12,40,6,3);ctx.fill();}
  ctx.fillStyle='#2b1f1f';ctx.strokeStyle='#2b1f1f';ctx.lineWidth=2.4;ctx.lineCap='round';
  if(sleep||blink){for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*9-4,hy+2);ctx.lineTo(d*9+4,hy+2);ctx.stroke();}}
  else if(work>0.5){for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*9,hy+3,4,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}}
  else{for(const d of[-1,1]){ell(d*9,hy+2,3.6,4.6);ctx.fill();}ctx.fillStyle='#fff';for(const d of[-1,1]){ell(d*9-1,hy,1.3,1.5);ctx.fill();}}
  if(id==='salary'){ctx.strokeStyle='#2a2a30';ctx.lineWidth=1.6;for(const d of[-1,1]){rr(d*9-7,hy-3,14,11,3);ctx.stroke();}ctx.beginPath();ctx.moveTo(-2,hy+2);ctx.lineTo(2,hy+2);ctx.stroke();}
  ctx.fillStyle='rgba(255,120,140,.45)';for(const d of[-1,1]){ell(d*16,hy+9,5,3);ctx.fill();}
  ctx.strokeStyle='#8a3030';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,hy+10,4,0.2,Math.PI-0.2);ctx.stroke();
  if(id==='salary'&&sleep){ctx.fillStyle='#8fd3ff';ell(18,hy-6,3,4);ctx.fill();}}
// ---------- 运行时 ----------
let petW=[];
function rosterValid(){return (SAVE.roster||[]).filter((id,i,a)=>PETS[id]&&SAVE.owned.pet.includes(id)&&a.indexOf(id)===i).slice(0,PET_MAX);}
function petsReset(){const old=petW;petW=rosterValid().map((id,k)=>({id,k,cd:1.2+k*0.45,hop:0,work:0,bub:'',bubT:0}));
  slots.forEach(s=>{if(s&&s.pet!=null&&!petW[s.pet])s.pet=null;});}
function petCap(){return petW.length>=2?2:3;}
function petPos(k){return L.petSpots[k];}
function petOwnedN(k){let n=0;for(const s of slots)if(s&&s.pet===k)n++;return n;}
function bestNormalFor(type){let best=-1,bp=9;spots.forEach((c,i)=>{if(c&&!c.isBoss&&custWants(c,type)){const pf=c.patience/c.maxP;if(pf<bp){bp=pf;best=i;}}});return best;}
function petDemandType(){const need={potato:0,wing:0,gut:0},urg={potato:9,wing:9,gut:9};
  spots.forEach(c=>{if(c&&!c.isBoss&&c.phase==='wait')c.order.forEach(o=>{const n=o.need-o.got-(o.inbound||0);if(n>0){need[o.type]+=n;urg[o.type]=Math.min(urg[o.type],c.patience/c.maxP);}});});
  for(const s of slots)if(s&&!s.burnt&&doneness(s)!=='burnt')need[s.type]--;
  let best=null;for(const k of TYPE_KEYS)if(need[k]>0&&(best==null||urg[k]<urg[best]))best=k;return best;}
function petFreeSlot(){for(let i=MAX_SLOTS-1;i>=0;i--)if(!slots[i])return i;return -1;}
function petBubble(p,txt){p.bub=txt;p.bubT=1.1;}
function petAct(p){const P=PETS[p.id],pos=petPos(p.k);
  for(let i=0;i<MAX_SLOTS;i++){const s=slots[i];if(s&&s.pet===p.k&&sellable(s)){const ci=bestNormalFor(s.type);if(ci>=0&&serve(i,ci)){petBubble(p,P.say[Math.floor(Math.random()*P.say.length)]);return true;}}}
  let n=0;for(let i=0;i<MAX_SLOTS;i++){const s=slots[i];if(s&&s.pet===p.k&&!s.burnt&&s.step<3&&s.fly>=1){doStep(i);n++;}}if(n)return true;
  if(petOwnedN(p.k)<petCap()){const type=petDemandType();if(type){const i=petFreeSlot();if(i>=0&&placeSkewer(type,i,{x:pos.x-1,y:pos.base-60,w:2,h:2})){slots[i].pet=p.k;return true;}}}
  return false;}
function petsUpdate(dt){if(!petW.length)return;for(const p of petW){p.hop=Math.max(0,p.hop-dt*3);p.work=Math.max(0,p.work-dt*1.5);p.bubT-=dt;}
  if(state!=='play')return;
  // 绝不烤糊：自己的串快到「快糊了」的后半段还没人要 → 先收起来（不算烤糊）
  slots.forEach((s,i)=>{if(!s||s.pet==null||s.burnt)return;const P=stagesOf(s.type);if(s.t>=P.p1+(P.p2-P.p1)*0.4){const ci=bossRound?-1:bestNormalFor(s.type);if(sellable(s)&&ci>=0)serve(i,ci);else{throwAway(i);}}});
  if(bossRound)return;// BOSS 期间宠物休息，BOSS 的单要玩家自己做
  for(const p of petW){p.cd-=dt;if(p.cd>0)continue;p.cd=PET_INT*rand(0.9,1.15);if(petAct(p)){p.hop=1;p.work=1;}}}
function drawPets(){if(!petW.length)return;for(const p of petW){const pos=petPos(p.k);drawPet(p.id,pos.x,pos.base,pos.s,{t:now+p.k*1.7,work:p.work,hop:p.hop,sleep:bossRound&&state==='play'});
  if(p.bubT>0){ctx.save();ctx.globalAlpha=Math.min(1,p.bubT*3);ctx.font='900 17px '+FONT;const tw=ctx.measureText(p.bub).width+18,y=pos.base-112*pos.s-10;rr(pos.x-tw/2,y-14,tw,28,14);ctx.fillStyle='#fffaf3';ctx.fill();ctx.strokeStyle='#ffb36a';ctx.lineWidth=2;ctx.stroke();text(p.bub,pos.x,y+1,17,'#c8502a','900');ctx.restore();}}}
function petBadge(s,x,y){const p=petW[s.pet];if(!p)return;const P=PETS[p.id];ctx.fillStyle=P.kind==='human'?P.col:P.col;ell(x,y,11,11);ctx.fill();ctx.strokeStyle=P.dark;ctx.lineWidth=2.5;ctx.stroke();
  ctx.fillStyle=P.dark==='#ffffff'?'#8a6248':(P.kind==='human'?P.dark:P.dark);ell(x,y+2,3.6,3);ctx.fill();for(const [a,b] of[[-4,-3],[0,-5],[4,-3]]){ell(x+a,y+b,1.6,1.8);ctx.fill();}}
