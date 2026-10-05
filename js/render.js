"use strict";
// ================= 渲染：夜市背景 / 烤架 / 烤串 / 顾客 / HUD / 特效 =================
function srand(seed){let a=seed>>>0;return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let bgCache=null,fgCache=null,cacheKey='';
const GLOW={};
function glowSprite(col){if(GLOW[col])return GLOW[col];const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d'),gr=g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,col);gr.addColorStop(0.35,col.replace(/[\d.]+\)$/,m=>(parseFloat(m)*0.45)+')'));gr.addColorStop(1,col.replace(/[\d.]+\)$/,'0)'));g.fillStyle=gr;g.fillRect(0,0,128,128);return GLOW[col]=c;}
function glow(x,y,r,col,a){const s=glowSprite(col);ctx.globalAlpha=a==null?1:a;ctx.drawImage(s,x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
function offscreen(){const c=document.createElement('canvas');c.width=cvs.width;c.height=cvs.height;return c;}
function withCtx(c,fn){const old=ctx;ctx=c.getContext('2d');ctx.setTransform(c.width/W,0,0,c.height/H,0,0);try{fn();}finally{ctx=old;}}
function ensureCaches(){const k=cvs.width+'x'+cvs.height+'|'+W+'x'+H+'|'+(L.port?1:0);if(bgCache&&fgCache&&k===cacheKey)return;cacheKey=k;
  bgCache=offscreen();withCtx(bgCache,paintBG);fgCache=offscreen();withCtx(fgCache,paintFG);avatarCache=null;}
// ---------- 背景（静态缓存）----------
function paintBG(){const cy=L.counterY,R=srand(77);
  let g=ctx.createLinearGradient(0,0,0,cy);g.addColorStop(0,'#100a2a');g.addColorStop(0.5,'#271646');g.addColorStop(1,'#5c2c50');ctx.fillStyle=g;ctx.fillRect(0,0,W,cy+4);
  for(let i=0;i<70;i++){const x=R()*W,y=R()*(cy*0.55),r=R()*1.4+0.4;ctx.fillStyle='rgba(255,245,225,'+(0.25+R()*0.6)+')';ell(x,y,r,r);ctx.fill();}
  const mx=L.port?L.ox+620:W*0.86,my=L.hud.h+(L.port?70:56);glow(mx,my,90,'rgba(255,236,190,.5)');ctx.fillStyle='#fff3d6';ell(mx,my,24,24);ctx.fill();ctx.fillStyle='rgba(230,205,170,.6)';ell(mx-7,my-4,5,4);ctx.fill();ell(mx+8,my+7,4,3);ctx.fill();
  // 远处楼群
  let x=-10;while(x<W){const w=40+R()*70,h=70+R()*130,y=cy-h;ctx.fillStyle=R()<0.5?'#1e1236':'#24163e';ctx.fillRect(x,y,w,h);
    for(let wy=y+10;wy<cy-16;wy+=16)for(let wx=x+7;wx<x+w-8;wx+=13)if(R()<0.33){ctx.fillStyle='rgba(255,'+(190+R()*40|0)+',110,'+(0.35+R()*0.4)+')';ctx.fillRect(wx,wy,6,8);}x+=w+2;}
  // 远处摊位棚子 + 暖光
  const tents=Math.ceil(W/170);for(let i=0;i<tents;i++){const tx=i*170+R()*40,ty=cy-58,tw=130,c=['#8a2a3a','#2a6a6a','#8a5a1a','#5a2a7a'][i%4];
    glow(tx+tw/2,ty+40,110,'rgba(255,170,80,.42)');ctx.fillStyle='#2a1a30';ctx.fillRect(tx+8,ty+8,tw-16,60);ctx.fillStyle=c;ctx.beginPath();ctx.moveTo(tx-6,ty+14);ctx.lineTo(tx+tw/2,ty-16);ctx.lineTo(tx+tw+6,ty+14);ctx.closePath();ctx.fill();
    ctx.fillStyle='rgba(255,220,160,.5)';for(let k=0;k<5;k++){ell(tx+12+k*(tw-24)/4,ty+16,4,4);ctx.fill();}}
  g=ctx.createLinearGradient(0,cy-80,0,cy);g.addColorStop(0,'rgba(255,140,70,0)');g.addColorStop(1,'rgba(255,140,70,.28)');ctx.fillStyle=g;ctx.fillRect(0,cy-80,W,80);
  // 自家摊位：立柱 + 遮阳篷
  ctx.fillStyle='#4a2a1c';const pw=L.port?16:20,px0=L.port?L.ox:0,px1=L.port?L.ox+720-pw:W-pw;ctx.fillRect(px0,L.hud.h,pw,cy-L.hud.h);ctx.fillRect(px1,L.hud.h,pw,cy-L.hud.h);
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(px0+3,L.hud.h,4,cy-L.hud.h);ctx.fillRect(px1+3,L.hud.h,4,cy-L.hud.h);
  const ay=L.hud.h,ah=L.port?30:24,sw2=36;for(let k=0,xx=0;xx<W;k++,xx+=sw2){ctx.fillStyle=k%2?'#f6e3c0':'#c8352b';ctx.fillRect(xx,ay,sw2,ah);ctx.beginPath();ctx.arc(xx+sw2/2,ay+ah,sw2/2,0,Math.PI);ctx.fill();}
  ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(0,ay,W,4);
  // 灯串电线
  ctx.strokeStyle='rgba(30,20,20,.8)';ctx.lineWidth=2;ctx.beginPath();for(let i=0;i<=40;i++){const t=i/40,xx=t*W,yy=ay+ah+26+Math.sin(t*Math.PI*(L.port?3:4))*-14+Math.abs(Math.sin(t*Math.PI*(L.port?3:4)))*0;i?ctx.lineTo(xx,lightY(t)):ctx.moveTo(xx,lightY(t));}ctx.stroke();
  // 竖屏：柜台后面的内墙 + 菜单板
  if(L.port){const y0=cy+L.counterH,y1=L.prepY;g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,'#4a2a20');g.addColorStop(1,'#6a3c26');ctx.fillStyle=g;ctx.fillRect(0,y0,W,y1-y0);
    ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=2;for(let xx=12;xx<W;xx+=46){ctx.beginPath();ctx.moveTo(xx,y0);ctx.lineTo(xx,y1);ctx.stroke();}
    const mb={x:L.ox+468,y:y0+30,w:236,h:142};ctx.fillStyle='#6b4026';rr(mb.x-8,mb.y-8,mb.w+16,mb.h+16,12);ctx.fill();ctx.fillStyle='#22302a';rr(mb.x,mb.y,mb.w,mb.h,8);ctx.fill();
    text('今日菜单',mb.x+mb.w/2,mb.y+24,22,'#ffe9a8','900');TYPE_KEYS.forEach((k,i)=>{text(TYPES[k].name,mb.x+24,mb.y+60+i*28,19,'#f4f0e0','800','left');text('¥'+TYPES[k].price,mb.x+mb.w-22,mb.y+60+i*28,19,'#ffd23f','900','right');});}
  // 暗角
  g=ctx.createRadialGradient(W/2,H*0.45,Math.min(W,H)*0.4,W/2,H*0.5,Math.max(W,H)*0.8);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(10,0,20,.45)');ctx.fillStyle=g;ctx.fillRect(0,0,W,L.prepY);}
function lightY(t){const ay=L.hud.h+(L.port?30:24),n=L.port?3:4;return ay+16+Math.abs(Math.sin(t*Math.PI*n))*24;}
// ---------- 前景：操作台 + 烤炉（静态缓存）----------
function paintFG(){const y0=L.prepY,R=srand(7);let g=ctx.createLinearGradient(0,y0,0,H);g.addColorStop(0,'#8a5232');g.addColorStop(0.08,'#6e3f26');g.addColorStop(1,'#43251a');ctx.fillStyle=g;ctx.fillRect(0,y0,W,H-y0);
  ctx.fillStyle='#b0744a';ctx.fillRect(0,y0,W,5);ctx.strokeStyle='rgba(30,10,0,.22)';ctx.lineWidth=2;for(let y=y0+48;y<H;y+=56){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}
  for(let i=0;i<40;i++){ctx.strokeStyle='rgba(255,220,180,.05)';ctx.lineWidth=1.5;const yy=y0+10+R()*(H-y0-10),xx=R()*W;ctx.beginPath();ctx.moveTo(xx,yy);ctx.quadraticCurveTo(xx+40,yy+R()*6-3,xx+90+R()*60,yy);ctx.stroke();}
  const G=L.grill;ctx.save();ctx.shadowColor='rgba(0,0,0,.5)';ctx.shadowBlur=24;ctx.shadowOffsetY=8;rr(G.x,G.y,G.w,G.h,22);g=ctx.createLinearGradient(0,G.y,0,G.y+G.h);g.addColorStop(0,'#5d5d68');g.addColorStop(1,'#26262d');ctx.fillStyle=g;ctx.fill();ctx.restore();
  ctx.strokeStyle='#8c8c99';ctx.lineWidth=3;rr(G.x+1.5,G.y+1.5,G.w-3,G.h-3,21);ctx.stroke();
  const B=grillBed();rr(B.x,B.y,B.w,B.h,12);ctx.fillStyle='#160c0a';ctx.fill();ctx.save();rr(B.x,B.y,B.w,B.h,12);ctx.clip();
  for(let i=0;i<220;i++){const x=B.x+R()*B.w,y=B.y+B.h*0.35+R()*B.h*0.7,r=6+R()*12;ctx.fillStyle=['#2a1610','#3a1c12','#4a2416','#251210'][i%4];ell(x,y,r,r*0.7);ctx.fill();
    if(R()<0.45){ctx.fillStyle='rgba(255,'+(90+R()*80|0)+',30,'+(0.35+R()*0.5)+')';ell(x+R()*4-2,y-r*0.2,r*0.45,r*0.25);ctx.fill();}}
  g=ctx.createLinearGradient(0,B.y,0,B.y+B.h);g.addColorStop(0,'rgba(0,0,0,.65)');g.addColorStop(0.4,'rgba(0,0,0,.15)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.fillRect(B.x,B.y,B.w,B.h);ctx.restore();
  // 铁网
  ctx.strokeStyle='rgba(190,190,200,.55)';ctx.lineWidth=2.5;for(let y=B.y+B.h*0.42;y<B.y+B.h;y+=20){ctx.beginPath();ctx.moveTo(B.x,y);ctx.lineTo(B.x+B.w,y);ctx.stroke();}
  ctx.strokeStyle='rgba(255,255,255,.05)';ctx.lineWidth=2;for(let i=1;i<MAX_SLOTS;i++){const S=L.slots[i];ctx.beginPath();ctx.moveTo(S.cx-S.w/2,B.y+8);ctx.lineTo(S.cx-S.w/2,B.y+B.h-8);ctx.stroke();}
  // 托盘 / 工具底座
  for(const r of L.trays){ctx.fillStyle='rgba(0,0,0,.25)';rr(r.x+3,r.y+6,r.w,r.h,18);ctx.fill();}
  for(const t of L.tools){ctx.fillStyle='rgba(0,0,0,.25)';rr(t.x+3,t.y+6,t.w,t.h,18);ctx.fill();}}
function grillBed(){const G=L.grill;return {x:G.x+14,y:G.y+12,w:G.w-28,h:G.h-24};}
// ---------- 夜市动态层 ----------
const PASSERS=[{x:0.1,v:28,c:'rgba(20,10,30,.32)',s:0.8},{x:0.55,v:-22,c:'rgba(30,15,40,.28)',s:0.7},{x:0.8,v:34,c:'rgba(25,12,35,.3)',s:0.85}];
function drawLiveBG(){const n=L.port?11:Math.round(W/90);ctx.globalCompositeOperation='lighter';
  for(let i=0;i<=n;i++){const t=(i+0.5)/(n+1),x=t*W,y=lightY(t)+5,tw=0.75+0.25*Math.sin(now*2.2+i*1.7);const col=['rgba(255,200,90,.9)','rgba(255,120,90,.9)','rgba(255,230,150,.9)'][i%3];glow(x,y,22,col,0.55*tw);}
  ctx.globalCompositeOperation='source-over';
  for(let i=0;i<=n;i++){const t=(i+0.5)/(n+1),x=t*W,y=lightY(t)+5;ctx.fillStyle=['#ffd27a','#ff9a7a','#fff0b0'][i%3];ell(x,y,4.5,5.5);ctx.fill();}
  const cy=L.counterY;for(const p of PASSERS){let x=((p.x*W+now*p.v)%(W+200)+W+200)%(W+200)-100;const y=cy-6,s=p.s,b=Math.abs(Math.sin(now*4+p.x*9))*3;ctx.fillStyle=p.c;
    ell(x,y-92*s-b,13*s,14*s);ctx.fill();rr(x-15*s,y-78*s-b,30*s,70*s,12*s);ctx.fill();}
  // 红灯笼
  const lx=L.port?[L.ox+40,L.ox+680]:[34,W-34];for(const [k,x] of lx.entries()){const sw=Math.sin(now*1.3+k*2)*0.06,y=L.hud.h+(L.port?40:34);ctx.save();ctx.translate(x,y);ctx.rotate(sw);
    ctx.strokeStyle='#2a1a10';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,14);ctx.stroke();glow(0,40,70,'rgba(255,90,50,.5)',0.6+0.1*Math.sin(now*3+k));
    ctx.fillStyle='#d8261c';ell(0,40,22,26);ctx.fill();ctx.fillStyle='#ff5a3a';ell(-6,36,8,18);ctx.fill();ctx.fillStyle='#e8b64a';rr(-12,13,24,6,2);ctx.fill();rr(-12,62,24,6,2);ctx.fill();
    ctx.strokeStyle='rgba(120,0,0,.5)';ctx.lineWidth=1.5;for(const d of[-12,0,12]){ctx.beginPath();ctx.ellipse(0,40,Math.abs(d)+1,26,0,0,TAU);ctx.stroke();}
    ctx.strokeStyle='#e8b64a';ctx.lineWidth=2;for(const d of[-4,0,4]){ctx.beginPath();ctx.moveTo(d,68);ctx.lineTo(d+Math.sin(now*2+d)*1.5,84);ctx.stroke();}text('串',0,41,15,'#ffe9a0','900');ctx.restore();}}
function drawCounter(){const y=L.counterY,h=L.counterH;let g=ctx.createLinearGradient(0,y,0,y+h);g.addColorStop(0,'#c27a44');g.addColorStop(0.25,'#a85f32');g.addColorStop(1,'#6e3a1e');ctx.fillStyle=g;ctx.fillRect(0,y,W,h);
  ctx.fillStyle='#e6a466';ctx.fillRect(0,y,W,6);ctx.fillStyle='rgba(255,255,255,.25)';ctx.fillRect(0,y+1,W,2);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(0,y+h-6,W,6);
  ctx.strokeStyle='rgba(60,25,10,.25)';ctx.lineWidth=1.5;for(let x=60;x<W;x+=150){ctx.beginPath();ctx.moveTo(x,y+10);ctx.quadraticCurveTo(x+40,y+h/2,x+20,y+h-8);ctx.stroke();}
  if(state==='play'&&!spots.some(Boolean)&&!bossRound)text('等客人来咯…',(L.port?W/2:(L.spots[0].cx+L.spots[3].cx)/2),y-70,22,'rgba(255,240,220,.55)','800');}
// ---------- 小图标 ----------
function iconSalt(s,fill){ctx.save();ctx.scale(s,s);ctx.fillStyle=fill||'#fff';rr(-15,-10,30,32,9);ctx.fill();ctx.strokeStyle='#8a9aa8';ctx.lineWidth=2.4;ctx.stroke();ctx.fillStyle='#aab6c2';rr(-15,-21,30,13,6);ctx.fill();
  ctx.fillStyle='#4a5a6a';for(const d of[-7,0,7]){ell(d,-15,1.8,1.8);ctx.fill();}text('盐',0,7,15,'#5a6a7a','900');ctx.restore();}
function iconChili(s){ctx.save();ctx.scale(s,s);ctx.rotate(0.5);ctx.fillStyle='#e8261a';ctx.beginPath();ctx.moveTo(-6,-18);ctx.quadraticCurveTo(17,-12,10,12);ctx.quadraticCurveTo(4,24,-4,26);ctx.quadraticCurveTo(0,9,-12,-11);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#9a1008';ctx.lineWidth=1.6;ctx.stroke();ctx.fillStyle='#2fae4a';rr(-12,-26,12,10,4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.5)';ell(2,-5,2.6,8);ctx.fill();ctx.restore();}
function iconFlip(s,col){ctx.save();ctx.scale(s,s);ctx.strokeStyle=col||'#ff9a1a';ctx.fillStyle=col||'#ff9a1a';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,0,15,Math.PI*1.12,Math.PI*1.88);ctx.stroke();ctx.beginPath();ctx.arc(0,0,15,Math.PI*0.12,Math.PI*0.88);ctx.stroke();
  ctx.beginPath();ctx.moveTo(13,-17);ctx.lineTo(22,-5);ctx.lineTo(8,-5);ctx.fill();ctx.beginPath();ctx.moveTo(-13,17);ctx.lineTo(-22,5);ctx.lineTo(-8,5);ctx.fill();ctx.restore();}
function iconCheck(s,col){ctx.save();ctx.scale(s,s);ctx.strokeStyle=col||'#fff';ctx.lineWidth=6;ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();ctx.moveTo(-11,1);ctx.lineTo(-3,10);ctx.lineTo(13,-9);ctx.stroke();ctx.restore();}
function iconX(s,col){ctx.save();ctx.scale(s,s);ctx.strokeStyle=col||'#ff8a7a';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-9,-9);ctx.lineTo(9,9);ctx.moveTo(9,-9);ctx.lineTo(-9,9);ctx.stroke();ctx.restore();}
function iconFlame(s){ctx.save();ctx.scale(s,s);const f=1+0.08*Math.sin(now*14);ctx.scale(1,f);ctx.fillStyle='#ff7a1a';ctx.beginPath();ctx.moveTo(0,-16);ctx.bezierCurveTo(14,-2,12,14,0,14);ctx.bezierCurveTo(-12,14,-14,-2,0,-16);ctx.fill();
  ctx.fillStyle='#ffd23f';ctx.beginPath();ctx.moveTo(0,-4);ctx.bezierCurveTo(7,4,6,12,0,12);ctx.bezierCurveTo(-6,12,-7,4,0,-4);ctx.fill();ctx.restore();}
function iconBin(s){ctx.save();ctx.scale(s,s);ctx.fillStyle='#cfd8e0';rr(-17,-11,34,34,6);ctx.fill();ctx.fillStyle='#9aa8b4';rr(-21,-19,42,8,4);ctx.fill();rr(-6,-25,12,7,3);ctx.fill();
  ctx.strokeStyle='#7a8a9a';ctx.lineWidth=3;for(const d of[-8,0,8]){ctx.beginPath();ctx.moveTo(d,-5);ctx.lineTo(d,17);ctx.stroke();}ctx.restore();}
function coinIcon(x,y,r,rot){ctx.save();ctx.translate(x,y);ctx.scale(Math.abs(Math.cos(rot||0))*0.85+0.15,1);const g=ctx.createLinearGradient(0,-r,0,r);g.addColorStop(0,'#fff3a0');g.addColorStop(0.5,'#ffd23f');g.addColorStop(1,'#e09a00');
  ctx.fillStyle=g;ell(0,0,r,r);ctx.fill();ctx.strokeStyle='#a86a00';ctx.lineWidth=Math.max(1.2,r*0.14);ctx.stroke();ctx.strokeStyle='rgba(168,106,0,.55)';ctx.lineWidth=Math.max(1,r*0.08);ell(0,0,r*0.68,r*0.68);ctx.stroke();
  if(r>=9)text('¥',0,r*0.05,r*1.05,'#a86a00','900');ctx.fillStyle='rgba(255,255,255,.7)';ell(-r*0.35,-r*0.4,r*0.22,r*0.14);ctx.fill();ctx.restore();}
// ---------- 食物 ----------
function foodCol(s){const T=TYPES[s.type],P=stagesOf(s.type);if(s.burnt||s.t>=P.p2)return T.burn;
  if(s.t<P.p0)return mix(T.raw,T.cook,s.t/P.p0);if(s.t<P.p1)return mix(T.cook,T.over,(s.t-P.p0)/(P.p1-P.p0)*0.35);return mix(mix(T.cook,T.over,0.35),T.burn,(s.t-P.p1)/(P.p2-P.p1)*0.55);}
function chunkPath(type,idx){ctx.beginPath();
  if(type==='potato'){ctx.ellipse(0,0,31,14,0,0,TAU);}
  else if(type==='wing'){ctx.moveTo(-33,-2);ctx.bezierCurveTo(-35,-17,-20,-21,-9,-15);ctx.bezierCurveTo(3,-10,15,-16,27,-21);ctx.quadraticCurveTo(37,-22,35,-12);ctx.bezierCurveTo(28,1,14,13,-2,16);ctx.bezierCurveTo(-16,18,-31,11,-33,-2);ctx.closePath();}
  else{ctx.moveTo(-29,0);for(let k=0;k<=8;k++){const xx=-29+k*7.25;ctx.quadraticCurveTo(xx-3.6,-17-(k%2?3:0),xx,-13-(k%2?3:0));}ctx.lineTo(29,0);for(let k=8;k>=0;k--){const xx=-29+k*7.25;ctx.quadraticCurveTo(xx+3.6,17+(k%2?3:0),xx,13+(k%2?3:0));}ctx.closePath();}}
function chunk(type,x,y,col,sc,flipped,marks,idx,gloss,burnt){ctx.save();ctx.translate(x,y);ctx.scale(sc,sc);if(type==='wing'){if(idx%2)ctx.scale(-1,1);ctx.rotate(-0.12);}else if(type==='gut')ctx.rotate((idx%2?1:-1)*0.06);
  chunkPath(type,idx);ctx.fillStyle=col;ctx.fill();ctx.save();ctx.clip();
  ctx.fillStyle='rgba(90,35,0,.26)';ctx.beginPath();ctx.ellipse(4,16,42,16,0,0,TAU);ctx.fill();
  ctx.fillStyle='rgba(255,250,225,'+(burnt?0.06:0.38)+')';ctx.beginPath();ctx.ellipse(-8,-9,20,5,-0.1,0,TAU);ctx.fill();
  if(type==='potato'){ctx.fillStyle='rgba(140,90,20,.3)';for(const [a,b,r] of[[-15,-2,2.4],[8,5,2],[18,-4,1.6],[-3,6,1.4]]){ell(a,b,r,r*0.7);ctx.fill();}}
  if(type==='wing'){ctx.strokeStyle='rgba(120,55,15,.4)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-7,-13);ctx.quadraticCurveTo(-3,0,-6,14);ctx.moveTo(20,-16);ctx.quadraticCurveTo(22,-6,17,3);ctx.stroke();
    ctx.fillStyle='rgba(120,55,15,.22)';for(const [a,b] of[[-25,2],[-17,6],[-13,-4],[3,4],[9,-3],[-22,-12]]){ell(a,b,1.3,1.3);ctx.fill();}}
  if(type==='gut'){ctx.strokeStyle='rgba(120,50,30,.4)';ctx.lineWidth=2;for(let k=1;k<4;k++){ctx.beginPath();ctx.moveTo(-29+k*14.5,-15);ctx.quadraticCurveTo(-25+k*14.5,0,-29+k*14.5,15);ctx.stroke();}}
  if(marks>0){ctx.strokeStyle='rgba(45,18,6,'+(0.6*marks)+')';ctx.lineWidth=4;ctx.lineCap='round';const d=flipped?-1:1;for(let k=-1;k<=1;k++){ctx.beginPath();ctx.moveTo(k*15-8*d,-14);ctx.lineTo(k*15+8*d,14);ctx.stroke();}}
  if(burnt){ctx.fillStyle='rgba(120,110,100,.5)';for(const [a,b] of[[-12,-4],[6,3],[16,-6],[-20,5]]){ell(a,b,3,2);ctx.fill();}}
  ctx.restore();
  ctx.strokeStyle=burnt?'rgba(10,5,0,.6)':mix(col,'#3a1606',0.5);ctx.lineWidth=2.4;chunkPath(type,idx);ctx.stroke();
  if(gloss>0){ctx.globalAlpha=gloss;ctx.fillStyle='#fff';ell(-14,-7,6,2.2);ctx.fill();ell(10,-8,3,1.5);ctx.fill();ctx.globalAlpha=1;}
  ctx.restore();}
function drawChunks(type,cx,top,len,col,sc,s,o){o=o||{};
  // 竹签
  ctx.lineCap='round';ctx.strokeStyle='#d8ad6a';ctx.lineWidth=5*sc;ctx.beginPath();ctx.moveTo(cx,top-6*sc);ctx.lineTo(cx,top+len+22*sc);ctx.stroke();
  ctx.fillStyle='#d8ad6a';ctx.beginPath();ctx.moveTo(cx-2.5*sc,top-6*sc);ctx.lineTo(cx,top-16*sc);ctx.lineTo(cx+2.5*sc,top-6*sc);ctx.fill();
  ctx.strokeStyle='#a8763a';ctx.lineWidth=7*sc;ctx.beginPath();ctx.moveTo(cx,top+len);ctx.lineTo(cx,top+len+22*sc);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=1.5*sc;ctx.beginPath();ctx.moveTo(cx-1.5*sc,top);ctx.lineTo(cx-1.5*sc,top+len);ctx.stroke();
  ctx.save();ctx.translate(cx,0);ctx.scale(1-0.8*Math.sin(Math.PI*(o.flipSq||0)),1);
  const n=type==='wing'?(len>150*sc?3:2):4,gap=(len-26*sc)/n;
  for(let k=0;k<n;k++){const y=top+16*sc+gap*(k+0.5);chunk(type,0,y,col,sc,o.flipped,o.marks||0,k,o.gloss||0,o.burnt);
    if(s&&(s.salt||s.chili)){const r1=1.7*sc,r2=3.2*sc;if(s.salt){ctx.fillStyle='rgba(255,255,255,.95)';ctx.beginPath();for(let j=0;j<s.dots.length;j+=2){const d=s.dots[j];if(d[2]>=s.salt*2)continue;const px=d[0]*22*sc,py=y+d[1]*9*sc;ctx.moveTo(px+r1,py);ctx.arc(px,py,r1,0,TAU);}ctx.fill();}
      if(s.chili){ctx.fillStyle='#d8180c';ctx.beginPath();for(let j=1;j<s.dots.length;j+=2){const d=s.dots[j];if(d[2]>=s.chili*2)continue;ctx.rect(d[0]*22*sc-r2/2,y+d[1]*9*sc-r2/2,r2,r2);}ctx.fill();}}}
  ctx.restore();}
function drawIcon(type,x,y,s,col){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.rotate(-0.5);drawChunks(type,0,-50,100,col||TYPES[type].cook,1,null,{marks:col?0:0.7,gloss:col?0:0.5});ctx.restore();}
// ---------- 烤串 + 火候圈 ----------
const STAGE_TXT={raw:'生',half:'半熟',perfect:'刚好！',warn:'快糊了！',burnt:'糊咯'},STAGE_COL={raw:'#f3e6b8',half:'#ffd98a',perfect:'#7cff7a',warn:'#ffb347',burnt:'#ff8a7a'};
const STEP_COL={salt:'#ffffff',flip:'#ff9a1a',chili:'#ff3b2a'};
function skewerPos(s,i){const S=L.slots[i];if(s.fly>=1||s.fromX==null)return {x:S.cx,y:0,sc:1,rot:0};const e=easeOutCubic(s.fly),tx=S.cx,ty=S.top+S.len*0.5;
  const x=lerp(s.fromX,tx,e),y=lerp(s.fromY,ty,e)-Math.sin(Math.PI*e)*90;return {x,y:y-ty,sc:lerp(0.7,1,e),rot:(1-e)*-0.9};}
function drawSkewer(s,i){const S=L.slots[i],d=doneness(s),P=stagesOf(s.type),sel=selected===i,dragging=drag&&drag.kind==='slot'&&drag.i===i;
  const col=foodCol(s),k0=clamp(s.t/P.p0,0,1),marks=k0>0.45?(k0-0.45)/0.55:0,sc=L.port?1.02:0.94;
  const pos=skewerPos(s,i);
  if(s.fly>=1&&!dragging){ctx.globalCompositeOperation='lighter';glow(S.cx,S.top+S.len*0.65,S.w*0.55,d==='warn'||d==='burnt'?'rgba(255,90,30,.5)':'rgba(255,150,50,.4)',0.6+0.15*Math.sin(now*5+i));ctx.globalCompositeOperation='source-over';}
  if(sel){ctx.save();ctx.shadowColor='#ffe066';ctx.shadowBlur=22;rr(S.cx-S.w/2+5,S.top-24,S.w-10,S.len+52,16);ctx.strokeStyle='#ffe066';ctx.lineWidth=4;ctx.stroke();ctx.restore();}
  ctx.save();if(dragging)ctx.globalAlpha=0.3;
  const cy=S.top+S.len*0.5,sq=s.squash>0?Math.sin(s.squash*Math.PI):0,pop=s.pop<1?easeOutBack(s.pop):1,wob=(d==='warn'?Math.sin(now*17+i)*0.035:0)+(s.shake>0?Math.sin(s.shake*50)*0.06:0);
  ctx.translate(pos.x,cy+pos.y-(sel?10:0));ctx.rotate(pos.rot+wob);ctx.scale(pos.sc*(1+0.12*sq)*(0.85+0.15*pop),pos.sc*(1-0.1*sq)*(0.85+0.15*pop));
  drawChunks(s.type,0,-S.len/2,S.len,col,sc,s,{flipped:s.flipped,marks,flipSq:s.flipAnim,gloss:(d==='perfect'&&s.step>=3)?0.5+0.3*Math.sin(now*4+i):0,burnt:d==='burnt'});
  ctx.restore();
  if(s.fly<1)return;
  drawRing(s,i,d,P);
  const ly=S.labelY,lt=STAGE_TXT[d],lc=STAGE_COL[d];ctx.font='900 '+(L.port?21:19)+'px '+FONT;const tw=ctx.measureText(lt).width+20,bl=d==='warn'||d==='burnt'?Math.sin(now*9)*0.5+0.5:0;
  rr(S.cx-tw/2,ly-15,tw,30,15);ctx.fillStyle=d==='perfect'?'rgba(20,70,30,.85)':d==='warn'?'rgba(110,40,0,'+(0.75+0.2*bl)+')':d==='burnt'?'rgba(60,20,20,.85)':'rgba(30,20,20,.7)';ctx.fill();text(lt,S.cx,ly+1,L.port?21:19,lc,'900');}
function drawRing(s,i,d,P){const S=L.slots[i],x=S.cx,y=S.ringY,r=L.port?27:25,tot=P.p2,a0=-Math.PI/2,ang=v=>a0+TAU*clamp(v/tot,0,1);
  const ready=sellable(s),need=!s.burnt&&d!=='burnt'&&s.step<3,pulse=need||ready?1+0.06*Math.sin(now*6+i):1;
  ctx.save();ctx.translate(x,y);ctx.scale(pulse,pulse);
  ctx.fillStyle='rgba(20,10,8,.88)';ell(0,0,r+7,r+7);ctx.fill();
  ctx.lineWidth=7;ctx.lineCap='butt';const seg=(a,b,c)=>{ctx.strokeStyle=c;ctx.beginPath();ctx.arc(0,0,r,ang(a),ang(b));ctx.stroke();};
  seg(0,P.p0,'rgba(243,230,184,.22)');seg(P.p0,P.p1,'rgba(76,217,100,.3)');seg(P.p1,P.p2,'rgba(255,159,46,.32)');
  const t=Math.min(s.t,tot);if(t>0){if(t>0)seg(0,Math.min(t,P.p0),'#f3e6b8');if(t>P.p0)seg(P.p0,Math.min(t,P.p1),'#4cd964');if(t>P.p1)seg(P.p1,t,s.burnt?'#5a3a30':'#ff9f2e');}
  if(d!=='burnt'){const an=ang(t);ctx.fillStyle='#fff';ell(Math.cos(an)*r,Math.sin(an)*r,4.5,4.5);ctx.fill();}
  // 中间图标
  if(d==='burnt')iconX(1,'#ff8a7a');
  else if(s.step<3){const st=STEPS[s.step];ctx.fillStyle=st==='salt'?'#4a5a6a':st==='flip'?'#5a3000':'#5a1008';ell(0,0,r-5,r-5);ctx.fill();
    if(st==='salt')iconSalt(0.62);else if(st==='flip')iconFlip(0.72);else iconChili(0.62);}
  else if(ready){ctx.fillStyle=d==='warn'?'#e07a00':'#2fae4a';ell(0,0,r-5,r-5);ctx.fill();iconCheck(1.05);}
  else iconFlame(0.85);
  ctx.restore();
  // 三步进度点
  const py=y+r+13;for(let k=0;k<3;k++){const px=x+(k-1)*15,st=STEPS[k];if(k<s.step){ctx.fillStyle=STEP_COL[st];ell(px,py,5,5);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=1.2;ctx.stroke();}
    else{ctx.fillStyle='rgba(0,0,0,.45)';ell(px,py,4,4);ctx.fill();}}}
// ---------- 顾客 ----------
const SKINS={cat:'#ffbe7a',bear:'#b9845a',rabbit:'#fff6f2',panda:'#ffffff',boy:'#ffe2c8',granny:'#ffe2c8',girl:'#ffe2c8'};
function custX(c,sp){const a=c.anim,e=a*a*(3-2*a);if(c.phase==='enter')return lerp(W+120,sp.cx,e);if(c.phase==='leaveHappy'||c.phase==='leaveAngry')return lerp(sp.cx,c.phase==='leaveAngry'?-140:W+140,e);return sp.cx;}
function drawCustomer(c,i){const sp=L.spots[i],s=sp.sc,x=custX(c,sp);
  const walking=c.phase!=='wait',bob=walking?-Math.abs(Math.sin(c.bob*10))*8:Math.sin(c.bob*2.5)*2,hop=c.hop>0?-Math.sin(c.hop*Math.PI)*14:0;
  const pf=c.patience/c.maxP,angry=c.phase==='leaveAngry'||(c.phase==='wait'&&pf<0.25),happy=c.phase==='leaveHappy'||(c.react>0&&c.reactGood);
  const K=c.kind,skin=SKINS[K],OL='rgba(60,30,40,.55)';
  ctx.save();ctx.translate(x,sp.base+bob+hop);ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.18)';ell(0,6,52,10);ctx.fill();
  // 身体
  let g=ctx.createLinearGradient(-40,-70,40,20);g.addColorStop(0,mix(c.col,'#ffffff',0.25));g.addColorStop(1,mix(c.col,'#3a2040',0.25));ctx.fillStyle=g;rr(-42,-72,84,96,32);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.3)';rr(-16,-60,32,34,12);ctx.fill();
  ctx.fillStyle=mix(c.col,'#3a2040',0.15);for(const d of[-1,1]){ell(d*36,-30+(walking?Math.sin(c.bob*10+d)*4:0),12,22);ctx.fill();}
  const hy=-120;
  if(K==='cat'){for(const d of[-1,1]){ctx.fillStyle=skin;ctx.beginPath();ctx.moveTo(d*12,hy-34);ctx.lineTo(d*38,hy-52);ctx.lineTo(d*38,hy-14);ctx.fill();ctx.strokeStyle=OL;ctx.stroke();ctx.fillStyle='#ffb0b8';ctx.beginPath();ctx.moveTo(d*20,hy-32);ctx.lineTo(d*34,hy-43);ctx.lineTo(d*33,hy-24);ctx.fill();}}
  if(K==='bear'||K==='panda'){for(const d of[-1,1]){ctx.fillStyle=K==='panda'?'#2a2a2a':skin;ell(d*32,hy-34,14,14);ctx.fill();ctx.strokeStyle=OL;ctx.stroke();if(K==='bear'){ctx.fillStyle='#e8b090';ell(d*32,hy-34,7,7);ctx.fill();}}}
  if(K==='rabbit'){for(const d of[-1,1]){ctx.save();ctx.translate(d*16,hy-40);ctx.rotate(d*(0.12+Math.sin(c.bob*3)*0.05));ctx.fillStyle=skin;ell(0,-22,10,30);ctx.fill();ctx.strokeStyle=OL;ctx.stroke();ctx.fillStyle='#ffc2d1';ell(0,-20,5,22);ctx.fill();ctx.restore();}}
  g=ctx.createRadialGradient(-14,hy-16,8,0,hy,52);g.addColorStop(0,angry?mix('#ff9a9a',skin,0.5):mix(skin,'#ffffff',0.3));g.addColorStop(1,angry?mix('#ff7070',skin,0.4):mix(skin,'#c08070',0.18));ctx.fillStyle=g;ell(0,hy,46,42);ctx.fill();ctx.strokeStyle=OL;ctx.lineWidth=3;ctx.stroke();
  if(K==='panda'){ctx.fillStyle='#2a2a2a';ctx.save();ctx.translate(-16,hy+2);ctx.rotate(0.4);ell(0,0,11,14);ctx.fill();ctx.restore();ctx.save();ctx.translate(16,hy+2);ctx.rotate(-0.4);ell(0,0,11,14);ctx.fill();ctx.restore();}
  if(K==='boy'){ctx.fillStyle='#2b2b3a';ctx.beginPath();ctx.arc(0,hy-6,47,Math.PI*1.05,Math.PI*1.95);for(let k=0;k<5;k++)ctx.lineTo(30-k*15,hy-38+(k%2)*10);ctx.fill();ctx.fillStyle='rgba(255,255,255,.18)';ell(-14,hy-38,12,4);ctx.fill();}
  if(K==='girl'){ctx.fillStyle='#6b3b2a';ctx.beginPath();ctx.arc(0,hy-4,48,Math.PI*0.95,Math.PI*2.05);ctx.quadraticCurveTo(10,hy-30,-48,hy);ctx.fill();ell(-46,hy+12,12,26);ctx.fill();ell(46,hy+12,12,26);ctx.fill();ctx.fillStyle='#ff6f91';flower5(30,hy-36,5,'#ff8fab','#ffe066');}
  if(K==='granny'){ctx.fillStyle='#e2e2ea';ctx.beginPath();ctx.arc(0,hy-6,47,Math.PI*1.02,Math.PI*1.98);ctx.fill();ell(0,hy-48,18,14);ctx.fill();
    ctx.strokeStyle='#7a5a40';ctx.lineWidth=2.5;ell(-16,hy+2,10,9);ctx.stroke();ell(16,hy+2,10,9);ctx.stroke();ctx.beginPath();ctx.moveTo(-6,hy+2);ctx.lineTo(6,hy+2);ctx.stroke();}
  const eyeC=K==='panda'?'#fff':'#2b1f1f';ctx.fillStyle=eyeC;ctx.strokeStyle=eyeC;ctx.lineWidth=3.2;ctx.lineCap='round';
  const blink=Math.sin(c.bob*1.7+i)>0.985;
  if(happy){for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*16,hy+5,6,Math.PI*1.1,Math.PI*1.9);ctx.stroke();}}
  else if(blink){for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*16-5,hy+2);ctx.lineTo(d*16+5,hy+2);ctx.stroke();}}
  else{for(const d of[-1,1]){ell(d*16,hy+2,5,6.5);ctx.fill();}if(K!=='panda'){ctx.fillStyle='#fff';ell(-14.2,hy-0.8,2,2.2);ctx.fill();ell(17.8,hy-0.8,2,2.2);ctx.fill();}}
  if(angry){ctx.strokeStyle='#2b1f1f';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(-26,hy-14);ctx.lineTo(-8,hy-8);ctx.moveTo(26,hy-14);ctx.lineTo(8,hy-8);ctx.stroke();}
  ctx.fillStyle='rgba(255,110,130,.45)';ell(-27,hy+14,8,4.5);ctx.fill();ell(27,hy+14,8,4.5);ctx.fill();
  ctx.strokeStyle='#8a3030';ctx.lineWidth=3;ctx.beginPath();
  if(happy){ctx.fillStyle='#c0394f';ctx.arc(0,hy+16,8,0,Math.PI);ctx.closePath();ctx.fill();ctx.fillStyle='#ff8fa3';ell(0,hy+20,4,2);ctx.fill();}
  else if(angry){ctx.arc(0,hy+26,7,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
  else if(pf<0.5&&c.phase==='wait'){ctx.moveTo(-6,hy+19);ctx.lineTo(6,hy+19);ctx.stroke();ctx.fillStyle='#7ec8ff';ctx.beginPath();ctx.moveTo(36,hy-20);ctx.quadraticCurveTo(44,hy-6,36,hy-4);ctx.quadraticCurveTo(28,hy-6,36,hy-20);ctx.fill();}
  else{ctx.arc(0,hy+14,6,0.2,Math.PI-0.2);ctx.stroke();}
  if(K==='cat'){ctx.strokeStyle='rgba(80,40,20,.6)';ctx.lineWidth=1.5;for(const d of[-1,1])for(const k of[-1,1]){ctx.beginPath();ctx.moveTo(d*24,hy+10+k*3);ctx.lineTo(d*44,hy+8+k*7);ctx.stroke();}}
  if(c.phase==='leaveAngry'){ctx.fillStyle='rgba(255,255,255,.8)';for(const d of[-1,1]){ell(d*44,hy-44-Math.sin(now*12)*4,9,7);ctx.fill();}}
  if(c.phase==='leaveHappy'&&c.mood>0){heart(46,hy-40-c.anim*30,9,'#ff5a7a');}
  ctx.restore();
  if(c.phase==='wait'||c.phase==='enter')drawOrder(c,i,x,sp,angry);
  if(c.react>0&&c.reactText){const ry=sp.base-196*s;ctx.save();ctx.globalAlpha=Math.min(1,c.react*2);ctx.font='900 21px '+FONT;const tw=ctx.measureText(c.reactText).width+26;
    const sc=c.react>1.2?easeOutBack(clamp((1.4-c.react)/0.2,0,1)):1;ctx.translate(x,ry);ctx.scale(sc,sc);rr(-tw/2,-18,tw,36,18);ctx.fillStyle=c.reactGood?'#3fbf5a':'#e8503e';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();text(c.reactText,0,1,20,'#fff','900');ctx.restore();}}
function drawOrder(c,i,x,sp,angry){const bw=L.port?168:clamp(sp.w-18,170,210),bh=L.port?92:84,bx=clamp(x-bw/2,4,W-4-bw),headTop=sp.base-168*sp.sc,by=Math.max(L.hud.h+4,headTop-bh-16);
  const pf=clamp(c.patience/c.maxP,0,1),urg=c.phase==='wait'&&pf<0.25;
  ctx.save();ctx.globalAlpha=c.phase==='enter'?c.anim:1;const wob=urg?Math.sin(now*14)*2:0;ctx.translate(wob,0);
  ctx.fillStyle='rgba(0,0,0,.25)';rr(bx+2,by+4,bw,bh,18);ctx.fill();
  rr(bx,by,bw,bh,18);ctx.fillStyle='#fffaf0';ctx.fill();ctx.strokeStyle=urg?'#ff5a4a':'#e8c9a8';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.moveTo(x-10,by+bh-1.5);ctx.lineTo(x+10,by+bh-1.5);ctx.lineTo(x,by+bh+12);ctx.fill();
  const n=c.order.length,cw=(bw-8)/n;c.order.forEach((o,k)=>{const ox=bx+4+cw*(k+0.5),cy=by+30,left=o.need-o.got;
    drawIcon(o.type,ox-(n>2?10:14),cy+2,n>2?0.36:0.44);
    if(left<=0){ctx.save();ctx.translate(ox+(n>2?12:16),cy);iconCheck(0.9,'#2fbf4a');ctx.restore();}else text('×'+left,ox+(n>2?14:20),cy+2,n>2?19:22,'#7a3a20','900');
    text(TYPES[o.type].name,ox,by+bh-27,n>2?12:14,'#a0704a','800');});
  const py=by+bh-15,pw=bw-40;rr(x-pw/2+8,py,pw,9,4.5);ctx.fillStyle='rgba(90,50,30,.25)';ctx.fill();
  rr(x-pw/2+8,py,Math.max(0,pw*pf),9,4.5);ctx.fillStyle=pf>0.5?'#4cd964':pf>0.25?'#ffb81c':'#ff5a4a';ctx.fill();heart(x-pw/2-4,py+5,7,pf>0.25?'#ff6f91':'#ff3a3a');ctx.restore();}
function drawBossCustomer(c){const sp=L.bossSpot,s=sp.sc;let x=sp.cx,y=sp.base,a=c.anim;
  if(c.phase==='enter')y=lerp(sp.base-560,sp.base,easeOutBounce(clamp(a,0,1)));else if(c.phase==='leaveAngry'){x=lerp(sp.cx,-300,a*a);y+=-Math.abs(Math.sin(c.bob*6))*6;}
  const sad=c.phase==='leaveAngry',cry=c.phase==='cry',pf=clamp(c.patience/c.maxP,0,1),worried=c.phase==='wait'&&pf<0.35,br=Math.sin(c.bob*2.4);
  ctx.save();ctx.translate(x,y);ctx.scale(s*(1+br*0.015),s*(1-br*0.015));
  glow(0,-130,200,'rgba(190,120,255,.45)');
  ctx.fillStyle='#b3122a';ctx.beginPath();ctx.moveTo(-62,-128);ctx.quadraticCurveTo(-118,-60,-112,10);ctx.lineTo(112,10);ctx.quadraticCurveTo(118,-60,62,-128);ctx.closePath();ctx.fill();
  ctx.fillStyle='#fff';for(let k=-4;k<=4;k++){ell(k*25,6,9,7);ctx.fill();ctx.fillStyle='#222';ell(k*25,7,2,3);ctx.fill();ctx.fillStyle='#fff';}
  let bg=ctx.createRadialGradient(-20,-90,10,0,-60,110);bg.addColorStop(0,'#a466e0');bg.addColorStop(1,'#5a2a96');ctx.fillStyle=bg;ell(0,-58,96,74);ctx.fill();ctx.strokeStyle='rgba(40,10,60,.5)';ctx.lineWidth=3;ctx.stroke();
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(0,-128);ctx.lineTo(0,14);ctx.stroke();
  ctx.fillStyle='#fffaf0';ctx.beginPath();ctx.moveTo(-46,-112);ctx.quadraticCurveTo(0,-98,46,-112);ctx.quadraticCurveTo(52,-50,0,-30);ctx.quadraticCurveTo(-52,-50,-46,-112);ctx.fill();ctx.strokeStyle='#ff8a6a';ctx.lineWidth=3;ctx.stroke();
  text('吃',0,-72,34,'#e8452c','900');
  const wave=c.phase==='wait'?Math.sin(c.bob*(worried?14:7))*10:0;
  for(const d of[-1,1]){ctx.save();ctx.translate(d*88,-70);ctx.fillStyle='#7b3fb5';ell(0,0,24,22);ctx.fill();ctx.fillStyle='#ffd9b8';ell(d*8,-14+(d<0?wave:-wave),15,15);ctx.fill();
    ctx.translate(d*8,-22+(d<0?wave:-wave));ctx.strokeStyle='#cfd8e0';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,4);ctx.lineTo(0,-46);ctx.stroke();
    if(d<0){ctx.lineWidth=3;for(const q of[-7,0,7]){ctx.beginPath();ctx.moveTo(q,-40);ctx.lineTo(q,-60);ctx.stroke();}ctx.beginPath();ctx.moveTo(-7,-40);ctx.lineTo(7,-40);ctx.stroke();}
    else{ctx.fillStyle='#e8eef3';ctx.beginPath();ctx.moveTo(-3,-44);ctx.quadraticCurveTo(10,-60,2,-78);ctx.lineTo(-3,-78);ctx.closePath();ctx.fill();}ctx.restore();}
  const hy=-160;ctx.fillStyle='#ffd9b8';ell(0,hy,64,58);ctx.fill();ctx.strokeStyle='rgba(120,60,40,.4)';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#f5c3a0';ell(0,hy+48,40,12);ctx.fill();ctx.fillStyle='#ffd9b8';ell(0,hy+40,42,12);ctx.fill();
  for(const d of[-1,1]){ctx.fillStyle='#ffd9b8';ell(d*62,hy+4,11,15);ctx.fill();}
  ctx.fillStyle='rgba(255,110,130,.5)';ell(-38,hy+18,14,9);ctx.fill();ell(38,hy+18,14,9);ctx.fill();ctx.lineCap='round';
  if(cry){ctx.strokeStyle='#3a2020';ctx.lineWidth=5;for(const d of[-1,1]){ctx.beginPath();ctx.arc(d*24,hy-2,11,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
    ctx.fillStyle='rgba(120,200,255,.85)';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*16,hy+2);ctx.lineTo(d*32,hy+2);const wv=Math.sin(now*10+d)*4;ctx.quadraticCurveTo(d*34+wv,hy+40,d*30,hy+70);ctx.lineTo(d*20,hy+70);ctx.quadraticCurveTo(d*22-wv,hy+40,d*16,hy+2);ctx.fill();}}
  else{for(const d of[-1,1]){ctx.fillStyle='#fff';ell(d*24,hy-4,14,15);ctx.fill();ctx.fillStyle='#2b1f1f';ell(d*24+(c.phase==='wait'?4:0),hy-1,8,10);ctx.fill();ctx.fillStyle='#fff';ell(d*24+1,hy-6,3,3);ctx.fill();}
    ctx.strokeStyle='#3a2020';ctx.lineWidth=5;for(const d of[-1,1]){ctx.beginPath();if(sad||worried){ctx.moveTo(d*12,hy-26);ctx.lineTo(d*36,hy-20);}else{ctx.moveTo(d*12,hy-24);ctx.lineTo(d*36,hy-30);}ctx.stroke();}
    if(sad){ctx.fillStyle='rgba(140,200,255,.9)';ell(-24,hy+16,4,6);ctx.fill();}}
  ctx.fillStyle='#5a3220';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,hy+14);ctx.quadraticCurveTo(d*18,hy+6,d*34,hy+16);ctx.quadraticCurveTo(d*40,hy+8,d*38,hy+22);ctx.quadraticCurveTo(d*20,hy+24,0,hy+20);ctx.fill();}
  ctx.fillStyle='#f2a988';ell(0,hy+8,8,6);ctx.fill();
  if(cry){ctx.fillStyle='#b02a3a';ctx.beginPath();ctx.moveTo(-22,hy+26);ctx.quadraticCurveTo(0,hy+30,22,hy+26);ctx.quadraticCurveTo(18,hy+52,0,hy+54);ctx.quadraticCurveTo(-18,hy+52,-22,hy+26);ctx.fill();ctx.fillStyle='#ff8fa3';ell(0,hy+46,10,5);ctx.fill();}
  else if(sad){ctx.strokeStyle='#8a3030';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,hy+42,13,Math.PI*1.15,Math.PI*1.85);ctx.stroke();}
  else{ctx.fillStyle='#8a2a35';ell(0,hy+34,10,9+Math.abs(Math.sin(c.bob*5))*3);ctx.fill();ctx.fillStyle='#8fd3ff';ctx.beginPath();ctx.moveTo(10,hy+36);ctx.quadraticCurveTo(16,hy+50,12,hy+56);ctx.quadraticCurveTo(6,hy+50,10,hy+36);ctx.fill();}
  ctx.save();ctx.translate(0,hy-50);ctx.rotate(Math.sin(c.bob*3)*0.05);const cg=ctx.createLinearGradient(0,-50,0,10);cg.addColorStop(0,'#fff3a0');cg.addColorStop(1,'#e8a200');ctx.fillStyle=cg;
  ctx.beginPath();ctx.moveTo(-44,6);ctx.lineTo(-50,-38);ctx.lineTo(-26,-16);ctx.lineTo(0,-50);ctx.lineTo(26,-16);ctx.lineTo(50,-38);ctx.lineTo(44,6);ctx.closePath();ctx.fill();ctx.strokeStyle='#b07800';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#e8261a';ell(0,-8,7,7);ctx.fill();ctx.fillStyle='#2f8bff';ell(-26,-4,5,5);ctx.fill();ctx.fillStyle='#2fbf4a';ell(26,-4,5,5);ctx.fill();
  ctx.fillStyle='#fff';for(const [px,py] of [[-50,-38],[0,-50],[50,-38]]){ell(px,py,5,5);ctx.fill();}ctx.restore();ctx.restore();
  if(c.phase==='wait'||(c.phase==='enter'&&a>0.7)){const o=c.order[0],left=o.need-o.got,bw=L.port?196:214,bh=L.port?104:96;let bx=x+100*s,by=Math.max(L.hud.h+30,sp.base-240*s);if(bx+bw>W-10)bx=W-10-bw;
    ctx.save();rr(bx,by,bw,bh,18);ctx.fillStyle='#fffaf0';ctx.fill();ctx.strokeStyle=worried?'#ff5a4a':'#a466e0';ctx.lineWidth=4;ctx.stroke();
    rr(bx+bw/2-58,by-12,116,26,13);ctx.fillStyle='#7a2ad0';ctx.fill();text('BOSS·大胃王',bx+bw/2,by+1,15,'#fff3a0','900');
    drawIcon(o.type,bx+46,by+bh/2+2,0.56);text('×'+left,bx+120,by+bh/2,34,'#7a3a20','900');text(TYPES[o.type].name,bx+170,by+bh/2+2,16,'#a0704a','900');
    const pw=bw-16,py=by+bh-16;rr(bx+8,py,pw,10,5);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fill();rr(bx+8,py,Math.max(0,pw*pf),10,5);ctx.fillStyle=pf>0.5?'#a466e0':pf>0.25?'#ffc93c':'#ff5a4a';ctx.fill();ctx.restore();}
  if(c.react>0&&c.reactText){ctx.save();ctx.globalAlpha=Math.min(1,c.react*2);ctx.font='900 26px '+FONT;const tw=ctx.measureText(c.reactText).width+32;let rx=x-100*s-tw;if(rx<10)rx=10;const ry=sp.base-215*s;
    rr(rx,ry-24,tw,48,22);ctx.fillStyle=cry?'#ff7aa8':c.phase==='leaveAngry'?'#7a6a8a':'#a466e0';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();text(c.reactText,rx+tw/2,ry+1,26,'#fff','900');ctx.restore();}}
