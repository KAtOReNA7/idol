'use client';
import {useEffect,useState} from 'react';
import {useArtistTimelineHostOptions,ArtistTimelineHost} from './artist-timeline-host';
import {catalogReadWithDeadline} from '@/lib/idol/catalog-read-deadline';
import {informationGroupId,renderGroupInformation} from '@/lib/idol/group-information.mjs';
import type {CatalogView} from '@/lib/idol/types';
import '../public/artist/group-information.css';

function useInformationCatalog(slug:string){
 const host=useArtistTimelineHostOptions(),[catalog,setCatalog]=useState<CatalogView|null>(null);
 useEffect(()=>{if(host.catalog!==undefined)return;const controller=new AbortController();void catalogReadWithDeadline(async signal=>{const response=await fetch(`/api/catalog?artist=${encodeURIComponent(slug)}&shape=display-v1`,{signal,cache:'no-store'});if(!response.ok)throw new Error('无法读取账号记录');return await response.json() as CatalogView;},controller.signal).then(c=>{if(!controller.signal.aborted)setCatalog(c);}).catch(()=>{});return()=>controller.abort();},[slug,host.catalog]);
 return host.catalog!==undefined?host.catalog:catalog;
}
export function ArtistInformation({slug}:{slug:string}){
 const group=useInformationCatalog(slug)?.groups.find(g=>g.id===informationGroupId(slug));
 return <div className="artist-information-host" dangerouslySetInnerHTML={{__html:renderGroupInformation(slug,group)}}/>;
}
export function ArtistHomeTimeline({slug}:{slug:string}){const host=useArtistTimelineHostOptions(),catalog=useInformationCatalog(slug),id=informationGroupId(slug);return <section className="artist-home-timeline" data-home-module="timeline"><header><small>TIMELINE</small><h2>时间轴</h2><a href={`/artists/${slug}?section=updates`}>完整时间轴 ↗</a></header>{id&&<ArtistTimelineHost groupId={id} catalog={catalog??null} loading={host.loading} error={host.error}/>}</section>;}
