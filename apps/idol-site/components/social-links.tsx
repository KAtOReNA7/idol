import {ArrowUpRight} from 'lucide-react';
import type {SocialAccount} from '@/lib/idol/types';
const names:Record<string,string>={instagram:'Instagram',x:'X',youtube:'YouTube',tiktok:'TikTok'};
export function accountCountLabel(a:SocialAccount){if(!a.countLabel)return '打开主页';const text=a.countLabel.replace(/followers/gi,'粉丝').replace(/subscribers/gi,'订阅');return /粉丝|关注|订阅/.test(text)?text:text+(a.platform==='youtube'?' 订阅':' 粉丝');}
export function SocialLinks({accounts,title,individual=false}:{accounts:SocialAccount[];title:string;individual?:boolean}){
 if(!accounts.length)return individual?<p className="subtle member-social-empty">暂未收录个人社媒账号</p>:null;
 return <section className={'social-section '+(individual?'individual-social':'')} aria-label={title}><h2>{title}</h2><div className="social-cards">{accounts.map(a=><a key={a.platform} href={a.url} target="_blank" rel="noopener noreferrer"><span>{names[a.platform]||a.platform}<ArrowUpRight size={14}/></span><strong>{accountCountLabel(a)}</strong><small>{a.observedAt?'采集于 '+a.observedAt.slice(0,10):'粉丝数暂未收录'}</small></a>)}</div></section>;
}
