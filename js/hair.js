"use strict";
// ================= 发型（前后分层：后发→身体→脸→侧发→刘海→前饰→帽子）=================
const HAIR0=Object.assign({},HAIR);
const PAL={plum:HAIR0,
  brown:{d:'#2e1a12',m:'#5a3422',l:'#8a5a3e',s:'rgba(255,220,190,.36)'},chestnut:{d:'#3a1c10',m:'#74401f',l:'#b07040',s:'rgba(255,225,180,.42)'},
  black:{d:'#0a080e',m:'#1e1a28',l:'#40385a',s:'rgba(215,215,255,.34)'},blonde:{d:'#a8742a',m:'#e0aa48',l:'#ffe08a',s:'rgba(255,255,230,.6)'},
  ash:{d:'#26262c',m:'#55525e',l:'#8e8a9c',s:'rgba(240,240,255,.38)'},auburn:{d:'#3a1414',m:'#6e2828',l:'#a8504a',s:'rgba(255,205,195,.38)'},
  honey:{d:'#5a3410',m:'#9e6428',l:'#e0a858',s:'rgba(255,240,200,.5)'},milktea:{d:'#6a4a32',m:'#a47c5a',l:'#d8b690',s:'rgba(255,245,225,.55)'},
  pink:{d:'#9a4064',m:'#de78a0',l:'#ffbcd4',s:'rgba(255,240,250,.6)'}};
