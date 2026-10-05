"use strict";
// ================= 老板娘 77：状态、动作、绘制 =================
// 坐标系：原点 = 腰部（柜台高度），向上为负。头部中心约 (0,-150)，头顶约 -214。
const Q={act:'idle',actT:0,actDur:0,say:'',sayT:0,sayDur:0,blink:2.5,t:0,idleEv:6,item:null,look:0,lookT:0,lookTo:0,emote:null,emoteT:0};
const Q_HAPPY=['来咯～','趁热吃噻！','巴适得板！','安逸惨咯～','慢慢吃哈～','下回再来耍嘛！','要得要得～','香得很哦！','吃好喝好哈～','安逸噻！下回再来嘛～','要得，慢走哈！'];
const Q_IDLE=['摆哈龙门阵嘛～','今天好热闹哦！','火候刚刚好～','么儿些，来吃串串！','大哥大姐来尝一下嘛～','香得遭不住咯～','噢哟，火好旺哦！','来嘛来嘛，巴适得很！','吃了还想吃哦～','莫客气，随便耍！','哦哟，香惨咯！'];
function q7Act(a,dur,item){Q.act=a;Q.actT=0;Q.actDur=dur||0.6;Q.item=item||null;}
function q7Say(t,dur){Q.say=t;Q.sayT=dur||1.8;Q.sayDur=Q.sayT;}
function q7Emote(e,dur){Q.emote=e;Q.emoteT=dur||1.2;}
function q7Update(dt){Q.t+=dt;Q.blink-=dt;if(Q.blink<-0.14)Q.blink=rand(2.2,4.8);
  if(Q.act!=='idle'){Q.actT+=dt;if(Q.actT>=Q.actDur){Q.act='idle';Q.actT=0;}}
  Q.sayT=Math.max(0,Q.sayT-dt);Q.emoteT=Math.max(0,Q.emoteT-dt);Q.idleEv-=dt;
  Q.lookT-=dt;if(Q.lookT<=0){Q.lookT=rand(1.5,4);Q.lookTo=Math.random()<0.5?0:rand(-1,1);}
  Q.look+=(Q.lookTo-Q.look)*Math.min(1,dt*6);
  if(Q.idleEv<=0&&Q.act==='idle'){Q.idleEv=rand(6,10);q7Act(Math.random()<0.5?'wipe':'hum',1.4);}}
function q7Pose(still){const t=still?0:Q.t,a=still?'idle':Q.act,k=Q.actDur?Q.actT/Q.actDur:0,env=Math.sin(Math.PI*clamp(k,0,1));
  // 默认：右手扇火，左手拿夹子
  const P={sway:Math.sin(t*1.7)*0.03,bob:Math.sin(t*2.6)*1.4,tilt:Math.sin(t*0.9)*0.03,breath:Math.sin(t*2.6),
    rU:0.55,rF:-0.9+Math.sin(t*9)*0.25,fan:Math.sin(t*9)*0.45,rItem:'fan',
    lU:-0.35,lF:0.55,lItem:'tongs',tongAng:0,face:'smile',eyes:'open',sweat:false,look:still?0:Q.look};
  if(still){P.rF=-0.9;P.fan=0;}
  if(a==='salt'||a==='chili'){P.rU=lerp(0.55,2.2,env);P.rF=lerp(-0.9,0.4,env)+Math.sin(t*38)*0.18*env;P.rItem=a;P.fan=0;P.face='open';P.look=0.6;}
  else if(a==='flip'){P.lU=lerp(-0.35,-1.6,env);P.lF=lerp(0.55,-0.6,env);P.tongAng=env*1.4;P.face='cat';P.look=-0.4;}
  else if(a==='happy'){const e2=Math.min(1,env*1.8);P.rU=lerp(0.55,2.05,e2);P.rF=lerp(-0.9,0.95,e2)+Math.sin(t*14)*0.18*e2;P.lU=lerp(-0.35,-0.75,e2);P.lF=lerp(0.55,0.9,e2);P.face='laugh';P.eyes='happy';P.fan=Math.sin(t*14)*0.3;P.bob+=-Math.abs(Math.sin(t*12))*5*env;P.tilt+=0.06*env;}
  else if(a==='wave'){const e2=Math.min(1,env*2);P.rU=lerp(0.55,2.6,e2);P.rF=lerp(-0.9,0.5,e2)+Math.sin(t*12)*0.35*e2;P.rItem=e2>0.4?null:'fan';P.face='laugh';P.eyes=e2>0.3?'wink':'open';P.tilt+=0.08*e2;}
  else if(a==='worry'){P.rU=lerp(0.55,2.75,env);P.rF=lerp(-0.9,1.9,env);P.lU=lerp(-0.35,-2.75,env);P.lF=lerp(0.55,-1.9,env);P.face='worry';P.eyes='worry';P.sweat=true;P.rItem=env>0.5?null:'fan';P.lItem=env>0.5?null:'tongs';P.sway=Math.sin(t*20)*0.03*env;}
  else if(a==='shock'){P.face='o';P.eyes='surprise';P.sweat=true;P.bob-=4*env;P.tilt-=0.05*env;}
  else if(a==='bigSprinkle'){const e2=Math.min(1,env*2.2),sh=Math.sin(t*40)*0.28*e2;P.rU=lerp(0.55,2.5,e2);P.rF=lerp(-0.9,0.25,e2)+sh;P.rItem=Q.item||'salt';P.lU=lerp(-0.35,-2.5,e2);P.lF=lerp(0.55,-0.25,e2)-sh;P.lItem=Q.item||'salt';P.fan=0;P.face='laugh';P.eyes='happy';P.bob+=-Math.abs(Math.sin(t*10))*6*e2;P.sway=Math.sin(t*12)*0.05*e2;}
  else if(a==='ult'){const k1=clamp(k/0.2,0,1),e2=k<0.85?k1*k1*(3-2*k1):1-(k-0.85)/0.15;P.rU=lerp(0.55,2.95,e2);P.rF=lerp(-0.9,0.05,e2);P.fan=Math.sin(t*16)*0.4*e2;P.lU=lerp(-0.35,-0.95,e2);P.lF=lerp(0.55,2.3,e2);P.lItem=e2>0.5?null:'tongs';P.face='laugh';P.eyes=e2>0.3?'wink':'open';P.sway=-0.07*e2;P.pop=1+0.08*e2+0.03*Math.sin(t*10)*e2;P.bob+=-8*e2;P.aura=e2;}
  else if(a==='wipe'){P.lU=lerp(-0.35,-2.6,env);P.lF=lerp(0.55,-2.1,env);P.lItem=env>0.5?null:'tongs';P.eyes=env>0.4?'happy':'open';P.face='phew';P.sweat=env>0.3;}
  else if(a==='hum'){P.eyes='happy';P.face='cat';P.tilt+=Math.sin(t*5)*0.07*env;P.sway+=Math.sin(t*5)*0.03*env;P.note=env;}
  else if(a==='twirl'){const e2=Math.min(1,env*1.6);P.eyes='star';P.face='laugh';P.pop=1+0.06*e2;P.tilt+=0.1*Math.sin(t*8)*e2;P.rU=lerp(0.55,2.3,e2);P.rF=lerp(-0.9,0.7,e2);P.rItem=null;P.lU=lerp(-0.35,-2.3,e2);P.lF=lerp(0.55,-0.7,e2);P.lItem=null;P.bob-=Math.abs(Math.sin(t*9))*6*e2;}
  return P;}
const SKIN0='#ffebe2',SKIN_SH='#f6cbbb',SKIN_LINE='#e2a594';
const HAIR={d:'#2a1726',m:'#4b2840',l:'#7c4868',s:'rgba(255,205,232,.34)'};
function limb(x,y,u,f,l1,l2,w,sleeve,sl,sx,cuff){// 角度：0=向下，正=向画面右
  const ex=x+Math.sin(u)*l1,ey=y+Math.cos(u)*l1,a2=u+f,hx=ex+Math.sin(a2)*l2,hy=ey+Math.cos(a2)*l2;
  ctx.lineCap='round';ctx.lineJoin='round';ctx.strokeStyle=SKIN_SH;ctx.lineWidth=w+1.6;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(ex,ey);ctx.lineTo(hx,hy);ctx.stroke();
  ctx.strokeStyle=SKIN0;ctx.lineWidth=w;ctx.stroke();
  sl=sl||0.45;sx=sx||0;let px,py;if(sl<=1){px=x+Math.sin(u)*l1*sl;py=y+Math.cos(u)*l1*sl;}else{px=ex+Math.sin(a2)*l2*(sl-1);py=ey+Math.cos(a2)*l2*(sl-1);}
  ctx.strokeStyle='rgba(60,20,40,.18)';ctx.lineWidth=w+7+sx;ctx.beginPath();ctx.moveTo(x,y);if(sl>1)ctx.lineTo(ex,ey);ctx.lineTo(px,py);ctx.stroke();
  ctx.strokeStyle=sleeve;ctx.lineWidth=w+5+sx;ctx.beginPath();ctx.moveTo(x,y);if(sl>1)ctx.lineTo(ex,ey);ctx.lineTo(px,py);ctx.stroke();
  if(cuff){const ax=sl>1?Math.sin(a2):Math.sin(u),ay=sl>1?Math.cos(a2):Math.cos(u);ctx.strokeStyle=cuff;ctx.lineWidth=w+6+sx;ctx.lineCap='butt';ctx.beginPath();ctx.moveTo(px-ax*3,py-ay*3);ctx.lineTo(px+ax*1.5,py+ay*1.5);ctx.stroke();ctx.lineCap='round';}
  // 小手
  ctx.fillStyle=SKIN0;ell(hx,hy,w*0.66,w*0.62);ctx.fill();ctx.strokeStyle=SKIN_LINE;ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(255,150,160,.35)';ell(hx+Math.sin(a2)*2,hy+Math.cos(a2)*2,w*0.3,w*0.22);ctx.fill();
  return {hx,hy,ang:a2};}
function drawQ7Item(item,h,P){if(!item)return;ctx.save();ctx.translate(h.hx,h.hy);
  if(item==='fan'){ctx.rotate(-h.ang+Math.PI+P.fan);ctx.strokeStyle='#8a5a2a';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-22);ctx.stroke();
    const g=ctx.createRadialGradient(0,-44,4,0,-44,24);g.addColorStop(0,'#fff6f0');g.addColorStop(1,'#ffc2cf');ctx.fillStyle=g;ell(0,-44,23,23);ctx.fill();ctx.strokeStyle='#e8452c';ctx.lineWidth=2.5;ctx.stroke();
    ctx.fillStyle='#ff6f91';for(let i=0;i<5;i++){const a=i*1.2566;ell(Math.cos(a)*7,-44+Math.sin(a)*7,4.5,4.5);ctx.fill();}ctx.fillStyle='#ffd23f';ell(0,-44,3.5,3.5);ctx.fill();}
  else if(item==='tongs'){ctx.rotate(-h.ang-P.tongAng);ctx.strokeStyle='#b8c2cc';ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-2,0);ctx.lineTo(-5,34);ctx.moveTo(2,0);ctx.lineTo(6,34);ctx.stroke();
    ctx.strokeStyle='#e8452c';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(0,-4);ctx.lineTo(0,6);ctx.stroke();}
  else{ctx.rotate(Math.sin(Q.t*38)*0.3);// 调料瓶
    if(item==='salt'){ctx.fillStyle='#fff';rr(-9,-26,18,24,5);ctx.fill();ctx.strokeStyle='#9aa';ctx.lineWidth=1.5;ctx.stroke();ctx.fillStyle='#b8c2cc';rr(-9,-32,18,8,3);ctx.fill();}
    else{ctx.fillStyle='#e8261a';rr(-9,-26,18,24,5);ctx.fill();ctx.fillStyle='#ffb300';rr(-9,-32,18,8,3);ctx.fill();ctx.fillStyle='#fff';ell(0,-14,4,4);ctx.fill();}
    const col=item==='salt'?'#ffffff':'#ff3b2a';ctx.fillStyle=col;for(let i=0;i<6;i++){const yy=-36-((Q.t*160+i*13)%40);ell(Math.sin(i*2.3+Q.t*9)*7,yy,1.8,1.8);ctx.fill();}}
  ctx.restore();}

