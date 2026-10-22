// Public catalog text only. Keep fields separate so a compact query can never
// join the end of one name to the beginning of another name or company.
export type NameSearchField={text:string;compact:string};
export type NameSearchQuery={terms:NameSearchField[];valid:boolean};
const separators=/[\s\-‐‑‒–—―_'’‘.·・･()[\]{}\/\\]/gu;
const hasNameCharacter=new RegExp('[\\p{L}\\p{N}]','u');
const normalize=(value:string)=>value.normalize('NFKC').toLowerCase().trim().replace(/\s+/gu,' ');
const field=(text:string):NameSearchField=>({text,compact:text.replace(separators,'')});

export function indexNameFields(values:(string|null|undefined)[]):NameSearchField[]{
 return values.filter((value):value is string=>typeof value==='string'&&!!value.trim()).map(value=>field(normalize(value)));
}
export function nameSearchQuery(value:string):NameSearchQuery{
 const text=normalize(value);
 return {terms:text?text.split(' ').map(field).filter(term=>!!term.compact):[],valid:!text||hasNameCharacter.test(text)};
}
export function matchesNameFields(fields:NameSearchField[],query:NameSearchQuery):boolean{
 return query.valid&&query.terms.every(term=>fields.some(value=>value.text.includes(term.text)||value.compact.includes(term.compact)));
}