function bez3(a,b,c,d,t){const u=1-t;return [u*u*u*a[0]+3*u*u*t*b[0]+3*u*t*t*c[0]+t*t*t*d[0],u*u*u*a[1]+3*u*u*t*b[1]+3*u*t*t*c[1]+t*t*t*d[1]];}
// 一缕/一束头发：沿贝塞尔中线、宽度渐细，可加波浪
function tail(P,w0,w1,o){o=o||{};const N=24,C=[];let y0=1e9,y1=-1e9;
  for(let i=0;i<=N;i++){const t=i/N,p=bez3(P[0],P[1],P[2],P[3],t),q=bez3(P[0],P[1],P[2],P[3],Math.min(1,t+0.01)),r=bez3(P[0],P[1],P[2],P[3],Math.max(0,t-0.01));
    const dx=q[0]-r[0],dy=q[1]-r[1],dl=Math.hypot(dx,dy)||1,nx=-dy/dl,ny=dx/dl;
    const w=lerp(w0,w1,t)*(1+(o.bulge||0)*Math.sin(Math.PI*t))/2,wv=o.wave?Math.sin(t*(o.freq||3)*TAU+(o.ph||0))*o.wave*Math.min(1,t*2.5):0;
    const cx=p[0]+nx*wv,cy=p[1]+ny*wv;C.push([cx,cy,nx,ny,w]);y0=Math.min(y0,cy-w);y1=Math.max(y1,cy+w);}
  ctx.beginPath();ctx.moveTo(C[0][0]+C[0][2]*C[0][4],C[0][1]+C[0][3]*C[0][4]);for(let i=1;i<=N;i++){const c=C[i];ctx.lineTo(c[0]+c[2]*c[4],c[1]+c[3]*c[4]);}
  const e=C[N],e1=C[N-1];ctx.quadraticCurveTo(e[0]+(e[0]-e1[0])*2.5,e[1]+(e[1]-e1[1])*2.5,e[0]-e[2]*e[4],e[1]-e[3]*e[4]);
  for(let i=N-1;i>=0;i--){const c=C[i];ctx.lineTo(c[0]-c[2]*c[4],c[1]-c[3]*c[4]);}ctx.closePath();
  ctx.fillStyle=hairGrad(y0,y1);ctx.fill();ctx.strokeStyle='rgba(20,5,15,.22)';ctx.lineWidth=1.1;ctx.stroke();
  ctx.lineCap='round';for(const [k,col,lw] of [[-0.45,'rgba(0,0,0,.16)',1.1],[0.4,'rgba(0,0,0,.13)',1],[-0.05,HAIR.s,2.2]]){ctx.strokeStyle=col;ctx.lineWidth=lw;ctx.beginPath();
    for(let i=2;i<N-2;i++){const c=C[i],x=c[0]+c[2]*c[4]*k,y=c[1]+c[3]*c[4]*k;i===2?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.stroke();}
  if(o.curl){const r=Math.max(4,w1*0.9+3);ctx.strokeStyle=HAIR.d;ctx.lineWidth=2;ctx.beginPath();ctx.arc(e[0],e[1]-r*0.3,r,0.3,TAU-0.6);ctx.stroke();}}
function bun(x,y,r){const g=ctx.createRadialGradient(x-r*0.35,y-r*0.45,r*0.1,x,y,r*1.05);g.addColorStop(0,HAIR.l);g.addColorStop(0.5,HAIR.m);g.addColorStop(1,HAIR.d);
  ctx.fillStyle=g;ell(x,y,r,r*0.94);ctx.fill();ctx.strokeStyle='rgba(20,5,15,.25)';ctx.lineWidth=1.2;ctx.stroke();
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.3;for(const [rr2,a] of[[0.62,0.4],[0.35,2.2]]){ctx.beginPath();ctx.arc(x,y,r*rr2,a,a+2.6);ctx.stroke();}
  ctx.strokeStyle=HAIR.s;ctx.lineWidth=2.6;ctx.beginPath();ctx.arc(x,y,r*0.72,3.6,4.6);ctx.stroke();}
function braid(x0,y0,x1,y1,n,w,sw){const sl=(y1-y0)/n;for(let k=n-1;k>=0;k--){const t=(k+0.5)/n,x=lerp(x0,x1,t)+sw*t*t,y=lerp(y0,y1,t),ww=w*(1-0.3*t);
  ctx.save();ctx.translate(x,y);ctx.rotate(k%2?0.5:-0.5);const g=ctx.createLinearGradient(0,-sl,0,sl);g.addColorStop(0,HAIR.l);g.addColorStop(0.5,HAIR.m);g.addColorStop(1,HAIR.d);ctx.fillStyle=g;
  ell(0,0,ww*0.6,sl*0.78);ctx.fill();ctx.strokeStyle='rgba(20,5,15,.28)';ctx.lineWidth=1.1;ctx.stroke();ctx.strokeStyle=HAIR.s;ctx.lineWidth=1.8;ctx.beginPath();ctx.ellipse(0,0,ww*0.32,sl*0.5,0,3.6,4.8);ctx.stroke();ctx.restore();}}
function scrunchie(x,y,r,col,dark){ctx.fillStyle=col;for(let k=0;k<8;k++){const a=k/8*TAU;ell(x+Math.cos(a)*r,y+Math.sin(a)*r*0.7,r*0.55,r*0.55);ctx.fill();}ctx.fillStyle=dark;ell(x,y,r*0.5,r*0.4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.4)';ell(x-r*0.5,y-r*0.5,r*0.3,r*0.2);ctx.fill();}
// ---------- 后发 ----------
function backBob(sw,len,wid){ctx.fillStyle=hairGrad(-215,len);ctx.beginPath();ctx.moveTo(-44,-190);
  ctx.bezierCurveTo(-wid-2,-178,-wid-6,-140,-wid+sw*0.3,len+6);ctx.quadraticCurveTo(-wid+8+sw*0.3,len+3,-wid+18,len);ctx.lineTo(wid-18,len);ctx.quadraticCurveTo(wid-8+sw*0.3,len+3,wid+sw*0.3,len+6);
  ctx.bezierCurveTo(wid+6,-140,wid+2,-178,44,-190);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.4;
  for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*(wid-8),-160);ctx.quadraticCurveTo(d*(wid-2),-130,d*(wid-6)+sw*0.3,len);ctx.stroke();}}
