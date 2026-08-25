
document.documentElement.classList.add('js');
const glow=document.getElementById('glow');
if(glow && window.matchMedia && matchMedia('(pointer:fine)').matches){addEventListener('pointermove',e=>{glow.style.transform=`translate(${e.clientX-260}px,${e.clientY-260}px)`},{passive:true});}
const reveals=document.querySelectorAll('.reveal');
if('IntersectionObserver' in window){const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('on');io.unobserve(e.target)}}),{threshold:.10,rootMargin:'0px 0px -4% 0px'});reveals.forEach(el=>io.observe(el));}else{reveals.forEach(el=>el.classList.add('on'));}
const menuButton=document.getElementById('menuButton'),mobileMenu=document.getElementById('mobileMenu');
function setMenu(open){if(!menuButton||!mobileMenu)return;menuButton.setAttribute('aria-expanded',String(open));menuButton.textContent=open?'CLOSE':'MENU';mobileMenu.classList.toggle('open',open);mobileMenu.setAttribute('aria-hidden',String(!open));document.body.classList.toggle('menu-open',open);}
if(menuButton&&mobileMenu){menuButton.addEventListener('click',()=>setMenu(menuButton.getAttribute('aria-expanded')!=='true'));mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));addEventListener('keydown',e=>{if(e.key==='Escape')setMenu(false)});addEventListener('resize',()=>{if(innerWidth>1100)setMenu(false)},{passive:true});}



// ELITE VISUAL LAYER — isolated, ordered, and fail-safe.
(()=>{
 const css=document.createElement('link');css.rel='stylesheet';css.href='elite.css';document.head.appendChild(css);
 const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.defer=true;s.onload=resolve;s.onerror=()=>reject(new Error(src));document.head.appendChild(s)});
 load('world-gshhs.js').then(()=>load('elite-runtime.js')).catch(err=>console.warn('ST8WRX elite visual layer unavailable',err));
})();