// ---------- 托盘 & 工具 ----------
const FINE=matchMedia('(pointer:fine)').matches;
function needCount(st){let n=0;for(const s of slots)if(s&&!s.burnt&&s.step<3&&STEPS[s.step]===st&&doneness(s)!=='burnt')n++;return n;}
function pressScale(id){const v=pressT[id]||0;return 1-0.07*Math.sin(Math.PI*clamp(v,0,1));}
let trayCache=[];
function paintTray(i,r){const type=TYPE_KEYS[i],T=TYPES[type];
  let g=ctx.createLinearGradient(0,0,0,r.h);g.addColorStop(0,'#e2aa70');g.addColorStop(1,'#a8703f');rr(2,2,r.w-4,r.h-4,18);ctx.fillStyle=g;ctx.fill();ctx.strokeStyle='#6e4020';ctx.lineWidth=3;ctx.stroke();
  rr(10,10,r.w-20,r.h-20,12);ctx.fillStyle='rgba(255,240,220,.22)';ctx.fill();ctx.fillStyle='rgba(255,255,255,.25)';rr(12,8,r.w-24,4,2);ctx.fill();
  const port=L.port,ix=port?r.w/2:64,iy=port?52:r.h/2;
  for(let k=0;k<3;k++){ctx.save();ctx.translate(ix-22+k*22,iy+(k===1?-3:0));ctx.rotate(-1.25);drawChunks(type,0,-36,72,T.raw,0.55,null,{});ctx.restore();}
  const tx=port?r.w/2:170;text(T.name,tx,port?r.h-46:r.h/2-14,26,'#fff','900',null,5,'#5a2e14');text('¥'+T.price+' · 点我上架',tx,port?r.h-18:r.h/2+20,port?16:15,'#fff3c4','800',null,3,'#5a2e14');
  if(FINE){rr(r.w-32,8,24,22,6);ctx.fillStyle='rgba(60,30,10,.55)';ctx.fill();text(String(i+1),r.w-20,20,14,'#ffe9c8','900');}}
