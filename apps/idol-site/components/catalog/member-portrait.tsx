'use client';
import musicPortraits from '@/data/music-member-artwork.json';
import musicGroupRegistry from '@/data/artist-timeline-registry.json';
import {vvupMemberPortrait} from '@/lib/idol/vvup-photos';
import {itzyMemberPortrait} from '@/lib/idol/itzy-photos';
import {weeeklyMemberPortrait} from '@/lib/idol/weeekly-photos';
import {cherrybulletMemberPortrait} from '@/lib/idol/cherrybullet-photos';
import {rocketpunchMemberPortrait} from '@/lib/idol/rocketpunch-photos';
import {everglowMemberPortrait} from '@/lib/idol/everglow-photos';
import {fromis9MemberPortrait} from '@/lib/idol/fromis9-photos';
import {izoneMemberPortrait} from '@/lib/idol/izone-photos';
import {idleMemberPortrait} from '@/lib/idol/idle-photos';
import {atheartMemberPortrait} from '@/lib/idol/atheart-photos';
import {hitgsMemberPortrait} from '@/lib/idol/hitgs-photos';
import {vchaMemberPortrait} from '@/lib/idol/vcha-photos';
import {sevenJournalPortrait} from '@/components/seven-redesign/journal';
import {memberDisplayName} from '@/lib/idol/member-display-name';
import {useState} from 'react';
import type {Member} from '@/lib/idol/types';
import {PhotoLightbox} from '@/components/photo-lightbox';
import {ConceptPhotoImage} from '@/components/app-image-presentation';
import {BABYMONSTER_GROUP_ID, ILLIT_GROUP_ID, XG_GROUP_ID, AESPA_GROUP_ID, IVE_GROUP_ID, KIOF_GROUP_ID, STAYC_GROUP_ID} from '@/lib/idol/artist-navigation';
import artistVisuals from '@/data/artist-visuals.json';
import {tracerMemberPortrait} from '@/lib/idol/tracer-photos';
import {katseyeMemberPortrait} from '@/lib/idol/katseye-photos';
import {spiaMemberPortrait} from '@/lib/idol/spia-photos';
import {witchxMemberPortrait} from '@/lib/idol/witchx-photos';
import {PhotoView} from './presentation';

export function musicMemberPortrait(m:Member,artistReturn?:string|null){const visualKey=m.groupIds.includes(BABYMONSTER_GROUP_ID)?'babymonster':m.groupIds.includes(ILLIT_GROUP_ID)?'illit':m.groupIds.includes(XG_GROUP_ID)?'xg':m.groupIds.includes(AESPA_GROUP_ID)?'aespa':m.groupIds.includes(IVE_GROUP_ID)?'ive':m.groupIds.includes(KIOF_GROUP_ID)?'kissoflife':m.groupIds.includes(STAYC_GROUP_ID)?'stayc':null;const displayGroups=m.groupIds.length?m.groupIds:(m.formerGroupIds??[]);const fallback=musicPortraits.find(a=>displayGroups.includes(a.groupId)&&(!a.memberId||a.memberId===m.id)&&a.stageName.toLowerCase()===m.stageName.toLowerCase());const currentPath=musicGroupRegistry.find(g=>displayGroups.includes(g.groupId))?.path;const defaultSeven=sevenJournalPortrait(m,artistReturn??currentPath);return defaultSeven??itzyMemberPortrait(m)??vvupMemberPortrait(m,artistReturn)??weeeklyMemberPortrait(m,artistReturn)??cherrybulletMemberPortrait(m,artistReturn)??rocketpunchMemberPortrait(m,artistReturn)??everglowMemberPortrait(m,artistReturn)??fromis9MemberPortrait(m,artistReturn)??izoneMemberPortrait(m,artistReturn)??idleMemberPortrait(m)??atheartMemberPortrait(m)??hitgsMemberPortrait(m)??vchaMemberPortrait(m)??katseyeMemberPortrait(m)??spiaMemberPortrait(m)??witchxMemberPortrait(m)??tracerMemberPortrait(m)??(visualKey?(artistVisuals[visualKey].members as Record<string,{image:string;label:string;date:string}>)[m.stageName]:null)??fallback??null;}
export function MusicPortrait({concept,member:m}:{concept:{image:string;label:string;date:string};member:Member}){const [open,setOpen]=useState(false);return <div className="music-portrait-original"><button type="button" className="photo" aria-label={'查看 '+memberDisplayName(m)+' 原图'} onClick={()=>setOpen(true)}><ConceptPhotoImage src={concept.image} memberId={m.id} label={m.stageName+' · '+concept.label}/></button><p>{concept.label}{concept.date?' · '+concept.date:''}</p><button className="text-button" onClick={()=>setOpen(true)}>查看原图 ↗</button>{open&&<PhotoLightbox src={concept.image} label={m.stageName+' · '+concept.label} onClose={()=>setOpen(false)}/>}</div>;}
export function MusicMemberPhoto({member:m,live}:{member:Member;live:boolean}){const concept=musicMemberPortrait(m);return concept?<div className="photo"><ConceptPhotoImage src={concept.image} memberId={m.id} label={m.stageName+' · '+concept.label}/></div>:<PhotoView photo={m.photo} label={memberDisplayName(m)} live={live}/>;}