function torsoPath(fl){fl=fl||0;ctx.beginPath();ctx.moveTo(-36,-96);ctx.quadraticCurveTo(-48,-90,-48,-70);ctx.lineTo(-40-fl,0);ctx.lineTo(40+fl,0);ctx.lineTo(48,-70);ctx.quadraticCurveTo(48,-90,36,-96);ctx.closePath();}
function neck0(){ctx.fillStyle=SKIN0;rr(-9,-108,18,16,6);ctx.fill();ctx.fillStyle='#f3cdb8';ell(0,-95,10,4);ctx.fill();}
const OUTFITS={
 apron:{name:'红色小围裙',price:0,sleeve:'#fff4ea',body(t){
  ctx.fillStyle='#fff4ea';ctx.beginPath();ctx.moveTo(-36,-96);ctx.quadraticCurveTo(-48,-90,-48,-70);ctx.lineTo(-40,0);ctx.lineTo(40,0);ctx.lineTo(48,-70);ctx.quadraticCurveTo(48,-90,36,-96);ctx.closePath();ctx.fill();
  ctx.fillStyle=SKIN0;rr(-9,-108,18,16,6);ctx.fill();ctx.fillStyle='#f3cdb8';ell(0,-95,10,4);ctx.fill();
  const ag=ctx.createLinearGradient(0,-90,0,0);ag.addColorStop(0,'#ff6a4a');ag.addColorStop(1,'#e23a24');ctx.fillStyle=ag;
  ctx.beginPath();ctx.moveTo(-24,-82);ctx.lineTo(24,-82);ctx.lineTo(28,-56);ctx.quadraticCurveTo(40,-50,42,0);ctx.lineTo(-42,0);ctx.quadraticCurveTo(-40,-50,-28,-56);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.setLineDash([4,4]);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#e23a24';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-22,-82);ctx.lineTo(-12,-100);ctx.moveTo(22,-82);ctx.lineTo(12,-100);ctx.stroke();
  ctx.fillStyle='#fff';ell(0,-46,15,15);ctx.fill();ctx.strokeStyle='#ffd23f';ctx.lineWidth=3;ctx.stroke();text('7',0,-45,20,'#e23a24','900');
  ctx.fillStyle='rgba(255,255,255,.85)';rr(-30,-20,24,14,4);ctx.fill();}},
 qipao:{name:'红色旗袍',price:200,sleeve:'#c8142e',cuff:'#ffd23f',body(t){
  torsoPath(-2);ctx.fillStyle=vgrad('#e2283e','#a50f26');ctx.fill();ctx.strokeStyle='#ffd23f';ctx.lineWidth=2.5;ctx.stroke();
  neck0();rr(-13,-106,26,12,6);ctx.fillStyle='#c8142e';ctx.fill();ctx.strokeStyle='#ffd23f';ctx.lineWidth=2.5;ctx.stroke();
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=3.5;ctx.beginPath();ctx.moveTo(-2,-95);ctx.quadraticCurveTo(22,-90,28,-72);ctx.lineTo(32,-56);ctx.stroke();
  ctx.fillStyle='#ffd23f';for(const [x,y] of [[12,-90],[26,-74],[30,-60]]){ell(x,y,3.5,2.5);ctx.fill();ctx.fillRect(x-7,y-1,14,2);}
  ctx.strokeStyle='rgba(255,215,90,.75)';ctx.lineWidth=1.6;for(const [x,y,r] of [[-20,-56,9],[10,-30,11],[-16,-16,7],[24,-12,6]]){for(let i=0;i<5;i++){const a=i*1.2566;ctx.beginPath();ctx.arc(x+Math.cos(a)*r*0.6,y+Math.sin(a)*r*0.6,r*0.45,0,6.283);ctx.stroke();}}
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-38,-30);ctx.quadraticCurveTo(-30,-20,-34,-8);ctx.stroke();}},
 hanfu:{name:'粉色汉服',price:220,sleeve:'#ffc2d6',sl:1.85,sx:12,cuff:'#fff4f8',body(t){
  torsoPath(8);ctx.fillStyle=vgrad('#ffd3e2','#ff9ec0');ctx.fill();
  neck0();ctx.fillStyle='#fffaf6';ctx.beginPath();ctx.moveTo(-16,-98);ctx.lineTo(0,-66);ctx.lineTo(16,-98);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#e8608c';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-22,-97);ctx.lineTo(16,-56);ctx.moveTo(22,-97);ctx.lineTo(4,-74);ctx.stroke();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-22,-92);ctx.lineTo(13,-53);ctx.stroke();
  ctx.fillStyle='#e8608c';rr(-46,-56,92,14,6);ctx.fill();ctx.fillStyle='#ffd23f';rr(-46,-50,92,3,1);ctx.fill();
  const sw=Math.sin(t*3)*3;ctx.fillStyle='#ff7aa5';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*4,-46);ctx.quadraticCurveTo(d*8+sw,-26,d*6+sw,-8);ctx.lineTo(d*12+sw,-10);ctx.quadraticCurveTo(d*12+sw,-28,d*10,-46);ctx.fill();}
  ell(0,-49,7,7);ctx.fill();ctx.strokeStyle='rgba(220,90,140,.35)';ctx.lineWidth=1.5;for(const x of[-30,-18,18,30]){ctx.beginPath();ctx.moveTo(x,-40);ctx.lineTo(x*1.15,0);ctx.stroke();}
  flower5(-26,-74,3.2,'#fff','#ff7aa5');flower5(30,-20,3,'#fff','#ff7aa5');}},
 floral:{name:'夏日碎花裙',price:180,sleeve:'#fffdf4',sl:0.55,sx:9,cuff:'#ffb3c6',body(t){
  torsoPath(12);ctx.fillStyle=vgrad('#fff3a8','#ffd86a');ctx.fill();
  neck0();ctx.fillStyle=SKIN0;rr(-17,-100,34,16,7);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,-84);ctx.lineTo(18,-84);ctx.stroke();
  ctx.fillStyle='#ff8fab';rr(-45,-60,90,6,3);ctx.fill();ctx.save();ctx.translate(22,-57);ctx.fillStyle='#ff6f91';ell(-7,0,7,5);ctx.fill();ell(7,0,7,5);ctx.fill();ell(0,0,3.5,3.5);ctx.fill();ctx.restore();
  const F=[[-30,-76,'#ff7aa5'],[30,-74,'#7ec8ff'],[-12,-44,'#ffffff'],[16,-36,'#ff7aa5'],[-34,-28,'#7ec8ff'],[34,-22,'#ffffff'],[-8,-14,'#ff7aa5'],[20,-8,'#7ec8ff'],[-26,-6,'#ffffff'],[4,-68,'#ffffff']];
  for(const [x,y,c] of F){flower5(x,y,2.6,c,'#ffb300');}
  ctx.fillStyle='#7ccf6a';for(const [x,y] of [[-25,-72],[35,-70],[-7,-40],[21,-32],[-29,-24]]){ell(x,y,2.5,1.4);ctx.fill();}}},
 chef:{name:'小厨师服',price:190,sleeve:'#fbfcfd',sl:1.8,cuff:'#dde4ea',body(t){
  torsoPath(0);ctx.fillStyle=vgrad('#ffffff','#e3e9ef');ctx.fill();ctx.strokeStyle='#c9d2da';ctx.lineWidth=2;ctx.stroke();
  neck0();rr(-14,-104,28,10,4);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#c9d2da';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#e8452c';ctx.beginPath();ctx.moveTo(-13,-96);ctx.lineTo(13,-96);ctx.lineTo(0,-80);ctx.closePath();ctx.fill();ell(0,-95,5,4);ctx.fill();
  ctx.strokeStyle='#c9d2da';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-4,-90);ctx.quadraticCurveTo(-26,-70,-24,0);ctx.stroke();
  ctx.fillStyle='#8a96a2';for(const y of[-70,-50,-30,-10]){ell(-14,y,3.6,3.6);ctx.fill();ell(16,y,3.6,3.6);ctx.fill();}
  ctx.strokeStyle='#c9d2da';rr(22,-80,16,12,3);ctx.stroke();text('7',30,-73,11,'#e8452c','900');}},
 sailor:{name:'水手服',price:200,sleeve:'#ffffff',sl:0.6,cuff:'#1f3a7a',body(t){
  torsoPath(2);ctx.fillStyle=vgrad('#ffffff','#eef2f8');ctx.fill();
  ctx.fillStyle='#1f3a7a';rr(-41,-16,82,16,2);ctx.fill();ctx.strokeStyle='rgba(255,255,255,.35)';ctx.lineWidth=1.5;for(let x=-32;x<=32;x+=10){ctx.beginPath();ctx.moveTo(x,-16);ctx.lineTo(x,0);ctx.stroke();}
  neck0();ctx.fillStyle='#1f3a7a';ctx.beginPath();ctx.moveTo(-38,-96);ctx.lineTo(-46,-72);ctx.lineTo(0,-50);ctx.lineTo(46,-72);ctx.lineTo(38,-96);ctx.lineTo(12,-99);ctx.lineTo(0,-70);ctx.lineTo(-12,-99);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-35,-92);ctx.lineTo(-41,-73);ctx.lineTo(0,-55);ctx.lineTo(41,-73);ctx.lineTo(35,-92);ctx.stroke();
  ctx.fillStyle='#e8263a';ctx.save();ctx.translate(0,-58);ell(-11,0,11,7);ctx.fill();ell(11,0,11,7);ctx.fill();ctx.beginPath();ctx.moveTo(-3,2);ctx.lineTo(-10,22);ctx.lineTo(-3,20);ctx.lineTo(0,4);ctx.lineTo(3,20);ctx.lineTo(10,22);ctx.lineTo(3,2);ctx.fill();ctx.fillStyle='#b8102a';ell(0,0,4.5,4.5);ctx.fill();ctx.restore();
  star5(30,-30,5,'#ffd23f');}},
 bear:{name:'小熊连体睡衣',price:210,sleeve:'#b9825a',sl:2,sx:3,cuff:'#f5dcbc',
  back(t){ctx.fillStyle='#a8714c';ell(0,-100,44,17);ctx.fill();for(const d of[-1,1]){ell(d*42,-108,12,12);ctx.fill();ctx.fillStyle='#f5c9a8';ell(d*42,-108,6,6);ctx.fill();ctx.fillStyle='#a8714c';}},
  body(t){torsoPath(5);ctx.fillStyle=vgrad('#c48d62','#a46e48');ctx.fill();
  neck0();ctx.fillStyle='#f5dcbc';ell(0,-40,27,33);ctx.fill();ctx.strokeStyle='#a8714c';ctx.lineWidth=2;ctx.setLineDash([3,3]);ell(0,-40,22,28);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#ff8fa3';ctx.beginPath();ctx.moveTo(0,-46);ctx.bezierCurveTo(-9,-56,-16,-44,0,-34);ctx.bezierCurveTo(16,-44,9,-56,0,-46);ctx.fill();
  ctx.fillStyle='#8a5a38';for(const y of[-88,-76]){ell(0,y,3,3);ctx.fill();}ctx.fillStyle='#d9a37a';ell(-28,-84,6,4);ctx.fill();ell(28,-84,6,4);ctx.fill();}},
 princess:{name:'公主裙',price:220,sleeve:'#f2c4ff',sl:0.55,sx:10,cuff:'#ffffff',body(t){
  torsoPath(16);ctx.fillStyle=vgrad('#f6d2ff','#c38cf0');ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.75)';for(let x=-50;x<=50;x+=11){ell(x,-2,7,6);ctx.fill();}ctx.fillStyle='#e4a8ff';for(let x=-46;x<=46;x+=11){ell(x,-22,6,5);ctx.fill();}
  ctx.fillStyle='#b072e8';ctx.beginPath();ctx.moveTo(-30,-64);ctx.lineTo(0,-46);ctx.lineTo(30,-64);ctx.lineTo(28,-70);ctx.lineTo(0,-54);ctx.lineTo(-28,-70);ctx.closePath();ctx.fill();
  neck0();ctx.fillStyle='#fff';for(let x=-20;x<=20;x+=6.6){ell(x,-95,4.2,4.2);ctx.fill();}
  ctx.fillStyle='#ffd23f';ell(0,-80,7,7);ctx.fill();ctx.fillStyle='#ff5fa2';ell(0,-80,4.5,4.5);ctx.fill();ctx.fillStyle='#fff';ell(-1.5,-81.5,1.4,1.4);ctx.fill();
  ctx.fillStyle='rgba(255,255,255,.8)';for(const [x,y] of [[-24,-36],[20,-30],[-6,-14],[32,-12]]){star5(x,y,2.6,'rgba(255,255,255,.85)');}}},
 idol:{name:'偶像演出服',price:210,sleeve:'#2ec9c0',sl:0.95,cuff:'#ffd23f',body(t){
  torsoPath(4);ctx.fillStyle='#ffffff';ctx.fill();
  ctx.fillStyle='#ff6fae';ctx.beginPath();ctx.moveTo(-44,-16);for(let k=0;k<=8;k++)ctx.lineTo(-44+k*11,k%2?0:-6);ctx.lineTo(44,-20);ctx.lineTo(-44,-20);ctx.closePath();ctx.fill();
  const jg=vgrad('#45e0d0','#1898b0');ctx.fillStyle=jg;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*36,-96);ctx.quadraticCurveTo(d*48,-90,d*48,-70);ctx.lineTo(d*42,-18);ctx.lineTo(d*16,-18);ctx.lineTo(d*12,-90);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#ffd23f';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(d*12,-90);ctx.lineTo(d*16,-18);ctx.stroke();}
  neck0();ctx.fillStyle='#ff5fa2';ctx.save();ctx.translate(0,-84);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(-15,-8);ctx.lineTo(-15,8);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(15,-8);ctx.lineTo(15,8);ctx.closePath();ctx.fill();ell(0,0,4,4);ctx.fill();ctx.restore();
  star5(-30,-60,6,'#ffd23f');star5(32,-44,5,'#ffd23f');star5(-26,-34,3.5,'#fff3a0');
  for(let i=0;i<5;i++){const a=0.5+0.5*Math.sin(t*6+i*1.7);ctx.globalAlpha=a;star5([-36,30,-20,36,6][i],[-80,-70,-50,-28,-64][i],2.4,'#ffffff');}ctx.globalAlpha=1;}},
 sweater:{name:'冬季毛衣',price:190,sleeve:'#2f8f4e',sl:2,sx:3,cuff:'#c62828',body(t){
  torsoPath(3);ctx.fillStyle=vgrad('#38a05a','#257a40');ctx.fill();
  ctx.fillStyle='#c62828';rr(-48,-76,96,6,2);ctx.fill();rr(-47,-58,94,6,2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-47,-66);for(let k=0;k<=12;k++)ctx.lineTo(-47+k*7.8,k%2?-70:-62);ctx.stroke();
  ctx.fillStyle='#1f6a36';ctx.beginPath();ctx.moveTo(0,-48);ctx.lineTo(-14,-22);ctx.lineTo(14,-22);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(0,-40);ctx.lineTo(-18,-10);ctx.lineTo(18,-10);ctx.closePath();ctx.fill();star5(0,-50,5,'#ffd23f');
  ctx.fillStyle='#ff5a4a';ell(-6,-28,2.2,2.2);ctx.fill();ell(7,-18,2.2,2.2);ctx.fill();ctx.fillStyle='#ffd23f';ell(5,-32,2,2);ctx.fill();
  ctx.strokeStyle='#fff';ctx.lineWidth=1.6;for(const [x,y] of [[-28,-30],[28,-30],[-30,-12],[30,-12]]){for(let k=0;k<3;k++){const a=k*Math.PI/3;ctx.beginPath();ctx.moveTo(x-Math.cos(a)*5,y-Math.sin(a)*5);ctx.lineTo(x+Math.cos(a)*5,y+Math.sin(a)*5);ctx.stroke();}}
  ctx.strokeStyle='rgba(0,0,0,.15)';ctx.lineWidth=1.5;for(let x=-38;x<=38;x+=5){ctx.beginPath();ctx.moveTo(x,-7);ctx.lineTo(x,0);ctx.stroke();}
  neck0();rr(-14,-108,28,16,7);ctx.fillStyle='#2f8f4e';ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=1.5;for(let x=-10;x<=10;x+=4){ctx.beginPath();ctx.moveTo(x,-106);ctx.lineTo(x,-94);ctx.stroke();}}}