function trayCanvas(i){const r=L.trays[i],k=cacheKey;if(trayCache[i]&&trayCache[i].k===k)return trayCache[i].c;const sx=cvs.width/W,c=document.createElement('canvas');c.width=Math.ceil(r.w*sx);c.height=Math.ceil(r.h*sx);
  const old=ctx;ctx=c.getContext('2d');ctx.setTransform(sx,0,0,sx,0,0);try{paintTray(i,r);}finally{ctx=old;}trayCache[i]={k,c};return c;}
function drawTray(i){const r=L.trays[i],id='tray'+i,hl=press&&press.h.k==='tray'&&press.h.i===i;
  const hint=state==='play'&&SAVE.day<=2&&!slots.some(Boolean)&&!flyers.length&&i===0;
  ctx.save();ctx.translate(r.x+r.w/2,r.y+r.h/2);const sc=(hl?0.95:1)*pressScale(id);ctx.scale(sc,sc);ctx.drawImage(trayCanvas(i),-r.w/2,-r.h/2,r.w,r.h);ctx.restore();
  if(hint){const a=0.5+0.5*Math.sin(now*5);ctx.strokeStyle='rgba(255,230,120,'+a+')';ctx.lineWidth=5;rr(r.x-4,r.y-4,r.w+8,r.h+8,22);ctx.stroke();drawFinger(r.x+r.w*0.7,r.y+r.h*0.62);}}
