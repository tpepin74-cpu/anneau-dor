import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { startSoftwareRing } from './softwareRing';

const clamp = (v) => Math.max(0, Math.min(1, v));
const smooth = (a, b, v) => { const t = clamp((v-a)/(b-a)); return t*t*(3-2*t); };
const METALS = { yellow: '#e7c184', white: '#e2e5e6', rose: '#e0ac96' };
const STONES = { diamond:'#eff8ff', emerald:'#126d57', sapphire:'#234f9d', champagne:'#e6c693' };

function bandGeometry() {
  const vertices = [], normals = [], indices = [];
  const sections=240, sides=20;
  for (let i=0;i<=sections;i++) {
    const u=i/sections*Math.PI*2;
    const shoulder=0.5+0.5*Math.cos(u);
    const radial=0.083+shoulder*0.025;
    for(let j=0;j<=sides;j++) {
      const v=j/sides*Math.PI*2;
      const r=1.1+Math.cos(v)*radial;
      vertices.push(Math.sin(u)*r, Math.cos(u)*r, Math.sin(v)*(0.13+shoulder*0.027));
      normals.push(Math.sin(u)*Math.cos(v),Math.cos(u)*Math.cos(v),Math.sin(v));
      if(i<sections && j<sides) { const a=i*(sides+1)+j,b=a+sides+1; indices.push(a,a+1,b,b,a+1,b+1); }
    }
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
  geo.setIndex(indices);return geo;
}

function gemGeometry() {
  const positions=[],groups=[];const n=16;
  const tiers=[{r:0,y:-.39},{r:.51,y:0},{r:.51,y:.035},{r:.31,y:.245}];
  const p=(tier,i)=>{ const a=i/n*Math.PI*2; return [Math.sin(a)*tier.r,tier.y,Math.cos(a)*tier.r]; };
  const tri=(a,b,c,k)=>{const start=positions.length/3;positions.push(...a,...c,...b);groups.push([start,3,k]);};
  for(let t=0;t<tiers.length-1;t++)for(let i=0;i<n;i++) {
    const a=p(tiers[t],i),b=p(tiers[t],i+1),c=p(tiers[t+1],i),d=p(tiers[t+1],i+1);
    tri(a,c,d,(i+t)%5);if(t>0)tri(a,d,b,(i+t+1)%5);
  }
  for(let i=0;i<n;i++) tri([0,.245,0],p(tiers[3],i+1),p(tiers[3],i),i%5);
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.computeVertexNormals();groups.forEach(x=>g.addGroup(...x));return g;
}

function createRing(scene) {
  const root = new THREE.Group();scene.add(root);
  const metal=new THREE.MeshPhysicalMaterial({color:METALS.yellow,metalness:1,roughness:.17,clearcoat:1,clearcoatRoughness:.08,envMapIntensity:1.65});
  const bandGeo=bandGeometry();
  const band=new THREE.Mesh(bandGeo,metal);root.add(band);
  const wireMat=new THREE.LineBasicMaterial({color:'#6c817b',transparent:true,opacity:.48});
  const sketch=new THREE.Group();root.add(sketch);
  // Sparse construction lines retain the feel of a jeweller's pencil study.
  [1.005,1.105,1.21].forEach((r,k)=>{
    const points=[];for(let i=0;i<=160;i++){const a=i/160*Math.PI*2;points.push(new THREE.Vector3(Math.sin(a)*r,Math.cos(a)*r,k===1?.14:0));}
    sketch.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),wireMat));
  });
  for(let i=0;i<12;i++) {
    const a=i/12*Math.PI*2;
    const pts=[new THREE.Vector3(Math.sin(a)*.98,Math.cos(a)*.98,-.16),new THREE.Vector3(Math.sin(a)*1.23,Math.cos(a)*1.23,.16)];
    sketch.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),wireMat));
  }
  const setting=new THREE.Group();root.add(setting);
  const basket=new THREE.Mesh(new THREE.TorusGeometry(.335,.035,10,64),metal);basket.rotation.x=Math.PI/2;basket.position.y=1.3;setting.add(basket);
  const gallery=new THREE.Mesh(new THREE.TorusGeometry(.44,.025,10,64),metal);gallery.rotation.x=Math.PI/2;gallery.position.y=1.48;setting.add(gallery);
  const prongs=[];
  for(let i=0;i<6;i++){
    const a=i/6*Math.PI*2+Math.PI/6;
    const curve=new THREE.CatmullRomCurve3([
      new THREE.Vector3(Math.sin(a)*.19,1.08,Math.cos(a)*.19),
      new THREE.Vector3(Math.sin(a)*.39,1.39,Math.cos(a)*.39),
      new THREE.Vector3(Math.sin(a)*.49,1.62,Math.cos(a)*.49),
      new THREE.Vector3(Math.sin(a)*.448,1.70,Math.cos(a)*.448)]);
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,28,.031,10,false),metal);setting.add(mesh);prongs.push(mesh);
    const tip=new THREE.Mesh(new THREE.SphereGeometry(.041,12,12),metal);tip.position.copy(curve.getPoint(1));setting.add(tip);
  }
  const gemRoot=new THREE.Group();root.add(gemRoot);gemRoot.position.y=1.56;
  const gemMats=Array.from({length:5},(_,i)=>new THREE.MeshPhysicalMaterial({
    color:['#f8fcff','#dbeaf1','#ffffff','#c9dce8','#eff8ff'][i],metalness:[.12,.24,.03,.32,.08][i],roughness:.015,
    transmission:.35,thickness:.75,ior:2.417,dispersion:.05,clearcoat:1,envMapIntensity:1.8,side:THREE.DoubleSide,
  }));
  const gemGeo=gemGeometry();const gem=new THREE.Mesh(gemGeo,gemMats);gemRoot.add(gem);
  const gemEdges=new THREE.LineSegments(new THREE.EdgesGeometry(gemGeo,10),new THREE.LineBasicMaterial({color:'#ffffff',transparent:true,opacity:.28}));gemRoot.add(gemEdges);
  const gemSketch=new THREE.LineSegments(new THREE.EdgesGeometry(gemGeo,10),wireMat);gemSketch.position.y=1.56;sketch.add(gemSketch);
  // Tiny shoulder stones complete the fine jewellery silhouette.
  const accents=new THREE.Group();root.add(accents);
  for(const side of [-1,1])for(let i=0;i<5;i++){
    const a=side*(.29+i*.108);
    const small=new THREE.Mesh(new THREE.IcosahedronGeometry(.039,0),gemMats[0]);
    small.position.set(Math.sin(a)*1.205,Math.cos(a)*1.205,.035);accents.add(small);
  }
  return {root,band,bandGeo,metal,sketch,wireMat,setting,gemRoot,gemMats,accents};
}

