// A small software 3D renderer for browsers without WebGL. Geometry, depth,
// lighting, rotation and construction stages remain interactive on Canvas 2D.
export function startSoftwareRing(el,state,{mini=false,canvasRef,onReady}={}){
  const canvas=document.createElement('canvas');const ctx=canvas.getContext('2d');
  if(!ctx)return ()=>{};el.appendChild(canvas);if(canvasRef)canvasRef.current=canvas;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let w=1,h=1,scale=1,frame=0,visible=true,spin=0,drag=0,down=false,lastX=0,last=0,loaded=false,renderStamp='';
  const ratio=Math.min(devicePixelRatio,1.5),PI=Math.PI;
  const clamp=v=>Math.max(0,Math.min(1,v));const smooth=(a,b,v)=>{let t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  const resize=()=>{renderStamp='';w=el.clientWidth;h=el.clientHeight;canvas.width=w*ratio;canvas.height=h*ratio;canvas.style.width=w+'px';canvas.style.height=h+'px';scale=Math.min(w/3.35,h/4.15);};
  const ro=new ResizeObserver(resize);ro.observe(el);resize();
  const io=new IntersectionObserver(([e])=>{visible=e.isIntersecting;},{rootMargin:'80px'});io.observe(el);
  const pointerDown=e=>{if(mini||!state.current.interactive)return;down=true;lastX=e.clientX;el.setPointerCapture(e.pointerId);el.classList.add('dragging');};
  const pointerMove=e=>{if(down){drag+=(e.clientX-lastX)*.01;lastX=e.clientX;}};const pointerUp=()=>{down=false;el.classList.remove('dragging');};
  el.addEventListener('pointerdown',pointerDown);el.addEventListener('pointermove',pointerMove);el.addEventListener('pointerup',pointerUp);el.addEventListener('pointercancel',pointerUp);
  const metals={yellow:[205,166,88],white:[196,202,205],rose:[205,151,128]};
  const stoneColors={diamond:[225,237,245],emerald:[40,118,87],sapphire:[53,87,153],champagne:[207,178,125]};
  const rgb=a=>`rgb(${a.map(v=>Math.round(Math.max(0,Math.min(255,v)))).join(',')})`;
  const run=now=>{
    frame=requestAnimationFrame(run);if(!visible||document.hidden)return;
    if(now-last<(mini?90:16))return;
    const dt=Math.min((now-last)/1000,.1);last=now;
    const s=state.current;let p=s.progress?.get?s.progress.get():s.progress??1;
    const stamp=[p.toFixed(5),s.metal,s.stone,s.shape,w,h].join('|');
    if(s.fixedPose&&stamp===renderStamp)return;renderStamp=stamp;
    if(!s.fixedPose&&s.playing&&!reduced&&!down)spin+=dt*(mini?.075:.12);
    const ry=-.38+spin+drag+(s.rotationRef?.current||0)+(s.rotation?.get?s.rotation.get():s.rotation||0),rx=.48,rz=-.37;
    const cy=Math.cos(ry),sy=Math.sin(ry),cx=Math.cos(rx),sx=Math.sin(rx),cz=Math.cos(rz),sz=Math.sin(rz);
    const transform=(v,normal=false)=>{let [x,y,z]=v;const y1=y*cx-z*sx,z1=y*sx+z*cx;const x2=x*cy+z1*sy,z2=-x*sy+z1*cy;return [x2*cz-y1*sz,x2*sz+y1*cz-(normal?0:.2),z2];};
    const project=v=>{const q=5.8/(5.8-v[2]);return [w*.5+v[0]*scale*q,h*.51-v[1]*scale*q];};
    const faces=[];let partOpacity=1;
    const metalColor=metals[s.metal]||metals.yellow,stoneColor=stoneColors[s.stone]||stoneColors.diamond;
    const shade=(n,kind,k)=>{
      if(kind==='gem'){
        const val=.32+(.5+.5*Math.sin(n[0]*13+n[1]*8+n[2]*6+k*2.4))*.68;
        const white=s.stone==='diamond';
        return rgb(stoneColor.map((c,i)=>c*(white?.5+val*.5:.38+val*.66)+(val>.87?(white?19:36):0)));
      }
      const diffuse=Math.max(0,n[0]*-.38+n[1]*.56+n[2]*.74);
      const reflectX=2*n[2]*n[0],reflectY=2*n[2]*n[1];
      const stripe=Math.exp(-Math.pow((reflectX+.28)/.22,2))*.65+Math.exp(-Math.pow((reflectY-.73)/.16,2))*.5;
      const dark=Math.exp(-Math.pow((reflectX-.65)/.1,2))*.24;
      const b=.39+diffuse*.48+stripe*.55-dark;
      const white=Math.max(0,stripe-.35)*150;
      return rgb(metalColor.map(c=>c*b+white));
    };
    const face=(points,normal,kind='gold',k=0)=>{
      const n=transform(normal,true);if(n[2]<-.1)return;
      const vs=points.map(v=>transform(v));const depth=vs.reduce((a,v)=>a+v[2],0)/vs.length;
      faces.push({vs:vs.map(project),z:depth,fill:shade(n,kind,k),kind,opacity:partOpacity});
    };
    const bandPoint=(u,v)=>[(1.1+Math.cos(v)*.09)*Math.sin(u),(1.1+Math.cos(v)*.09)*Math.cos(u),Math.sin(v)*.145];
    const material=smooth(.21,.56,p),serti=smooth(.54,.79,p);
    const slices=mini?100:192,sides=mini?14:24;
    for(let i=0;i<Math.floor(slices*material);i++)for(let j=0;j<sides;j++){
      const a=i/slices*2*PI,b=(i+1)/slices*2*PI,c=j/sides*2*PI,d=(j+1)/sides*2*PI;
      const u=(a+b)/2,v=(c+d)/2;
      face([bandPoint(a,c),bandPoint(b,c),bandPoint(b,d),bandPoint(a,d)],[Math.sin(u)*Math.cos(v),Math.cos(u)*Math.cos(v),Math.sin(v)]);
    }
    const tube=(points,r=.027)=>{
      for(let q=0;q<points.length-1;q++)for(let j=0;j<8;j++){
        const a=j/8*2*PI,b=(j+1)/8*2*PI;
        const offset=(v,t)=>[v[0]+Math.cos(t)*r,v[1],v[2]+Math.sin(t)*r];
        face([offset(points[q],a),offset(points[q+1],a),offset(points[q+1],b),offset(points[q],b)],[Math.cos((a+b)/2),.1,Math.sin((a+b)/2)]);
      }
    };
    const gemstone=(x,y,z,size=1)=>{
      const shapeX=s.shape==='oval'?.79:1,shapeZ=s.shape==='oval'?1.22:1;
      const tiers=[[0,-.39],[.51,0],[.51,.035],[.31,.245]],n=12;
      const pt=(t,i)=>{const a=i/n*2*PI;return [x+Math.sin(a)*t[0]*size*shapeX,y+t[1]*size,z+Math.cos(a)*t[0]*size*shapeZ];};
      const add=(points,k)=>{
        const a=points[0],b=points[1],c=points[2];const u=b.map((v,i)=>v-a[i]),v=c.map((v,i)=>v-a[i]);
        let normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];const len=Math.hypot(...normal)||1;normal=normal.map(v=>v/len);
        face(points,normal,'gem',k);
      };
      for(let t=0;t<3;t++)for(let i=0;i<n;i++){
        const a=pt(tiers[t],i),b=pt(tiers[t],i+1),c=pt(tiers[t+1],i),d=pt(tiers[t+1],i+1);
        add([a,d,c],i+t*3);if(t>0)add([a,b,d],i+t*4);
      }
      for(let i=0;i<n;i++)add([[x,y+.245*size,z],pt(tiers[3],i),pt(tiers[3],i+1)],i*2);
    };
    if(p>(s.fixedPose?.45:.47)){
      const settingScale=s.fixedPose?.02+.98*smooth(.45,.66,p):1;
      const settingPoint=([x,y,z])=>[x*settingScale,1.08+(y-1.08)*settingScale,z*settingScale];
      const open=(1-serti)*.14;
      for(let i=0;i<6;i++){
        const a=i/6*2*PI+PI/6;
        const points=[[.2,1.08],[.32,1.27],[.41,1.43],[.49+open,1.62],[.448+open,1.70]].map(([r,y])=>[Math.sin(a)*r,y,Math.cos(a)*r]);
        tube(points.map(settingPoint),.032*settingScale);
      }
      // Basket below the gemstone.
      for(let i=0;i<32;i++){
        const a=i/32*2*PI,b=(i+1)/32*2*PI;
        tube([[Math.sin(a)*.35,1.31,Math.cos(a)*.35],[Math.sin(b)*.35,1.31,Math.cos(b)*.35]].map(settingPoint),.027*settingScale);
      }
      partOpacity=s.fixedPose?smooth(.60,.79,p):1;
      if(partOpacity>0)gemstone(0,1.56+(s.fixedPose?0:(1-serti)*1.4),0);
      partOpacity=1;
      if(p>.85)for(let k of [-1,1])for(let i=0;i<5;i++){const a=k*(.30+i*.105);gemstone(Math.sin(a)*1.205,Math.cos(a)*1.205,.055,.073);}
    }
    ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,w,h);
    if(p<.65){
      ctx.globalAlpha=(1-smooth(.4,.65,p))*.67;ctx.strokeStyle='#6f8774';ctx.lineWidth=.7;
      for(let r of [1.0,1.1,1.2]){ctx.beginPath();for(let i=0;i<Math.floor(smooth(0,.16,p)*161);i++){const a=i/160*PI*2;const [x,y]=project(transform([Math.sin(a)*r,Math.cos(a)*r,0]));i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();}
      const diamond=[[0,1.17,0],[-.5,1.56,0],[-.3,1.8,0],[.3,1.8,0],[.5,1.56,0],[0,1.17,0],[-.3,1.8,0],[.3,1.8,0],[0,1.17,0]];
      ctx.beginPath();diamond.forEach((v,i)=>{const [x,y]=project(transform(v));i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();ctx.globalAlpha=1;
    }
    faces.sort((a,b)=>a.z-b.z);
    faces.forEach(f=>{ctx.globalAlpha=f.opacity;ctx.beginPath();f.vs.forEach((v,i)=>i?ctx.lineTo(...v):ctx.moveTo(...v));ctx.closePath();ctx.fillStyle=f.fill;ctx.fill();ctx.strokeStyle=f.fill;ctx.lineWidth=.55;ctx.stroke();});ctx.globalAlpha=1;
    if(p>.85){
      const [gx,gy]=project(transform([.34,1.76,.16]));const intensity=(reduced||s.fixedPose)?.5:.25+.75*Math.pow(Math.max(0,Math.sin(now*.0015)),8);
      ctx.globalAlpha=intensity;const glow=ctx.createRadialGradient(gx,gy,0,gx,gy,10);glow.addColorStop(0,'#fff');glow.addColorStop(1,'#ffffff00');ctx.fillStyle=glow;ctx.fillRect(gx-10,gy-10,20,20);ctx.strokeStyle='#ffffff';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(gx-7,gy);ctx.lineTo(gx+7,gy);ctx.moveTo(gx,gy-7);ctx.lineTo(gx,gy+7);ctx.stroke();ctx.globalAlpha=1;
    }
    if(!loaded){loaded=true;onReady?.();}
  };frame=requestAnimationFrame(run);
  return ()=>{cancelAnimationFrame(frame);ro.disconnect();io.disconnect();el.removeEventListener('pointerdown',pointerDown);el.removeEventListener('pointermove',pointerMove);el.removeEventListener('pointerup',pointerUp);el.removeEventListener('pointercancel',pointerUp);canvas.remove();};
}
