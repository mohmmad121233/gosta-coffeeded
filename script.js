/* ===== إعدادات المحل ===== */
const SHOP_WA = "962791976488";
const BRANCH = {lat: 32.0728, lng: 36.0879};
// جلب المنيو المحدثة من لوحة الإدارة (أو الاعتماد على المنيو الافتراضية)
let MENU = JSON.parse(localStorage.getItem("gosta_menu")) || [
  {id:1,n:"إسبريسو",p:1.5,c:"مشروبات ساخنة"},
  {id:2,n:"أمريكانو",p:2,c:"مشروبات ساخنة"},
  {id:3,n:"كابتشينو",p:2.5,c:"مشروبات ساخنة"},
  {id:4,n:"لاتيه",p:2.75,c:"مشروبات ساخنة"},
  {id:5,n:"آيس لاتيه",p:3,c:"مشروبات باردة"},
  {id:6,n:"آيس موكا",p:3.25,c:"مشروبات باردة"},
  {id:7,n:"فرابيه كراميل",p:3.5,c:"مشروبات باردة"},
  {id:8,n:"كرواسان",p:1.75,c:"حلويات"},
  {id:9,n:"براونيز",p:2,c:"حلويات"}
];

// جلب بيانات نقاط الزبون وكوده المشترك مع لوحة الإدارة
let clientData = JSON.parse(localStorage.getItem("gosta")) || {
  pts: 0,
  code: "GOS-" + Math.random().toString(36).substr(2, 5).toUpperCase(),
  orders: []
};

// حفظ البيانات المحدثة
function saveClientData() {
  localStorage.setItem("gosta", JSON.stringify(clientData));
}

const PRIZES = [{t:"5 نقاط",v:5},{t:"حظ أوفر",v:0},{t:"10 نقاط",v:10},{t:"20 نقطة",v:20},{t:"حظ أوفر",v:0},{t:"15 نقطة",v:15},{t:"50 نقطة",v:50},{t:"25 نقطة",v:25}];
const MAX_SPINS = 10, DAY = 864e5, PTS_CUP = 35, PTS_FREE = 500, PTS_INVITE = 25;

const $ = id => document.getElementById(id);
let S; try{S = JSON.parse(localStorage.getItem("gosta"))}catch(e){}
S = Object.assign({pts:0,orders:[],spins:0,last:0,friend:"",theme:null,code:"GOS-"+Math.random().toString(36).slice(2,7).toUpperCase()}, S||{});
const save = () => { try{localStorage.setItem("gosta",JSON.stringify(S))}catch(e){} };
let cart = {};



/* إخفاء شاشة البداية بعد 5 ثوانٍ بسلاسة */
window.addEventListener("load", () => {
  setTimeout(() => {
    const splash = $("splash");
    if(splash){
      splash.style.opacity = "0";
      setTimeout(() => splash.remove(), 600);
    }
  }, 5000);
});





function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}
function openWA(text){
  const a=document.createElement("a"); a.href="https://wa.me/"+SHOP_WA+"?text="+encodeURIComponent(text);
  a.target="_blank"; a.rel="noopener"; document.body.appendChild(a); a.click(); a.remove();
}




function modal(title,text,code,waText){
  $("mTitle").textContent=title;$("mText").textContent=text;
  $("mCode").style.display=code?"block":"none";$("mCode").textContent=code||"";
  $("mWa").style.display=waText?"inline-block":"none";$("mWa").onclick=()=>openWA(waText||"");
  $("modal").classList.add("on");
}




function closeM(){$("modal").classList.remove("on")}

function applyTheme(){
  const t=S.theme||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
  document.documentElement.dataset.t=t;$("theme").textContent=t==="dark"?"☀️":"🌙";
}



$("theme").onclick=()=>{S.theme=document.documentElement.dataset.t==="dark"?"light":"dark";save();applyTheme()};