function drawFinger(x,y){const b=Math.sin(now*5)*6;ctx.save();ctx.translate(x,y+b);ctx.fillStyle='#fff';ctx.strokeStyle='#5a2e14';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-6,-26);ctx.quadraticCurveTo(-6,-34,0,-34);ctx.quadraticCurveTo(6,-34,6,-26);ctx.lineTo(6,-6);ctx.lineTo(18,-4);ctx.quadraticCurveTo(24,-2,22,8);ctx.lineTo(18,22);ctx.lineTo(-10,22);ctx.lineTo(-18,4);ctx.quadraticCurveTo(-20,-4,-12,-4);ctx.lineTo(-6,2);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
function drawTool(t){const isBin=t.id==='bin',n=isBin?slots.filter(s=>s&&(s.burnt||doneness(s)==='burnt')).length:needCount(t.id),hot=n>0&&state==='play',hl=press&&(press.h.k==='tool'||press.h.k==='bin')&&press.h.id===t.id;
  const binHot=isBin&&drag&&drag.kind==='slot';
  ctx.save();ctx.translate(t.x+t.w/2,t.y+t.h/2);const sc=(hl?0.94:1)*pressScale(t.id);ctx.scale(sc,sc);ctx.translate(-t.w/2,-t.h/2);
  if(hot&&!isBin){ctx.save();ctx.shadowColor=STEP_COL[t.id]==='#ffffff'?'#bfe6ff':STEP_COL[t.id];ctx.shadowBlur=14+6*Math.sin(now*6);rr(0,0,t.w,t.h,18);ctx.fillStyle='#fff3c4';ctx.fill();ctx.restore();}
  rr(0,0,t.w,t.h,18);const g=ctx.createLinearGradient(0,0,0,t.h);if(isBin){g.addColorStop(0,'#6a7a8a');g.addColorStop(1,'#46525e');}else{g.addColorStop(0,hot?'#fff6d8':'#f6e2cc');g.addColorStop(1,hot?'#ffd98a':'#d8b896');}ctx.fillStyle=g;ctx.fill();
  ctx.lineWidth=hot||binHot?4:3;ctx.strokeStyle=isBin?(hot||binHot?'#ff7a5a':'#2e3842'):hot?'#ff9a1a':'#a87a50';ctx.stroke();ctx.fillStyle='rgba(255,255,255,.35)';rr(10,5,t.w-20,4,2);ctx.fill();
  const port=L.port,icx=port?t.w/2:54,icy=port?50:t.h/2,lx=port?t.w/2:138,ly=port?t.h-30:t.h/2-(isBin?0:8);
  ctx.save();ctx.translate(icx,icy);const ib=hot?1+0.06*Math.sin(now*8):1;ctx.scale(ib*1.2,ib*1.2);if(t.id==='salt')iconSalt(1);else if(t.id==='chili')iconChili(1);else if(t.id==='flip')iconFlip(1,'#e07a00');else iconBin(1);ctx.restore();
  const lab=isBin?'垃圾桶':STEP_NAME[t.id];text(lab,lx,ly,port?22:24,isBin?'#fff':'#6a3418','900');
  if(!port){text(isBin?(n?'扔掉 '+n+' 串糊的':'拖串进来扔'):(n?n+' 串等着':'全部一起'),lx,t.h/2+18,14,isBin?'#e0e8f0':'#9a6a40','800');}
  if(n>0&&state==='play'){const bx=t.w-14,by=14;ctx.fillStyle=isBin?'#ff5a4a':'#e8452c';ell(bx,by,14,14);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.stroke();text(String(n),bx,by+1,16,'#fff','900');}
  if(FINE){const k=t.id==='salt'?'Q':t.id==='flip'?'W':t.id==='chili'?'E':'X';rr(6,t.h-28,22,22,6);ctx.fillStyle='rgba(60,30,10,.35)';ctx.fill();text(k,17,t.h-17,13,'#fff','900');}
  ctx.restore();}
