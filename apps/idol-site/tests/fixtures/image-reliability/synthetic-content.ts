/** Image-only synthetic source shapes. Reuses the earlier exact shape declarations;
 * all values and image endpoints are generated within this tests directory.
 */
import {candidateContent,expandedContent,babymonsterContent,illitContent,featuredReleaseContent,releaseCoverageContent,itzyContent} from '../timeline-host/synthetic-artist-content';
import type {ExpandedArtistContent} from '../../../components/expanded-artist';
import {fixtureMemberId} from './synthetic-catalog';
function decorate<T extends ExpandedArtistContent>(base:T,slug:string){
 return {...base,profile:{...base.profile,members:['FIXTURE_A','FIXTURE_B']},
 hero:{...base.hero,image:`/image-fixture/hero.png?host=${slug}`,caption:'合成宿主图片，不是真实照片'},
 memberVisuals:{FIXTURE_A:{image:`/image-fixture/portrait-a.png?host=${slug}`,label:'合成 A',date:'测试时期'},FIXTURE_B:{image:`/image-fixture/portrait-b.png?host=${slug}`,label:'合成 B',date:'测试时期'}}};
}
export function candidateImageContent(slug:string,groupId:string,index:number){
 const base=candidateContent(slug,groupId,'合成图片宿主 '+slug);
 return {...base,hero:{image:`/image-fixture/hero.png?host=${slug}`,caption:'合成团体图，不是真实照片',sourceUrl:'https://image-fixture.example/credit'},
 portraits:Object.fromEntries((['A','B'] as const).map(suffix=>[fixtureMemberId(index,suffix),{image:`/image-fixture/portrait-${suffix.toLowerCase()}.png?host=${slug}`,stageName:`FIXTURE_${suffix}`,sourceUrl:'https://image-fixture.example/credit',credit:'合成来源范围：整张展示'}]))};
}
export const expandedImageContent=(slug:string,id:string)=>decorate(expandedContent(id,'合成图片宿主 '+slug),slug);
export const babymonsterImageContent=(slug:string,id:string)=>decorate(babymonsterContent(id,'合成图片宿主 '+slug),slug);
export const illitImageContent=(slug:string,id:string)=>decorate(illitContent(id,'合成图片宿主 '+slug),slug);
export const featuredImageContent=(slug:string,id:string)=>decorate(featuredReleaseContent(id,'合成图片宿主 '+slug),slug);
export const releaseImageContent=(slug:string,id:string)=>decorate(releaseCoverageContent(id,'合成图片宿主 '+slug),slug);
export const itzyImageContent=(slug:string,id:string)=>decorate(itzyContent(id,'合成图片宿主 '+slug),slug);