function backUpdo(){ctx.fillStyle=hairGrad(-215,-110);ctx.beginPath();ctx.moveTo(-44,-190);ctx.bezierCurveTo(-56,-176,-56,-136,-44,-112);ctx.lineTo(44,-112);ctx.bezierCurveTo(56,-136,56,-176,44,-190);ctx.closePath();ctx.fill();}
function backWavy(sw,len,wid,amp,fq){const pts=[];const N=26;for(let i=0;i<=N;i++){const y=lerp(-186,len,i/N),k=i/N,x=44+(wid-44)*Math.min(1,k*2.2)+Math.sin(k*fq*TAU)*amp*k+sw*k;pts.push([x,y]);}
  ctx.fillStyle=hairGrad(-215,len);ctx.beginPath();ctx.moveTo(-pts[0][0]+sw*0,pts[0][1]);for(const [x,y] of pts)ctx.lineTo(-x+2*sw*((y+186)/(len+186)),y);
  const n=6;for(let k=0;k<=n;k++){const x=lerp(-pts[N][0]+2*sw,pts[N][0],k/n),y=len+(k%2?-10:4);ctx.lineTo(x,y);}
  for(let i=N;i>=0;i--)ctx.lineTo(pts[i][0],pts[i][1]);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.5;for(const d of[-1,1])for(const f of[0.75,0.5]){ctx.beginPath();for(let i=3;i<=N;i++){const [x,y]=pts[i];const xx=d*x*f+(d<0?sw*((y+186)/(len+186)):0)+(1-f)*d*20;i===3?ctx.moveTo(xx,y):ctx.lineTo(xx,y);}ctx.stroke();}
  ctx.strokeStyle=HAIR.s;ctx.lineWidth=2.5;for(const d of[-1,1]){ctx.beginPath();for(let i=4;i<N*0.7;i++){const [x,y]=pts[i];const xx=d*x*0.9;i===4?ctx.moveTo(xx,y):ctx.lineTo(xx,y);}ctx.stroke();}}
function backCurly(sw){backBob(sw,-72,62);const g=hairGrad(-220,-60);ctx.fillStyle=g;for(const d of[-1,1])for(let k=0;k<9;k++){const y=-196+k*15,x=d*(50+Math.sin(k*1.3)*6+(k>2?10:0))+(k>3?sw*0.3:0);ell(x,y,13,12);ctx.fill();}
  for(let k=0;k<6;k++){const x=-44+k*17.6;ell(x+sw*0.3,-70+(k%2)*5,12,11);ctx.fill();}
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.4;for(const d of[-1,1])for(let k=1;k<8;k++){ctx.beginPath();ctx.arc(d*(56+(k>2?8:0)),-190+k*15,6,0.5,3.6);ctx.stroke();}}
// ---------- 侧发 ----------
function locksHime(sw){for(const d of[-1,1]){ctx.fillStyle=hairGrad(-190,-110);ctx.beginPath();ctx.moveTo(d*35,-182);ctx.quadraticCurveTo(d*50,-176,d*53,-150);ctx.lineTo(d*53,-113);ctx.lineTo(d*37,-113);ctx.lineTo(d*36,-150);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.1;for(const xx of[41,47]){ctx.beginPath();ctx.moveTo(d*xx,-168);ctx.lineTo(d*xx,-115);ctx.stroke();}ctx.strokeStyle=HAIR.s;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(d*44,-166);ctx.lineTo(d*44,-136);ctx.stroke();}}
function locksBob(sw){for(const d of[-1,1]){ctx.fillStyle=hairGrad(-190,-100);ctx.beginPath();ctx.moveTo(d*37,-182);ctx.bezierCurveTo(d*56,-166,d*58,-130,d*54+sw*0.2,-112);ctx.quadraticCurveTo(d*50,-100,d*40,-104);
  ctx.quadraticCurveTo(d*46,-112,d*44,-128);ctx.bezierCurveTo(d*42,-150,d*40,-166,d*34,-172);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(d*44,-166);ctx.quadraticCurveTo(d*52,-136,d*47,-110);ctx.stroke();
  ctx.strokeStyle=HAIR.s;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(d*48,-160);ctx.quadraticCurveTo(d*53,-140,d*51,-126);ctx.stroke();}}
function locksShort(sw){for(const d of[-1,1]){ctx.fillStyle=hairGrad(-190,-120);ctx.beginPath();ctx.moveTo(d*37,-182);ctx.bezierCurveTo(d*54,-170,d*54,-146,d*49,-124);ctx.quadraticCurveTo(d*44,-136,d*40,-146);ctx.quadraticCurveTo(d*38,-160,d*34,-172);ctx.closePath();ctx.fill();
  ctx.strokeStyle=HAIR.s;ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(d*46,-166);ctx.quadraticCurveTo(d*50,-150,d*48,-136);ctx.stroke();}}
