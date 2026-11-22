import entries from '@/data/reviewed-editorial-work-imports.json';
import {AppError, TABLES} from './feishu';
import {F} from './fields';
import {hash} from './hash';
import {nativeKey} from './native-format';
import {nativeRevision} from './native-save';
import {assertSourceUnchanged, nativeDb, nativeRow, nativeSchema, ownControl, type NativeRow} from './native-storage';
import {asIds, asText, asUrl, videoId} from './values';

const batch = 'editorial-mvs-20261122';
type Entry = typeof entries[number];

function conflict(message: string): never {
  throw new AppError('EDITORIAL_WORK_CONFLICT', message, 409);
}

async function inspect(userId: string) {
  const control = await ownControl(userId);
  if (control?.mode !== 'native' || !control.active_snapshot) {
    throw new AppError('STORAGE_CHANGING', '请在原生手帐就绪后再导入作品。', 409);
  }
  const snapshot = control.active_snapshot;
  const db = nativeDb();
  const [generation, schema, works, groupRows] = await Promise.all([
    db.prepare('SELECT generation FROM idol_catalog_state WHERE user_id=?').bind(userId).first<{generation: number}>(),
    nativeSchema(snapshot, 'works'),
    db.prepare("SELECT record_id,fields_json FROM idol_native_records WHERE snapshot_id=? AND table_key='works'")
      .bind(snapshot).all<Pick<NativeRow,'record_id'|'fields_json'>>(),
    Promise.all(entries.map(entry => nativeRow(snapshot, 'groups', entry.groupId))),
  ]);
  if (!generation) conflict('目录状态暂时无法读取。');
  for (const id of [F.works.name, F.works.song, F.works.url, F.works.groups, F.works.videoType, F.works.version,
    F.works.releaseDate, F.works.officialTitle, F.works.channel, F.works.source]) {
    if (!schema.some(field => field.field_id === id)) conflict('作品字段已变化，请核对导入资料。');
  }
  const indexed = works.results.map(row => {
    const fields = JSON.parse(row.fields_json);
    return {id: row.record_id, groups: asIds(fields[F.works.groups]), video: videoId(asUrl(fields[F.works.url]))};
  });
  const records = entries.map((entry, i) => {
    const group = groupRows[i];
    const groupFields = JSON.parse(group.fields_json) as Record<string,unknown>;
    if (asText(groupFields[F.groups.name]) !== entry.group) conflict('目标团体身份已变化。');
    const own = indexed.find(row => row.id === entry.workId);
    const equivalents = indexed.filter(row => row.groups.includes(entry.groupId) && row.video === entry.videoId);
    if (equivalents.some(row => row.id !== entry.workId)) conflict('相同视频已使用其他作品记录，请核对后接入。');
    if (own && (own.video !== entry.videoId || own.groups.length !== 1 || own.groups[0] !== entry.groupId)) {
      conflict('目标作品身份与已存在的记录不一致。');
    }
    const priorLinks = groupFields[F.groups.works] ?? [];
    if (!Array.isArray(priorLinks)) conflict('该团体的作品关系格式已变化。');
    const references = asIds(priorLinks).filter(id => id === entry.workId).length;
    if (references !== Number(Boolean(own))) conflict('团体和作品之间的关系需要核对。');
    return {entry, present: Boolean(own), group, groupFields, priorLinks};
  });
  await assertSourceUnchanged(userId, control);
  return {control, snapshot, records, generation: generation.generation};
}

export async function previewEditorialWorks(userId: string) {
  const {records} = await inspect(userId);
  return {batch, works: records.map(({entry, present}) => ({
    workId: entry.workId, group: entry.group, song: entry.song, version: entry.version, videoId: entry.videoId, present,
  }))};
}

function workFields(entry: Entry) {
  const url = 'https://www.youtube.com/watch?v=' + entry.videoId;
  return {
    [F.works.name]: entry.group + ' · ' + entry.song,
    [F.works.song]: entry.song,
    [F.works.groups]: [{tableId: TABLES.groups, recordId: entry.groupId, text: entry.group}],
    [F.works.url]: [{url, text: url}],
    [F.works.videoType]: entry.videoType,
    [F.works.version]: entry.version,
    [F.works.officialTitle]: entry.officialTitle,
    [F.works.channel]: entry.channel,
    [F.works.source]: entry.source,
    ...(entry.releaseDate ? {[F.works.releaseDate]: entry.releaseDate + 'T00:00:00.000Z'} : {}),
  };
}

