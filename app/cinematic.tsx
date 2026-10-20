'use client';

import {useEffect,useRef,useState,type CSSProperties} from 'react';
import {Cpu,ImageOff,Pause,Play,Vote} from 'lucide-react';
import {Progress} from '@/components/ui/progress';
import {clamp,galleryProgress,pageProgress} from '@/lib/scroll-motion';
import type {Candidate} from '@/lib/candidates';
import credits from '@/lib/image-sources.json';
import {yearRange} from '@/lib/catalog';

export function useReducedMotion(){
 const [reduced,setReduced]=useState(false);
 useEffect(()=>{const media=matchMedia('(prefers-reduced-motion: reduce)');const update=()=>setReduced(media.matches);update();media.addEventListener('change',update);return()=>media.removeEventListener('change',update);},[]);
 return reduced;
}

export function OpeningSequence({onComplete}:{onComplete:()=>void}){
 const [progress,setProgress]=useState(0);const [closing,setClosing]=useState(false);
 const finished=useRef(false);const skip=useRef<HTMLButtonElement>(null);const closeTimer=useRef<ReturnType<typeof setTimeout>|null>(null);
 function finish(){if(finished.current)return;finished.current=true;setClosing(true);closeTimer.current=setTimeout(onComplete,matchMedia('(prefers-reduced-motion: reduce)').matches?0:420);}
 useEffect(()=>{
  const ui=document.querySelector<HTMLElement>('.site-ui');const oldOverflow=document.body.style.overflow;
  if(ui)ui.inert=true;document.body.style.overflow='hidden';skip.current?.focus({preventScroll:true});
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const duration=reduced?100:1550;const start=performance.now();let raf=0;
  const tick=(now:number)=>{const p=clamp((now-start)/duration);setProgress(p*100);if(p<1&&!finished.current)raf=requestAnimationFrame(tick);else finish();};
  raf=requestAnimationFrame(tick);
  const safety=setTimeout(finish,2400);
  return()=>{cancelAnimationFrame(raf);clearTimeout(safety);if(closeTimer.current)clearTimeout(closeTimer.current);if(ui)ui.inert=false;document.body.style.overflow=oldOverflow;};
 // The opening runs once; its bounded animation never waits for the network.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[]);
 return <div className={'opening-screen '+(closing?'opening-leave':'')} aria-label="Abertura GPU Legends">
  <span className="opening-edition">HISTÓRIA DO HARDWARE / ELEIÇÃO 2026</span>
  <div className="opening-brand" role="status"><span className="opening-chip"><Cpu aria-hidden="true"/></span><div><span className="opening-word">GPU</span><span className="opening-word opening-green">LEGENDS</span></div><p>A sua escolha entra para a história.</p></div>
  <div className="opening-bottom"><div><span>ABRINDO A EXPOSIÇÃO</span><Progress value={progress} className="opening-progress" aria-label="Progresso da abertura"/></div><button ref={skip} className="button ghost" onClick={finish}>Pular abertura</button></div>
 </div>;
}

export function GPUBackdrop({view}:{view:string}){return <div className="gpu-backdrop" data-active={view==='catalog'} aria-hidden="true"><div className="gpu-backdrop-shade"/></div>;}

export function MotionControl({paused,onToggle,reduced}:{paused:boolean;onToggle:()=>void;reduced:boolean}){
 return <button className="motion-control" onClick={onToggle} aria-pressed={paused||reduced} disabled={reduced} aria-label={reduced?'Animações reduzidas conforme preferência do dispositivo':paused?'Ativar animações':'Pausar animações'}>{paused||reduced?<Play/>:<Pause/>}<span>{reduced?'Movimento reduzido':paused?'Ativar animações':'Pausar animações'}</span></button>;
}

export function ScrollEffects({enabled,contentKey}:{enabled:boolean;contentKey:string}){
 const bar=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  const targets=[...document.querySelectorAll<HTMLElement>('.gpu-card,.timeline-card,.view-heading,.reveal-section,.result-row,.about-grid>.panel')];
  if(!enabled){targets.forEach(el=>el.classList.remove('will-reveal'));return;}
  const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:0.08,rootMargin:'0px 0px -24px 0px'});
  targets.forEach((el,index)=>{el.style.setProperty('--reveal-delay',String(index%4*65)+'ms');if(el.getBoundingClientRect().top>innerHeight-24){el.classList.add('will-reveal');el.classList.remove('is-visible');observer.observe(el);}else el.classList.add('is-visible');});
  return()=>observer.disconnect();
 },[enabled,contentKey]);
 useEffect(()=>{
  let raf=0;const update=()=>{raf=0;bar.current?.style.setProperty('transform','scaleX('+pageProgress(scrollY,document.documentElement.scrollHeight,innerHeight)+')');};const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule);const resize=new ResizeObserver(schedule);resize.observe(document.body);update();
  return()=>{cancelAnimationFrame(raf);resize.disconnect();window.removeEventListener('scroll',schedule);window.removeEventListener('resize',schedule);};
 },[]);
 useEffect(()=>{
  if(!enabled||!matchMedia('(pointer: fine)').matches)return;
  let active:HTMLElement|null=null;
  const reset=()=>{if(active){active.style.setProperty('--tilt-x','0deg');active.style.setProperty('--tilt-y','0deg');active=null;}};
  const move=(event:PointerEvent)=>{const card=(event.target as Element)?.closest<HTMLElement>('.gpu-card');if(card!==active)reset();if(!card)return;active=card;const r=card.getBoundingClientRect();card.style.setProperty('--tilt-y',((event.clientX-r.left)/r.width-.5)*5+'deg');card.style.setProperty('--tilt-x',-((event.clientY-r.top)/r.height-.5)*4+'deg');};
  const leave=(event:PointerEvent)=>{if(active&&!(event.relatedTarget instanceof Node&&active.contains(event.relatedTarget)))reset();};
  document.addEventListener('pointermove',move);document.addEventListener('pointerout',leave);window.addEventListener('blur',reset);
  return()=>{reset();document.removeEventListener('pointermove',move);document.removeEventListener('pointerout',leave);window.removeEventListener('blur',reset);};
 },[enabled]);
 return <div ref={bar} className="reading-progress" aria-hidden="true"/>;
}

