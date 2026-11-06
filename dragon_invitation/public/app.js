const $ = (s) => document.querySelector(s);
const views = ["#loginView", "#adminView", "#guestView"];
const api = async (url, options={}) => {
  const res = await fetch(url, { credentials:"same-origin", headers:{"Content-Type":"application/json", ...(options.headers||{})}, ...options });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra.");
  return data;
};
function showView(id) { views.forEach(v => $(v).classList.add("hidden")); $(id).classList.remove("hidden"); }
function makeEmbers() {
  const host=$("#embers");
  for(let i=0;i<42;i++){const e=document.createElement("i");e.className="ember";e.style.left=Math.random()*100+"%";e.style.animationDuration=(6+Math.random()*12)+"s";e.style.animationDelay=(-Math.random()*15)+"s";e.style.opacity=(.2+Math.random()*.7);e.style.transform=`scale(${.5+Math.random()*1.8})`;host.appendChild(e);}
}
makeEmbers();

async function boot() {
  try {
    const me=await api("/api/me");
    if(!me.loggedIn) return showView("#loginView");
    if(me.isAdmin){showView("#adminView");await loadAdmin();}
    else {showView("#guestView");await loadInvitation();}
  } catch { showView("#loginView"); }
}
$("#loginForm").addEventListener("submit",async e=>{
  e.preventDefault();$("#loginError").textContent="";
  const fd=new FormData(e.currentTarget);
  try{
    const data=await api("/api/login",{method:"POST",body:JSON.stringify({username:fd.get("username"),password:fd.get("password")})});
    e.currentTarget.reset();
    if(data.isAdmin){showView("#adminView");await loadAdmin();}
    else{showView("#guestView");await loadInvitation();}
  }catch(err){$("#loginError").textContent=err.message;}
});
document.querySelectorAll(".logout").forEach(b=>b.addEventListener("click",async()=>{await api("/api/logout",{method:"POST",body:"{}"});location.reload();}));

async function loadAdmin(){
  await Promise.all([loadUsers(),loadSettings()]);
}
async function loadUsers(){
  const users=await api("/api/admin/users");
  const host=$("#userList");host.replaceChildren();
  if(!users.length){host.textContent="Chưa có tài khoản khách mời.";return;}
  users.forEach(u=>{
    const row=document.createElement("div");row.className="user-row";
    const info=document.createElement("div");
    const name=document.createElement("strong");name.textContent=u.displayName+(u.active?"":" · ĐÃ KHÓA");
    const meta=document.createElement("small");meta.textContent="@"+u.username;
    info.append(name,meta);
    const actions=document.createElement("div");actions.className="user-actions";
    const toggle=document.createElement("button");toggle.className="ghost-btn";toggle.textContent=u.active?"Khóa":"Mở khóa";
    toggle.addEventListener("click",async()=>{await api(`/api/admin/users/${u.id}`,{method:"PATCH",body:JSON.stringify({active:!u.active})});loadUsers();});
    const del=document.createElement("button");del.className="ghost-btn";del.textContent="Xóa";
    del.addEventListener("click",async()=>{if(confirm(`Xóa tài khoản @${u.username}?`)){await api(`/api/admin/users/${u.id}`,{method:"DELETE"});loadUsers();}});
    actions.append(toggle,del);row.append(info,actions);host.append(row);
  });
}
$("#createUserForm").addEventListener("submit",async e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);const msg=$("#createMessage");msg.textContent="";
  try{
    const data=await api("/api/admin/users",{method:"POST",body:JSON.stringify({username:fd.get("username"),password:fd.get("password"),displayName:fd.get("displayName")})});
    msg.textContent=`Đã tạo tài khoản @${data.user.username} cho ${data.user.displayName}. Hãy gửi mật khẩu riêng cho người đó.`;
    e.currentTarget.reset();await loadUsers();
  }catch(err){msg.textContent=err.message;}
});
async function loadSettings(){
  const data=await api("/api/invitation");const form=$("#settingsForm");
  Object.entries(data.settings).forEach(([k,v])=>{if(form.elements[k])form.elements[k].value=v;});
}
$("#settingsForm").addEventListener("submit",async e=>{
  e.preventDefault();const fd=new FormData(e.currentTarget);const body=Object.fromEntries(fd.entries());
  try{await api("/api/admin/settings",{method:"PUT",body:JSON.stringify(body)});$("#settingsMessage").textContent="Đã lưu nội dung thư mời.";}
  catch(err){$("#settingsMessage").textContent=err.message;}
});

let invitationData=null;
async function loadInvitation(){
  invitationData=await api("/api/invitation");
  $("#guestName").textContent=invitationData.guestName;
  const s=invitationData.settings;
  $("#inviteTitle").textContent=s.title||"THƯ MỜI KỶ YẾU";
  $("#inviteSubtitle").textContent=s.subtitle||"";
  $("#inviteBody").textContent=s.body||"";
  $("#inviteDate").textContent=s.date||"";
  $("#inviteLocation").textContent=s.location||"";
  $("#inviteClosing").textContent=s.closing||"";
}
$("#igniteBtn").addEventListener("click",()=>{
  $("#igniteBtn").disabled=true;
  $("#fireFlash").classList.add("blast");
  setTimeout(()=>{
    $("#intro").classList.add("hidden");
    $("#letter").classList.remove("hidden");
    $("#fireFlash").classList.remove("blast");
    window.scrollTo({top:0,behavior:"smooth"});
  },1150);
});
boot();