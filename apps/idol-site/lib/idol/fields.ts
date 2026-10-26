import type {TableKey} from './feishu';
export const F={
 groups:{name:'fld67LEUaG',generation:'fldigq75J4',company:'fld3qJAEeV',country:'fld7jnin0G',note:'fld3SVWhWc',debut:'fldvkImxXW',members:'fldhQc8PnX',works:'fldDrA68Gz',currentName:'fldWnQ0FGQ',status:'fldmdYTnjK',officialUrl:'fld4wyGltW',channelUrl:'fld5HjXcS6'},
 members:{name:'fldkWtH5Dl',photo:'fldTMEUgHF',cnName:'fld3ZUEOW4',groups:'fld6bhQOdO',formerGroups:'fldf1alCIu',country:'fldymKJ73x',birthDate:'fld5tiO7Is',role:'fldFqUenwo',stageName:'fld1jPwSAP',favorite:'fld1yLzS5g',note:'fld6bHl8sq',status:'fld3U12Dow',profile:'fld2J3j9r8',officialUrl:'fld4QBGQoc'},
 works:{name:'fld7a3lnBc',groups:'fld2wy1cqw',url:'fldhBWXBZE',song:'fld6ahf75U',score:'fld38CJY2U',stageScore:'fld641ausT',ratings:'fldkgbJyiR',note:'fld4yOdHT5',watched:'fld3QKrpLN',videoType:'fld1vZ4MUc',version:'fld3owwWZX',releaseDate:'fldyhFRnND',verification:'fld7dhbVjg',officialTitle:'fld6nT26GF',channel:'fld566aFV0',source:'fld1bEQ9rf'},
 ratings:{name:'fld6BveWOh',works:'fld58b7Cvs',verification:'fldiYFtE0V',members:'fldNSoSjTU',photo:'fldoddL0Gv',score:'fld7E8yx1a',stylingScore:'fld49NJY1j',memory:'fld1L5cSac',note:'fld3y0fn7i',source:'fld7zAVhN2',recognition:'flduuZFo4O'}
} as const;
// This explicit policy never derives permission from browser input or captured userEditable flags.
export const EDITABLE:Record<TableKey,Record<string,{id:string;type:'number'|'numeric_text'|'text'|'select';types:number[]}>>={
 groups:{note:{id:F.groups.note,type:'text',types:[1]}},
 members:{favorite:{id:F.members.favorite,type:'number',types:[2]},note:{id:F.members.note,type:'text',types:[1]}},
 works:{score:{id:F.works.score,type:'number',types:[2]},stageScore:{id:F.works.stageScore,type:'number',types:[2]},note:{id:F.works.note,type:'text',types:[1]},watched:{id:F.works.watched,type:'select',types:[3]}},
 ratings:{score:{id:F.ratings.score,type:'numeric_text',types:[1]},stylingScore:{id:F.ratings.stylingScore,type:'number',types:[2]},memory:{id:F.ratings.memory,type:'text',types:[1]},note:{id:F.ratings.note,type:'text',types:[1]}}
};