// ---------- HUD ----------
let avatarCache=null,avatarKey='';
function avatarCanvas(r){const k=SAVE.outfit+'|'+SAVE.hat+'|'+SAVE.hair+'|'+r+'|'+cvs.width;if(avatarCache&&avatarKey===k)return avatarCache;avatarKey=k;
  const px=Math.ceil(r*2*(cvs.width/W)),c=document.createElement('canvas');c.width=c.height=px;const old=ctx;ctx=c.getContext('2d');const s=px/(r*2);
  ctx.setTransform(s,0,0,s,0,0);ctx.beginPath();ctx.arc(r,r,r,0,TAU);ctx.clip();const g=ctx.createLinearGradient(0,0,0,r*2);g.addColorStop(0,'#ffd9e6');g.addColorStop(1,'#ff9ab8');ctx.fillStyle=g;ctx.fillRect(0,0,r*2,r*2);
  const sc=r*2/118;try{drawQ7(r,r+152*sc,sc,null,true);}catch(e){}ctx=old;avatarCache=c;return c;}
function drawHUD(){const U=L.ui,h=L.hud.h;let g=ctx.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(30,12,30,.92)');g.addColorStop(1,'rgba(50,20,40,.85)');ctx.fillStyle=g;ctx.fillRect(0,0,W,h);ctx.fillStyle='#e8b64a';ctx.fillRect(0,h-3,W,3);
  const A=U.avatar;ctx.drawImage(avatarCanvas(A.r),A.x-A.r,A.y-A.r,A.r*2,A.r*2);ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ell(A.x,A.y,A.r,A.r);ctx.stroke();
  text('第'+SAVE.day+'天',U.day.x,U.day.y-(L.port?12:10),L.port?28:24,'#fff3c4','900','left');
  const goal=starGoals();for(let k=0;k<3;k++){const on=coins>=goal[k];star5(U.day.x+12+k*24,U.day.y+(L.port?18:15),9,on?'#ffd23f':'rgba(255,255,255,.22)');}
  const T=U.time,low=time<=10&&state==='play'&&!bossPending,bossT=bossRound||bossPending;rr(T.x,T.y,T.w,T.h,T.h/2);ctx.fillStyle=bossPending?'rgba(130,30,170,'+(0.8+0.2*Math.sin(now*8))+')':bossT?'rgba(110,30,150,.9)':low?'rgba(160,30,30,'+(0.75+0.2*Math.sin(now*8))+')':'rgba(0,0,0,.4)';ctx.fill();
  const tot=bossRound?BOSS_TIME:ROUND,f=clamp(time/tot,0,1);ctx.save();rr(T.x,T.y,T.w,T.h,T.h/2);ctx.clip();ctx.fillStyle=bossT?'rgba(200,120,255,.35)':'rgba(255,210,90,.22)';ctx.fillRect(T.x,T.y,T.w*f,T.h);ctx.restore();
  const sec=Math.ceil(time),ts=Math.floor(sec/60)+':'+String(sec%60).padStart(2,'0');ctx.save();ctx.translate(T.x+26,T.y+T.h/2);ctx.strokeStyle='#fff3c4';ctx.lineWidth=3;ell(0,0,10,10);ctx.stroke();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-6);ctx.moveTo(0,0);ctx.lineTo(5,2);ctx.stroke();ctx.restore();
  text((bossRound?'BOSS ':bossPending?'大人物 ':'')+ts,T.x+T.w/2+12,T.y+T.h/2+1,L.port?26:26,low?'#fff':'#fff3c4','900');
  const C=U.coin;rr(C.x,C.y,C.w,C.h,C.h/2);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fill();ctx.strokeStyle='rgba(255,210,63,.5)';ctx.lineWidth=2;ctx.stroke();
  const pop=1+0.25*coinPop;coinIcon(L.coinPos.x,L.coinPos.y,(L.port?17:15)*pop,coinPop*6);ctx.save();ctx.translate(C.x+C.w/2+14,C.y+C.h/2+1);ctx.scale(pop,pop);text('¥'+shownCoins,0,0,L.port?28:26,'#ffe066','900');ctx.restore();
  hudBtn(U.mute,()=>{ctx.fillStyle='#fff3c4';ctx.beginPath();ctx.moveTo(-14,-6);ctx.lineTo(-6,-6);ctx.lineTo(4,-15);ctx.lineTo(4,15);ctx.lineTo(-6,6);ctx.lineTo(-14,6);ctx.closePath();ctx.fill();
    ctx.strokeStyle=SAVE.muted?'#ff7a6a':'#fff3c4';ctx.lineWidth=3;ctx.lineCap='round';if(SAVE.muted){ctx.beginPath();ctx.moveTo(9,-7);ctx.lineTo(19,7);ctx.moveTo(19,-7);ctx.lineTo(9,7);ctx.stroke();}else{ctx.beginPath();ctx.arc(6,0,8,-0.8,0.8);ctx.stroke();ctx.beginPath();ctx.arc(6,0,14,-0.8,0.8);ctx.stroke();}});
  hudBtn(U.pause,()=>{ctx.fillStyle='#fff3c4';rr(-10,-12,7,24,2);ctx.fill();rr(3,-12,7,24,2);ctx.fill();});}
