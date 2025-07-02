
// ============ إعداد الـ Canvas ============
const canvas = document.getElementById("c");
const ctx     = canvas.getContext("2d");
function resize(){ canvas.width = innerWidth; canvas.height = innerHeight; }
resize(); addEventListener("resize", resize);

// ============ خصائص النص =============
ctx.font = "32px Arial";
ctx.textAlign = "center";
ctx.textBaseline = "middle";

const TEXT   = ["HAPPY","BIRTHDAY!","to You"];
const SPACE  = 48,  LINE_H = 70;
const TIMING = { intro: 2000, effects: 4000 };      // ms

// ============ حاويات الكائنات ============
let letters = [], sparkles = [], bubbles = [];
let phase = 0, start = performance.now(), last = start;

// ============ فئات الرسوم ============
class Letter{
  constructor(ch,x,y){
    this.init(ch,x,y);
  }
  init(ch,x,y){                         // يعيد الحرف إلى وضع البداية
    this.ch=ch; this.homeX=x; this.homeY=y;
    this.x=x;  this.y=canvas.height+100+Math.random()*100;
    this.vy = 1+Math.random()*1.5;
    this.vx = (Math.random()-.5)*0.6;
    this.color=`hsl(${Math.random()*360},100%,70%)`;
    this.rising=false;
  }
  update(){
    if(this.rising){ this.y-=this.vy; this.x+=this.vx; }
  }
  draw(){
    if(this.rising){            // balloon + string
      ctx.strokeStyle=this.color;
      ctx.beginPath(); ctx.moveTo(this.x,this.y-42); ctx.lineTo(this.x,this.y); ctx.stroke();
      ctx.fillStyle=this.color;
      ctx.beginPath(); ctx.ellipse(this.x,this.y-52,16,22,0,0,2*Math.PI); ctx.fill();
    }
    ctx.fillStyle="#fff";
    ctx.fillText(this.ch, this.rising? this.x:this.homeX, this.rising? this.y:this.homeY);
  }
}
class Spark{
  constructor(){
    this.x=Math.random()*canvas.width;
    this.y=Math.random()*canvas.height;
    this.life=300+Math.random()*300;
    this.size=2+Math.random()*2;
  }
  update(dt){ this.life-=dt; }
  draw(){ ctx.fillStyle="#ffd966"; ctx.fillRect(this.x,this.y,this.size,this.size); }
}
class Bubble{
  constructor(){
    this.x=Math.random()*canvas.width;
    this.y=Math.random()*canvas.height;
    this.r=8+Math.random()*8; this.vy=0.15+Math.random()*0.3;
    this.a=0.4+Math.random()*0.3;
  }
  update(){ this.y-=this.vy; if(this.y<-this.r) this.y=canvas.height+this.r; }
  draw(){ ctx.strokeStyle=`rgba(255,255,255,${this.a})`; ctx.beginPath(); ctx.arc(this.x,this.y,this.r,0,2*Math.PI); ctx.stroke(); }
}

// ============ التحضير & إعادة الضبط ============
function prepareLetters(){
  letters.length=0;                  // تُفرِّغ المصفوفة
  const cx = canvas.width/2, cy = canvas.height/2;
  TEXT.forEach((ln,li)=>{
    const y = cy + (li-1)*LINE_H;
    const startX = cx - (ln.length*SPACE)/2;
    [...ln].forEach((ch,i)=>{
      letters.push(new Letter(ch, startX+i*SPACE, y));
    });
  });
}
prepareLetters();

// ============ الحلقة الرئيسية ============
function loop(now=performance.now()){
  const dt = now - last; last = now;
  const t  = now - start;

  // ---- تبديل المراحل ----
  const newPhase = t < TIMING.intro                 ? 0 :
                   t < TIMING.intro+TIMING.effects  ? 1 : 2;
  if(newPhase !== phase){
    phase = newPhase;
    if(phase===2){ letters.forEach(l=>l.rising=true); }
  }

  // ---- تحديث الكائنات ----
  if(phase===1){
    if(Math.random()<0.3) sparkles.push(new Spark());
    if(Math.random()<0.05) bubbles.push(new Bubble());
  }
  letters.forEach(l=>l.update());
  sparkles.forEach(s=>s.update(dt));
  bubbles.forEach(b=>b.update());

  // ---- رسم ----
  ctx.clearRect(0,0,canvas.width,canvas.height);
  letters.forEach(l=>l.draw());
  if(phase===1){
    sparkles.forEach(s=>s.draw());
    bubbles.forEach(b=>b.draw());
  }

  // ---- تنظيف الشرارات المنتهية ----
  sparkles = sparkles.filter(s=>s.life>0);

  // ---- إعادة التشغيل عند انتهاء البلالين ----
  const allGone = phase===2 && letters.every(l=>l.y < -60);
  if(allGone){
    sparkles.length = bubbles.length = 0;   // تفريغ المؤثّرات
    prepareLetters();                       // إعادة الحروف إلى البداية
    start = now; phase = 0;                 // إعادة العداد الزمني
  }

  requestAnimationFrame(loop);
}
loop();