function ExhibitPhoto({candidate,priority=false}:{candidate:Candidate;priority?:boolean}){
 const [failed,setFailed]=useState(false);
 return failed?<div className="photo-fallback"><ImageOff/><span>Foto indisponível · {candidate.name}</span></div>:<img src={candidate.image} alt={credits.find(item=>item.id===candidate.id)?.model||candidate.name} width="900" height="500" loading={priority?'eager':'lazy'} decoding="async" onError={()=>setFailed(true)}/>;
}

export function CinematicHero({catalog,onDetail,onExplore,onCatalog}:{catalog:Candidate[];onDetail:(candidate:Candidate)=>void;onExplore:()=>void;onCatalog:()=>void}){
 const years=yearRange(catalog);const picks=['voodoo2','gtx-1080-ti','rtx-5090'].map(id=>catalog.find(c=>c.id===id)).filter((c):c is Candidate=>!!c);
 return <section className="cinematic-hero archive-stage" aria-labelledby="election-question">
  <span className="stage-bracket bracket-start" aria-hidden="true"/><span className="stage-bracket bracket-end" aria-hidden="true"/>
  <div className="stage-watermark" aria-hidden="true"><span>GPU LEGENDS / GPU LEGENDS / </span><span>GPU LEGENDS / GPU LEGENDS / </span></div>
  <div className="stage-dots" aria-hidden="true"/><div className="stage-sparks" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{'--spark-index':i} as CSSProperties}/>)}</div>
  <div className="archive-left">
   <div className="archive-quote">CADA GERAÇÃO DEIXA UMA MARCA.<span>ELEIÇÃO DE LENDAS / 2026</span></div>
   <div className="hero-copy"><h1 id="election-question"><span className="archive-title-main">GPU</span><span className="archive-title-sub">LEGENDS</span></h1><p>{catalog.length} placas. De qual geração vem a sua favorita?</p><div className="hero-actions"><button className="button" onClick={onCatalog}><Vote/>Escolher e votar</button><button className="button secondary" onClick={onExplore}>Explorar galeria</button></div></div>
   <div className="archive-ledger"><div className="archive-ledger-heading"><span>ARQUIVO DE GERAÇÕES</span><span>03 / {catalog.length}</span></div><div className="hero-picks">{picks.map(c=><button className="hero-pick" onClick={()=>onDetail(c)} key={c.id}><ExhibitPhoto candidate={c} priority/><span><small>{c.year} / Nº {c.number}</small><b>{c.name}</b></span><span className="pick-marker" aria-hidden="true">◇</span></button>)}</div></div>
   <div className="archive-left-footer"><span className="hero-years">{years.first} <span>—</span> {years.last}</span><span className="archive-label">{catalog.length} CANDIDATAS</span></div>
  </div>
  <div className="archive-art" aria-hidden="true"><div className="art-window"><span className="art-ghost">GPU</span><div className="art-grid"/><img className="archive-gpu" src="/images/gpu-illustration.webp" alt="" width="1513" height="1040" fetchPriority="high" decoding="async"/><div className="art-spec-labels"><span>DO PRIMEIRO 3D</span><span>À ERA DO RAY TRACING</span><i/></div><div className="art-bottom-label"><span>HARDWARE / HISTÓRIA</span><Cpu/></div></div></div>
  <aside className="archive-right" aria-hidden="true"><span className="archive-edition">2026</span><div className="archive-vertical"><span>ESCOLHA SUA LENDA</span><small>GPU LEGENDS</small><i>◇</i></div><span className="archive-stamp">{years.first}<br/>—<br/>{years.last}</span></aside>
 </section>;
}