function locksTail(sw,wave,len){for(const d of[-1,1])tail([[d*40,-180],[d*56,-150],[d*54+sw,-120],[d*50+sw*1.2,len||-70]],15,4,{wave:wave,freq:2.2,ph:d});}
function locksCurly(sw){const g=hairGrad(-190,-100);ctx.fillStyle=g;for(const d of[-1,1])for(let k=0;k<5;k++){ell(d*(46+(k%2)*3),-176+k*15+(k>2?sw*0:0),9,9);ctx.fill();}
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.2;for(const d of[-1,1])for(let k=0;k<5;k++){ctx.beginPath();ctx.arc(d*(46+(k%2)*3),-176+k*15,4.5,0.4,3.4);ctx.stroke();}}
// ---------- 刘海 ----------
const BANG_BLUNT=[[42,-160,35,-155],[30,-161,24,-155],[18,-161,12,-155],[6,-161,0,-155],[-6,-161,-12,-155],[-18,-161,-24,-155],[-30,-160,-36,-154],[-42,-157,-50,-146]];
const BANG_SIDE=[[44,-176,42,-162],[36,-188,26,-170],[26,-194,10,-168],[12,-196,-8,-163],[-4,-194,-24,-158],[-20,-188,-38,-152],[-36,-176,-50,-146]];
function bangsList(list){ctx.beginPath();bangsTop();ctx.quadraticCurveTo(36,-172,14,-175);ctx.quadraticCurveTo(-8,-177,-30,-172);ctx.quadraticCurveTo(-46,-168,-50,-146);ctx.closePath();ctx.fillStyle=HAIR.d;ctx.fill();
  bangsPath(list);ctx.fillStyle=hairGrad(-218,-150);ctx.fill();ctx.save();bangsPath(list);ctx.clip();ctx.lineCap='round';
  for(const [cx,cy,rx,ry,a0,a1,w,al] of [[2,-180,42,15,1.12,1.32,3.2,.32],[2,-180,42,15,1.4,1.6,3.6,.36],[2,-180,42,15,1.68,1.86,3.2,.3]]){ctx.strokeStyle=HAIR.s.replace(/[\d.]+\)$/,al+')');ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,Math.PI*a0,Math.PI*a1);ctx.stroke();}
  ctx.strokeStyle='rgba(20,5,15,.22)';ctx.lineWidth=1.1;for(const [vx,vy,tx,ty] of list.slice(1,-1)){ctx.beginPath();ctx.moveTo(vx+3,-204);ctx.quadraticCurveTo(vx+2,vy+6,(vx+tx)/2+1,ty-3);ctx.stroke();}ctx.restore();}
function bangsPart(){ctx.beginPath();bangsTop();ctx.bezierCurveTo(36,-158,14,-178,5,-200);ctx.lineTo(-3,-200);ctx.bezierCurveTo(-14,-178,-36,-158,-50,-146);ctx.closePath();ctx.fillStyle=hairGrad(-218,-150);ctx.fill();
  ctx.strokeStyle='rgba(20,5,15,.25)';ctx.lineWidth=1.1;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*4,-206);ctx.bezierCurveTo(d*24,-196,d*42,-180,d*49,-152);ctx.stroke();}
  ctx.strokeStyle=HAIR.s;ctx.lineWidth=3;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*14,-206);ctx.quadraticCurveTo(d*34,-200,d*44,-180);ctx.stroke();}}
// ---------- 饰品 ----------
function hairpinGold(t){ctx.save();ctx.translate(26,-214);ctx.rotate(0.5);ctx.strokeStyle='#d8a020';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-34,0);ctx.lineTo(18,0);ctx.stroke();ctx.restore();
  furong(-28,-226,9,'#ff8fb0','#ffe066');const sw2=Math.sin(t*2.4)*3;ctx.strokeStyle='#d8a020';ctx.lineWidth=1.4;for(const k of[0,6]){ctx.beginPath();ctx.moveTo(40+k,-206);ctx.lineTo(42+k+sw2,-180+k);ctx.stroke();ctx.fillStyle=k?'#e8452c':'#7cd0ff';ell(42+k+sw2,-178+k,2.6,2.6);ctx.fill();}}
