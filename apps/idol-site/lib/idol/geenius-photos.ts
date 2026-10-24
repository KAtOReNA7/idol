const root='/artist/geenius/';
export function geeniusOriginalPhoto(src:string){const match=src.match(/^\/artist\/geenius\/batch-b-20261016-webp-v1\/(group|yeyoung|sion|mika|zoe|andamiro)-display\.webp$/);return match?root+'batch-b-20261016/'+match[1]+'.original.'+(match[1]==='group'?'png':'jpg'):src;}