function renderMenu(){
  let h="",cat="";
  MENU.forEach(m=>{
    if(m.c!==cat){cat=m.c;h+=`<div class="cat">${cat}</div>`}
    h+=`<div class="card row"><div><b>${m.n}</b><div class="price">${m.p.toFixed(2)} د.أ</div></div>
    <div class="qty"><button class="alt" onclick="chg(${m.id},-1)">−</button><span id="q${m.id}">0</span><button onclick="chg(${m.id},1)">+</button></div></div>`;
  });
  $("menuList").innerHTML=h;
}
function chg(id,d){cart[id]=Math.max(0,(cart[id]||0)+d);$("q"+id).textContent=cart[id];updCart()}
function cartTotals(){
  let n=0,tot=0,cups=0;
  MENU.forEach(m=>{const q=cart[m.id]||0;n+=q;tot+=q*m.p;if(m.c!=="حلويات")cups+=q});
  return {n,tot,cups};
}
function updCart(){
  const t=cartTotals();$("cartbar").style.display=t.n?"flex":"none";
  $("cartInfo").textContent=`${t.n} صنف — ${t.tot.toFixed(2)} د.أ`;
}
$("sendOrder").onclick=()=>{
  const t=cartTotals(); if(!t.n)return;
  const lines=MENU.filter(m=>cart[m.id]).map(m=>`• ${m.n} × ${cart[m.id]} = ${(m.p*cart[m.id]).toFixed(2)}`);
  const msg=`طلب جديد من موقع جوستا\n${lines.join("\n")}\nالمجموع: ${t.tot.toFixed(2)} د.أ\nكود الزبون: ${S.code}`+(S.friend?`\nكود الصديق: ${S.friend}`:"");
  S.orders.unshift({d:new Date().toLocaleString("ar-JO"),txt:lines.join("\n"),tot:t.tot,type:"order"});
  S.pts+=t.cups*PTS_CUP; save();
  cart={};renderMenu();updCart();renderAll();
  openWA(msg); toast(`تمت إضافة ${t.cups*PTS_CUP} نقطة`);
};

function renderPoints(){
  $("pts").textContent=S.pts;$("cups").textContent=Math.floor(S.pts/PTS_FREE);
  $("ptsBar").style.width=Math.min(100,(S.pts%PTS_FREE)/PTS_FREE*100)+"%";
  $("myCode").textContent=S.code;$("friend").value=S.friend;
}
$("copyCode").onclick=async()=>{
  try{await navigator.clipboard.writeText(S.code);toast("تم نسخ الرمز ✅")}
  catch(e){const r=document.createRange();r.selectNode($("myCode"));getSelection().removeAllRanges();getSelection().addRange(r);toast("حدد الرمز وانسخه يدوياً")}
};
$("saveFriend").onclick=()=>{
  const v=$("friend").value.trim().toUpperCase();
  if(v===S.code)return toast("ما بتقدر تستخدم كودك");
  S.friend=v;save();toast(v?"تم حفظ كود الصديق ✅":"تم المسح");
};
$("redeem").onclick=()=>{
  if(S.pts<PTS_FREE)return toast(`بتحتاج ${PTS_FREE-S.pts} نقطة كمان`);
  S.pts-=PTS_FREE;const c="FREE-"+Math.random().toString(36).slice(2,7).toUpperCase();
  S.orders.unshift({d:new Date().toLocaleString("ar-JO"),txt:"كاسة مجانية — كود: "+c,tot:0,type:"reward"});
  save();renderAll();
  modal("مبروك! كاسة مجانية ☕","اعرض هذا الكود على الكاشير:",c,`أبغى أستبدل كاسة مجانية. الكود: ${c}\nكود الزبون: ${S.code}`);
};

