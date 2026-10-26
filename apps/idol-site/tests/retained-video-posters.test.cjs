const {checkOriginals}=require('./helpers/poster-provenance.cjs');
const cases=[
 {work:'recvxyOz5XdFJL',video:'ArmDp-zijuc',song:'Super Shy',src:'/artist/newjeans/figma-display/media-recvxyOz5XdFJL-ec9a05cc78.jpg',sha:'ec9a05cc78b4b1feb98f6f51c2e178b58b788656ab2d1f5ea95ef27b96c0f4ff',label:'MV 预览图（Bugs 来源）',manifest:'data/newjeans-image-sources.json',origin:'https://image.bugsm.co.kr/mvhd/images/1280/6180/618075.jpg'},
 {work:'recvxyOz5XEvYC',video:'7HDeem-JaSY',song:'Queencard',src:'/artist/idle/display/media-recvxyOz5XEvYC--media-recvxyOz5XEvYC.jpg',sha:'96c1929b4ee1348930a8a1e408eba2134c35dfd0cc4a9512762b1a119350321c',label:'官方 MV 视频封面',manifest:'data/idle-design-public.json',origin:'https://img.youtube.com/vi/7HDeem-JaSY/maxresdefault.jpg'},
 {work:'recvxyOz5XYOoF',video:'_ZAgIHmHLdc',song:'OMG',src:'/artist/newjeans/figma-display/media-recvxyOz5XYOoF-342d3e0f6c.jpg',sha:'342d3e0f6c60c74b24f8fca7abedfe42c27429f771aac445d950433fdfe3182c',label:'MV 预览图（Bugs 来源）',manifest:'data/newjeans-image-sources.json',origin:'https://image.bugsm.co.kr/mvhd/images/1280/6141/614199.jpg'},
 {work:'recvxyH5pzL7oj',video:'RknLOnO6ZtI',song:'DANG! (hocus pocus)',src:'/artist/billlie/display/billlie-recvxyH5pzL7oj-mv-RknLOnO6ZtI.jpg',sha:'aef33a36396dfcaaf8d40708a25547a8872c798487d9250cdf3e41369af25d11',label:'MV 预览图',manifest:'data/billlie-figma-asset-manifest.json',origin:'research/video-thumbnails/billlie-recvxyH5pzL7oj-mv-RknLOnO6ZtI.jpg'},
];
checkOriginals('Retained legacy previews',cases);