function streaks(list){ctx.save();bangsPath(list);ctx.clip();ctx.lineCap='round';ctx.lineWidth=6;ctx.strokeStyle='rgba(255,110,180,.75)';ctx.beginPath();ctx.moveTo(18,-214);ctx.quadraticCurveTo(10,-190,-2,-166);ctx.stroke();
  ctx.strokeStyle='rgba(130,120,255,.7)';ctx.beginPath();ctx.moveTo(-14,-214);ctx.quadraticCurveTo(-22,-186,-34,-156);ctx.stroke();ctx.restore();}
// ---------- 发型表 ----------
const HAIRS={
 classic:{name:'招牌黑长直',price:0,pal:'plum',back:(t,sw)=>backHair(t,sw),locks:(t,sw)=>sideLocks(t,sw),bangs:()=>bangs(0),bow:1,ahoge:1},
 twintail:{name:'甜心双马尾',price:200,pal:'pink',back:(t,sw)=>{for(const d of[-1,1])tail([[d*46,-194],[d*96,-180],[d*86+sw,-112],[d*72+sw*1.6,-22]],28,6,{bulge:0.35,wave:2.5,freq:1.5,ph:d,curl:1});backUpdo();},
   locks:(t,sw)=>locksShort(sw),bangs:()=>bangs(0),front:(t,sw,cv)=>{for(const d of[-1,1])bowAt(d*47,-194,0.85,'#ff6f9a','#c8306a',true);},ahoge:1},
 bun:{name:'元气丸子头',price:180,pal:'brown',back:(t,sw,cv)=>{if(!cv)bun(0,-226,24);backUpdo();},locks:(t,sw)=>{for(const d of[-1,1])tail([[d*42,-176],[d*50,-156],[d*49+sw*0.4,-134],[d*46+sw*0.6,-112]],8,2,{wave:1.5,freq:1.5});},
   bangs:()=>bangs(0),front:(t,sw,cv)=>{if(!cv){scrunchie(0,-208,7,'#ffd23f','#d89a00');}}},
 curls:{name:'法式长卷发',price:230,pal:'chestnut',back:(t,sw)=>{backWavy(sw,-34,64,4,4);for(const d of[-1,1])tail([[d*52,-150],[d*72,-122],[d*74+sw,-72],[d*64+sw*1.3,-22]],22,9,{wave:6,freq:3,ph:d,curl:1});},
   locks:(t,sw)=>locksTail(sw,3.5,-74),bangs:()=>bangsList(BANG_SIDE),front:(t,sw,cv)=>{if(!cv)bowAt(38,-196,0.7,'#3a6ad8','#1a3a8a',false);}},
 bob:{name:'清爽波波头',price:160,pal:'brown',back:(t,sw)=>backBob(sw,-102,60),locks:(t,sw)=>locksBob(sw),bangs:()=>bangsList(BANG_BLUNT),ahoge:1},
 hime:{name:'黑长公主切',price:220,pal:'black',back:(t,sw)=>backHair(t,sw),locks:(t,sw)=>locksHime(sw),bangs:()=>bangsList(BANG_BLUNT),front:(t,sw,cv)=>{if(!cv)bowAt(40,-194,0.6,'#ffffff','#c8c0d8',false);}},
 braids:{name:'温柔麻花辫',price:200,pal:'brown',back:()=>backUpdo(),locks:(t,sw)=>locksShort(sw),bangs:()=>bangsList(BANG_SIDE),
   front:(t,sw)=>{for(const d of[-1,1]){braid(d*46,-160,d*50,-36,10,22,sw*0.6);bowAt(d*50+sw*0.6,-36,0.6,'#ff8a5a','#c84a20',true);}}},
 sidetail:{name:'俏皮侧边娃',price:180,pal:'auburn',back:()=>backUpdo(),locks:(t,sw)=>{locksShort(sw);},bangs:()=>bangsList(BANG_SIDE),
   front:(t,sw,cv)=>{tail([[-46,-180],[-82,-162],[-70+sw,-100],[-56+sw*1.4,-30]],30,6,{bulge:0.3,wave:3,freq:1.4,curl:1});scrunchie(-46,-182,8,'#7ad0ff','#2a8ad0');},ahoge:1},
 ponytail:{name:'飒爽高马尾',price:190,pal:'plum',back:(t,sw)=>{tail([[32,-206],[74,-230],[92+sw*1.2,-176],[80+sw*1.8,-60]],18,5,{bulge:0.9,wave:2.5,freq:1.3,curl:1});backUpdo();},
   locks:(t,sw)=>locksShort(sw),bangs:()=>bangsList(BANG_SIDE),front:(t,sw,cv)=>{if(!cv)scrunchie(30,-208,8,'#e8452c','#a01a10');},ahoge:1},
 guofeng:{name:'古风发髻',price:250,pal:'black',back:(t,sw,cv)=>{if(!cv){bun(-16,-226,18);bun(16,-230,20);}backHair(t,sw);},locks:(t,sw)=>sideLocks(t,sw),bangs:()=>bangsPart(),front:(t,sw,cv)=>{if(!cv)hairpinGold(t);}},
 odango:{name:'月光双丸子',price:240,pal:'blonde',back:(t,sw,cv)=>{for(const d of[-1,1])tail([[d*34,-212],[d*76,-200],[d*76+sw,-120],[d*66+sw*1.6,-14]],16,5,{wave:3,freq:1.8,ph:d});if(!cv)for(const d of[-1,1])bun(d*34,-218,17);backUpdo();},
   locks:(t,sw)=>sideLocks(t,sw),bangs:()=>bangs(0),front:(t,sw,cv)=>{if(!cv)for(const d of[-1,1]){ctx.fillStyle='#e8452c';ell(d*28,-206,4,3);ctx.fill();ctx.fillStyle='#ffd23f';ell(d*28,-206,1.6,1.6);ctx.fill();}},ahoge:1},
 pixie:{name:'利落短发',price:150,pal:'ash',back:(t,sw)=>backBob(sw,-120,56),locks:(t,sw)=>locksShort(sw),bangs:()=>bangsList(BANG_SIDE),
   front:(t,sw,cv)=>{ctx.strokeStyle='#ffd23f';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(30,-186);ctx.lineTo(44,-170);ctx.moveTo(36,-190);ctx.lineTo(48,-176);ctx.stroke();},ahoge:1},
 updo:{name:'气质盘发',price:230,pal:'auburn',back:(t,sw)=>{bun(42,-116,19);backUpdo();},locks:()=>{},bangs:()=>bangsPart(),
   front:(t,sw,cv)=>{tail([[-42,-176],[-58,-146],[-50+sw,-114],[-56+sw*1.2,-84]],9,2,{wave:3,freq:2});for(let k=0;k<3;k++){ctx.fillStyle='#fffaf0';ell(46+k*5,-130+k*7,2.6,2.6);ctx.fill();}}},
 waves:{name:'蜜糖大波浪',price:240,pal:'honey',back:(t,sw)=>backWavy(sw,-12,78,9,1.6),locks:(t,sw)=>locksTail(sw,5,-60),bangs:()=>bangsList(BANG_SIDE)},
 streak:{name:'酷酷挑染发',price:200,pal:'plum',back:(t,sw)=>backHair(t,sw),locks:(t,sw)=>{sideLocks(t,sw);ctx.globalAlpha=0.75;ctx.strokeStyle='#ff6eb4';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(44,-170);ctx.bezierCurveTo(48,-140,48,-110,47+sw,-76);ctx.stroke();ctx.globalAlpha=1;},
   bangs:()=>{bangsList(BANG_SIDE);streaks(BANG_SIDE);},ahoge:1},
 fluffy:{name:'奶茶羊毛卷',price:190,pal:'milktea',back:(t,sw)=>backCurly(sw),locks:(t,sw)=>locksCurly(sw),bangs:()=>bangs(0),front:(t,sw,cv)=>{if(!cv)flower5(-36,-196,4,'#fff3a0','#ff9f1c');}},
};
const HAIR_IDS=Object.keys(HAIRS);
function useHair(id){const H=HAIRS[id]||HAIRS.classic;Object.assign(HAIR,PAL[H.pal]||HAIR0);return H;}