,
};
const HATS={
 bandana:{name:'红头巾',price:0,draw(t){
  ctx.fillStyle='#e8452c';ctx.beginPath();ctx.moveTo(-46,-180);ctx.bezierCurveTo(-36,-212,36,-212,46,-180);ctx.quadraticCurveTo(0,-196,-46,-180);ctx.fill();
  ctx.fillStyle='#fff';for(const [px,py] of [[-28,-195],[-8,-201],[14,-200],[32,-192],[2,-190]]){ell(px,py,2.6,2.2);ctx.fill();}
  ctx.save();ctx.translate(44,-186);ctx.fillStyle='#e8452c';ell(0,0,7,6);ctx.fill();
  for(const k of[0,1]){ctx.save();ctx.rotate(0.5+k*0.7+Math.sin(t*5+k)*0.15);ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(14,-6,24,2);ctx.quadraticCurveTo(14,6,0,4);ctx.fill();ctx.restore();}ctx.restore();}},
 chefhat:{cover:1,name:'小厨师帽',price:190,draw(t){ctx.save();ctx.translate(0,9);ctx.rotate(0.06);
  ctx.fillStyle='#fff';ctx.strokeStyle='#cfd8e0';ctx.lineWidth=2;
  for(const [x,y,r] of [[-26,-224,17],[26,-224,17],[-12,-238,19],[12,-238,19],[0,-246,17]]){ell(x,y,r,r);ctx.fill();ctx.stroke();}
  ctx.fillRect(-34,-230,68,24);rr(-38,-210,76,22,8);ctx.fill();ctx.stroke();
  ctx.strokeStyle='#e3e9ef';ctx.lineWidth=2;for(const x of[-18,0,18]){ctx.beginPath();ctx.moveTo(x,-226);ctx.lineTo(x,-212);ctx.stroke();}text('7',0,-199,12,'#e8452c','900');ctx.restore();}},
 catears:{name:'猫耳发箍',price:180,draw(t){const tw=Math.sin(t*1.3)>0.92?0.18:0;
  for(const d of[-1,1]){ctx.save();ctx.translate(d*28,-196);ctx.rotate(d*(0.35+(d>0?tw:0)));ctx.fillStyle='#2e1f2f';ctx.beginPath();ctx.moveTo(-14,6);ctx.lineTo(0,-30);ctx.lineTo(14,6);ctx.closePath();ctx.fill();
    ctx.fillStyle='#ff9ec0';ctx.beginPath();ctx.moveTo(-7,2);ctx.lineTo(0,-19);ctx.lineTo(7,2);ctx.closePath();ctx.fill();ctx.restore();}
  ctx.strokeStyle='#ff6f91';ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-160,45,Math.PI*1.13,Math.PI*1.87);ctx.stroke();
  ctx.fillStyle='#ffd23f';ell(22,-196,4,4);ctx.fill();}},
 bunny:{name:'兔耳发箍',price:190,draw(t){
  for(const d of[-1,1]){ctx.save();ctx.translate(d*16,-198);ctx.rotate(d*0.22+Math.sin(t*2+d)*0.05);ctx.fillStyle='#fff';ctx.strokeStyle='#f0c9d6';ctx.lineWidth=2;
    if(d>0){ctx.beginPath();ctx.moveTo(-9,0);ctx.bezierCurveTo(-12,-30,-8,-44,2,-46);ctx.quadraticCurveTo(20,-50,22,-38);ctx.quadraticCurveTo(10,-36,9,-24);ctx.lineTo(9,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle='#ffc2d6';ctx.beginPath();ctx.moveTo(-4,-2);ctx.bezierCurveTo(-6,-26,-3,-38,2,-40);ctx.quadraticCurveTo(4,-30,4,-2);ctx.fill();}
    else{ell(0,-30,10,32);ctx.fill();ctx.stroke();ctx.fillStyle='#ffc2d6';ell(0,-28,5,23);ctx.fill();}ctx.restore();}
  ctx.strokeStyle='#fff';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.arc(0,-160,45,Math.PI*1.13,Math.PI*1.87);ctx.stroke();ctx.strokeStyle='#ffc2d6';ctx.lineWidth=2;ctx.stroke();}},
 straw:{cover:1,name:'草帽',price:200,draw(t){ctx.save();ctx.rotate(-0.06);
  ctx.fillStyle='#e8c070';ell(0,-194,70,15);ctx.fill();ctx.strokeStyle='#c9a050';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='rgba(160,120,50,.45)';ctx.lineWidth=1.2;for(let r=58;r>40;r-=7){ell(0,-194,r,r*0.21);ctx.stroke();}
  ctx.fillStyle='#f2cf80';ctx.beginPath();ctx.moveTo(-40,-196);ctx.bezierCurveTo(-42,-232,42,-232,40,-196);ctx.closePath();ctx.fill();ctx.strokeStyle='#c9a050';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#e8452c';ctx.beginPath();ctx.moveTo(-40,-198);ctx.quadraticCurveTo(0,-192,40,-198);ctx.lineTo(41,-207);ctx.quadraticCurveTo(0,-201,-41,-207);ctx.closePath();ctx.fill();
  flower5(30,-204,3.6,'#fff','#ffd23f');ctx.restore();}},
 crown:{name:'小皇冠',price:220,draw(t){ctx.save();ctx.translate(6,-204);ctx.rotate(0.12);
  const g=ctx.createLinearGradient(0,-28,0,6);g.addColorStop(0,'#fff3a0');g.addColorStop(1,'#e8a200');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-24,4);ctx.lineTo(-28,-20);ctx.lineTo(-14,-8);ctx.lineTo(0,-28);ctx.lineTo(14,-8);ctx.lineTo(28,-20);ctx.lineTo(24,4);ctx.closePath();ctx.fill();ctx.strokeStyle='#b07800';ctx.lineWidth=2;ctx.stroke();
  ctx.fillStyle='#ff5fa2';ell(0,-6,4.5,4.5);ctx.fill();ctx.fillStyle='#4fb3ff';ell(-14,-2,3,3);ctx.fill();ell(14,-2,3,3);ctx.fill();
  ctx.fillStyle='#fff';for(const [x,y] of [[-28,-20],[0,-28],[28,-20]]){ell(x,y,3,3);ctx.fill();}
  ctx.globalAlpha=0.5+0.5*Math.sin(t*5);star5(-6,-16,3,'#fff');ctx.globalAlpha=1;ctx.restore();}},
 bow:{name:'蝴蝶结',price:180,draw(t){ctx.save();ctx.translate(26,-198);ctx.rotate(0.35+Math.sin(t*2)*0.04);
  ctx.fillStyle='#ff6f91';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(d*16,-22,d*34,-14,d*30,2);ctx.bezierCurveTo(d*34,16,d*16,20,0,0);ctx.fill();}
  ctx.beginPath();ctx.moveTo(-3,2);ctx.lineTo(-12,26);ctx.lineTo(-4,23);ctx.lineTo(0,4);ctx.lineTo(4,23);ctx.lineTo(12,26);ctx.lineTo(3,2);ctx.fill();
  ctx.fillStyle='#fff';for(const [x,y] of [[-20,-6],[-14,6],[20,-6],[15,7],[-24,4],[25,3]]){ell(x,y,2.2,2.2);ctx.fill();}
  ctx.fillStyle='#e8456f';ell(0,0,6,6);ctx.fill();ctx.restore();}},
 beret:{cover:1,name:'贝雷帽',price:200,draw(t){ctx.save();ctx.translate(-4,-196);ctx.rotate(-0.16);
  const g=ctx.createRadialGradient(-10,-14,4,0,-8,56);g.addColorStop(0,'#d24a64');g.addColorStop(1,'#962a42');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-50,4);ctx.bezierCurveTo(-60,-22,-20,-30,6,-28);ctx.bezierCurveTo(44,-26,62,-12,48,4);ctx.quadraticCurveTo(0,12,-50,4);ctx.fill();
  ctx.fillStyle='#7a1e34';rr(-44,0,90,6,3);ctx.fill();ctx.strokeStyle='#7a1e34';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(4,-28);ctx.lineTo(6,-36);ctx.stroke();
  ctx.fillStyle='rgba(255,255,255,.18)';ell(-14,-16,18,6);ctx.fill();ctx.restore();}},
 santa:{cover:1,name:'圣诞帽',price:210,draw(t){const sw=Math.sin(t*2.2)*4;
  ctx.fillStyle='#d8263a';ctx.beginPath();ctx.moveTo(-44,-196);ctx.bezierCurveTo(-40,-236,10,-252,40+sw,-238);ctx.quadraticCurveTo(58+sw,-226,58+sw,-208);ctx.quadraticCurveTo(40,-226,30,-224);ctx.quadraticCurveTo(44,-206,44,-196);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(0,0,0,.12)';ctx.beginPath();ctx.moveTo(10,-240);ctx.quadraticCurveTo(30,-232,30,-224);ctx.quadraticCurveTo(14,-228,10,-240);ctx.fill();
  ctx.fillStyle='#fff';rr(-50,-206,100,18,9);ctx.fill();ell(58+sw,-206,9,9);ctx.fill();ctx.fillStyle='rgba(200,210,230,.6)';for(let x=-40;x<=40;x+=12){ell(x,-197,3,2);ctx.fill();}}},
 wreath:{name:'花环',price:200,draw(t){const cols=['#ff7aa5','#ffd23f','#ffffff','#b48cff','#ff9f5a'];
  ctx.strokeStyle='#5aa84a';ctx.lineWidth=4;ctx.beginPath();ctx.ellipse(0,-182,46,20,0,Math.PI*1.02,Math.PI*1.98);ctx.stroke();
  for(let i=0;i<9;i++){const a=Math.PI*(1.05+i*0.9/8),x=Math.cos(a)*46,y=-182+Math.sin(a)*20;ctx.fillStyle='#6cc25a';ell(x+5,y+3,5,2.5);ctx.fill();flower5(x,y,4.2+(i%2)*1.2,cols[i%5],i%5===1?'#ff7a3a':'#ffd23f');}}}