export async function importEditorialWorks(userId: string, operationId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(operationId)) {
    throw new AppError('INVALID_OPERATION', '导入操作编号无效。', 400);
  }
  const state = await inspect(userId);
  const db = nativeDb();
  const requestHash = await hash([batch, state.snapshot, state.control.epoch]);
  async function receipt() {
    const row = await db.prepare('SELECT user_id,request_hash,status,result_json FROM idol_saves WHERE id=?')
      .bind(operationId).first<{user_id:string; request_hash:string; status:string; result_json:string}>();
    if (!row) return null;
    if (row.user_id !== userId || row.request_hash !== requestHash || row.status !== 'done') {
      conflict('此编号已经用于另一项操作。');
    }
    return JSON.parse(row.result_json) as {batch: string; added: string[]};
  }
  const prior = await receipt();
  if (prior) {
    if (state.records.some(row => !row.present)) conflict('此前导入的作品已变更，请重新核对。');
    return prior;
  }
  const missing = state.records.filter(row => !row.present);
  const result = {batch, added: missing.map(row => row.entry.workId)};
  if (!missing.length) return result;

  const {snapshot, control} = state;
  const now = Date.now();
  const guards = missing.map(({group}) => ({key: group.key, revision: group.revision}));
  const journal = db.prepare(`INSERT INTO idol_saves
    (id,user_id,table_key,record_id,request_hash,status,before_json,patch_json,result_json,created_at,updated_at)
    SELECT ?,?,'works',?,?,'done',?,?,?,?,? FROM idol_storage_control c
    WHERE c.id='main' AND c.owner_id=? AND c.mode='native' AND c.active_snapshot=? AND c.epoch=?
    AND EXISTS (SELECT 1 FROM idol_catalog_state WHERE user_id=? AND generation=?)
    AND NOT EXISTS (SELECT 1 FROM json_each(?) guard LEFT JOIN idol_native_records r
      ON r.key=json_extract(guard.value,'$.key') WHERE r.revision IS NOT json_extract(guard.value,'$.revision'))
    AND NOT EXISTS (SELECT 1 FROM idol_native_records WHERE snapshot_id=? AND record_id IN (SELECT value FROM json_each(?)))
    ON CONFLICT(id) DO NOTHING`).bind(operationId, userId, result.added[0], requestHash,
      JSON.stringify({absent: result.added, groups: guards}), JSON.stringify({batch, snapshot, works: missing.map(({entry}) => entry)}),
      JSON.stringify(result), now, now, userId, snapshot, control.epoch, userId, state.generation,
      JSON.stringify(guards), snapshot, JSON.stringify(result.added));
  const gate = 'EXISTS (SELECT 1 FROM idol_saves WHERE id=? AND user_id=? AND request_hash=? AND result_json=?)';
  const gateArgs = [operationId, userId, requestHash, JSON.stringify(result)];
  const statements = [journal];
  for (const {entry, group, groupFields, priorLinks} of missing) {
    const raw = workFields(entry);
    const workRevision = await nativeRevision(snapshot, 'works', entry.workId, 1, raw);
    const nextGroup = {...groupFields, [F.groups.works]: [...priorLinks,
      {tableId: TABLES.works, recordId: entry.workId, text: raw[F.works.name]}]};
    const groupRevision = await nativeRevision(snapshot, 'groups', entry.groupId, group.version + 1, nextGroup);
    statements.push(
      db.prepare(`INSERT INTO idol_native_records (key,snapshot_id,table_key,record_id,fields_json,revision,version,updated_at,source_order)
        SELECT ?,?,'works',?,?,?,1,?,(SELECT coalesce(max(source_order),-1)+1 FROM idol_native_records WHERE snapshot_id=? AND table_key='works')
        WHERE ${gate} ON CONFLICT(key) DO NOTHING`).bind(
          nativeKey(snapshot, 'works', entry.workId), snapshot, entry.workId, JSON.stringify(raw), workRevision, now, snapshot, ...gateArgs),
      db.prepare(`UPDATE idol_native_records SET fields_json=?,revision=?,version=version+1,updated_at=?
        WHERE key=? AND revision=? AND ${gate}`).bind(JSON.stringify(nextGroup), groupRevision, now, group.key, group.revision, ...gateArgs),
    );
  }
  statements.push(db.prepare(`UPDATE idol_catalog_state SET generation=generation+1,snapshot_id=NULL,
    checksum=NULL,part_count=NULL,captured_at=NULL WHERE user_id=? AND generation=? AND ${gate}`)
    .bind(userId, state.generation, ...gateArgs));
  try {
    await db.batch(statements);
  } catch (error) {
    const saved = await receipt();
    if (saved) return saved;
    throw error;
  }
  const saved = await receipt();
  if (!saved) conflict('目录刚刚更新，请重新读取并导入。');
  return saved;
}
