import fixture from '@/fixtures/catalog.json';

// A closed registry of synthetic fixtures. No upstream fetch, token or storage I/O.
export function GET(request:Request){
 const params=new URL(request.url).searchParams;
 const table=params.get('table'),record=params.get('record'),index=params.get('index');
 const photos=[...fixture.members.map(m=>m.photo),...fixture.ratings.map(r=>r.photo)];
 const photo=photos.find(p=>p&&p.table===table&&p.recordId===record&&String(p.index)===index);
 if(!photo)return Response.json({error:'SYNTHETIC_MEDIA_NOT_FOUND'},{status:404});
 const landscape=table==='ratings'&&record?.endsWith('Rating1');
 const [width,height]=landscape?[900,500]:[400,600];
 const label=landscape?'LANDSCAPE':'PORTRAIT';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><rect width="100%" height="100%" fill="#eee9f4"/><rect x="8" y="8" width="${width-16}" height="${height-16}" fill="none" stroke="#776286" stroke-width="4"/><path d="M0 0L${width} ${height}M${width} 0L0 ${height}" stroke="#d4c6e0" stroke-width="2"/><circle cx="${width/2}" cy="${height/2-30}" r="55" fill="#c6b3d4"/><text x="50%" y="${height/2+65}" text-anchor="middle" font-family="sans-serif" font-size="22" fill="#51415e">SYNTHETIC ${label}</text><text x="50%" y="${height/2+98}" text-anchor="middle" font-family="sans-serif" font-size="16" fill="#51415e">${width} × ${height} · no real photo</text><circle cx="14" cy="14" r="8" fill="#a66e82"/><circle cx="${width-14}" cy="14" r="8" fill="#a66e82"/><circle cx="14" cy="${height-14}" r="8" fill="#a66e82"/><circle cx="${width-14}" cy="${height-14}" r="8" fill="#a66e82"/></svg>`;
 return new Response(svg,{headers:{'Content-Type':'image/svg+xml','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; sandbox"}});
}