,
};
function bowAt(x,y,s,col,dark,tails){ctx.save();ctx.translate(x,y);ctx.scale(s,s);ctx.fillStyle=col;
  for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(d*8,-10,d*17,-9,d*16,0);ctx.bezierCurveTo(d*17,9,d*8,10,0,0);ctx.fill();}
  if(tails){ctx.beginPath();ctx.moveTo(-2,1);ctx.lineTo(-9,17);ctx.lineTo(-3,15);ctx.lineTo(0,3);ctx.lineTo(3,15);ctx.lineTo(9,17);ctx.lineTo(2,1);ctx.fill();}
  ctx.fillStyle=dark||'rgba(0,0,0,.25)';ell(0,0,3.6,3.6);ctx.fill();ctx.fillStyle='rgba(255,255,255,.35)';for(const d of[-1,1]){ell(d*9,-3,3,1.6);ctx.fill();}ctx.restore();}
function scallops(x0,x1,y,r,col){ctx.fillStyle=col;for(let x=x0;x<=x1+0.1;x+=r*1.6){ell(x,y,r,r*0.8);ctx.fill();}}
const NEW_OUTFITS={
 maid:{name:'甜心女仆装',price:240,sleeve:'#2e2a40',sl:0.55,sx:8,cuff:'#ffffff',body(t){
  torsoPath(9);ctx.fillStyle=vgrad('#3c3654','#211e2e');ctx.fill();
  neck0();
  ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-34,-52);ctx.lineTo(34,-52);ctx.lineTo(39,-2);ctx.lineTo(-39,-2);ctx.closePath();ctx.fill();scallops(-38,38,-1,4.5,'#fff');
  ctx.strokeStyle='#e6e4f2';ctx.lineWidth=1.4;for(const x of[-20,0,20]){ctx.beginPath();ctx.moveTo(x*0.9,-48);ctx.lineTo(x,-6);ctx.stroke();}
  rr(-19,-86,38,36,7);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#e6e4f2';ctx.stroke();scallops(-17,17,-86,3.2,'#fff');
  ctx.strokeStyle='#ffb6c8';ctx.lineWidth=1.4;ctx.setLineDash([2,2]);rr(-14,-82,28,28,5);ctx.stroke();ctx.setLineDash([]);
  ctx.fillStyle='#fff';rr(-46,-58,92,7,3);ctx.fill();
  for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,-97);ctx.quadraticCurveTo(d*22,-101,d*25,-87);ctx.quadraticCurveTo(d*12,-80,0,-90);ctx.closePath();ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#d8d6e8';ctx.lineWidth=1.3;ctx.stroke();}
  bowAt(0,-92,0.75,'#e8304a','#a01830',true);heart(0,-66,5.5,'#ff8fab');heart(22,-26,4.5,'#ffb6c8');}},
 yukata:{name:'樱花浴衣',price:240,sleeve:'#e8f1ff',sl:1.85,sx:12,cuff:'#c9daf6',body(t){
  torsoPath(7);ctx.fillStyle=vgrad('#f4f8ff','#d3e1fa');ctx.fill();
  ctx.save();torsoPath(7);ctx.clip();ctx.strokeStyle='rgba(120,150,210,.25)';ctx.lineWidth=1.2;for(let y=-90;y<0;y+=13){ctx.beginPath();ctx.moveTo(-50,y);ctx.quadraticCurveTo(-25,y-6,0,y);ctx.quadraticCurveTo(25,y+6,50,y);ctx.stroke();}
  for(const [x,y,r] of [[-30,-80,4],[26,-86,3.5],[-14,-30,4.2],[30,-24,3.6],[-36,-14,3.2],[8,-12,3],[36,-66,3]])flower5(x,y,r,'#ffb3c9','#ff6f91');ctx.restore();
  neck0();ctx.fillStyle=SKIN0;ctx.beginPath();ctx.moveTo(-14,-98);ctx.lineTo(0,-72);ctx.lineTo(14,-98);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#2c3f7a';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-21,-97);ctx.lineTo(15,-58);ctx.moveTo(21,-97);ctx.lineTo(3,-73);ctx.stroke();
  ctx.fillStyle='#e8507a';rr(-46,-60,92,19,4);ctx.fill();ctx.fillStyle='#ffd23f';rr(-46,-52,92,3,1);ctx.fill();
  ctx.fillStyle='#c83a62';ctx.save();ctx.translate(38,-52);for(const a of[-0.6,0.6]){ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(14,-8);ctx.lineTo(14,8);ctx.closePath();ctx.fill();ctx.restore();}ell(0,0,4,4);ctx.fill();ctx.restore();
  flower5(-28,-50,3.4,'#fff','#ff6f91');}},
 sporty:{name:'元气运动服',price:200,sleeve:'#ffffff',sl:2,sx:3,cuff:'#2fbf8f',body(t){
  torsoPath(2);ctx.fillStyle=vgrad('#ffffff','#e6edf2');ctx.fill();
  ctx.fillStyle='#36c99a';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*48,-72);ctx.lineTo(d*42,0);ctx.lineTo(d*30,0);ctx.lineTo(d*35,-74);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#ff6f91';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*35,-74);ctx.lineTo(d*30,0);ctx.lineTo(d*27,0);ctx.lineTo(d*32,-74);ctx.closePath();ctx.fill();}
  ctx.strokeStyle='#a8b2ba';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-96);ctx.lineTo(0,0);ctx.stroke();ctx.setLineDash([1.5,2]);ctx.lineWidth=3;ctx.stroke();ctx.setLineDash([]);
  neck0();rr(-17,-107,34,15,6);ctx.fillStyle='#36c99a';ctx.fill();ctx.fillStyle='#d8dde2';rr(-2.5,-90,5,10,2);ctx.fill();
  ctx.fillStyle='#36c99a';rr(-42,-9,84,9,3);ctx.fill();text('77',20,-68,15,'#ff5a7a','900');star5(-22,-70,5,'#ffd23f');}},
 coat:{name:'冬日呢子大衣',price:250,sleeve:'#c88b56',sl:2,sx:4,cuff:'#9a6232',body(t){
  torsoPath(7);ctx.fillStyle=vgrad('#d9a06a','#ad713e');ctx.fill();
  ctx.fillStyle='#b97a44';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*3,-92);ctx.lineTo(d*30,-95);ctx.lineTo(d*22,-64);ctx.lineTo(d*3,-50);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(80,40,10,.25)';ctx.lineWidth=1.4;ctx.stroke();}
  ctx.strokeStyle='rgba(80,40,10,.3)';ctx.beginPath();ctx.moveTo(0,-50);ctx.lineTo(0,0);ctx.stroke();
  ctx.fillStyle='#5a3418';for(const y of[-40,-24,-8])for(const d of[-1,1]){ell(d*11,y,3.4,3.4);ctx.fill();}
  ctx.fillStyle='rgba(80,40,10,.25)';rr(-38,-28,17,4,2);ctx.fill();rr(21,-28,17,4,2);ctx.fill();
  neck0();
  ctx.save();ctx.translate(14,-96);ctx.rotate(-0.12);rr(-7,0,15,48,4);ctx.fillStyle='#e83a4a';ctx.fill();ctx.fillStyle='#fff';for(const y of[10,22,34])ctx.fillRect(-7,y,15,4);ctx.strokeStyle='#e83a4a';ctx.lineWidth=1.5;for(let x=-6;x<=7;x+=3){ctx.beginPath();ctx.moveTo(x,48);ctx.lineTo(x,54);ctx.stroke();}ctx.restore();
  rr(-25,-110,50,20,10);ctx.fillStyle='#e83a4a';ctx.fill();ctx.fillStyle='#fff';for(let x=-18;x<=18;x+=9)ctx.fillRect(x,-110,3.5,20);ctx.strokeStyle='rgba(120,0,20,.3)';ctx.lineWidth=1.5;rr(-25,-110,50,20,10);ctx.stroke();}},
 magical:{name:'魔法少女裙',price:260,sleeve:'#ffffff',sl:0.5,sx:9,cuff:'#ff8fc0',body(t){
  torsoPath(15);ctx.fillStyle=vgrad('#ffe3f2','#ff9ccc');ctx.fill();
  scallops(-50,50,-4,6,'#fff');scallops(-46,46,-18,5.4,'#ff7ab6');ctx.fillStyle='#ffd23f';rr(-45,-52,90,4,2);ctx.fill();
  rr(-27,-92,54,40,10);ctx.fillStyle='#fff';ctx.fill();ctx.strokeStyle='#ffc0dc';ctx.lineWidth=1.5;ctx.stroke();
  neck0();ctx.fillStyle='#ff4f9a';rr(-10,-104,20,4,2);ctx.fill();
  bowAt(0,-78,1.25,'#ff4f9a','#c81e6a',true);heart(0,-77,4.5,'#ffd23f');
  for(let i=0;i<5;i++){const a=0.4+0.6*Math.abs(Math.sin(t*4+i*1.3));ctx.globalAlpha=a;sparkle4([-36,34,-30,38,-6][i],[-74,-60,-34,-30,-36][i],[4,3.5,3,4,3][i],'#fff7b0');}ctx.globalAlpha=1;
  star5(-28,-24,4,'#ffe066');star5(26,-14,3.5,'#ffe066');}},
 overalls:{name:'牛仔背带裤',price:200,sleeve:'#ffd84a',sl:0.55,sx:4,cuff:'#ffffff',body(t){
  torsoPath(4);ctx.fillStyle='#ffd84a';ctx.fill();ctx.fillStyle='#fff';for(const y of[-88,-76,-64,-52])ctx.fillRect(-48,y,96,4);
  neck0();ctx.strokeStyle='#f0c020';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-98,10,0.2,Math.PI-0.2);ctx.stroke();
  const dg=vgrad('#6a9ee0','#3a66b0',-70,0);ctx.fillStyle=dg;rr(-23,-70,46,40,6);ctx.fill();ctx.beginPath();ctx.moveTo(-41,-36);ctx.lineTo(41,-36);ctx.lineTo(44,0);ctx.lineTo(-44,0);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#3a66b0';ctx.lineWidth=7;ctx.lineCap='round';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*17,-66);ctx.lineTo(d*30,-96);ctx.stroke();}
  ctx.fillStyle='#ffd23f';for(const d of[-1,1]){ell(d*17,-65,3.5,3.5);ctx.fill();}
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=1.3;ctx.setLineDash([2.5,2]);rr(-11,-60,22,17,3);ctx.stroke();rr(-20,-68,40,36,5);ctx.stroke();ctx.setLineDash([]);
  heart(0,-51,5.5,'#ff6a8a');ctx.fillStyle='rgba(255,255,255,.18)';rr(-36,-24,14,12,3);ctx.fill();}},
 starry:{name:'星空晚礼服',price:260,sleeve:SKIN0,sl:0.15,sx:-4,body(t){
  torsoPath(15);ctx.fillStyle=SKIN0;ctx.fill();neck0();
  ctx.fillStyle='rgba(230,160,150,.35)';for(const d of[-1,1]){ell(d*30,-88,9,4);ctx.fill();}
  ctx.beginPath();ctx.moveTo(-45,-74);ctx.quadraticCurveTo(0,-84,45,-74);ctx.lineTo(56,0);ctx.lineTo(-56,0);ctx.closePath();
  const g=ctx.createLinearGradient(0,-80,0,0);g.addColorStop(0,'#3a2f8a');g.addColorStop(0.55,'#6a3aa8');g.addColorStop(1,'#1c1848');ctx.fillStyle=g;ctx.fill();
  ctx.save();ctx.clip();for(let i=0;i<14;i++){const x=((i*37)%96)-48,y=-70+((i*23)%66),a=0.35+0.65*Math.abs(Math.sin(t*3+i));ctx.globalAlpha=a;sparkle4(x,y,i%3?2.2:3.6,'#fff');}ctx.globalAlpha=1;
  ctx.fillStyle='rgba(255,255,255,.08)';ctx.beginPath();ctx.moveTo(-10,-80);ctx.quadraticCurveTo(10,-40,-6,0);ctx.lineTo(10,0);ctx.quadraticCurveTo(26,-40,6,-80);ctx.fill();ctx.restore();
  scallops(-44,44,-76,4,'#4a3a9a');ctx.strokeStyle='#e6e8ff';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-45,-74);ctx.quadraticCurveTo(0,-84,45,-74);ctx.stroke();
  ctx.strokeStyle='#ffd86a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-11,-100);ctx.quadraticCurveTo(0,-84,11,-100);ctx.stroke();star5(0,-86,4.5,'#ffe066');}},
 panda:{name:'熊猫卫衣',price:230,sleeve:'#2a2a30',sl:2,sx:4,cuff:'#44444c',
  back(t){ctx.fillStyle='#f2f2f5';ell(0,-102,46,17);ctx.fill();ctx.fillStyle='#2a2a30';for(const d of[-1,1]){ell(d*40,-112,11,11);ctx.fill();}},
  body(t){torsoPath(5);ctx.fillStyle=vgrad('#ffffff','#e4e4ea');ctx.fill();
  ctx.fillStyle='#2a2a30';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*36,-96);ctx.quadraticCurveTo(d*49,-90,d*48,-70);ctx.lineTo(d*45,-52);ctx.quadraticCurveTo(d*32,-70,d*24,-95);ctx.closePath();ctx.fill();}
  ctx.fillStyle='#fff';ell(0,-44,21,17);ctx.fill();ctx.strokeStyle='#d6d6de';ctx.lineWidth=1.5;ctx.stroke();
  ctx.fillStyle='#2a2a30';for(const d of[-1,1]){ctx.save();ctx.translate(d*8,-46);ctx.rotate(d*0.5);ell(0,0,5,6.5);ctx.fill();ctx.restore();ell(d*15,-58,4.5,4.5);ctx.fill();}
  ctx.fillStyle='#fff';for(const d of[-1,1]){ell(d*8.4,-47,1.7,1.7);ctx.fill();}ctx.fillStyle='#2a2a30';ell(0,-39,3,2.2);ctx.fill();ctx.strokeStyle='#2a2a30';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-3,-36);ctx.quadraticCurveTo(0,-34,3,-36);ctx.stroke();
  ctx.fillStyle='rgba(255,140,160,.5)';for(const d of[-1,1]){ell(d*14,-40,3,2);ctx.fill();}
  ctx.strokeStyle='#cfcfd8';ctx.lineWidth=1.6;rr(-26,-24,52,17,8);ctx.stroke();
  neck0();rr(-20,-105,40,12,6);ctx.fillStyle='#f2f2f5';ctx.fill();ctx.strokeStyle='#d6d6de';ctx.lineWidth=1.4;ctx.stroke();
  ctx.strokeStyle='#e8452c';ctx.lineWidth=1.8;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*7,-94);ctx.lineTo(d*9,-72);ctx.stroke();ctx.fillStyle='#e8452c';ell(d*9,-71,2,3);ctx.fill();}
  ctx.fillStyle='#5cb85c';ctx.save();ctx.translate(30,-20);ctx.rotate(-0.6);ell(0,0,7,2.6);ctx.fill();ctx.rotate(0.9);ell(4,-2,6,2.3);ctx.fill();ctx.restore();}},
 blazer:{name:'学院制服',price:220,sleeve:'#26315c',sl:2,sx:3,cuff:'#1a2244',body(t){
  torsoPath(6);ctx.fillStyle=vgrad('#303d70','#1d2548');ctx.fill();
  ctx.fillStyle='#8a2a3a';rr(-44,-15,88,15,2);ctx.fill();ctx.strokeStyle='rgba(255,220,120,.4)';ctx.lineWidth=1.2;for(let x=-40;x<=40;x+=10){ctx.beginPath();ctx.moveTo(x,-15);ctx.lineTo(x,0);ctx.stroke();}ctx.beginPath();ctx.moveTo(-44,-8);ctx.lineTo(44,-8);ctx.stroke();
  neck0();ctx.fillStyle='#fff';ctx.beginPath();ctx.moveTo(-17,-97);ctx.lineTo(0,-56);ctx.lineTo(17,-97);ctx.closePath();ctx.fill();
  ctx.strokeStyle='#e8c060';ctx.lineWidth=1.6;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*17,-97);ctx.lineTo(d*1,-56);ctx.stroke();}
  ctx.fillStyle='#fff';for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,-95);ctx.lineTo(d*14,-100);ctx.lineTo(d*11,-86);ctx.closePath();ctx.fill();}
  bowAt(0,-88,0.72,'#e8304a','#a01830',true);
  ctx.fillStyle='#e8c060';ctx.beginPath();ctx.moveTo(-30,-72);ctx.lineTo(-18,-72);ctx.lineTo(-18,-64);ctx.quadraticCurveTo(-24,-58,-24,-58);ctx.quadraticCurveTo(-30,-62,-30,-64);ctx.closePath();ctx.fill();text('7',-24,-66,8,'#26315c','900');
  ctx.fillStyle='#e8c060';for(const y of[-44,-30])for(const d of[-1,1]){ell(d*6,y,2.6,2.6);ctx.fill();}}},
 shujin:{name:'蜀锦芙蓉袄',price:260,sleeve:'#1d7f86',sl:1.9,sx:6,cuff:'#e8452c',body(t){
  torsoPath(6);ctx.fillStyle=vgrad('#2aa0a6','#14606a');ctx.fill();
  ctx.save();torsoPath(6);ctx.clip();ctx.strokeStyle='rgba(255,215,110,.35)';ctx.lineWidth=1;for(let x=-60;x<70;x+=14){ctx.beginPath();ctx.moveTo(x,-100);ctx.lineTo(x+40,0);ctx.moveTo(x+40,-100);ctx.lineTo(x,0);ctx.stroke();}
  for(const [x,y,r] of [[-24,-58,7],[22,-30,8],[-20,-18,5],[30,-78,5]])furong(x,y,r,'#ff9ab8','#ffd23f');ctx.restore();
  ctx.fillStyle='#e8452c';rr(-44,-7,88,7,2);ctx.fill();ctx.fillStyle='#ffd23f';rr(-44,-8,88,2,1);ctx.fill();
  neck0();rr(-13,-107,26,12,5);ctx.fillStyle='#e8452c';ctx.fill();ctx.strokeStyle='#ffd23f';ctx.lineWidth=2;ctx.stroke();
  ctx.strokeStyle='#e8452c';ctx.lineWidth=4.5;ctx.beginPath();ctx.moveTo(-1,-95);ctx.quadraticCurveTo(24,-90,28,-70);ctx.lineTo(30,-6);ctx.stroke();ctx.strokeStyle='#ffd23f';ctx.lineWidth=1.2;ctx.stroke();
  ctx.fillStyle='#ffd23f';for(const [x,y] of [[12,-91],[25,-76],[29,-56],[30,-36]]){ell(x,y,3.2,2.4);ctx.fill();ctx.fillRect(x-7,y-0.9,14,1.8);}}}
};
const NEW_HATS={
 tiara:{name:'水晶头冠',price:260,draw(t){ctx.save();ctx.translate(0,-201);
  ctx.strokeStyle='#cfd5e6';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,10,44,12,0,Math.PI*1.06,Math.PI*1.94);ctx.stroke();
  const g=ctx.createLinearGradient(0,-24,0,4);g.addColorStop(0,'#ffffff');g.addColorStop(1,'#aeb6d4');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-30,2);ctx.lineTo(-22,-10);ctx.lineTo(-13,-4);ctx.lineTo(0,-24);ctx.lineTo(13,-4);ctx.lineTo(22,-10);ctx.lineTo(30,2);ctx.quadraticCurveTo(0,-4,-30,2);ctx.closePath();ctx.fill();ctx.strokeStyle='#8a92b4';ctx.lineWidth=1.4;ctx.stroke();
  const gem=(x,y,rx,ry,a,b)=>{const q=ctx.createLinearGradient(0,y-ry,0,y+ry);q.addColorStop(0,a);q.addColorStop(1,b);ctx.fillStyle=q;ell(x,y,rx,ry);ctx.fill();ctx.fillStyle='rgba(255,255,255,.8)';ell(x-rx*0.3,y-ry*0.35,rx*0.3,ry*0.25);ctx.fill();};
  gem(0,-9,4.2,6,'#d8f6ff','#3a9ae0');gem(-15,-3,2.6,3.4,'#ffe0f0','#ff6fa8');gem(15,-3,2.6,3.4,'#ffe0f0','#ff6fa8');for(const x of[-22,22]){ctx.fillStyle='#fff';ell(x,-10,2,2);ctx.fill();}
  ctx.globalAlpha=0.5+0.5*Math.sin(t*5);sparkle4(-6,-20,5,'#fff');ctx.globalAlpha=0.5+0.5*Math.sin(t*5+2);sparkle4(24,-14,3.5,'#fff');ctx.globalAlpha=1;ctx.restore();}},
 maidband:{name:'女仆蕾丝头饰',price:200,draw(t){ctx.save();
  for(let i=0;i<=12;i++){const a=Math.PI*(1.1+i*0.8/12),x=Math.cos(a)*46,y=-176+Math.sin(a)*30;ctx.fillStyle='#fff';ell(x+Math.cos(a)*4,y+Math.sin(a)*4,5,4.2);ctx.fill();}
  ctx.strokeStyle='#ffffff';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(0,-176,46,30,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  ctx.strokeStyle='#e4e2f0';ctx.lineWidth=1.3;ctx.setLineDash([2,3]);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#2e2a40';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,-176,46,30,0,Math.PI*1.12,Math.PI*1.88);ctx.stroke();
  bowAt(-40,-188,0.55,'#2e2a40','#111',true);bowAt(40,-188,0.55,'#2e2a40','#111',true);ctx.restore();}},
 witch:{cover:1,name:'星星魔女帽',price:240,draw(t){ctx.save();ctx.translate(0,-2);ctx.rotate(-0.05);const sw=Math.sin(t*1.8)*3;
  ctx.fillStyle='#3a2266';ell(0,-196,64,13);ctx.fill();
  const g=ctx.createLinearGradient(-30,-260,30,-196);g.addColorStop(0,'#8a5ad8');g.addColorStop(1,'#4a2a8a');ctx.fillStyle=g;
  ctx.beginPath();ctx.moveTo(-34,-198);ctx.quadraticCurveTo(-18,-232,6,-258);ctx.quadraticCurveTo(26+sw,-262,38+sw,-250);ctx.quadraticCurveTo(22,-246,18,-236);ctx.quadraticCurveTo(26,-218,36,-198);ctx.closePath();ctx.fill();
  ctx.fillStyle='#ffb02e';ctx.beginPath();ctx.moveTo(-34,-200);ctx.quadraticCurveTo(0,-192,36,-200);ctx.lineTo(33,-210);ctx.quadraticCurveTo(0,-203,-31,-210);ctx.closePath();ctx.fill();star5(0,-204,6.5,'#fff3a0');
  ctx.fillStyle='rgba(255,255,255,.18)';ell(-40,-198,14,3.5);ctx.fill();
  ctx.globalAlpha=0.5+0.5*Math.sin(t*4);star5(-12,-226,3,'#ffe066');ctx.globalAlpha=0.5+0.5*Math.sin(t*4+2);star5(12,-240,2.4,'#ffe066');ctx.globalAlpha=1;
  ctx.fillStyle='#ffe066';star5(38+sw,-250,4,'#ffe066');ctx.restore();}},
 cap:{cover:1,name:'元气棒球帽',price:190,draw(t){ctx.save();ctx.translate(0,4);
  ctx.fillStyle='#c8301c';ctx.save();ctx.translate(24,-184);ctx.rotate(0.08);ell(0,0,36,8.5);ctx.fill();ctx.restore();
  const g=ctx.createLinearGradient(0,-226,0,-184);g.addColorStop(0,'#ff6a50');g.addColorStop(1,'#e2402a');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(-47,-184);ctx.bezierCurveTo(-48,-230,48,-230,47,-184);ctx.quadraticCurveTo(0,-192,-47,-184);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(120,20,10,.35)';ctx.lineWidth=1.3;ctx.beginPath();ctx.moveTo(0,-218);ctx.quadraticCurveTo(-2,-202,0,-189);ctx.moveTo(0,-218);ctx.quadraticCurveTo(-26,-210,-34,-188);ctx.moveTo(0,-218);ctx.quadraticCurveTo(26,-210,34,-188);ctx.stroke();
  ctx.fillStyle='#c8301c';ell(0,-218,4,2.6);ctx.fill();ctx.fillStyle='#fff';rr(-15,-210,30,15,6);ctx.fill();text('77',0,-202,12,'#e2402a','900');ctx.restore();}},
 earmuff:{name:'毛绒耳罩',price:210,draw(t){
  ctx.strokeStyle='#ff8fb8';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(0,-168,50,48,0,Math.PI*1.08,Math.PI*1.92);ctx.stroke();ctx.strokeStyle='rgba(255,255,255,.5)';ctx.lineWidth=1.6;ctx.stroke();
  for(const d of[-1,1]){const x=d*49,y=-146;for(let i=0;i<10;i++){const a=i/10*TAU;ctx.fillStyle=i%2?'#ffe4ee':'#ffffff';ell(x+Math.cos(a)*11,y+Math.sin(a)*12,6.5,6.5);ctx.fill();}
    ctx.fillStyle='#ffc2d8';ell(x,y,10,11);ctx.fill();ctx.fillStyle='rgba(255,255,255,.6)';ell(x-3,y-4,3,2.5);ctx.fill();heart(x,y+1,3.4,'#ff6f9a');}}},
 pandaears:{name:'熊猫耳朵',price:180,draw(t){
  ctx.strokeStyle='#2a2a30';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.ellipse(0,-172,46,34,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  for(const d of[-1,1]){const tw=d>0&&Math.sin(t*1.4)>0.94?0.2:0;ctx.save();ctx.translate(d*31,-202);ctx.rotate(d*(0.2+tw));ctx.fillStyle='#2a2a30';ell(0,0,14,13);ctx.fill();ctx.fillStyle='#4a4a54';ell(0,1,7.5,7);ctx.fill();ctx.restore();}
  ctx.save();ctx.translate(44,-188);ctx.fillStyle='#5cb85c';ctx.rotate(-0.4);ell(6,0,9,3);ctx.fill();ctx.rotate(0.8);ell(6,0,8,2.6);ctx.fill();ctx.restore();}},
 sakura:{name:'樱花流苏簪',price:220,draw(t){ctx.save();ctx.translate(34,-190);
  ctx.strokeStyle='#8a5a3a';ctx.lineWidth=3;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-18,8);ctx.lineTo(16,-14);ctx.stroke();
  const sk=(x,y,r)=>{ctx.save();ctx.translate(x,y);for(let i=0;i<5;i++){ctx.rotate(TAU/5);ctx.fillStyle='#ffc2d6';ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(-r*0.7,-r*0.6,-r*0.3,-r);ctx.lineTo(0,-r*0.82);ctx.lineTo(r*0.3,-r);ctx.quadraticCurveTo(r*0.7,-r*0.6,0,0);ctx.fill();}ctx.fillStyle='#ff6f91';ell(0,0,r*0.22,r*0.22);ctx.fill();ctx.restore();};
  sk(2,-4,9);sk(-10,4,6.5);sk(13,-12,6);
  for(const [x,l,k] of [[-4,20,0],[2,26,1],[8,18,2]]){const sw=Math.sin(t*2.2+k)*3;ctx.strokeStyle='#e8a0b8';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(x,4);ctx.quadraticCurveTo(x+sw*0.5,4+l/2,x+sw,4+l);ctx.stroke();ctx.fillStyle=k===1?'#ff6f91':'#ffd23f';ell(x+sw,6+l,2.4,2.4);ctx.fill();}
  ctx.restore();}},
 duck:{name:'小黄鸭发夹',price:190,draw(t){const b=Math.abs(Math.sin(t*3))*-3;ctx.save();ctx.translate(16,-213+b);ctx.rotate(Math.sin(t*1.5)*0.06);
  ctx.fillStyle='#ffd84a';ctx.beginPath();ctx.moveTo(-16,0);ctx.quadraticCurveTo(-20,-12,-12,-10);ctx.quadraticCurveTo(-4,-14,8,-8);ctx.quadraticCurveTo(16,-4,12,4);ctx.quadraticCurveTo(0,8,-16,0);ctx.fill();
  ell(4,-16,9,8.5);ctx.fill();ctx.fillStyle='#ff9a2e';ctx.beginPath();ctx.moveTo(11,-15);ctx.quadraticCurveTo(20,-15,18,-11);ctx.quadraticCurveTo(14,-10,11,-12);ctx.fill();
  ctx.fillStyle='#2a1a1a';ell(6.5,-18,1.8,2.2);ctx.fill();ctx.fillStyle='#fff';ell(6,-19,0.7,0.7);ctx.fill();ctx.fillStyle='rgba(255,120,120,.5)';ell(9,-13,2.4,1.5);ctx.fill();
  ctx.fillStyle='#f0c030';ctx.beginPath();ctx.moveTo(-8,-4);ctx.quadraticCurveTo(-2,-8,2,-2);ctx.quadraticCurveTo(-4,0,-8,-4);ctx.fill();ctx.fillStyle='rgba(255,255,255,.45)';ell(0,-20,3,2);ctx.fill();ctx.restore();}},
 halo:{name:'天使光环',price:230,draw(t){const b=Math.sin(t*2)*3,y=-234+b;ctx.save();
  const g=ctx.createRadialGradient(0,y,4,0,y,46);g.addColorStop(0,'rgba(255,240,160,.5)');g.addColorStop(1,'rgba(255,240,160,0)');ctx.fillStyle=g;ell(0,y,46,22);ctx.fill();
  ctx.strokeStyle='#ffd23f';ctx.lineWidth=6;ctx.beginPath();ctx.ellipse(0,y,30,8,0,0,TAU);ctx.stroke();ctx.strokeStyle='#fff8c8';ctx.lineWidth=2;ctx.beginPath();ctx.ellipse(0,y-1,30,8,0,Math.PI*1.1,Math.PI*1.9);ctx.stroke();
  ctx.globalAlpha=0.5+0.5*Math.sin(t*5);sparkle4(-30,y-6,4,'#fff');ctx.globalAlpha=0.5+0.5*Math.sin(t*5+2);sparkle4(30,y+6,3,'#fff');ctx.globalAlpha=1;ctx.restore();}},
 bucket:{cover:1,name:'草莓渔夫帽',price:210,draw(t){ctx.save();ctx.translate(0,2);
  ctx.fillStyle='#ffd0dc';ctx.beginPath();ctx.moveTo(-60,-180);ctx.quadraticCurveTo(0,-206,60,-180);ctx.quadraticCurveTo(52,-170,40,-178);ctx.quadraticCurveTo(0,-192,-40,-178);ctx.quadraticCurveTo(-52,-170,-60,-180);ctx.fill();
  ctx.fillStyle='#ffeef2';ctx.beginPath();ctx.moveTo(-40,-188);ctx.bezierCurveTo(-40,-232,40,-232,40,-188);ctx.quadraticCurveTo(0,-196,-40,-188);ctx.fill();
  ctx.fillStyle='#ff8fab';ctx.beginPath();ctx.moveTo(-40,-188);ctx.quadraticCurveTo(0,-196,40,-188);ctx.lineTo(39,-196);ctx.quadraticCurveTo(0,-204,-39,-196);ctx.closePath();ctx.fill();
  for(const [x,y] of [[-22,-212],[4,-220],[24,-208],[-6,-204]]){ctx.fillStyle='#ff4a5a';ctx.beginPath();ctx.moveTo(x,y+6);ctx.quadraticCurveTo(x-6,y,x-4,y-3);ctx.quadraticCurveTo(x,y-5,x+4,y-3);ctx.quadraticCurveTo(x+6,y,x,y+6);ctx.fill();ctx.fillStyle='#4caf50';ell(x,y-4,3.5,1.6);ctx.fill();ctx.fillStyle='#ffe9a0';ell(x-1.5,y,0.7,0.7);ctx.fill();ell(x+1.5,y+2,0.7,0.7);ctx.fill();}
  ctx.restore();}}
};
Object.assign(OUTFITS,NEW_OUTFITS);Object.assign(HATS,NEW_HATS);
const OUTFIT_IDS=Object.keys(OUTFITS),HAT_IDS=Object.keys(HATS);
// ---------- 头发 ----------
function hairGrad(y0,y1){const g=ctx.createLinearGradient(0,y0,0,y1);g.addColorStop(0,HAIR.l);g.addColorStop(0.35,HAIR.m);g.addColorStop(1,HAIR.d);return g;}
function backHair(t,sw){ctx.fillStyle=hairGrad(-215,-30);
  ctx.beginPath();ctx.moveTo(-46,-182);ctx.bezierCurveTo(-66,-156,-62,-112,-62+sw*0.4,-74);ctx.bezierCurveTo(-64+sw,-54,-62+sw,-40,-54+sw,-24);
  ctx.quadraticCurveTo(-49+sw,-34,-43+sw,-26);ctx.quadraticCurveTo(-38+sw,-38,-31+sw,-30);ctx.lineTo(31+sw,-30);
  ctx.quadraticCurveTo(38+sw,-38,43+sw,-26);ctx.quadraticCurveTo(49+sw,-34,54+sw,-24);ctx.bezierCurveTo(62+sw,-40,64+sw,-54,62+sw*0.4,-74);ctx.bezierCurveTo(62,-112,66,-156,46,-182);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(0,0,0,.2)';ctx.lineWidth=1.6;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*50,-150);ctx.bezierCurveTo(d*56,-110,d*54+sw*0.5,-70,d*48+sw,-34);ctx.stroke();}
  ctx.strokeStyle='rgba(255,200,230,.13)';ctx.lineWidth=3;for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(d*56,-140);ctx.bezierCurveTo(d*60,-110,d*58+sw*0.5,-80,d*56+sw,-50);ctx.stroke();}}
