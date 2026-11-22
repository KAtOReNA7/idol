import type {CatalogView} from './types';
import {artistWorkUrl} from './artist-preview';
import {videoId} from './values';
import reviewedImports from '../../data/reviewed-editorial-work-imports.json';

export function reviewedEditorialWorkId(groupId: string, id: string) {
  return reviewedImports.find(work => work.groupId === groupId && work.videoId === id)?.workId;
}

// Checked public MV identities used while the live catalog is loading. A loaded catalog always wins.
const verifiedPublicMv: Readonly<Record<string,string>> = {
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
  "rec28ldfRTiDcU:MbclRNm_ANY": "rec28ldfRTrGeR",
  "rec28ldfRTiDcU:6czkm_qdVlw": "rec28ldfRTrGj0",
  "rec28ldfRTiDcU:IVXJXo_AZyw": "rec28ldfRTrGou",
  "rec28ldfRTiDcU:wT5UmjgSdLc": "rec28ldfRTrGsz",
  "rec28ldfRTiDcU:QsOnTCwooDs": "rec28ldfRTrGwK",
  "rec28ldfRTiDcU:2HZbPz-r2UA": "rec28ldfRTrGAu",
  "rec28ldfRTiDcU:aAjb-d4UkPc": "recvxIZRWKntfT",
  "rec28ldfRTiDcU:GaqBpWroH68": "recvxIZY0lR25A",
  "rec28ldfRTiDcU:J997YfFCw2I": "recvxIZY0lPdWr",
  "rec28ldfRTiDcU:LY4SA0X2kvg": "recvxIZY0lX8bP",
  "rec28ldfRTiDcU:lFxXpXk35Eo": "recvxJ03dOg1Gc",
  // genblue
  "rec28ldfRTiCKv:Ke5jk7Ngpqs": "rec28ldfRTrCU6",
  "rec28ldfRTiCKv:69QCKEYOAZs": "rec28ldfRTrCYg",
  "rec28ldfRTiCKv:_nzdeQrEg3Q": "rec28ldfRTrQJ1",
  "rec28ldfRTiCKv:o5EdYwk8k9o": "recvxIZLjZmGMf",
  // wooah
  "recvxyEBDZs5Ic:X2FB37r4Oyw": "recvxyH5pzlG0W",
  "recvxyEBDZs5Ic:xwDmGC2fTfU": "recvxyH5pzV8fK",
  "recvxyEBDZs5Ic:hPzz4cRxtco": "recvxyH5pz4VGa",
  "recvxyEBDZs5Ic:UE--H12gl2I": "recvxyH5pzTgrL",
  "recvxyEBDZs5Ic:g5B6zCSMrcc": "recvxyH5pzzH06",
  "recvxyEBDZs5Ic:_X9720wjipE": "recvxyH5pz4vBM",
  "recvxyEBDZs5Ic:KkyUE7TcBcs": "recvxyH5pzAava",
  "recvxyEBDZs5Ic:yh5W41ANcjo": "recvxyH5pz0vNt",
  "recvxyEBDZs5Ic:j3RGtLEZ-PM": "recvxyH5pzHfj0",
  "recvxyEBDZs5Ic:liuotbjjsHw": "recvxyH5pzgBlW",
  "recvxyEBDZs5Ic:jsfsisyG3Vo": "recvxyH5pzZfyK",
  "recvxyEBDZs5Ic:ZtiThQN5ETc": "recvxyH5pzrrSO",
  "recvxyEBDZs5Ic:8DwTAa5hPsA": "recvxyH5pzQxpW",
  "recvxyEBDZs5Ic:nYrezqbjl3E": "recvxIYG1FSCws",
  // vcha
  "rec28ldfRTiE0h:rBHK8Z8cwmQ": "rec28ldfRTrPGP",
  "rec28ldfRTiE0h:spQ6JXmv1do": "recvxIZFpVFeiL",
  "rec28ldfRTiE0h:xLNmyB1iCig": "recvxIZFpVtElQ",
  "rec28ldfRTiE0h:iQzBz-JV2zg": "recvxIZFpVm8cn",
  // hitgs
  "rec28ldfRTiE4q:L9VNIOcfSOU": "recvxIZy35rUeY",
  "rec28ldfRTiE4q:IM-N8trjDzk": "recvxIZy3525BF",
  "rec28ldfRTiE4q:y438mzlXS4c": "rec28ldfRTrPKX",
  "rec28ldfRTiE4q:1XOmTvPWQSs": "recvxIZnNLkXMl",
  "rec28ldfRTiE4q:HcJUfVPvU4Y": "recvxIZnNLuycR",
  "rec28ldfRTiE4q:3ensCfpaUWI": "recvxIZnNLgpyC",
  "rec28ldfRTiE4q:GGYo0Ya-4xE": "recvxIZxXupyDR",
  "rec28ldfRTiE4q:6GUKqEfiX1I": "recvxIZy35Xwr7",
  // atheart
  "rec28ldfRTiEaV:ioK78YucIjc": "recvxIZy35ZBcF",
  "rec28ldfRTiEaV:74Kv5W9c8dE": "rec28ldfRTrPOJ",
  // badvillain
  "rec28ldfRTiD0h:s-KjDJFOh5s": "rec28ldfRTrQ0L",
  "rec28ldfRTiD0h:CW2g-yu77eA": "rec28ldfRTrEL4",
  "rec28ldfRTiD0h:GJzq_xBSDWI": "rec28ldfRTrEGO",
  "rec28ldfRTiD0h:WpFuv7Q0VBo": "rec28ldfRTrEzJ",
  "rec28ldfRTiD0h:00tUzCOPI6g": "rec28ldfRTrEng",
  // izna
  "rec28ldfRTiCpp:d3mqW9wqqx0": "rec28ldfRTrBGz",
  "rec28ldfRTiCpp:88GkYKvnvvI": "rec28ldfRTrBKQ",
  "rec28ldfRTiCpp:wLKpQpC3-Sw": "rec28ldfRTrNoB",
  "rec28ldfRTiCpp:LiZAgfmoQwc": "rec28ldfRTrNsK",
  "rec28ldfRTiCpp:2fyFx2u5fbU": "rec28ldfRTrNwO",
  "rec28ldfRTiCpp:xZ5Ej-tLEjM": "rec28ldfRTrNBu",
  "rec28ldfRTiCpp:xu0fU46Cd7M": "rec28ldfRTrNO2",
  "rec28ldfRTiCpp:NQRGAh7ukh8": "rec28ldfRTrNSv",
  "rec28ldfRTiCpp:_kxr2D8-tq8": "rec28ldfRTrNYh",
  // ifeye
  "rec28ldfRTiCGa:I_msu2-4UAU": "rec28ldfRTrCQ2",
  "rec28ldfRTiCGa:tGMy0z1akLs": "rec28ldfRTrPSV",
  "rec28ldfRTiCGa:e-bwzm8-xnU": "recvxIZFknJ2Rq",
  "rec28ldfRTiCGa:ecQSl-6NSTA": "recvxIZFpVLU0R",
};

export function artistMvWorkId(catalog: Pick<CatalogView,'works'> | null | undefined, groupId: string, source: string, expectedWork?: string | null) {
  const id = videoId(source);
  if (!id) return null;
  // Older editorial files have an empty work ID for these subsequently imported exact versions.
  const imported = reviewedEditorialWorkId(groupId, id);
  const expected = expectedWork === '' && imported ? imported : expectedWork;
  if (!catalog) {
    const known = imported ?? verifiedPublicMv[groupId + ':' + id];
    return known && (expected === undefined || expected === known) ? known : null;
  }
  const matches = catalog.works.filter(work => !work.placeholder && work.groupIds.includes(groupId) && videoId(work.url) === id);
  if (matches.length !== 1) return null;
  const workId = matches[0].id;
  if (expected !== undefined && workId !== expected) return null;
  return catalog.works.filter(work => work.id === workId).length === 1 ? workId : null;
}

export function artistMvHref(catalog: Pick<CatalogView,'works'> | null | undefined, groupId: string, source: string, returnTo: string, expectedWork?: string | null) {
  const id = artistMvWorkId(catalog, groupId, source, expectedWork);
  return id ? artistWorkUrl({id}, false, returnTo) : null;
}
