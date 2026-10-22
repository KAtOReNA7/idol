'use client';

import {useLayoutEffect, useRef, useState} from 'react';
import native from '@/data/design-review/unis-native-artwork.json';
import retained from '@/data/design-review/unis-retained-source-artwork.json';

type ArtworkRole = keyof typeof native.roles;
type Glyph = {nodeId?: string; sourceComponent?: string; asset: string; left: number; top: number};
type Geometry = {frameId: string; slot: string; width: number; height: number; complete: boolean; glyphs: Glyph[]};
type Asset = {runtime: string; rootWidth: number; rootHeight: number; provenance?: string};
const assets = {...native.assets, ...retained.assets} as Record<string, Asset>;

/** Whole native node exports plus explicitly labeled retained authored components.
 * Source paths, transforms and intrinsic root dimensions stay unchanged.
 * exportAsync already applies the original flip; repeating it would invert N.
 * Responsive downscaling affects the containing stage uniformly, never SVG roots.
 */
function NativeStage({geometry}: {geometry: Geometry}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState(1);
  useLayoutEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setScale(Math.min(1, node.clientWidth / geometry.width));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, [geometry.width]);
  return <span ref={ref} className="uf-native-art" data-native-artwork={`${geometry.frameId}/${geometry.slot}`}
    style={{width: geometry.width, maxWidth: '100%', aspectRatio: `${geometry.width} / ${geometry.height}`}}>
    <span className="uf-native-art-stage" style={{width: geometry.width, height: geometry.height, transform: `scale(${scale})`}}>
      {geometry.glyphs.map(glyph => <img key={glyph.nodeId ?? glyph.sourceComponent} src={assets[glyph.asset].runtime} alt="" draggable={false} data-native-node={glyph.nodeId} data-retained-source-component={glyph.sourceComponent} data-artwork-provenance={assets[glyph.asset].provenance}
        width={assets[glyph.asset].rootWidth} height={assets[glyph.asset].rootHeight} style={{left: glyph.left, top: glyph.top}}/>)}
    </span>
  </span>;
}

export function UnisNativeText({role, label}: {role: ArtworkRole; label: string}) {
  const variants = (role === 'swicy' ? {...native.roles.swicy, ...retained.roles.swicy} : native.roles[role]) as Record<string, Geometry>;
  return <span className={`uf-native-label uf-native-role-${role}`}><span className="uf-visually-hidden">{label}</span>
    {Object.entries(variants).map(([variant, geometry]) => <span key={variant} aria-hidden="true" className={`uf-native-variant uf-native-${variant}`} data-native-complete={geometry.complete}>
      {geometry.complete ? <NativeStage geometry={geometry}/> : <span className="uf-native-pending" data-native-assets-pending>标题暂时无法显示</span>}
    </span>)}
  </span>;
}

export function UnisNativeColourDots() {
  return <div className="uf-colour-dots" aria-hidden="true">{native.decorations.heroDots.map(item => <img key={item.nodeId} data-native-node={item.nodeId}
    src={assets[item.asset].runtime} alt="" width={assets[item.asset].rootWidth} height={assets[item.asset].rootHeight}/>)}</div>;
}

/** Primitive layers stay separate from live controls, text and data-supplied images. */
import {createContext, useContext} from 'react';
import primitiveData from '@/data/design-review/unis-native-primitives.json';
export type UnisNativeScreen = keyof typeof primitiveData.screens;
export const UnisNativeScreenContext = createContext<UnisNativeScreen>('home');
type PrimitiveLayer = {nodeId: string; asset: string; left: number; top: number; layer: 'base' | 'interaction'};
type PrimitiveGeometry = {width: number; height: number; layers: PrimitiveLayer[]};
const primitiveAssets = primitiveData.assets as Record<string, Asset>;
const primitiveScreens = primitiveData.screens as Record<string, Record<string, {frameId: string; slots: Record<string, PrimitiveGeometry>}>>;

function PrimitiveStage({geometry, frameId, slot}: {geometry: PrimitiveGeometry; frameId: string; slot: string}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [scale, setScale] = useState({x: 1, y: 1});
  useLayoutEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () => setScale({x: element.getBoundingClientRect().width / geometry.width, y: element.getBoundingClientRect().height / geometry.height});
    measure(); const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, [geometry.width, geometry.height]);
  return <span ref={ref} className="uf-native-surface-box" data-native-surface={`${frameId}/${slot}`}>
    {(['base', 'interaction'] as const).map(kind => <span key={kind} className={`uf-native-surface-stage${kind === 'interaction' ? ' uf-native-hit-stage' : ''}`} style={{width: geometry.width, height: geometry.height, transform: `scale(${scale.x}, ${scale.y})`}}>
      {geometry.layers.filter(layer => layer.layer === kind).map(layer => <img key={layer.nodeId} src={primitiveAssets[layer.asset].runtime} alt="" draggable={false} data-native-node={layer.nodeId}
        width={primitiveAssets[layer.asset].rootWidth} height={primitiveAssets[layer.asset].rootHeight} style={{left: layer.left, top: layer.top}}/>)}
    </span>)}
  </span>;
}

export function UnisNativeSurface({slot, className = '', screen: screenOverride}: {slot: string; className?: string; screen?: UnisNativeScreen}) {
  const currentScreen = useContext(UnisNativeScreenContext), screen = screenOverride ?? currentScreen;
  return <span className={`uf-native-surface ${className}`} aria-hidden="true">
    {Object.entries(primitiveScreens[screen]).map(([variant, frame]) => {
      // Extra real catalog rows reuse the same native row/control surface, without inventing IDs.
      const fallback = slot.replace(/^(work-|release-row-)\d+/, (_, prefix: string) => prefix + '0');
      const geometry = frame.slots[slot] ?? frame.slots[fallback];
      return geometry ? <span key={variant} className={`uf-native-variant uf-native-${variant}`}><PrimitiveStage geometry={geometry} frameId={frame.frameId} slot={slot}/></span> : null;
    })}
  </span>;
}

/** The canonical timeline has 13 data rows; measure its real axis rather than dropping records. */
export function UnisNativeTimelineAxis() {
  const ref = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = ref.current, host = element?.parentElement;
    if (!element || !host) return;
    const measure = () => {
      const nodes = host.querySelectorAll<HTMLElement>('.at-node');
      if (!nodes.length) return;
      const bounds = host.getBoundingClientRect(), first = nodes[0].getBoundingClientRect(), last = nodes[nodes.length - 1].getBoundingClientRect();
      element.style.left = `${first.left - bounds.left + first.width / 2}px`;
      element.style.top = `${first.top - bounds.top + first.height / 2 + 2}px`;
      element.style.height = `${Math.max(0, last.top - first.top + 20)}px`;
    };
    measure(); const observer = new ResizeObserver(measure); observer.observe(host);
    return () => observer.disconnect();
  }, []);
  return <span ref={ref} className="uf-native-timeline-axis"><UnisNativeSurface slot="timeline-line" screen="timeline"/></span>;
}