function sideLocks(t,sw){for(const d of[-1,1]){const s2=sw*(d>0?1:0.8);ctx.fillStyle=hairGrad(-190,-70);
    ctx.beginPath();ctx.moveTo(d*38,-180);ctx.bezierCurveTo(d*54,-152,d*53,-122,d*51+s2*0.6,-98);ctx.quadraticCurveTo(d*52+s2,-82,d*45+s2,-68);
    ctx.quadraticCurveTo(d*44+s2*0.8,-84,d*41+s2*0.5,-96);ctx.bezierCurveTo(d*38,-116,d*39,-142,d*35,-170);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(0,0,0,.22)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(d*42,-160);ctx.bezierCurveTo(d*46,-130,d*46,-108,d*46+s2,-76);ctx.stroke();
    ctx.strokeStyle=HAIR.s;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(d*46,-158);ctx.bezierCurveTo(d*49,-136,d*49,-120,d*48+s2*0.6,-104);ctx.stroke();}}
const BANG_S=[[44,-171,46,-146],[37,-178,32,-152],[28,-181,22,-163],[17,-182,9,-154],[3,-182,-3,-160],[-8,-182,-16,-152],[-21,-180,-28,-162],[-32,-177,-40,-148],[-44,-168,-50,-146]];
function bangsTop(){ctx.moveTo(-50,-146);ctx.bezierCurveTo(-58,-198,-26,-218,2,-216);ctx.bezierCurveTo(32,-216,60,-198,50,-148);}
function bangsPath(list){ctx.beginPath();bangsTop();
  let px=50,py=-148;for(const [vx,vy,tx,ty] of (list||BANG_S)){ctx.quadraticCurveTo(px-1,(py+vy)/2-3,vx,vy);ctx.quadraticCurveTo(vx+(tx-vx)*0.15+1.5,(vy+ty)/2+4,tx,ty);px=tx;py=ty;}
  ctx.closePath();}
