"use strict";
// ================= 通用工具（全局，供各脚本共享）=================
const FONT='"PingFang SC","Hiragino Sans GB","Microsoft YaHei","Noto Sans CJK SC","Noto Sans SC","Source Han Sans SC","WenQuanYi Micro Hei",sans-serif';
const TAU=Math.PI*2;
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v,lerp=(a,b,t)=>a+(b-a)*t;
const $=id=>document.getElementById(id);
const easeOutBack=x=>{const c1=1.70158,c3=c1+1;return 1+c3*Math.pow(x-1,3)+c1*Math.pow(x-1,2);};
const easeOutCubic=x=>1-Math.pow(1-x,3);
const smooth=x=>x*x*(3-2*x);
function easeOutBounce(x){const n=7.5625,d=2.75;if(x<1/d)return n*x*x;if(x<2/d)return n*(x-=1.5/d)*x+0.75;if(x<2.5/d)return n*(x-=2.25/d)*x+0.9375;return n*(x-=2.625/d)*x+0.984375;}
function mix(c1,c2,t){const a=parseInt(c1.slice(1),16),b=parseInt(c2.slice(1),16);t=clamp(t,0,1);
  const r=Math.round(lerp(a>>16,b>>16,t)),g=Math.round(lerp(a>>8&255,b>>8&255,t)),bl=Math.round(lerp(a&255,b&255,t));return '#'+((1<<24)|(r<<16)|(g<<8)|bl).toString(16).slice(1);}
// 当前绘制上下文（会被临时切换到衣橱卡片 / 头像等小画布）
let ctx=null;
function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath();}
function ell(x,y,rx,ry){ctx.beginPath();ctx.ellipse(x,y,Math.max(0.1,rx),Math.max(0.1,ry),0,0,TAU);}
function text(t,x,y,size,col,weight,align,stroke,strokeCol){ctx.font=(weight||'bold')+' '+size+'px '+FONT;ctx.textAlign=align||'center';ctx.textBaseline='middle';
  if(stroke){ctx.lineWidth=stroke;ctx.strokeStyle=strokeCol||'rgba(70,30,30,0.9)';ctx.lineJoin='round';ctx.strokeText(t,x,y);}ctx.fillStyle=col;ctx.fillText(t,x,y);}
function vgrad(a,b,y0,y1){const g=ctx.createLinearGradient(0,y0==null?-96:y0,0,y1==null?0:y1);g.addColorStop(0,a);g.addColorStop(1,b);return g;}
function flower5(x,y,r,col,mid){ctx.fillStyle=col;for(let i=0;i<5;i++){const a=i*1.2566-1.57;ell(x+Math.cos(a)*r,y+Math.sin(a)*r,r*0.75,r*0.75);ctx.fill();}ctx.fillStyle=mid||'#ffd23f';ell(x,y,r*0.6,r*0.6);ctx.fill();}
function star5(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();for(let q=0;q<10;q++){const rr2=q%2?r*0.45:r,an=q*Math.PI/5-Math.PI/2;ctx.lineTo(x+Math.cos(an)*rr2,y+Math.sin(an)*rr2);}ctx.closePath();ctx.fill();}
function sparkle4(x,y,r,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y-r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.quadraticCurveTo(x,y,x,y+r);ctx.quadraticCurveTo(x,y,x-r,y);ctx.quadraticCurveTo(x,y,x,y-r);ctx.fill();}
function heart(x,y,s,col){ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(x,y+s*0.35);ctx.bezierCurveTo(x-s*1.1,y-s*0.35,x-s*0.45,y-s*1.05,x,y-s*0.45);ctx.bezierCurveTo(x+s*0.45,y-s*1.05,x+s*1.1,y-s*0.35,x,y+s*0.35);ctx.fill();}
// 芙蓉花（成都市花）
function furong(x,y,r,col,mid){ctx.save();ctx.translate(x,y);for(let i=0;i<5;i++){ctx.rotate(TAU/5);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,0);ctx.bezierCurveTo(-r*0.7,-r*0.4,-r*0.6,-r*1.15,0,-r);ctx.bezierCurveTo(r*0.6,-r*1.15,r*0.7,-r*0.4,0,0);ctx.fill();}
  ctx.fillStyle=mid||'#ffd23f';ell(0,0,r*0.28,r*0.28);ctx.fill();ctx.restore();}