function hudBtn(r,icon){const hl=press&&press.h.k===(r===L.ui.mute?'mute':'pause');ctx.save();ctx.translate(r.x+r.w/2,r.y+r.h/2);if(hl)ctx.scale(0.92,0.92);rr(-r.w/2,-r.h/2,r.w,r.h,14);ctx.fillStyle='rgba(255,255,255,.12)';ctx.fill();ctx.strokeStyle='rgba(255,230,180,.35)';ctx.lineWidth=2;ctx.stroke();ctx.scale(L.port?1.15:1,L.port?1.15:1);icon();ctx.restore();}
// ---------- 粒子 / 飞行物 / 特效 ----------
const SMOKE_C={};function smokeCol(hex){if(SMOKE_C[hex])return SMOKE_C[hex];const n=parseInt(hex.slice(1),16);return SMOKE_C[hex]='rgba('+(n>>16&255)+','+(n>>8&255)+','+(n&255)+',.55)';}
function drawParticles(){for(const p of particles){const k=clamp(p.life/p.max,0,1);
    if(p.type==='smoke'){const a=Math.min(1,(1-k)*6)*k;glow(p.x,p.y,p.r*2.4,smokeCol(p.col),a*0.9);continue;}
    if(p.type==='ember'){ctx.globalCompositeOperation='lighter';glow(p.x,p.y,p.r*5,'rgba(255,150,60,.8)',k);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=k;ctx.fillStyle=p.col;ell(p.x,p.y,p.r,p.r);ctx.fill();continue;}
    ctx.globalAlpha=clamp(k*1.3,0,1);ctx.fillStyle=p.col;
    if(p.type==='coin'){ctx.globalAlpha=1;coinIcon(p.x,p.y,p.r,p.life*14);}
    else if(p.type==='spark'||p.type==='swirl'){const r=p.r*(0.6+0.6*k);sparkle4(p.x,p.y,r*1.8,p.col);}
    else{ell(p.x,p.y,p.r,p.r);ctx.fill();}}
  ctx.globalAlpha=1;}