function bangs(t){
  // 底层（更暗，填住发缕之间的缝）
  ctx.beginPath();bangsTop();ctx.quadraticCurveTo(36,-172,14,-175);ctx.quadraticCurveTo(-8,-177,-30,-172);ctx.quadraticCurveTo(-46,-168,-50,-146);ctx.closePath();ctx.fillStyle=HAIR.d;ctx.fill();
  bangsPath();ctx.fillStyle=hairGrad(-218,-150);ctx.fill();
  ctx.save();bangsPath();ctx.clip();
  // 天使环高光（几段沿头型的短弧）
  ctx.lineCap='round';for(const [cx,cy,rx,ry,a0,a1,w,al] of [[2,-180,42,15,1.12,1.32,3.2,.32],[2,-180,42,15,1.4,1.6,3.6,.36],[2,-180,42,15,1.68,1.86,3.2,.3],[-6,-186,26,9,1.2,1.42,1.6,.55]]){
    ctx.strokeStyle='rgba(255,215,236,'+al+')';ctx.lineWidth=w;ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,Math.PI*a0,Math.PI*a1);ctx.stroke();}
  // 发丝线（弯的、淡的）
  ctx.strokeStyle='rgba(20,5,15,.22)';ctx.lineWidth=1.1;for(const [vx,vy,tx,ty] of BANG_S.slice(1,8)){ctx.beginPath();ctx.moveTo(vx+3,-204);ctx.quadraticCurveTo(vx+2,vy+6,(vx+tx)/2+1,ty-3);ctx.stroke();}
  ctx.restore();}
