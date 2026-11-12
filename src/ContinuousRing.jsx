import React, { useLayoutEffect, useRef, useState } from 'react';
import { useMotionValueEvent, useScroll, useSpring, useTransform } from 'framer-motion';
import RingScene from './RingScene';

const chapterIds = ['imaginer', 'faconner', 'sertir', 'transmettre'];
const stages = ['Le premier trait', 'La matière prend forme', 'La rencontre de la pierre', 'Le dernier éclat'];

export default function ContinuousRing({ still }) {
  const host = useRef(null);
  const { scrollY } = useScroll({ offset: ['start start', 'end end'] });
  const [stops, setStops] = useState([0, 1800, 2700, 3600, 4500]);
  const [stage, setStage] = useState(0);
  // One continuous timeline, measured from the actual responsive chapter layout.
  // This canvas stays mounted from the first pencil line to the footer.
  const targetProgress = useTransform(scrollY, stops, [.2, .28, .56, .86, 1]);
  const progress = useSpring(targetProgress, { stiffness: 100, damping: 26, mass: .38, restDelta: .0001, restSpeed: .0001 });
  useLayoutEffect(() => {
    const measure = () => {
      const viewport = window.innerHeight;
      const hero = document.getElementById('accueil').getBoundingClientRect();
      const next = [Math.max(0, hero.bottom + window.scrollY - viewport * .6)];
      chapterIds.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        next.push(Math.max(next.at(-1) + 1, rect.top + window.scrollY + rect.height * .72 - viewport * .5));
      });
      if (next.length === 5) setStops(previous => previous.every((v, i) => Math.abs(v - next[i]) < 1) ? previous : next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(document.getElementById('main'));
    window.addEventListener('resize', measure);
    return () => { observer.disconnect(); window.removeEventListener('resize', measure); };
  }, []);
  useMotionValueEvent(progress, 'change', value => {
    if (host.current) host.current.dataset.progress = value.toFixed(4);
    setStage(value < .28 ? 0 : value < .56 ? 1 : value < .86 ? 2 : 3);
  });
  return <aside className="continuous-ring" aria-label="La naissance d’une bague" ref={host} data-progress={progress.get().toFixed(4)}>
    <div className="ring-caption sr-only">
      <span className="eyebrow">DU TRAIT AU BIJOU</span>
      <p>{stages[still ? 3 : stage]}</p>
    </div>
    <div className="continuous-ring-canvas">
      <RingScene progress={still ? 1 : progress} playing={false} fixedPose interactive={false}/>
    </div>
  </aside>;
}