function drawFlyer(f){const p=flyPos(f),T=TYPES[f.s.type],sc=(L.port?0.95:0.85)*(f.kind==='trash'?1-0.5*p.k:1-0.25*p.k);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(-0.5+p.k*f.spin*(f.kind==='trash'?1:0.25));
  drawChunks(f.s.type,0,-60,120,foodCol(f.s),sc,f.s,{flipped:f.s.flipped,marks:0.8,burnt:f.kind==='trash'&&doneness(f.s)==='burnt'});ctx.restore();}
function drawCoinFlys(){for(const c of coinFlys){if(c.t<0)continue;let x=c.x,y=c.y;if(c.t>=0.18){const k=clamp((c.t-0.18)/(c.dur-0.18),0,1),e=k*k;x=lerp(c.sx,L.coinPos.x,e);y=lerp(c.sy,L.coinPos.y,e)-Math.sin(Math.PI*k)*60;}
  coinIcon(x,y,11,c.t*16);}}
function drawDrag(){if(!drag)return;let s,col;if(drag.kind==='tray'){col=TYPES[drag.type].raw;s=null;}else{s=slots[drag.i];if(!s){return;}col=foodCol(s);}
  const h=hit(drag);let r=null,ok=false;
  if(drag.kind==='tray'){if(h.k==='slot'&&!slots[h.i]){r=slotRect(h.i);ok=true;}else if(inR(drag,L.grill)){r=L.grill;ok=freeSlot()>=0;}}
  else{if(h.k==='cust'){r=spotRect(h.i);const c=spots[h.i];ok=sellable(s)&&custWants(c,s.type);}else if(h.k==='bin'){r=L.tools.find(t=>t.id==='bin');ok=true;}else if(h.k==='slot'&&!slots[h.i]){r=slotRect(h.i);ok=true;}}
  if(r){ctx.save();ctx.strokeStyle=ok?'#ffe066':'#ff6a5a';ctx.lineWidth=5;ctx.setLineDash([14,10]);ctx.lineDashOffset=-now*40;rr(r.x+3,r.y+3,r.w-6,r.h-6,18);ctx.stroke();ctx.restore();}
  ctx.save();ctx.translate(drag.x,drag.y);ctx.rotate(-0.35+Math.sin(now*8)*0.04);ctx.shadowColor='rgba(0,0,0,.4)';ctx.shadowBlur=16;ctx.shadowOffsetY=10;
  drawChunks(drag.kind==='tray'?drag.type:s.type,0,-80,160,col,L.port?1.05:0.95,s,s?{flipped:s.flipped,marks:clamp(s.t/stagesOf(s.type).p0,0,1)*0.8,burnt:doneness(s)==='burnt'}:{});ctx.restore();}
function drawFloats(){for(const f of floats){const k=f.t/f.dur;ctx.save();ctx.globalAlpha=k>0.7?1-(k-0.7)/0.3:1;const sc=k<0.15?lerp(0.5,1.15,k/0.15):k<0.25?lerp(1.15,1,(k-0.15)/0.1):1;ctx.translate(f.x,f.y-easeOutCubic(k)*56);ctx.scale(sc,sc);text(f.text,0,0,f.size,f.color,'900',null,6);ctx.restore();}}
function fxUpdate(r){fx.flash=Math.max(0,fx.flash-r*1.5);if(fx.ring>0){fx.ring+=r*1.2;if(fx.ring>1)fx.ring=0;}fx.slow=Math.max(0,fx.slow-r);if(fx.warnT!=null)fx.warnT+=r;fx.trauma=Math.max(0,fx.trauma-r*1.4);ultT=Math.max(0,ultT-r);
  for(const k in pressT){pressT[k]=Math.max(0,pressT[k]-r*5);}
  if(fx.callout){fx.callout.t+=r;if(fx.callout.t>fx.callout.dur)fx.callout=null;}
  if(fx.banner){fx.banner.t+=r;if(fx.banner.t>fx.banner.dur)fx.banner=null;}
  if(fx.sweep){const s=fx.sweep;s.t+=r;const G=L.grill,x=G.x+G.w*clamp(s.t/s.dur,0,1);
    for(let k=0;k<6;k++)particles.push({x:x+rand(-34,34),y:G.y+rand(8,50),vx:rand(-40,40),vy:rand(80,230),life:rand(.5,.9),max:.9,r:rand(1.8,3.4),col:k%3?s.col:'#ffe680',type:'dot',g:520});if(s.t>s.dur)fx.sweep=null;}}