function ahoge(t){const b=Math.sin(t*3.1)*3;ctx.strokeStyle=HAIR.m;ctx.lineCap='round';ctx.lineWidth=3.4;ctx.beginPath();ctx.moveTo(0,-213);ctx.bezierCurveTo(3,-232+b,20,-238+b,18+b*0.3,-224+b);ctx.stroke();
  ctx.lineWidth=2.4;ctx.beginPath();ctx.moveTo(-3,-213);ctx.quadraticCurveTo(-10,-228+b*0.6,-16,-226+b*0.6);ctx.stroke();}
function hairBow(t){ctx.save();ctx.translate(-40,-192);ctx.rotate(-0.5+Math.sin(t*2)*0.03);ctx.fillStyle='#e8452c';
  for(const d of[-1,1]){ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(d*8,-10,d*16,-8,d*15,0);ctx.bezierCurveTo(d*16,8,d*8,10,0,0);ctx.fill();}
  ctx.fillStyle='#ff8a70';for(const d of[-1,1]){ell(d*9,-1.5,3,2);ctx.fill();}ctx.fillStyle='#b8261a';ell(0,0,3.4,3.4);ctx.fill();ctx.restore();}
// ---------- 脸 ----------
function facePath(){ctx.beginPath();ctx.moveTo(-45,-170);ctx.bezierCurveTo(-46,-138,-35,-116,-13,-106);ctx.quadraticCurveTo(0,-100,13,-106);ctx.bezierCurveTo(35,-116,46,-138,45,-170);ctx.bezierCurveTo(44,-214,-44,-214,-45,-170);ctx.closePath();}
function eyeShape(){ctx.beginPath();ctx.moveTo(-11,-1);ctx.bezierCurveTo(-8,-11,4,-14,12.5,-6);ctx.quadraticCurveTo(14,-3,13,0);ctx.bezierCurveTo(12,8,4,12,-1,11);ctx.bezierCurveTo(-7,10,-11,5,-11,-1);ctx.closePath();}
const IRIS=['#2a1020','#7d2f48','#e5866a','#ffd29a'];
function drawEye(d,ex,ey,st,lx){ctx.save();ctx.translate(ex,ey);ctx.scale(d,1);const L=lx*d;
  ctx.lineCap='round';ctx.lineJoin='round';
  if(st==='happy'){ctx.strokeStyle='#2a1220';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(-11,3);ctx.quadraticCurveTo(0,-11,13,2);ctx.stroke();ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(12,1);ctx.quadraticCurveTo(15,-1,17,-3);ctx.stroke();ctx.restore();return;}
  if(st==='closed'){ctx.strokeStyle='#2a1220';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-11,1);ctx.quadraticCurveTo(1,8,13,0);ctx.stroke();ctx.lineWidth=1.3;for(const [a,b] of [[3,5],[8,3.6],[12,1]]){ctx.beginPath();ctx.moveTo(a,b);ctx.lineTo(a+1.5,b+3.5);ctx.stroke();}ctx.restore();return;}
  const sur=st==='surprise',rx=sur?7.2:8.4,ry=sur?9.4:10.8,cx=0.6+L*2.2,cy=sur?0.5:1.6;
  eyeShape();ctx.fillStyle='#fffdfb';ctx.fill();ctx.save();eyeShape();ctx.clip();
  ctx.fillStyle='rgba(120,60,90,.22)';ell(1,-9,16,7);ctx.fill();
  const g=ctx.createLinearGradient(0,cy-ry,0,cy+ry);g.addColorStop(0,IRIS[0]);g.addColorStop(0.45,IRIS[1]);g.addColorStop(0.82,IRIS[2]);g.addColorStop(1,IRIS[3]);
  ctx.fillStyle=g;ell(cx,cy,rx,ry);ctx.fill();ctx.strokeStyle='rgba(40,8,25,.75)';ctx.lineWidth=1.1;ctx.stroke();
  ctx.fillStyle='rgba(255,200,150,.5)';ell(cx,cy+5.6,rx*0.62,ry*0.3);ctx.fill();
  ctx.fillStyle='#1c0a14';ell(cx,cy+0.4,rx*0.45,ry*0.52);ctx.fill();
  ctx.fillStyle='rgba(30,5,20,.45)';ell(cx,cy-ry*0.82,rx*1.2,ry*0.42);ctx.fill();
  if(st==='star'){sparkle4(cx-2.6,cy-3.2,5.2,'#fff');sparkle4(cx+3.4,cy+4.4,2.6,'#fff');}
  else{ctx.fillStyle='#fff';ell(cx-3.3,cy-4.2,3.1,3.8);ctx.fill();ell(cx+3.6,cy+4.6,1.5,1.5);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ell(cx+2.6,cy-6,1,1);ctx.fill();}
  ctx.restore();
  // 睫毛 & 眼线
  ctx.strokeStyle='#2a1220';ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(-12,0);ctx.bezierCurveTo(-8,-12,4,-15,12.5,-6.5);ctx.quadraticCurveTo(14.6,-4,15.5,-1.5);ctx.stroke();
  ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(11,-7.5);ctx.quadraticCurveTo(15,-10,17.5,-13);ctx.stroke();ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(13.6,-4.2);ctx.quadraticCurveTo(17.5,-5.5,19.5,-8);ctx.stroke();
  ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-11,-1);ctx.lineTo(-13,1);ctx.stroke();
  ctx.strokeStyle='rgba(90,40,55,.55)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(2,11);ctx.quadraticCurveTo(10,8.5,12.6,1.2);ctx.stroke();
  ctx.strokeStyle='rgba(165,95,105,.55)';ctx.beginPath();ctx.moveTo(-5,-14.6);ctx.quadraticCurveTo(5,-17.8,12.4,-11.8);ctx.stroke();
  ctx.restore();}
