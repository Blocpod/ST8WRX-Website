document.documentElement.classList.add('js');
const glow=document.getElementById('glow');
if(glow && window.matchMedia && matchMedia('(pointer:fine)').matches){addEventListener('pointermove',e=>{glow.style.transform=`translate(${e.clientX-260}px,${e.clientY-260}px)`},{passive:true});}
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.10,rootMargin:'0px 0px -4% 0px'});reveals.forEach(el=>io.observe(el));}else{reveals.forEach(el=>el.classList.add('on'));}
const menuButton=document.getElementById('menuButton'),mobileMenu=document.getElementById('mobileMenu');
function setMenu(open){if(!menuButton||!mobileMenu)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'CLOSE':'MENU';mobileMenu.classList.toggle('open',open);mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open);}
if(menuButton&&mobileMenu){menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});addEventListener('resize',()=>{if(innerWidth>1100)setMenu(false)},{passive:true});}

// ST8WRX V4 HERO — native Canvas state field. Code-driven motion only; no artwork assets.
(() => {
  const canvas=document.getElementById('heroField');
  if(!canvas) return;
  if(window.matchMedia&&matchMedia('(max-width:640px)').matches) return;
  const ctx=canvas.getContext('2d');
  if(!ctx) return;
  const reduce=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  let w=1,h=1,dpr=1,raf=0,visible=true,last=0,start=performance.now(),mx=0,my=0;
  const nodes=[[-.31,-.23],[.28,-.27],[-.34,.21],[.31,.18],[.02,.34],[.01,.0]];
  const links=[[0,5],[1,5],[2,5],[3,5],[4,5],[0,2],[1,3]];
  function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);}
  function P(n){const scale=Math.min(w,h)*.82;return{x:w*.52+n[0]*scale+mx*10,y:h*.50+n[1]*scale+my*8};}
  function line(a,b,alpha=.16,width=1){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(255,145,14,${alpha})`;ctx.lineWidth=width;ctx.stroke();}
  function dot(p,r,alpha=1){ctx.save();ctx.shadowColor='rgba(255,138,0,.75)';ctx.shadowBlur=18;ctx.beginPath();ctx.arc(p.x,p.y,r,0,Math.PI*2);ctx.fillStyle=`rgba(255,161,30,${alpha})`;ctx.fill();ctx.restore();}
  function draw(now){
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080806';ctx.fillRect(0,0,w,h);
    const cx=w*.52+mx*10,cy=h*.50+my*8,fade=Math.min(w,h)*.72;
    ctx.save();
    const grad=ctx.createRadialGradient(cx,cy,0,cx,cy,fade);grad.addColorStop(0,'rgba(255,138,0,.045)');grad.addColorStop(.48,'rgba(255,138,0,.015)');grad.addColorStop(1,'rgba(255,138,0,0)');ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);
    const step=Math.max(54,Math.min(w,h)/10);ctx.lineWidth=.6;
    for(let x=(cx%step)-step;x<w+step;x+=step){const a=Math.max(0,1-Math.abs(x-cx)/fade)*.055;ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.strokeStyle=`rgba(255,153,21,${a})`;ctx.stroke();}
    for(let y=(cy%step)-step;y<h+step;y+=step){const a=Math.max(0,1-Math.abs(y-cy)/fade)*.055;ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.strokeStyle=`rgba(255,153,21,${a})`;ctx.stroke();}
    ctx.restore();
    links.forEach(([a,b],i)=>line(P(nodes[a]),P(nodes[b]),i<5?.16:.08,.85));
    const center=P(nodes[5]);
    for(const rr of [.17,.36]){ctx.beginPath();ctx.arc(center.x,center.y,Math.min(w,h)*rr*(1+(reduce?0:.012*Math.sin(now*.00055+rr*9))),0,Math.PI*2);ctx.strokeStyle='rgba(255,151,18,.10)';ctx.lineWidth=.8;ctx.stroke();}
    nodes.forEach((n,i)=>{const p=P(n);const pulse=reduce?1:.82+.18*Math.sin(now*.002+i*1.6);ctx.beginPath();ctx.arc(p.x,p.y,7*pulse,0,Math.PI*2);ctx.strokeStyle='rgba(255,151,18,.16)';ctx.lineWidth=.7;ctx.stroke();dot(p,2.1*pulse,.9);});
    const duration=reduce?0:now-start;
    [[0,5,0],[5,3,.34],[2,5,.66]].forEach(([a,b,offset],i)=>{const A=P(nodes[a]),B=P(nodes[b]);const t=reduce?.58:((duration*.000085+offset)%1);const p={x:A.x+(B.x-A.x)*t,y:A.y+(B.y-A.y)*t};dot(p,1.65,.92-i*.08);});
    ctx.strokeStyle='rgba(240,215,162,.16)';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(center.x-15,center.y);ctx.lineTo(center.x+15,center.y);ctx.moveTo(center.x,center.y-15);ctx.lineTo(center.x,center.y+15);ctx.stroke();
  }
  function loop(now){if(now-last>32){last=now;draw(now)}if(!reduce&&visible&&!document.hidden)raf=requestAnimationFrame(loop);else raf=0;}
  resize();draw(performance.now());
  if('ResizeObserver'in window)new ResizeObserver(()=>{resize();draw(performance.now())}).observe(canvas);else addEventListener('resize',()=>{resize();draw(performance.now())},{passive:true});
  if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=!!e[0]&&e[0].isIntersecting;if(visible&&!raf&&!reduce)raf=requestAnimationFrame(loop);},{rootMargin:'150px 0px'}).observe(canvas);
  const host=canvas.parentElement;if(host&&window.matchMedia&&matchMedia('(pointer:fine)').matches){host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();mx=(e.clientX-r.left)/r.width-.5;my=(e.clientY-r.top)/r.height-.5},{passive:true});host.addEventListener('pointerleave',()=>{mx=0;my=0},{passive:true});}
  if(!reduce)raf=requestAnimationFrame(loop);
  addEventListener('visibilitychange',()=>{if(!document.hidden&&!raf&&visible&&!reduce)raf=requestAnimationFrame(loop)});
})();

(() => {
  const canvas = document.getElementById('worldGlobe');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const coastlines=(()=>{const s='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','bin=atob(s),a=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);let p=0;const u=()=>{let n=0,sh=0,b;do{b=a[p++];n|=(b&127)<<sh;sh+=7}while(b&128);return n>>>0},z=n=>(n>>>1)^-(n&1),rings=[],nr=u();for(let r=0;r<nr;r++){const len=u(),ring=[];let lo=0,la=0;for(let i=0;i<len;i++){lo+=z(u());la+=z(u());ring.push([lo/1000,la/1000])}rings.push(ring)}return rings})();
  const nodes = [
    {name:'Miami',lat:25.7617,lon:-80.1918},
    {name:'San Francisco',lat:37.7749,lon:-122.4194},
    {name:'New York',lat:40.7128,lon:-74.0060},
    {name:'London',lat:51.5074,lon:-0.1278},
    {name:'Dubai',lat:25.2048,lon:55.2708},
    {name:'Singapore',lat:1.3521,lon:103.8198},
    {name:'Tokyo',lat:35.6762,lon:139.6503},
    {name:'Sydney',lat:-33.8688,lon:151.2093},
    {name:'São Paulo',lat:-23.5505,lon:-46.6333},
    {name:'Johannesburg',lat:-26.2041,lon:28.0473}
  ];
  const routes = [[0,1],[0,2],[2,3],[3,4],[4,5],[5,6],[6,7],[0,8],[3,9],[9,4]];
  const reduceMotion = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  let globeVisible = true;
  let lastFrame = 0;
  let w=0,h=0,dpr=1,cx=0,cy=0,R=0,raf=0,start=performance.now();
  const rad=d=>d*Math.PI/180;

  function resize() {
    const r=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2);
    w=Math.max(1,r.width); h=Math.max(1,r.height);
    canvas.width=Math.round(w*dpr); canvas.height=Math.round(h*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
    cx=w*.54; cy=h*.50; R=Math.min(w,h)*.355;
  }
  if('ResizeObserver' in window){new ResizeObserver(resize).observe(canvas);}else{addEventListener('resize',resize,{passive:true});}
  resize();

  function project(latDeg,lonDeg,lon0,lat0=rad(13)) {
    const lat=rad(latDeg), dlon=rad(lonDeg)-lon0;
    const sl=Math.sin(lat), cl=Math.cos(lat), s0=Math.sin(lat0), c0=Math.cos(lat0);
    const vis=s0*sl+c0*cl*Math.cos(dlon);
    return {x:cx+R*cl*Math.sin(dlon),y:cy-R*(c0*sl-s0*cl*Math.cos(dlon)),vis};
  }
  function sphereVec(lat,lon) { const p=rad(lat),l=rad(lon),c=Math.cos(p); return [c*Math.cos(l),c*Math.sin(l),Math.sin(p)]; }
  function slerp(a,b,t) {
    const va=sphereVec(a.lat,a.lon), vb=sphereVec(b.lat,b.lon);
    let dot=Math.max(-1,Math.min(1,va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2]));
    const om=Math.acos(dot), so=Math.sin(om); let v;
    if(so<1e-5) v=va; else { const A=Math.sin((1-t)*om)/so,B=Math.sin(t*om)/so; v=[A*va[0]+B*vb[0],A*va[1]+B*vb[1],A*va[2]+B*vb[2]]; }
    const m=Math.hypot(...v); v=v.map(n=>n/m);
    return {lat:Math.asin(v[2])*180/Math.PI,lon:Math.atan2(v[1],v[0])*180/Math.PI};
  }
  function strokeGeo(points,lon0,width,alpha,color='255,162,28') {
    ctx.beginPath(); let pen=false;
    for(const [lon,lat] of points) { const p=project(lat,lon,lon0); if(p.vis>0) { if(!pen){ctx.moveTo(p.x,p.y);pen=true} else ctx.lineTo(p.x,p.y); } else pen=false; }
    ctx.strokeStyle=`rgba(${color},${alpha})`; ctx.lineWidth=width; ctx.stroke();
  }
  function drawGrid(lon0) {
    ctx.save(); ctx.lineWidth=.7;
    for(let lat=-60;lat<=60;lat+=20) { const pts=[]; for(let lon=-180;lon<=180;lon+=3) pts.push([lon,lat]); strokeGeo(pts,lon0,.65,.12,'240,215,162'); }
    for(let lon=-180;lon<180;lon+=20) { const pts=[]; for(let lat=-89;lat<=89;lat+=2.5) pts.push([lon,lat]); strokeGeo(pts,lon0,.65,.10,'240,215,162'); }
    ctx.restore();
  }
  function drawCoasts(lon0) { for(const ring of coastlines) strokeGeo(ring,lon0,.9,.50,'255,153,18'); }
  function drawRoutes(lon0,time) {
    routes.forEach((pair,idx)=>{ const a=nodes[pair[0]],b=nodes[pair[1]]; const pts=[]; for(let i=0;i<=56;i++){const q=slerp(a,b,i/56);pts.push([q.lon,q.lat]);} strokeGeo(pts,lon0,.8,.17,'255,176,54');
      const t=reduceMotion?.55:((time*.000045+idx*.137)%1); const q=slerp(a,b,t), p=project(q.lat,q.lon,lon0); if(p.vis>0){ctx.beginPath();ctx.arc(p.x,p.y,2.1,0,Math.PI*2);ctx.fillStyle='rgba(255,190,82,.95)';ctx.shadowColor='rgba(255,138,0,.85)';ctx.shadowBlur=12;ctx.fill();ctx.shadowBlur=0;}
    });
  }
  function drawNodes(lon0,time) {
    nodes.forEach((n,i)=>{ const p=project(n.lat,n.lon,lon0); if(p.vis<=0)return; const pulse=reduceMotion?1:(.78+.22*Math.sin(time*.002+i)); ctx.beginPath();ctx.arc(p.x,p.y,2.2*pulse,0,Math.PI*2);ctx.fillStyle='rgba(255,157,25,.95)';ctx.shadowColor='rgba(255,138,0,.9)';ctx.shadowBlur=14;ctx.fill();ctx.shadowBlur=0;ctx.beginPath();ctx.arc(p.x,p.y,6.5*pulse,0,Math.PI*2);ctx.strokeStyle='rgba(255,157,25,.22)';ctx.lineWidth=.7;ctx.stroke(); });
  }
  function draw(time) {
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#080806';ctx.fillRect(0,0,w,h);
    const glow=ctx.createRadialGradient(cx,cy,R*.18,cx,cy,R*1.22); glow.addColorStop(0,'rgba(255,138,0,.085)');glow.addColorStop(.55,'rgba(255,138,0,.025)');glow.addColorStop(1,'rgba(255,138,0,0)');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
    const lon0=rad(reduceMotion?-35:(-35+(time-start)*.0017)%360);
    ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.fillStyle='rgba(14,12,8,.72)';ctx.fill();ctx.strokeStyle='rgba(255,171,42,.34)';ctx.lineWidth=1;ctx.stroke();
    ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-.5,0,Math.PI*2);ctx.clip(); drawGrid(lon0); drawRoutes(lon0,time); drawCoasts(lon0); drawNodes(lon0,time); ctx.restore();
    const rim=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);rim.addColorStop(0,'rgba(255,214,132,.13)');rim.addColorStop(.5,'rgba(255,138,0,.38)');rim.addColorStop(1,'rgba(255,214,132,.08)');ctx.beginPath();ctx.arc(cx,cy,R,0,Math.PI*2);ctx.strokeStyle=rim;ctx.lineWidth=1.15;ctx.stroke();
    if(!reduceMotion && globeVisible && !document.hidden) raf=requestAnimationFrame(loop);
  }
  function loop(time){
    if(time-lastFrame<30){raf=requestAnimationFrame(loop);return;}
    lastFrame=time;draw(time);
  }
  function startGlobe(){if(reduceMotion){draw(performance.now());return;}if(!raf&&globeVisible&&!document.hidden)raf=requestAnimationFrame(loop);}
  function stopGlobe(){if(raf){cancelAnimationFrame(raf);raf=0;}}
  if('IntersectionObserver' in window){const globeIO=new IntersectionObserver(entries=>{globeVisible=!!entries[0]&&entries[0].isIntersecting;if(globeVisible)startGlobe();else stopGlobe();},{rootMargin:'200px 0px'});globeIO.observe(canvas);}
  draw(performance.now());
  startGlobe();
  addEventListener('visibilitychange',()=>{if(document.hidden)stopGlobe();else startGlobe()});
})();
