(() => {
  const reduce = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const TAU = Math.PI * 2;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

  // ---------- HERO: semantic 3D cluster mesh — no arbitrary edges ----------
  (()=>{
    const canvas=document.getElementById('heroField');
    if(!canvas || (window.matchMedia&&matchMedia('(max-width:900px)').matches)) return;
    const ctx=canvas.getContext('2d',{alpha:true});if(!ctx)return;
    let w=1,h=1,dpr=1,raf=0,last=0,visible=true,start=performance.now(),mx=0,my=0;
    const FPS=30,TAU=Math.PI*2;
    const defs={
      human:{c:[.585,.29,.10],count:9,r:[.030,.060,.15],rgb:[255,220,151]},
      agent:{c:[.575,.70,-.08],count:10,r:[.034,.065,.17],rgb:[255,137,20]},
      state:{c:[.725,.50,0],count:14,r:[.045,.082,.22],rgb:[255,178,52]},
      contribution:{c:[.835,.30,.10],count:9,r:[.034,.064,.17],rgb:[255,226,159]},
      compute:{c:[.840,.70,-.10],count:9,r:[.036,.066,.19],rgb:[255,119,6]},
      proof:{c:[.955,.50,.03],count:12,r:[.042,.078,.20],rgb:[255,239,198]},
      market:{c:[1.075,.50,.06],count:7,r:[.030,.052,.14],rgb:[255,199,103]}
    };
    const order=['human','agent','state','contribution','compute','proof','market'];
    const nodes={};
    for(const name of order){const d=defs[name];nodes[name]=Array.from({length:d.count},(_,i)=>({i,phase:i*2.399963+order.indexOf(name)*.71,tilt:(i%3-1)*.32,seed:(i*37+13)%97/97}))}
    const linkPairs=[];
    function link(a,ai,b,bi,type){linkPairs.push({a,ai,b,bi,type,seed:linkPairs.length*.137})}
    nodes.human.forEach((n,i)=>{link('human',i,'state',(i*2)%14,'human');link('human',i,'state',(i*2+3)%14,'human')});
    nodes.agent.forEach((n,i)=>{link('agent',i,'state',(i*2+1)%14,'agent');link('agent',i,'state',(i*2+5)%14,'agent')});
    nodes.state.forEach((n,i)=>{const target=i%2?'compute':'contribution',count=defs[target].count;link('state',i,target,(i*3)%count,target);if(i%4===0)link('state',i,target,(i*3+2)%count,target)});
    nodes.contribution.forEach((n,i)=>{link('contribution',i,'proof',(i*2)%12,'contribution');if(i%3===0)link('contribution',i,'proof',(i*2+3)%12,'contribution')});
    nodes.compute.forEach((n,i)=>{link('compute',i,'proof',(i*2+1)%12,'compute');if(i%3===1)link('compute',i,'proof',(i*2+4)%12,'compute')});
    nodes.proof.forEach((n,i)=>link('proof',i,'market',i%7,'proof'));
    const dust=Array.from({length:70},(_,i)=>({x:.48+((i*73)%57)/100,y:.06+((i*41)%88)/100,z:-.45+((i*29)%90)/100,p:i*1.771}));
    function makeSprite(rgb){const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,31);r.addColorStop(0,`rgba(${rgb.join(',')},1)`);r.addColorStop(.12,`rgba(${rgb.join(',')},.95)`);r.addColorStop(.46,`rgba(${rgb.join(',')},.20)`);r.addColorStop(1,`rgba(${rgb.join(',')},0)`);g.fillStyle=r;g.fillRect(0,0,64,64);return c}
    const sprites={};order.forEach(n=>sprites[n]=makeSprite(defs[n].rgb));
    function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,1.7);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0)}
    function pos(name,node,time){const d=defs[name],a=node.phase+(reduce?0:(time-start)*(.00010+node.seed*.000035)),b=node.phase*.63+(reduce?0:(time-start)*.000065);const x=d.c[0]+Math.cos(a)*d.r[0]*(.65+.35*Math.cos(b)),y=d.c[1]+Math.sin(a)*d.r[1],z=d.c[2]+Math.sin(b+node.tilt)*d.r[2];return[x,y,z]}
    function project(v){const perspective=1+v[2]*.22;return{x:(v[0]-.5)*w*perspective+w*.5+mx*18*(.55+v[2]*.4),y:(v[1]-.5)*h*perspective+h*.5+my*11*(.55+v[2]*.4),z:v[2]}}
    function rgba(rgb,a){return`rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`}
    function sprite(name,x,y,size,a){const s=sprites[name],d=size*9;ctx.globalAlpha=a;ctx.drawImage(s,x-d/2,y-d/2,d,d);ctx.globalAlpha=1}
    function drawCluster(name,time){const d=defs[name],pts=nodes[name].map(n=>project(pos(name,n,time)));const center=project(d.c);ctx.save();ctx.globalCompositeOperation='lighter';
      for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length];ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=rgba(d.rgb,.055+Math.max(0,(a.z+b.z))*.025);ctx.lineWidth=.45;ctx.stroke()}
      const isCore=name==='state'||name==='proof',rings=isCore?4:2;for(let k=0;k<rings;k++){const rr=(isCore?18:12)+k*(isCore?10:8),rot=(reduce?0:time*.00012)*(k%2?1:-1)+k*.83;ctx.strokeStyle=rgba(d.rgb,.115-k*.018);ctx.lineWidth=.62;ctx.beginPath();ctx.ellipse(center.x,center.y,rr,rr*(.36+.055*k),rot,0,TAU);ctx.stroke()}
      for(const p of pts){const depth=clamp((p.z+.35)/.7,0,1);sprite(name,p.x,p.y,.28+.20*depth,.38+.42*depth)}
      sprite(name,center.x,center.y,isCore?1.05:.55,isCore?.88:.55);ctx.restore();return pts}
    function curve(a,b,seed){const dx=b.x-a.x,dy=b.y-a.y,L=Math.max(1,Math.hypot(dx,dy)),nx=-dy/L,ny=dx/L,bend=(Math.sin(seed*12.7)*.5+.5)*15+5;return{cx:(a.x+b.x)/2+nx*bend,cy:(a.y+b.y)/2+ny*bend}}
    function draw(time){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);
      ctx.save();ctx.globalCompositeOperation='lighter';for(const d of dust){const drift=reduce?0:(time-start)*(.000003+.000004*(d.z+.5)),x=(d.x+drift)%1.12,y=d.y+Math.sin(time*.00015+d.p)*.005,p=project([x,y,d.z]),fade=clamp((x-.48)/.17,0,1);sprite('market',p.x,p.y,.12+.15*(d.z+.5),(.012+.042*(d.z+.5))*fade)}ctx.restore();
      const stagePts={};for(const n of order)stagePts[n]=nodes[n].map(nd=>project(pos(n,nd,time)));
      ctx.save();ctx.globalCompositeOperation='lighter';for(const l of linkPairs){const a=stagePts[l.a][l.ai],b=stagePts[l.b][l.bi],rgb=defs[l.type==='proof'?'proof':l.type].rgb,c=curve(a,b,l.seed),depth=clamp(((a.z+b.z)/2+.35)/.7,0,1);ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.cx,c.cy,b.x,b.y);ctx.strokeStyle=rgba(rgb,.035+.080*depth);ctx.lineWidth=.45+.45*depth;ctx.stroke()}ctx.restore();
      const buses=[['human','state','human'],['agent','state','agent'],['state','contribution','contribution'],['state','compute','compute'],['contribution','proof','contribution'],['compute','proof','compute'],['proof','market','proof']];
      for(let bi=0;bi<buses.length;bi++){const[aN,bN,colN]=buses[bi],a=project(defs[aN].c),b=project(defs[bN].c),rgb=defs[colN].rgb,c=curve(a,b,bi*.177);ctx.save();ctx.globalCompositeOperation='lighter';ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.cx,c.cy,b.x,b.y);ctx.strokeStyle=rgba(rgb,.025);ctx.lineWidth=9;ctx.stroke();ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.quadraticCurveTo(c.cx,c.cy,b.x,b.y);ctx.strokeStyle=rgba(rgb,.28);ctx.lineWidth=1.1;ctx.stroke();ctx.restore();for(let train=0;train<2;train++){const t=reduce?.32+train*.28:((time-start)*(.000050+bi*.0000015)+train*.47+bi*.093)%1,u=1-t,px=u*u*a.x+2*u*t*c.cx+t*t*b.x,py=u*u*a.y+2*u*t*c.cy+t*t*b.y;sprite(colN,px,py,.52,.75)}}
      order.filter(n=>n!=='market').forEach(n=>drawCluster(n,time));
      const proof=project(defs.proof.c),rgb=defs.proof.rgb;for(let k=0;k<2;k++){const u=reduce?.5:((time-start)*.000075+k*.48)%1,r=65*(.35+.65*u);ctx.beginPath();ctx.arc(proof.x,proof.y,r,0,TAU);ctx.strokeStyle=rgba(rgb,.085*(1-u));ctx.lineWidth=.6;ctx.stroke()}
    }
    function loop(t){if(t-last>=1000/FPS){last=t;draw(t)}if(!reduce&&visible&&!document.hidden)raf=requestAnimationFrame(loop);else raf=0}
    resize();draw(performance.now());if('ResizeObserver'in window)new ResizeObserver(()=>{resize();draw(performance.now())}).observe(canvas);if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;if(visible&&!raf&&!reduce)raf=requestAnimationFrame(loop)},{rootMargin:'180px'}).observe(canvas);const host=canvas.closest('.hero');if(host&&matchMedia('(pointer:fine)').matches){host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();mx=((e.clientX-r.left)/r.width-.5)*.68;my=((e.clientY-r.top)/r.height-.5)*.40},{passive:true});host.addEventListener('pointerleave',()=>{mx*=.2;my*=.2},{passive:true})}if(!reduce)raf=requestAnimationFrame(loop)
  })();

  // ---------- GLOBE: verified east-positive orthographic projection + GSHHS shorelines ----------
  (()=>{
    const canvas=document.getElementById('worldGlobe'); if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return;
    const raw=atob((window.__ST8_GSHHS_PARTS||[]).join('')),dv=new DataView(Uint8Array.from(raw,c=>c.charCodeAt(0)).buffer);let off=0;
    const segCount=dv.getUint16(off,true);off+=2;const coasts=[];
    for(let s=0;s<segCount;s++){const len=dv.getUint16(off,true);off+=2,seg=[];for(let i=0;i<len;i++){seg.push([dv.getInt16(off,true)/100,dv.getInt16(off+2,true)/100]);off+=4}coasts.push(seg)}
    const landCount=dv.getUint16(off,true);off+=2;const land=[];for(let i=0;i<landCount;i++){land.push([dv.getInt16(off,true)/100,dv.getInt16(off+2,true)/100]);off+=4}
    const hubs=[['Miami',25.76,-80.19],['NYC',40.71,-74.01],['SF',37.77,-122.42],['London',51.51,-.13],['Dubai',25.20,55.27],['Singapore',1.35,103.82],['Tokyo',35.68,139.65],['Sydney',-33.87,151.21],['São Paulo',-23.55,-46.63],['Johannesburg',-26.20,28.05]];
    const links=[[0,1],[0,2],[1,3],[3,4],[4,5],[5,6],[6,7],[0,8],[3,9],[9,4]];
    let w=1,h=1,dpr=1,cx=0,cy=0,R=1,raf=0,last=0,visible=true,start=performance.now(),hoverX=0,hoverY=0;
    const rad=d=>d*Math.PI/180,deg=r=>r*180/Math.PI;
    function resize(){const r=canvas.getBoundingClientRect();dpr=Math.min(devicePixelRatio||1,2);w=Math.max(1,r.width);h=Math.max(1,r.height);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);cx=w*.50;cy=h*.49;R=Math.min(w,h)*(.39)}
    function project(latD,lonD,lon0D,lat0D){const p=rad(latD),l=rad(lonD),l0=rad(lon0D),p0=rad(lat0D),dl=l-l0,cp=Math.cos(p),sp=Math.sin(p),c0=Math.cos(p0),s0=Math.sin(p0);const X=cp*Math.sin(dl),Y=c0*sp-s0*cp*Math.cos(dl),Z=s0*sp+c0*cp*Math.cos(dl);return{x:cx+R*X,y:cy-R*Y,z:Z,X,Y}}
    function sphereVec(lat,lon){const p=rad(lat),l=rad(lon),c=Math.cos(p);return[c*Math.cos(l),c*Math.sin(l),Math.sin(p)]}
    function slerp(a,b,t){const va=sphereVec(a[1],a[2]),vb=sphereVec(b[1],b[2]);let d=clamp(va[0]*vb[0]+va[1]*vb[1]+va[2]*vb[2],-1,1),om=Math.acos(d),so=Math.sin(om),v;if(so<1e-5)v=va;else{const A=Math.sin((1-t)*om)/so,B=Math.sin(t*om)/so;v=[A*va[0]+B*vb[0],A*va[1]+B*vb[1],A*va[2]+B*vb[2]]}const m=Math.hypot(...v);return[deg(Math.asin(v[2]/m)),deg(Math.atan2(v[1],v[0]))]}
    function coast(seg,lon0,lat0,alpha=.72,width=.75){ctx.beginPath();let pen=false;for(const [lon,lat] of seg){const p=project(lat,lon,lon0,lat0);if(p.z>.005){if(!pen)ctx.moveTo(p.x,p.y);else ctx.lineTo(p.x,p.y);pen=true}else pen=false}ctx.strokeStyle=`rgba(255,174,58,${alpha})`;ctx.lineWidth=width;ctx.stroke()}
    function graticule(lon0,lat0){ctx.save();ctx.lineWidth=.55;for(let lat=-60;lat<=60;lat+=20){ctx.beginPath();let pen=false;for(let lon=-180;lon<=180;lon+=3){const p=project(lat,lon,lon0,lat0);if(p.z>0){pen?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);pen=true}else pen=false}ctx.strokeStyle='rgba(240,211,158,.095)';ctx.stroke()}for(let lon=-180;lon<180;lon+=20){ctx.beginPath();let pen=false;for(let lat=-88;lat<=88;lat+=2){const p=project(lat,lon,lon0,lat0);if(p.z>0){pen?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);pen=true}else pen=false}ctx.strokeStyle='rgba(240,211,158,.075)';ctx.stroke()}ctx.restore()}
    function route(a,b,lon0,lat0,time,idx){const pts=[];for(let i=0;i<=54;i++){const t=i/54,[lat,lon]=slerp(a,b,t),p=project(lat,lon,lon0,lat0),lift=1+.07*Math.sin(Math.PI*t);pts.push({...p,x:cx+(p.x-cx)*lift,y:cy+(p.y-cy)*lift})}ctx.beginPath();let pen=false;for(const p of pts){if(p.z>-.02){pen?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y);pen=true}else pen=false}ctx.strokeStyle='rgba(255,185,73,.24)';ctx.lineWidth=.75;ctx.stroke();const t=reduce?.55:((time*.000032+idx*.127)%1),j=Math.min(53,Math.floor(t*54)),p=pts[j];if(p&&p.z>0){ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='rgba(255,151,14,.95)';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(p.x,p.y,1.9,0,TAU);ctx.fillStyle='rgba(255,207,116,.96)';ctx.fill();ctx.restore()}}
    function draw(time){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#050505';ctx.fillRect(0,0,w,h);const lon0=-52+(reduce?0:(time-start)*.00062)+hoverX*16,lat0=18-hoverY*8;let halo=ctx.createRadialGradient(cx,cy,R*.86,cx,cy,R*1.10);halo.addColorStop(0,'rgba(255,128,0,0)');halo.addColorStop(.78,'rgba(255,145,18,.018)');halo.addColorStop(1,'rgba(255,145,18,0)');ctx.fillStyle=halo;ctx.beginPath();ctx.arc(cx,cy,R*1.12,0,TAU);ctx.fill();ctx.save();ctx.shadowColor='rgba(255,145,18,.32)';ctx.shadowBlur=26;ctx.strokeStyle='rgba(255,166,44,.20)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx,cy,R+1,0,TAU);ctx.stroke();ctx.restore();const body=ctx.createRadialGradient(cx-R*.34,cy-R*.30,R*.04,cx,cy,R*1.05);body.addColorStop(0,'#4d2a08');body.addColorStop(.25,'#2c1808');body.addColorStop(.62,'#100b08');body.addColorStop(1,'#050505');ctx.fillStyle=body;ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(cx,cy,R-.5,0,TAU);ctx.clip();ctx.globalCompositeOperation='lighter';for(let i=0;i<land.length;i++){const [lon,lat]=land[i],p=project(lat,lon,lon0,lat0);if(p.z<=.015)continue;const lum=.10+.34*Math.pow(p.z,.8),r=.45+.75*p.z;ctx.beginPath();ctx.arc(p.x,p.y,r,0,TAU);ctx.fillStyle=`rgba(255,${Math.round(126+76*p.z)},${Math.round(16+48*p.z)},${lum})`;ctx.fill()}ctx.globalCompositeOperation='source-over';graticule(lon0,lat0);coasts.forEach(s=>coast(s,lon0,lat0,.58,.72));links.forEach((l,i)=>route(hubs[l[0]],hubs[l[1]],lon0,lat0,time,i));hubs.forEach((n,i)=>{const p=project(n[1],n[2],lon0,lat0);if(p.z<=0)return;const rr=1.7+1.25*p.z,pulse=reduce?1:.82+.18*Math.sin(time*.0017+i);ctx.save();ctx.globalCompositeOperation='lighter';ctx.shadowColor='rgba(255,144,0,.95)';ctx.shadowBlur=14;ctx.beginPath();ctx.arc(p.x,p.y,rr*pulse,0,TAU);ctx.fillStyle='rgba(255,188,78,.95)';ctx.fill();ctx.restore()});ctx.restore();const rim=ctx.createLinearGradient(cx-R,cy-R,cx+R,cy+R);rim.addColorStop(0,'rgba(255,225,159,.14)');rim.addColorStop(.43,'rgba(255,151,22,.54)');rim.addColorStop(1,'rgba(255,123,0,.07)');ctx.beginPath();ctx.arc(cx,cy,R,0,TAU);ctx.strokeStyle=rim;ctx.lineWidth=1.15;ctx.stroke()}
    function loop(t){if(t-last>38){last=t;draw(t)}if(!reduce&&visible&&!document.hidden)raf=requestAnimationFrame(loop);else raf=0}
    resize();draw(performance.now());if('ResizeObserver'in window)new ResizeObserver(()=>{resize();draw(performance.now())}).observe(canvas);if('IntersectionObserver'in window)new IntersectionObserver(e=>{visible=!!e[0]?.isIntersecting;if(visible&&!raf&&!reduce)raf=requestAnimationFrame(loop)},{rootMargin:'160px'}).observe(canvas);const host=canvas.parentElement;if(host&&matchMedia('(pointer:fine)').matches)host.addEventListener('pointermove',e=>{const r=host.getBoundingClientRect();hoverX=((e.clientX-r.left)/r.width-.5);hoverY=((e.clientY-r.top)/r.height-.5)},{passive:true});if(!reduce)raf=requestAnimationFrame(loop)
  })();
})();