type GalleryProps={catalog:Candidate[];enabled:boolean;onDetail:(candidate:Candidate)=>void;onVote:(candidate:Candidate)=>void;voteLabel:string;disabled:boolean;total:number};
export function HorizontalExhibit({catalog,enabled,onDetail,onVote,voteLabel,disabled,total}:GalleryProps){
 const years=yearRange(catalog);const section=useRef<HTMLElement>(null);const viewport=useRef<HTMLDivElement>(null);const track=useRef<HTMLDivElement>(null);const stick=useRef<HTMLDivElement>(null);
 const metrics=useRef({start:0,distance:0,step:0});const [pinned,setPinned]=useState(false);const [active,setActive]=useState(0);const activeRef=useRef(0);
 useEffect(()=>{
  const host=section.current,windowEl=viewport.current,rail=track.current,sticky=stick.current;if(!host||!windowEl||!rail||!sticky)return;
  const media=matchMedia('(min-width: 901px) and (min-height: 660px)');let raf=0;
  const update=()=>{
   raf=0;const progress=galleryProgress(scrollY,metrics.current.start,metrics.current.distance);const shift=pinned?progress*metrics.current.distance:windowEl.scrollLeft;
   if(pinned)rail.style.transform='translate3d('+(-shift)+'px,0,0)';host.style.setProperty('--gallery-progress',String(pinned?progress:clamp(shift/Math.max(1,metrics.current.distance))));
   const index=Math.round(clamp(shift/Math.max(1,metrics.current.distance))*(catalog.length-1));if(index!==activeRef.current){activeRef.current=index;setActive(index);}
  };
  const schedule=()=>{if(!raf)raf=requestAnimationFrame(update);};
  const measure=()=>{
   const shouldPin=enabled&&media.matches;
   const headerHeight=document.querySelector('.site-header')?.getBoundingClientRect().height||86;host.style.setProperty('--header-height',headerHeight+'px');
   host.dataset.pinned=String(shouldPin);setPinned(shouldPin);
   const distance=Math.max(0,rail.scrollWidth-windowEl.clientWidth);const first=rail.firstElementChild as HTMLElement|null;const gap=parseFloat(getComputedStyle(rail).gap)||24;
   metrics.current={start:host.getBoundingClientRect().top+scrollY-headerHeight,distance,step:(first?.offsetWidth||0)+gap};
   host.style.height=shouldPin?distance+sticky.offsetHeight+'px':'auto';
   if(!shouldPin)rail.style.transform='none';schedule();
  };
  const resize=new ResizeObserver(measure);resize.observe(windowEl);resize.observe(rail);const header=document.querySelector('.site-header');if(header)resize.observe(header);
  window.addEventListener('scroll',schedule,{passive:true});windowEl.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',measure);media.addEventListener('change',measure);measure();
  return()=>{cancelAnimationFrame(raf);resize.disconnect();window.removeEventListener('scroll',schedule);windowEl.removeEventListener('scroll',schedule);window.removeEventListener('resize',measure);media.removeEventListener('change',measure);rail.style.transform='none';host.style.height='auto';};
 },[enabled,catalog.length,pinned]);
 function go(index:number){const next=Math.round(clamp(index,0,catalog.length-1));const shift=next/Math.max(1,catalog.length-1)*metrics.current.distance;if(pinned)window.scrollTo({top:metrics.current.start+shift,behavior:enabled?'smooth':'auto'});else viewport.current?.scrollTo({left:shift,behavior:enabled?'smooth':'auto'});}
 return <section ref={section} id="gpu-gallery" className="horizontal-exhibit" aria-labelledby="gallery-heading" data-pinned={pinned}>
  <div ref={stick} className="gallery-sticky"><div className="gallery-heading"><div><div className="eyebrow">01 / EXPOSIÇÃO</div><h2 id="gallery-heading">Destaques entre gerações<span>.</span></h2></div><p>{pinned?'Continue rolando para percorrer as placas.':'Deslize para percorrer as placas.'}<br/><span>{years.first} — {years.last} / {catalog.length} destaques · {total} candidatas</span></p></div>
   <div ref={viewport} className="gallery-viewport" tabIndex={0} aria-label="Galeria horizontal de placas" onKeyDown={event=>{if(event.target!==event.currentTarget)return;if(event.key==='ArrowRight'){event.preventDefault();go(active+1);}if(event.key==='ArrowLeft'){event.preventDefault();go(active-1);}if(event.key==='Home'){event.preventDefault();go(0);}if(event.key==='End'){event.preventDefault();go(catalog.length-1);}}}>
    <div ref={track} className="gallery-track">{catalog.map((c,index)=><article className="exhibit-card" key={c.id} onFocusCapture={()=>{if(pinned&&active!==index)go(index);}}><div className="exhibit-card-top"><span>Nº {c.number} / {c.manufacturer}</span><b>{c.year}</b></div><button className="exhibit-photo" aria-label={'Ver ficha de '+c.name} onClick={()=>onDetail(c)}><ExhibitPhoto candidate={c} priority={index<2}/></button><div className="exhibit-card-copy"><span className="exhibit-architecture">{c.architecture} / {c.memory} {c.memoryType}</span><h3>{c.name}</h3><p>{c.tagline}</p><div className="exhibit-actions"><button className="button" onClick={()=>onVote(c)} disabled={disabled}><Vote/>{voteLabel}</button><button className="card-details" onClick={()=>onDetail(c)}>Ver ficha</button></div></div></article>)}</div>
   </div>
   <div className="gallery-controls"><div className="gallery-index"><b>{String(active+1).padStart(2,'0')}</b><span>/ {String(catalog.length).padStart(2,'0')}</span><div className="gallery-progress"><span/></div></div><div className="gallery-buttons"><button className="button ghost small" onClick={()=>go(active-1)} disabled={active===0}>Anterior</button><button className="button secondary small" onClick={()=>go(active+1)} disabled={active===catalog.length-1}>Próxima</button></div></div>
  </div>
 </section>;
}
