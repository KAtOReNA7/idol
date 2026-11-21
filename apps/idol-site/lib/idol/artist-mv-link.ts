import type {CatalogView} from './types';
import {artistWorkUrl} from './artist-preview';
import {videoId} from './values';

// The public catalog confirmed these exact home-card sources and work IDs before hydration.
const verifiedHomeWork: Readonly<Record<string,string>> = {
  // cherrybullet
  "recvxyEBDZm40w:85h-tVHNasg": "recvxyH5pza4kq",
  "recvxyEBDZm40w:sXQ3c2TAbH8": "recvxyH5pzU0qX",
  // everglow
  "recvxyEBDZ9Jl3:pe3EWBY7SIc": "recvxyH5pznMiW",
  "recvxyEBDZ9Jl3:srA5cabrz1g": "recvxyH5pzPbao",
  // fromis9
  "recvxyEBDZcosR:sLk8zWUuYTA": "recvxyOz5XaZIt",
  "recvxyEBDZcosR:r1QapH1SIAI": "recvxyOz5XJpI9",
  // idle
  "recvxyEBDZqkpg:Jh4QFaPmdss": "recvxyOz5XuYef",
  // izone
  "recvxyEBDZ52oG:G8GaQdW2wHc": "recvxyH5pzBdad",
  "recvxyEBDZ52oG:eDEFolvLn0A": "recvxyH5pzMZA0",
  // rocketpunch
  "recvxyEBDZB3pz:D7dzSapaIS4": "recvxyH5pzPAfy",
  "recvxyEBDZB3pz:oAbhfMWvcZs": "recvxyH5pzb37S",
  // weeekly
  "recvxyEBDZPbu5:WPGkYxm8xps": "recvxyH5pzCrq5",
  "recvxyEBDZPbu5:9qRmlYPJB10": "recvxyH5pzr7Nc",
  // adya
  "rec28ldfRTiDtr:v08zVNXb4is": "rec28ldfRTrH9V",
  "rec28ldfRTiDtr:phkIQcY3BXg": "rec28ldfRTrHdF",
  "rec28ldfRTiDtr:-Xqhrnql7mg": "rec28ldfRTrHhL",
  // geenius
  "rec28ldfRTiDxx:KnoZi2E7RDw": "rec28ldfRTrPmh",
  "rec28ldfRTiDxx:oheqbYaOd3g": "recvxIZRQAko79",
  "rec28ldfRTiDxx:NLa_eJYKcfQ": "recvxIZRWKKCeh",
  "rec28ldfRTiDxx:BF3kLvjQE4Q": "recvxIZRWKBgDC",
  "rec28ldfRTiDxx:BwbY56T9EXo": "recvxIZXUpORHf",
  "rec28ldfRTiDxx:Qp3nqWwBKVk": "recvxIZY0lVCCr",
  // oddyouth
  "rec28ldfRTiDpi:JV_2SI-raz0": "rec28ldfRTrGY0",
  "rec28ldfRTiDpi:8WQZzvE4fJg": "rec28ldfRTrH26",
  "rec28ldfRTiDpi:_9yKcMSjCMs": "rec28ldfRTrH5P",
  // spia
  "rec28ldfRTiDJU:FxDq3bqngzQ": "rec28ldfRTrPua",
  // tracer
  "rec28ldfRTiDBG:924WxkHMdxU": "rec28ldfRTrPq2",
  // candyshop
  "rec28ldfRTiDlb:RkBEM8Q3qMQ": "rec28ldfRTrGMp",
  "rec28ldfRTiDlb:J2A3jzgtRjI": "rec28ldfRTrGQ9",
  "rec28ldfRTiDlb:mS_ol5Wa8Ac": "rec28ldfRTrGUf",
  // bewave
  "rec28ldfRTiDh1:BbcxmtNaesk": "rec28ldfRTrGEy",
  "rec28ldfRTiDh1:FlqHSi64UVM": "rec28ldfRTrGIk",
  // youngposse
  "rec28ldfRTiDcU:-6HWMkyTAaA": "rec28ldfRTrFPR",
  "rec28ldfRTiDcU:Pi9wf7sONz8": "rec28ldfRTrFUq",
  "rec28ldfRTiDcU:eaGsVrnH-5k": "rec28ldfRTrFYu",
  // genblue
  "rec28ldfRTiCKv:Ke5jk7Ngpqs": "rec28ldfRTrCU6",
  // wooah
  "recvxyEBDZs5Ic:X2FB37r4Oyw": "recvxyH5pzlG0W",
  "recvxyEBDZs5Ic:xwDmGC2fTfU": "recvxyH5pzV8fK",
  "recvxyEBDZs5Ic:hPzz4cRxtco": "recvxyH5pz4VGa",
  // vcha
  "rec28ldfRTiE0h:rBHK8Z8cwmQ": "rec28ldfRTrPGP",
  // hitgs
  "rec28ldfRTiE4q:L9VNIOcfSOU": "recvxIZy35rUeY",
  "rec28ldfRTiE4q:IM-N8trjDzk": "recvxIZy3525BF",
};

export function artistMvWorkId(catalog: Pick<CatalogView,'works'> | null | undefined, groupId: string, source: string) {
  const id = videoId(source);
  if (!id) return null;
  if (!catalog) return verifiedHomeWork[groupId + ':' + id] ?? null;
  const matches = catalog.works.filter(work => work.groupIds.includes(groupId) && videoId(work.url) === id);
  return matches.length === 1 ? matches[0].id : null;
}

export function artistMvHref(catalog: Pick<CatalogView,'works'> | null | undefined, groupId: string, source: string, returnTo: string) {
  const id = artistMvWorkId(catalog, groupId, source);
  return id ? artistWorkUrl({id}, false, returnTo) : null;
}