export default function RingScene({progress,playing=true,metal='yellow',stone='diamond',shape='round',mini=false,rotationRef,rotation,interactive=true,fixedPose=false,canvasRef,onReady}) {
  const host=useRef(null),state=useRef({}),[failed,setFailed]=useState(false);
  state.current={progress,playing,metal,stone,shape,rotationRef,rotation,interactive,fixedPose};
  useEffect(()=>{
    const el=host.current;let renderer;
    const probe=document.createElement('canvas');
    const gl=probe.getContext('webgl2');
    if(!gl)return startSoftwareRing(el,state,{mini,canvasRef,onReady});
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    try { renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance',preserveDrawingBuffer:!!canvasRef}); }
    catch {return startSoftwareRing(el,state,{mini,canvasRef,onReady});}
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,mini?1.25:1.8));
    renderer.setClearColor(0xffffff,0);renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;
    renderer.outputColorSpace=THREE.SRGBColorSpace;el.appendChild(renderer.domElement);
    if(canvasRef)canvasRef.current=renderer.domElement;
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(34,1,.1,80);camera.position.set(0,.32,6.2);camera.lookAt(0,.25,0);
    const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();
    const env=pmrem.fromScene(room,.035);scene.environment=env.texture;room.dispose();pmrem.dispose();
    const ambient=new THREE.HemisphereLight(0xffffff,0xadb5b4,2.0);scene.add(ambient);
    const key=new THREE.DirectionalLight(0xfff7e7,4);key.position.set(3,5,4);scene.add(key);
    const fill=new THREE.DirectionalLight(0xd4edff,2.4);fill.position.set(-4,1,2);scene.add(fill);
    const rim=new THREE.DirectionalLight(0xffffff,4);rim.position.set(-2,3,-3);scene.add(rim);
    const ring=createRing(scene);ring.root.rotation.set(.19,-.38,-.34);
    let currentMetal='',currentStone='',frame=0,visible=true,last=performance.now(),spin=0,userAngle=0,dragging=false,lastX=0,hasLoaded=false,renderStamp='';
    const motionReduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resize=()=>{renderStamp='';const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.position.z=camera.aspect<.85?7.5:6.2;camera.updateProjectionMatrix();};
    const obs=new ResizeObserver(resize);obs.observe(el);resize();
    const io=new IntersectionObserver(([e])=>visible=e.isIntersecting,{rootMargin:'150px'});io.observe(el);
    const down=e=>{if(mini||!state.current.interactive)return;dragging=true;lastX=e.clientX;el.setPointerCapture(e.pointerId);el.classList.add('dragging');};
    const move=e=>{if(dragging){userAngle+=(e.clientX-lastX)*.009;lastX=e.clientX;}};
    const up=()=>{dragging=false;el.classList.remove('dragging');};
    el.addEventListener('pointerdown',down);el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up);
    const animate=(now)=>{
      frame=requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.06);last=now;
      if(!visible||document.hidden)return;
      const s=state.current;const p=s.progress?.get?s.progress.get():s.progress??1;
      const stamp=[p.toFixed(5),s.metal,s.stone,s.shape,el.clientWidth,el.clientHeight].join('|');
      if(s.fixedPose&&stamp===renderStamp)return;renderStamp=stamp;
      if(!s.fixedPose&&s.playing&&!motionReduced&&!dragging)spin+=dt*(mini?.1:.18);
      const keyAngle=(s.rotationRef?.current||0)+(s.rotation?.get?s.rotation.get():s.rotation||0);
      ring.root.rotation.y=-.42+spin+userAngle+keyAngle+(!s.fixedPose&&p>.74?(p-.74)*1.8:0);
      ring.root.rotation.x=.19+(!s.fixedPose&&!motionReduced?Math.sin(now*.00045)*.04:0);
      ring.root.rotation.z=-.35+(s.fixedPose?0:(1-p)*.12);
      ring.root.position.y=-.22+(!s.fixedPose&&!motionReduced&&s.playing?Math.sin(now*.0007)*.028:0);
      const material=smooth(.21,.56,p),serti=smooth(.54,.79,p),final=smooth(.74,.95,p);
      ring.band.visible=p>.19;
      const count=Math.floor(Math.max(.001,material)*240)*20*6;ring.bandGeo.setDrawRange(0,count);
      ring.sketch.visible=p<.63;ring.wireMat.opacity=(1-smooth(.40,.65,p))*.45;
      ring.sketch.children.forEach((child,i)=>{if(child.geometry?.attributes.position && i<3){child.geometry.setDrawRange(0,Math.floor(smooth(0,.2,p)*161));}});
      const settingScale=.02+.98*smooth(.45,.66,p);
      ring.setting.visible=p>.45;ring.setting.scale.setScalar(settingScale);ring.setting.position.y=s.fixedPose?1.08*(1-settingScale):0;
      const gemOpacity=s.fixedPose?smooth(.60,.79,p):1;
      ring.gemRoot.visible=p>(s.fixedPose?.60:.48);ring.gemRoot.position.y=1.56+(s.fixedPose?0:(1-serti)*1.5);ring.gemRoot.rotation.y=s.fixedPose?0:(1-serti)*.75;
      ring.gemMats.forEach(m=>{m.transparent=!!s.fixedPose;m.opacity=gemOpacity;});ring.gemRoot.children[1].material.opacity=.28*gemOpacity;
      ring.gemRoot.scale.set(s.shape==='oval'?.79:1,1,s.shape==='oval'?1.22:1);
      ring.accents.visible=final>.3;
      if(s.metal!==currentMetal){ring.metal.color.set(METALS[s.metal]||METALS.yellow);currentMetal=s.metal;}
      if(s.stone!==currentStone){ring.gemMats.forEach((m,i)=>{m.color.set(STONES[s.stone]||STONES.diamond);m.color.multiplyScalar(.79+i*.07);m.transmission=s.stone==='diamond'?.35:.16;});currentStone=s.stone;}
      ring.metal.roughness=.38-.22*smooth(.35,.85,p);
      renderer.render(scene,camera);
      if(!hasLoaded){hasLoaded=true;onReady?.();}
    };frame=requestAnimationFrame(animate);
    return ()=>{cancelAnimationFrame(frame);obs.disconnect();io.disconnect();el.removeEventListener('pointerdown',down);el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);scene.traverse(o=>{o.geometry?.dispose();if(o.material){(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());}});env.dispose();renderer.dispose();el.removeChild(renderer.domElement);};
  },[]);
  return <div ref={host} className={`ring-canvas ${mini?'mini':''}`} role="img" aria-label={`Bague en trois dimensions, ${metal==='yellow'?'or jaune':metal==='white'?'or blanc':'or rose'}, ${stone==='diamond'?'diamant':stone==='emerald'?'émeraude':stone==='sapphire'?'saphir':'pierre champagne'}.`}>{failed&&<div className="webgl-fallback"><span className="fallback-ring"/><p>L’aperçu 3D nécessite WebGL.<br/>Vous pouvez continuer à imaginer votre bijou ci-dessous.</p></div>}</div>;
}
