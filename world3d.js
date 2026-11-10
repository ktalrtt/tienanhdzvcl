/* Không gian thiên hà 2D: không phòng, không sàn/trần, không cổng 3D. */
(() => {
 const $=id=>document.getElementById(id), stage=$('worldStage'); if(!stage)return;
 const fallback=[
  {title:'Album ảnh',description:'Những khung hình thanh xuân',url:'pages/album.html',icon:'▧'},
  {title:'Thành viên',description:'Những gương mặt thân quen',url:'pages/members.html',icon:'✦'},
  {title:'Video thanh xuân',description:'Chuyển động của ngày xưa',url:'pages/videos.html',icon:'▶'},
  {title:'Kỷ niệm',description:'Chuyện nhỏ không thể quên',url:'pages/memories.html',icon:'✧'},
  {title:'Lời nhắn',description:'Điều muốn nói với nhau',url:'pages/messages.html',icon:'♡'},
  {title:'Hành trình lớp',description:'Từ ngày đầu đến hôm nay',url:'pages/journey.html',icon:'⌁'}
 ];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const cfg=()=>window.getYearbookConfig?window.getYearbookConfig():{};
 const base=()=>new URL('.',document.querySelector('script[src$="world3d.js"]')?.src||location.href);
 function href(v){if(!v||v==='#')return '#';if(/^(https?:|mailto:|tel:)/i.test(v))return v;return new URL(String(v).replace(/^\/+/,''),base()).href;}
 function render(){
  const c=cfg(),items=Array.isArray(c.worldItems)&&c.worldItems.length?c.worldItems:fallback;
  $('worldTitle').textContent=c.worldTitle||'Ngân hà kỷ niệm';
  stage.innerHTML='';
  stage.classList.add('galaxy-stage');
  const stars=document.createElement('div');stars.className='cosmic-stars';stars.setAttribute('aria-hidden','true');
  for(let i=0;i<240;i++){const s=document.createElement('i');s.style.left=Math.random()*100+'%';s.style.top=Math.random()*100+'%';s.style.setProperty('--d',(1+Math.random()*3)+'s');s.style.setProperty('--o',(.25+Math.random()*.75));stars.append(s);}
  stage.append(stars);
  const neb=document.createElement('div');neb.className='cosmic-nebula nebula-a';stage.append(neb);
  const neb2=document.createElement('div');neb2.className='cosmic-nebula nebula-b';stage.append(neb2);
  const galaxy=document.createElement('div');galaxy.className='memory-galaxy';
  galaxy.innerHTML='<div class="spiral-arm arm-a"></div><div class="spiral-arm arm-b"></div><div class="spiral-arm arm-c"></div><div class="galaxy-glow"></div><div class="galaxy-nucleus"></div><div class="particle-heart" aria-label="Trái tim ký ức"></div><div class="galaxy-label">OUR MEMORIES · OUR UNIVERSE</div>';
  stage.append(galaxy);
  // Hàng trăm hạt tạo hình trái tim.
  const heart=galaxy.querySelector('.particle-heart');
  for(let i=0;i<520;i++){const t=Math.random()*Math.PI*2, r=Math.sqrt(Math.random());const x=16*Math.pow(Math.sin(t),3), y=-(13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t));const p=document.createElement('i');p.style.left=(50+x*r*2.0)+'%';p.style.top=(50+y*r*2.0)+'%';p.style.setProperty('--tw',(.7+Math.random()*2)+'s');p.style.setProperty('--op',(.35+Math.random()*.65));heart.append(p);}
  // Chòm sao ký ức.
  const constellation=document.createElement('div');constellation.className='constellation-layer';
  const patterns=[[[8,24],[15,18],[22,25],[18,34]],[[75,17],[83,12],[90,21],[84,30]],[[9,76],[17,69],[24,78],[19,87]],[[76,75],[84,68],[92,77],[86,88]]];
  patterns.forEach((pts,n)=>{const group=document.createElement('div');group.className='constellation constellation-'+n;pts.forEach((pt,i)=>{const dot=document.createElement('i');dot.style.left=pt[0]+'%';dot.style.top=pt[1]+'%';group.append(dot);if(i){const prev=pts[i-1],line=document.createElement('b');const dx=pt[0]-prev[0],dy=pt[1]-prev[1];line.style.left=prev[0]+'%';line.style.top=prev[1]+'%';line.style.width=Math.hypot(dx,dy)+'%';line.style.transform='rotate('+Math.atan2(dy,dx)+'rad)';group.append(line);}});const label=document.createElement('small');label.textContent=['FIRST DAYS','OUR FRIENDS','BEST MOMENTS','FOREVER'][n];group.append(label);constellation.append(group);});
  stage.append(constellation);
  const positions=[[7,43], [25,13], [70,12], [86,43], [70,79], [25,82], [4,66], [91,66]];
  items.forEach((it,i)=>{const a=document.createElement('a');a.className='memory-photo memory-photo-'+(i%8);a.href=href(it.url);const pos=positions[i%positions.length];a.style.left=pos[0]+'%';a.style.top=pos[1]+'%';const img=it.image||it.photo||'';a.innerHTML=(img?'<img src="'+esc(img)+'" alt="'+esc(it.title||'Ảnh kỷ niệm')+'">':'<span class="memory-placeholder">'+esc(it.icon||'✦')+'</span>')+'<span class="memory-photo-caption">'+esc(it.title||'Kỷ niệm')+'</span>';a.addEventListener('click',e=>{if(a.getAttribute('href')==='#')e.preventDefault();});stage.append(a);});
  const hint=document.createElement('div');hint.className='galaxy-hint';hint.textContent='CHẠM VÀO ẢNH ĐỂ MỞ KỶ NIỆM';stage.append(hint);
  update();
 }
 let zoom=1;
 function update(){const g=stage.querySelector('.memory-galaxy');if(g)g.style.setProperty('--zoom',zoom);const z=$('worldZoomValue');if(z)z.textContent=Math.round(zoom*100)+'%';const r=$('worldZoomRange');if(r)r.value=String(Math.round(zoom*100));}
 $('worldZoomIn')?.addEventListener('click',()=>{zoom=Math.min(1.35,zoom+.08);update()});
 $('worldZoomOut')?.addEventListener('click',()=>{zoom=Math.max(.78,zoom-.08);update()});
 $('worldZoomRange')?.addEventListener('input',e=>{zoom=Math.max(.78,Math.min(1.35,Number(e.target.value)/100));update()});
 $('worldReset')?.addEventListener('click',()=>{zoom=1;update()});
 $('worldLeft')?.addEventListener('click',()=>{stage.classList.toggle('reverse-spin')});
 $('worldRight')?.addEventListener('click',()=>{stage.classList.toggle('reverse-spin')});
 stage.addEventListener('wheel',e=>{e.preventDefault();zoom=Math.max(.78,Math.min(1.35,zoom+(e.deltaY<0?.05:-.05)));update()},{passive:false});
 window.renderWorld3D=render;window.addEventListener('resize',update);window.addEventListener('kyyeu-config-ready',render);
})();