function drawBrow(d,ex,ey,st){ctx.save();ctx.translate(ex,ey);ctx.scale(d,1);ctx.strokeStyle='#4a2234';ctx.lineCap='round';ctx.lineWidth=2.1;ctx.beginPath();
  if(st==='worry'){ctx.moveTo(-9,-25.5);ctx.quadraticCurveTo(2,-25,13,-19.5);}else if(st==='surprise'){ctx.moveTo(-9,-25);ctx.quadraticCurveTo(2,-30,13,-25);}else{ctx.moveTo(-9,-21.5);ctx.quadraticCurveTo(2,-26,13,-21.5);}
  ctx.stroke();ctx.restore();}
function drawMouth(f,t){ctx.lineCap='round';ctx.lineJoin='round';const y=-120;
  if(f==='laugh'||f==='open'){const o=f==='laugh'?1:0.75;ctx.fillStyle='#a8304a';ctx.beginPath();ctx.moveTo(-8*o,y-2);ctx.quadraticCurveTo(0,y+0.5,8*o,y-2);ctx.quadraticCurveTo(7*o,y+9*o,0,y+10*o);ctx.quadraticCurveTo(-7*o,y+9*o,-8*o,y-2);ctx.fill();
    ctx.save();ctx.clip();ctx.fillStyle='#ff8b9c';ell(0,y+9*o,6*o,4);ctx.fill();ctx.fillStyle='#fff';rr(-5*o,y-2.5,10*o,2.8,1.2);ctx.fill();ctx.restore();}
  else if(f==='worry'){ctx.strokeStyle='#b03a52';ctx.lineWidth=1.9;ctx.beginPath();ctx.moveTo(-6,y+1);ctx.quadraticCurveTo(-3,y-2.5,0,y+0.5);ctx.quadraticCurveTo(3,y+3.5,6,y);ctx.stroke();}
  else if(f==='o'){ctx.fillStyle='#a8304a';ell(0,y+2,3.6,4.4);ctx.fill();ctx.fillStyle='#ff8b9c';ell(0,y+4,2.2,1.6);ctx.fill();}
  else if(f==='cat'){ctx.strokeStyle='#b03a52';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(-7,y-2);ctx.quadraticCurveTo(-3.5,y+3,0,y-1);ctx.quadraticCurveTo(3.5,y+3,7,y-2);ctx.stroke();}
  else{ctx.fillStyle='#ff9aa8';ctx.beginPath();ctx.moveTo(-6,y-2);ctx.quadraticCurveTo(0,y+5,6,y-2);ctx.quadraticCurveTo(0,y+0.5,-6,y-2);ctx.fill();ctx.strokeStyle='#b03a52';ctx.lineWidth=1.7;ctx.beginPath();ctx.moveTo(-6.5,y-2.2);ctx.quadraticCurveTo(0,y+4,6.5,y-2.2);ctx.stroke();}}
function drawHead(P,t,still){
  facePath();const fg=ctx.createLinearGradient(0,-200,0,-102);fg.addColorStop(0,'#fff4ee');fg.addColorStop(1,SKIN0);ctx.fillStyle=fg;ctx.fill();
  ctx.save();facePath();ctx.clip();
  const sh=ctx.createLinearGradient(0,-178,0,-150);sh.addColorStop(0,'rgba(214,130,140,.42)');sh.addColorStop(1,'rgba(214,130,140,0)');ctx.fillStyle=sh;ctx.fillRect(-50,-180,100,32);
  const js=ctx.createRadialGradient(40,-126,2,40,-126,22);js.addColorStop(0,'rgba(225,150,150,.18)');js.addColorStop(1,'rgba(225,150,150,0)');ctx.fillStyle=js;ell(40,-126,22,30);ctx.fill();ctx.restore();
  ctx.strokeStyle='rgba(205,135,125,.55)';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(-40,-136);ctx.bezierCurveTo(-34,-118,-22,-108,-12,-105.5);ctx.quadraticCurveTo(0,-100.5,12,-105.5);ctx.bezierCurveTo(22,-108,34,-118,40,-136);ctx.stroke();
  // 腮红
  for(const d of[-1,1]){const bg=ctx.createRadialGradient(d*28,-127,1,d*28,-127,13);bg.addColorStop(0,'rgba(255,120,150,.55)');bg.addColorStop(1,'rgba(255,120,150,0)');ctx.fillStyle=bg;ell(d*28,-127,14,8);ctx.fill();
    ctx.strokeStyle='rgba(240,100,130,.45)';ctx.lineWidth=1.1;for(let k=0;k<3;k++){ctx.beginPath();ctx.moveTo(d*23+k*4-2,-124.5);ctx.lineTo(d*23+k*4+1,-129.5);ctx.stroke();}}
  // 眼睛
  const ey=-143,blink=!still&&Q.blink<0;
  for(const d of[-1,1]){let st=P.eyes;if(st==='wink')st=d===1?'happy':'open';if(blink&&(st==='open'||st==='worry'||st==='star'))st='closed';drawEye(d,d*18,ey,st,P.look||0);}
  // 鼻子 & 嘴
  ctx.strokeStyle=SKIN_LINE;ctx.lineWidth=1.4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(1.5,-133);ctx.lineTo(-0.5,-130.5);ctx.stroke();ctx.fillStyle='rgba(255,255,255,.7)';ell(-1.5,-134,1.2,1.6);ctx.fill();
  drawMouth(P.face,t);}
// ---------- 整体 ----------
function drawQ7(x,base,s,look,still){const P=q7Pose(still),t=still?0:Q.t,LK=look||curLook(),OF=OUTFITS[LK.outfit]||OUTFITS.apron,HT=HATS[LK.hat]||null,sw=still?0:Math.sin(t*2.1)*4;
  ctx.save();ctx.translate(x,base+P.bob);const ps=s*(P.pop||1);ctx.scale(ps,ps*(1+P.breath*0.006));ctx.rotate(P.sway);
  if(P.aura){ctx.save();ctx.globalAlpha=P.aura;ctx.translate(0,-120);const ag0=ctx.createRadialGradient(0,0,10,0,0,150);ag0.addColorStop(0,'rgba(255,240,150,.9)');ag0.addColorStop(1,'rgba(255,180,40,0)');ctx.fillStyle=ag0;ell(0,0,150,150);ctx.fill();
    ctx.rotate(t*2);ctx.fillStyle='rgba(255,215,80,.45)';for(let r=0;r<10;r++){ctx.rotate(Math.PI/5);ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(150,-14);ctx.lineTo(150,14);ctx.fill();}ctx.restore();}
  const HS=useHair(LK.hair),cv=!!(HT&&HT.cover);ctx.save();ctx.translate(0,-104);ctx.rotate(P.tilt*0.5);ctx.translate(0,104);HS.back(t,sw,cv);ctx.restore();
  if(OF.back)OF.back(t);
  OF.body(t);
  const L1=limb(-40,-86,P.lU,P.lF,30,28,10.5,OF.sleeve||'#fff4ea',OF.sl,OF.sx,OF.cuff);drawQ7Item(P.lItem,L1,P);
  // 头部（随动作轻微歪头）
  ctx.save();ctx.translate(0,-104);ctx.rotate(P.tilt);ctx.translate(0,104);
  drawHead(P,t,still);HS.locks(t,sw,cv);if(!cv){if(HS.bow)hairBow(t);if(HS.ahoge)ahoge(t);}HS.bangs(t,sw,cv);
  ctx.globalAlpha=0.62;for(const d of[-1,1])drawBrow(d,d*18,-143,P.eyes);ctx.globalAlpha=1;
  if(HS.front)HS.front(t,sw,cv);
  if(HT)HT.draw(t);
  if(P.sweat){ctx.fillStyle='#8fd3ff';ctx.beginPath();ctx.moveTo(-44,-178);ctx.quadraticCurveTo(-37,-164,-44,-160);ctx.quadraticCurveTo(-51,-164,-44,-178);ctx.fill();ctx.fillStyle='rgba(255,255,255,.75)';ell(-45,-165,1.5,2.5);ctx.fill();}
  if(P.note){ctx.globalAlpha=P.note;ctx.fillStyle='#ff7aa5';const ny=-200-(t*30%20);ctx.font='900 18px '+FONT;ctx.textAlign='center';ctx.fillText('♪',56,ny);ctx.fillText('♫',70,ny+14);ctx.globalAlpha=1;}
  if(!still&&Q.emoteT>0&&Q.emote){const k=Q.emoteT,a=Math.min(1,k*3);ctx.globalAlpha=a;if(Q.emote==='heart'){heart(54,-196-(1.2-k)*14,7,'#ff5f8f');heart(66,-176-(1.2-k)*10,4.5,'#ff9fb8');}
    else if(Q.emote==='sparkle'){sparkle4(56,-196,8,'#ffe066');sparkle4(68,-176,5,'#fff');}else if(Q.emote==='anger'){ctx.strokeStyle='#ff4b5a';ctx.lineWidth=2.5;for(const q of[0,1,2,3]){ctx.save();ctx.translate(48,-196);ctx.rotate(q*Math.PI/2);ctx.beginPath();ctx.moveTo(2,-3);ctx.quadraticCurveTo(3,-8,8,-8);ctx.stroke();ctx.restore();}}ctx.globalAlpha=1;}
  ctx.restore();
  const R1=limb(40,-86,P.rU,P.rF,30,28,10.5,OF.sleeve||'#fff4ea',OF.sl,OF.sx,OF.cuff);drawQ7Item(P.rItem,R1,P);
  ctx.restore();}
function drawQ7Say(x,y,maxW,flip){if(Q.sayT<=0||!Q.say)return;const el=(Q.sayDur||1.6)-Q.sayT,a=Math.min(1,Q.sayT*4),sc=el<0.18?easeOutBack(el/0.18)*0.4+0.6:1;
  ctx.save();ctx.globalAlpha=a;ctx.translate(x,y);ctx.scale(sc,sc);let fs=21;ctx.font='900 '+fs+'px '+FONT;let mw=ctx.measureText(Q.say).width;if(maxW&&mw+30>maxW){fs=Math.max(13,Math.floor(fs*(maxW-28)/mw));ctx.font='900 '+fs+'px '+FONT;mw=ctx.measureText(Q.say).width;}const tw=mw+30;
  const bx=flip?-tw+6:-6;
  ctx.fillStyle='rgba(60,20,30,.25)';rr(bx+2,-17,tw,42,18);ctx.fill();
  rr(bx,-21,tw,42,18);ctx.fillStyle='#fffaf3';ctx.fill();ctx.strokeStyle='#ff8a6a';ctx.lineWidth=3;ctx.stroke();
  ctx.fillStyle='#fffaf3';ctx.beginPath();if(flip){ctx.moveTo(-4,14);ctx.lineTo(12,28);ctx.lineTo(-20,18);}else{ctx.moveTo(4,14);ctx.lineTo(-12,28);ctx.lineTo(20,18);}ctx.fill();
  text(Q.say,bx+tw/2,1,fs,'#d8402a','900');ctx.restore();}
