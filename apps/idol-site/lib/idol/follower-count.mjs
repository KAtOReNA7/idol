// Presentation only. Keep the source's count label, precision and date unchanged.
export function followerCount(label) {
 if(typeof label!=='string')return null;
 const match=label.trim().replace(/^(?:约|大约|about)\s*/i,'').match(/^([\d,]+(?:\.\d+)?)\s*(万|亿|[KMB])?(?:\s*(?:位|人|粉丝|关注者?|订阅者?|followers?|subscribers?))*\s*$/i);
 if(!match)return null;
 const count=Number(match[1].replaceAll(',',''))*({万:1e4,亿:1e8,K:1e3,M:1e6,B:1e9}[match[2]?.toUpperCase()]??1);
 return Number.isFinite(count)&&count>=0?count:null;
}
export function formatFollowerCount(label) {
 const count=followerCount(label);
 return count===null?null:count<1e4?`${Math.round(count)}人`:`${Math.round(count/1e4)}万`;
}
export function followerAccountLabel(account) {
 const value=formatFollowerCount(account.countLabel);
 return value?value+(account.platform==='youtube'?' 订阅':' 粉丝'):'打开主页';
}