const cv=$("wheel"),cx=cv.getContext("2d");let rot=0;
function drawWheel(){
  const n=PRIZES.length,a=2*Math.PI/n;
  PRIZES.forEach((p,i)=>{
    cx.beginPath();cx.moveTo(260,260);cx.arc(260,260,255,i*a,(i+1)*a);
    cx.fillStyle=i%2?"#2E7D5A":"#1F5B41";cx.fill();
    cx.save();cx.translate(260,260);cx.rotate(i*a+a/2);cx.fillStyle="#F5F0E1";
    cx.font="bold 28px Cairo,Tahoma";cx.textAlign="right";cx.fillText(p.t,235,10);cx.restore();
  });
}
function spinInfo(){
  const left=MAX_SPINS-S.spins,wait=S.last+DAY-Date.now();
  let t=`اللفات المتبقية: ${left} من ${MAX_SPINS}`;
  if(left<=0){t="خلصت لفاتك";$("spin").disabled=true}
  else if(wait>0){const h=Math.floor(wait/36e5),m=Math.floor(wait%36e5/6e4),s=Math.floor(wait%6e4/1e3);
    t+=` — اللفة الجاية بعد ${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;$("spin").disabled=true}
  else $("spin").disabled=false;
  $("spinInfo").textContent=t;
}
$("spin").onclick=()=>{
  if(S.spins>=MAX_SPINS||Date.now()<S.last+DAY)return;
  $("spin").disabled=true;
  const i=Math.floor(Math.random()*PRIZES.length),a=360/PRIZES.length;
  rot+=360*5+(360-(i*a+a/2))-(rot%360);
  cv.style.transform=`rotate(${rot}deg)`;
  S.spins++;S.last=Date.now();save();
  setTimeout(()=>{
    const p=PRIZES[i];S.pts+=p.v;save();renderAll();
    p.v?modal("مبروك! 🎊","حصلت على "+p.t):modal("حظ أوفر!","جرّب مرة ثانية بعد 24 ساعة");
  },4200);
};

function renderOrders(){
  $("ordersList").innerHTML=S.orders.length?S.orders.map(o=>`<div class="card"><div class="row"><b>${o.type==="reward"?"استبدال نقاط":"طلب"}</b><small style="color:var(--mut)">${o.d}</small></div><pre style="font:inherit;white-space:pre-wrap">${o.txt}</pre>${o.tot?`<div class="price">${o.tot.toFixed(2)} د.أ</div>`:""}</div>`).join(""):`<div class="card" style="color:var(--mut)">ما في طلبات لسا. اختر من المنيو وابدأ.</div>`;
}

function dist(a,b,c,d){const R=6371,r=x=>x*Math.PI/180,dl=r(c-a),dn=r(d-b);
  const h=Math.sin(dl/2)**2+Math.cos(r(a))*Math.cos(r(c))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(h))}
$("here").onclick=()=>{
  const out=$("hereRes");
  if(!navigator.geolocation){out.textContent="متصفحك ما بيدعم تحديد الموقع، استخدم زر الخريطة.";return}
  out.textContent="جاري تحديد موقعك… وافق على طلب الإذن من المتصفح.";
  navigator.geolocation.getCurrentPosition(p=>{
    const d=dist(p.coords.latitude,p.coords.longitude,BRANCH.lat,BRANCH.lng);
    out.textContent=`أقرب فرع: الزرقاء - الأوتوستراد، على بعد ${d<1?Math.round(d*1000)+" متر":d.toFixed(1)+" كم"}`;
  },e=>{
    out.textContent=e.code===1?"الإذن مرفوض. فعّل الموقع من إعدادات المتصفح وجرّب مرة ثانية.":"ما قدرنا نحدد موقعك. تأكد إنّ الـ GPS شغّال.";
  },{enableHighAccuracy:true,timeout:15000});
};

$("jSend").onclick=()=>{
  const n=$("jName").value.trim(),p=$("jPhone").value.trim();
  if(!n||!p)return toast("اكتب الاسم ورقم الهاتف");
  openWA(`طلب توظيف\nالاسم: ${n}\nالهاتف: ${p}\nالوظيفة: ${$("jPos").value}\n(سيرتي الذاتية مرفقة بالمحادثة)`);
};

function renderAll(){renderPoints();renderOrders();spinInfo()}
applyTheme();renderMenu();drawWheel();renderAll();setInterval(spinInfo,1000);

