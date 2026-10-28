const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto');
const {reviewedNativeRecognition:read}=require('./helpers/public-artist-loader.cjs')('lib/idol/reviewed-native-recognition.ts');
const row=require('../data/reviewed-native-recognition.json').records[0];
const {MvIdentityPhoto}=require('./helpers/image-dependency-loader.cjs').imageDependency('@/components/mv-identity-photo');
const React=require('react'),{renderToStaticMarkup}=require('react-dom/server');
test('native recognition upgrade requires exact work/video/member and retains original native access',()=>{
 const work={id:row.workId,url:`https://www.youtube.com/watch?v=${row.videoId}`};
 const photo={table:'ratings',recordId:row.nativeRecordId,index:row.nativeIndex,fieldId:'photo'};
 const before=structuredClone(photo);
 assert.equal(read(work,row.memberId,photo).src,row.src);
 for(const args of [[{...work,id:'wrong'},row.memberId,photo],[{...work,url:'https://youtu.be/abcdefghijk'},row.memberId,photo],[work,'wrong',photo],[work,row.memberId,null],[work,row.memberId,{...photo,recordId:'different'}],[work,row.memberId,{...photo,index:1}]])assert.equal(read(...args),null);
 const html=renderToStaticMarkup(React.createElement(MvIdentityPhoto,{work,memberId:row.memberId,label:'SUHYEON',photo,live:true}));
 assert(html.includes(row.src));assert(html.includes('查看原有照片'));assert.deepEqual(photo,before);
 const b=fs.readFileSync('public'+row.src);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),'73c07ca63a99529c0e24609a1f9d6e917b78d24d22b648683928a536de7fa6a3');
 assert.equal(row.sourceCrop.width/row.sourceCrop.height,3/4);
});
