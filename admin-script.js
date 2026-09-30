const $ = id => document.getElementById(id);

// جلب أو تهيئة بيانات المنيو والمشتركين المشتركة مع موقع الزباين عبر الـ localStorage
let sharedMenu = JSON.parse(localStorage.getItem("gosta_menu")) || [
 {id:1,n:"إسبريسو",p:1.5,c:"مشروبات ساخنة"},{id:2,n:"أمريكانو",p:2,c:"مشروبات ساخنة"},
 {id:3,n:"كابتشينو",p:2.5,c:"مشروبات ساخنة"},{id:4,n:"لاتيه",p:2.75,c:"مشروبات ساخنة"},
 {id:5,n:"آيس لاتيه",p:3,c:"مشروبات باردة"},{id:6,n:"آيس موكا",p:3.25,c:"مشروبات باردة"},
 {id:7,n:"فرابيه كراميل",p:3.5,c:"مشروبات باردة"},{id:8,n:"كرواسان",p:1.75,c:"حلويات"},{id:9,n:"براونيز",p:2,c:"حلويات"}
];

let staffAttendance = JSON.parse(localStorage.getItem("gosta_staff")) || [];
let clientProfiles = JSON.parse(localStorage.getItem("gosta")) || {pts:0, code:"GOS-DEMO"};

function saveMenu(){ localStorage.setItem("gosta_menu", JSON.stringify(sharedMenu)); }
function saveStaff(){ localStorage.setItem("gosta_staff", JSON.stringify(staffAttendance)); }

function toast(t){const e=$("toast");e.textContent=t;e.classList.add("on");setTimeout(()=>e.classList.remove("on"),2200)}

// عرض المنيو للإدارة مع خيار الحذف أو التعديل
function renderAdminMenu(){
  let h = "";
  sharedMenu.forEach(m => {
    h += `<div class="row card" style="margin-bottom:6px;padding:8px">
      <div><b>${m.n}</b> (${m.c}) — <span style="color:var(--g)">${m.p.toFixed(2)} د.أ</span></div>
      <button class="alt" style="padding:4px 10px;color:red;border-color:red" onclick="deleteItem(${m.id})">حذف</button>
    </div>`;
  });
  $("adminMenuList").innerHTML = h || "<p style='color:var(--mut)'>لا توجد أصناف حالياً.</p>";
  $("totalOrders").textContent = (JSON.parse(localStorage.getItem("gosta"))?.orders || []).length;
}

window.deleteItem = function(id){
  sharedMenu = sharedMenu.filter(m => m.id !== id);
  saveMenu();
  renderAdminMenu();
  toast("تم حذف الصنف بنجاح ✅");
};

$("addItmBtn").onclick = () => {
  const name = $("newItmName").value.trim();
  const price = parseFloat($("newItmPrice").value);
  const cat = $("newItmCat").value;
  if(!name || isNaN(price)) return toast("الرجاء إدخال اسم الصنف والسعر بشكل صحيح");
  
  const newId = sharedMenu.length ? Math.max(...sharedMenu.map(m=>m.id)) + 1 : 1;
  sharedMenu.push({id: newId, n: name, p: price, c: cat});
  saveMenu();
  renderAdminMenu();
  $("newItmName").value = "";
  $("newItmPrice").value = "";
  toast("تمت إضافة الصنف الجديد وتحديث موقع الزباين بنجاح 🚀");
};

// إدارة نقاط الزباين (إضافة أو سحب)
$("addPtsBtn").onclick = () => modifyPoints(true);
$("subPtsBtn").onclick = () => modifyPoints(false);

function modifyPoints(isAdd){
  const code = $("targetCode").value.trim().toUpperCase();
  const ptsVal = parseInt($("targetPoints").value);
  if(!code || isNaN(ptsVal)) return toast("أدخل كود الزبون وعدد النقاط بشكل صحيح");

  // ملاحظة: بما أن التطبيق المحلي يحفظ بيانات الزبون الحالي، نقوم بفحص وتعديل البيانات المخزنة
  let clientData = JSON.parse(localStorage.getItem("gosta"));
  if(!clientData) return toast("لا يوجد بيانات مسجلة لهذا الزبون");

  if(isAdd){
    clientData.pts += ptsVal;
    toast(`تمت إضافة ${ptsVal} نقطة للزبون بنجاح ✅`);
  } else {
    clientData.pts = Math.max(0, clientData.pts - ptsVal);
    toast(`تم سحب ${ptsVal} نقطة من الزبون ✅`);
  }
  
  localStorage.setItem("gosta", JSON.stringify(clientData));
  $("clientInfoResult").textContent = `رصيد الزبون الحالي (${code}): ${clientData.pts} نقطة`;
}

// إدارة الدوام والمهام للموظفين
$("checkInBtn").onclick = () => {
  const name = $("stName").value.trim();
  if(!name) return toast("اكتب اسم الموظف");
  staffAttendance.unshift({name, time: new Date().toLocaleTimeString("ar-JO")});
  saveStaff();
  renderStaff();
  $("stName").value = "";
  toast("تم تسجيل حضور الموظف بنجاح ✅");
};

function renderStaff(){
  $("totalStaffCount").textContent = staffAttendance.length;
  $("staffList").innerHTML = staffAttendance.length ? staffAttendance.map(s=>`
    <div class="row" style="padding:6px 0;border-bottom:1px solid var(--line)">
      <span>👤 <b>${s.name}</b></span>
      <span style="color:var(--mut);font-size:.85rem">سجل حضور الساعة: ${s.time}</span>
    </div>
  `).join("") : "<p style='color:var(--mut)'>لا يوجد موظفين مسجلين حضور حالياً.</p>";
}

renderAdminMenu();
renderStaff();