function drawCallout(){const c=fx.callout;if(!c)return;const k=c.t/c.dur,a=k>0.8?1-(k-0.8)/0.2:1,big=c.kind==='B';
  const pop=c.t<0.16?lerp(0.3,1.18,c.t/0.16):c.t<0.28?lerp(1.18,1,(c.t-0.16)/0.12):1+0.02*Math.sin(c.t*12);
  const fs=big?(L.port?46:36):(L.port?34:28),h=fs+(L.port?22:16),y=L.port?L.grill.y-40:L.counterY-30;ctx.save();ctx.globalAlpha=a;ctx.translate(L.port?W/2:(L.grill.x+L.grill.w/2),y);ctx.scale(pop,pop);ctx.font='900 '+fs+'px '+FONT;const tw=ctx.measureText(c.text).width+(big?90:64);
  if(big){ctx.save();ctx.rotate(now*1.5);ctx.fillStyle='rgba(255,220,90,.28)';for(let r=0;r<12;r++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(tw*0.75,-22);ctx.lineTo(tw*0.75,22);ctx.fill();}ctx.restore();}
  const g=ctx.createLinearGradient(-tw/2,0,tw/2,0);if(big){g.addColorStop(0,'#a8001c');g.addColorStop(0.5,'#ff3b2a');g.addColorStop(1,'#a8001c');}else if(c.kind==='C'){g.addColorStop(0,'#ff6a9a');g.addColorStop(1,'#ffb34a');}else if(c.st==='chili'){g.addColorStop(0,'#ff5a3a');g.addColorStop(1,'#ff9f1c');}else{g.addColorStop(0,'#5aa0ff');g.addColorStop(1,'#9ad8ff');}
  rr(-tw/2,-h/2,tw,h,h/2);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=big?5:4;ctx.strokeStyle=big?'#ffe066':'#fff';ctx.stroke();
  for(const d of[-1,1])sparkle4(d*(tw/2-h*0.42),0,h*0.2*(1+0.3*Math.sin(now*14+d)),big?'#ffe066':'#fff7b0');
  text(c.text,0,2,fs,big?'#fff6c8':'#fff','900',null,big?7:6);ctx.restore();}
function drawBanner(){const b=fx.banner;if(!b)return;const k=b.t/b.dur,y=(L.hud.h+L.counterY)/2,a=k<0.1?k/0.1:k>0.82?1-(k-0.82)/0.18:1,slide=k<0.12?lerp(-W,0,easeOutCubic(k/0.12)):0;
  ctx.save();ctx.globalAlpha=a;ctx.translate(slide,y);const bh=L.port?120:100;ctx.fillStyle='rgba(30,0,20,.55)';ctx.fillRect(0,-bh/2-8,W,bh+16);
  const g=ctx.createLinearGradient(0,-bh/2,0,bh/2);g.addColorStop(0,'#ff3b2a');g.addColorStop(1,'#9a0f30');ctx.fillStyle=g;ctx.fillRect(0,-bh/2,W,bh);ctx.fillStyle='#ffd23f';ctx.fillRect(0,-bh/2,W,5);ctx.fillRect(0,bh/2-5,W,5);
  const sc=1+0.05*Math.sin(b.t*14);ctx.save();ctx.translate(W/2,-12);ctx.scale(sc,sc);text('BOSS来了！',0,0,L.port?58:50,'#fff3a0','900',null,8);ctx.restore();
  text('大胃王驾到 · 要 '+BOSS_NEED+' 串'+TYPES[bossType].name+' · 限时 '+BOSS_TIME+' 秒',W/2,bh/2-22,L.port?22:20,'#ffe9c8','900',null,4);ctx.restore();}
function drawFX(){if(fx.ring>0){const G=L.grill,cx=G.x+G.w/2,cy=G.y+G.h/2,R=20+fx.ring*Math.hypot(W,H)*0.8,a=1-fx.ring;ctx.save();ctx.globalAlpha=a;
    ctx.strokeStyle='rgba(255,190,60,.85)';ctx.lineWidth=36*(1-fx.ring)+6;ell(cx,cy,R,R);ctx.stroke();ctx.fillStyle='rgba(255,226,100,.9)';for(let k=0;k<24;k++){const an=k/24*TAU+now*2,fl=12+8*Math.sin(now*22+k);ell(cx+Math.cos(an)*R,cy+Math.sin(an)*R,fl*0.6,fl);ctx.fill();}ctx.restore();}
  if(fx.slow>0){const g=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.max(W,H)*0.75);g.addColorStop(0,'rgba(255,200,80,0)');g.addColorStop(1,'rgba(255,150,30,'+(0.45*Math.min(1,fx.slow*2))+')');ctx.fillStyle=g;ctx.fillRect(-50,-50,W+100,H+100);}
  if(fx.flash>0){ctx.fillStyle='rgba(255,250,220,'+(fx.flash*0.5)+')';ctx.fillRect(-50,-50,W+100,H+100);}}
function drawToast(){if(!toast||fx.callout||fx.banner)return;const k=toast.t/toast.dur,a=k<0.1?k/0.1:k>0.8?1-(k-0.8)/0.2:1,fs=L.port?24:21;ctx.save();ctx.globalAlpha=a;ctx.font='900 '+fs+'px '+FONT;
  const tw=Math.min(W-30,ctx.measureText(toast.text).width+44),ty=L.toastY+(toast.warn?Math.sin(toast.t*40)*(1-k)*3:0),tx=L.port?W/2:(L.grill.x+L.grill.w/2);
  ctx.translate(tx,ty);const sc=toast.t<0.12?easeOutBack(toast.t/0.12)*0.3+0.7:1;ctx.scale(sc,sc);rr(-tw/2,-22,tw,44,22);ctx.fillStyle=toast.warn?'rgba(150,45,25,.92)':'rgba(45,25,40,.88)';ctx.fill();ctx.strokeStyle='rgba(255,220,160,.5)';ctx.lineWidth=2;ctx.stroke();
  text(toast.text,0,1,fs,toast.color,'900');ctx.restore();}
function drawBossWarn(){if(!bossPending||state!=='play')return;const k=fx.warnT||0,sec=Math.max(0,Math.ceil(time)),pop=k<0.25?easeOutBack(k/0.25):1,y=L.hud.h+(L.port?44:38);
  ctx.save();ctx.translate(L.port?W/2:(L.spots[0].cx+L.spots[3].cx)/2,y);ctx.scale(pop,pop);const w=L.port?560:520,h=L.port?62:54;
  const g=ctx.createLinearGradient(-w/2,0,w/2,0);g.addColorStop(0,'rgba(90,10,120,.94)');g.addColorStop(0.5,'rgba(170,40,190,.96)');g.addColorStop(1,'rgba(90,10,120,.94)');
  rr(-w/2,-h/2,w,h,h/2);ctx.fillStyle=g;ctx.fill();ctx.lineWidth=4;ctx.strokeStyle='#ffd23f';ctx.stroke();
  for(const d of[-1,1])sparkle4(d*(w/2-26),0,10+3*Math.sin(now*10+d),'#ffe066');
  text('大人物要来啦！',-w*0.12,1,L.port?30:26,'#fff3a0','900',null,5,'#4a0a50');
  const bs=1+0.18*Math.max(0,1-((time%1)+1)%1*3);ctx.save();ctx.translate(w*0.3,0);ctx.scale(bs,bs);ell(0,0,h*0.42,h*0.42);ctx.fillStyle='#ffd23f';ctx.fill();text(String(sec),0,2,L.port?30:26,'#5a0a60','900');ctx.restore();
  ctx.restore();
  text('不来新客人了，快把手上的串卖完！',L.port?W/2:(L.spots[0].cx+L.spots[3].cx)/2,y+(L.port?48:42),L.port?20:17,'#ffe9c8','900',null,4,'#3a0a40');}
function noise1(t){return Math.sin(t)*0.6+Math.sin(t*2.3+1.7)*0.3+Math.sin(t*5.1+0.3)*0.1;}
// ---------- 主渲染 ----------
function render(){ctx=mainCtx;ensureCaches();const sx=cvs.width/W,sy=cvs.height/H,tr=fx.trauma*fx.trauma,mx=L.port?14:16,ox=tr*mx*noise1(now*31),oy=tr*mx*noise1(now*37+4),rot=tr*0.012*noise1(now*23+9);
  if(tr>0.0001){ctx.setTransform(1,0,0,1,0,0);ctx.fillStyle='#120a22';ctx.fillRect(0,0,cvs.width,cvs.height);}
  ctx.setTransform(sx,0,0,sy,0,0);ctx.translate(W/2+ox,H/2+oy);ctx.rotate(rot);ctx.translate(-W/2,-H/2);ctx.drawImage(bgCache,0,0,W,H);
  drawLiveBG();
  spots.forEach((c,i)=>{if(c)(c.isBoss?drawBossCustomer(c):drawCustomer(c,i));});
  const q=L.q7,showQ=state!=='title';if(!L.port&&showQ)drawQ7(q.x,q.base,q.s);drawCounter();if(L.port&&showQ)drawQ7(q.x,q.base,q.s);
  {const py=L.prepY-2,sy2=fgCache.height/H;ctx.drawImage(fgCache,0,Math.floor(py*sy2),fgCache.width,fgCache.height-Math.floor(py*sy2),0,Math.floor(py*sy2)/sy2,W,H-Math.floor(py*sy2)/sy2);}
  // 炭火呼吸光
  const B=grillBed();ctx.save();rr(B.x,B.y,B.w,B.h,12);ctx.clip();ctx.globalCompositeOperation='lighter';const nG=6;for(let k=0;k<nG;k++){const x=B.x+B.w*(k+0.5)/nG,fl=0.55+0.25*Math.sin(now*2.3+k*1.9)+0.1*Math.sin(now*7.1+k);glow(x,B.y+B.h*0.82,B.w/nG*0.95,'rgba(255,110,30,.55)',fl);}
  if(fx.sweep){const s=fx.sweep,x=L.grill.x+L.grill.w*clamp(s.t/s.dur,0,1);glow(x,B.y+B.h/2,160,s.col==='#ffffff'?'rgba(255,255,255,.5)':'rgba(255,80,50,.5)',1);}
  ctx.globalCompositeOperation='source-over';ctx.restore();
  for(let i=0;i<3;i++)drawTray(i);L.tools.forEach(drawTool);
  for(let i=0;i<MAX_SLOTS;i++){const s=slots[i];if(s)drawSkewer(s,i);else if(state==='play'){const S=L.slots[i];text('空位',S.cx,L.grill.y+L.grill.h*0.5,16,'rgba(255,255,255,.2)','800');}}
  drawParticles();for(const f of flyers)drawFlyer(f);drawCoinFlys();drawDrag();
  if(showQ)drawQ7Say(q.sayX,q.sayY,q.sayW);drawFloats();drawFX();drawBossWarn();drawCallout();drawBanner();drawToast();
  ctx.setTransform(sx,0,0,sy,0,0);drawHUD();}
