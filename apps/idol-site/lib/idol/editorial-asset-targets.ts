import { editorialEmptyFormerProof } from './editorial-asset-empty-former-proof';
import { editorialUdttGroupProof } from './editorial-asset-udtt-group-proof';
import { stageForWork } from './stage';
import { stageSourceKey } from './stage-source';
/** Read-only native resolver. Only explicit server identities can be candidates. */
import type { AssetScope, AssetTarget } from './editorial-asset-types';
import { canonical, fail, validateTarget } from './editorial-asset-format';
import { F } from './fields';
const GROUP_TABLE = 'tbl5uwKCLEq7buNy';
export type EditorialPilotIdentity = {
    slug: string;
    groupId: string;
    members: {
        memberId: string;
        currentGroupIds: string[];
        formerGroupIds: string[];
    }[];
};
type Row = {
    key: string;
    snapshot_id: string;
    table_key: string;
    record_id: string;
    fields_json: string;
};
type SchemaRow = {
    key: string;
    snapshot_id: string;
    table_key: string;
    fields_json: string;
};
type Field = {
    field_id: string;
    type: number;
    property?: {
        table_id?: string;
    };
};
export type EditorialReadDb = {
    prepare: (sql: string) => {
        bind: (...values: string[]) => {
            all: <T>() => Promise<{
                results: T[];
            }>;
        };
    };
};
function object(value: unknown): value is Record<string, unknown> { return !!value && typeof value === 'object' && !Array.isArray(value); }
function recordId(value: unknown): value is string { return typeof value === 'string' && /^rec[A-Za-z0-9]+$/.test(value); }
/** Explicit known native representations only; aliases cannot contradict or hide bad IDs. */
export function strictEditorialGroupIds(value: unknown): string[] {
    const ids: string[] = [];
    function parse(item: unknown) {
        if (recordId(item)) {
            ids.push(item);
            return;
        }
        if (!object(item))
            fail('TARGET_RELATION_INVALID', 409);
        const aliases = ['recordIds', 'record_ids', 'recordId', 'record_id', 'link_record_ids'].filter(k => Object.hasOwn(item, k));
        if (aliases.length !== 1 || Object.keys(item).some(k => ![...aliases, 'tableId', 'table_id', 'text', 'text_arr', 'type'].includes(k)))
            fail('TARGET_RELATION_INVALID', 409);
        if (Object.hasOwn(item, 'tableId') && item.tableId !== GROUP_TABLE || Object.hasOwn(item, 'table_id') && item.table_id !== GROUP_TABLE)
            fail('TARGET_RELATION_INVALID', 409);
        if (Object.hasOwn(item, 'text') && typeof item.text !== 'string' || Object.hasOwn(item, 'type') && item.type !== 'text' || Object.hasOwn(item, 'text_arr') && (!Array.isArray(item.text_arr) || item.text_arr.some(v => typeof v !== 'string')))
            fail('TARGET_RELATION_INVALID', 409);
        const alias = aliases[0], values = item[alias];
        if (alias === 'recordId' || alias === 'record_id') {
            if (!recordId(values))
                fail('TARGET_RELATION_INVALID', 409);
            ids.push(values);
        }
        else {
            if (!Array.isArray(values) || values.length > 100 || values.some(v => !recordId(v)))
                fail('TARGET_RELATION_INVALID', 409);
            ids.push(...values as string[]);
        }
    }
    // Null/missing is not silently equivalent to an observed empty relation.
    if (Array.isArray(value)) {
        if (value.length > 100)
            fail('TARGET_RELATION_INVALID', 409);
        for (const item of value) {
            if (Array.isArray(item))
                fail('TARGET_RELATION_INVALID', 409);
            parse(item);
        }
    }
    else {
        if (!object(value))
            fail('TARGET_RELATION_INVALID', 409);
        parse(value);
    }
    if (ids.length > 100)
        fail('TARGET_RELATION_INVALID', 409);
    if (new Set(ids).size !== ids.length)
        fail('TARGET_RELATION_DUPLICATE', 409);
    return ids.sort();
}
export type EditorialRelationDiagnostic = {
    field: 'current' | 'former'; present: boolean;
    shape: 'missing' | 'null' | 'array' | 'object' | 'scalar';
    strictAccepted: boolean; reason: 'ACCEPTED' | 'MISSING' | 'NULL' | 'SCALAR' | 'NESTED_ARRAY' | 'MULTIPLE_ALIASES' | 'NO_ALIAS' | 'UNKNOWN_KEY' | 'WRONG_TABLE' | 'BAD_METADATA' | 'BAD_ID' | 'OVERSIZE' | 'DUPLICATE' | 'INVALID';
    matchesExpected: boolean | null;
};
/** Diagnostic only: the unchanged strict parser, never this classifier, decides acceptance. */
export function diagnoseEditorialRelation(field: 'current' | 'former', present: boolean, value: unknown, expected: readonly string[]): EditorialRelationDiagnostic {
    const shape = !present ? 'missing' : value === null ? 'null' : Array.isArray(value) ? 'array' : object(value) ? 'object' : 'scalar';
    const result: EditorialRelationDiagnostic = { field, present, shape, strictAccepted: false, reason: 'INVALID', matchesExpected: null };
    try {
        const ids = strictEditorialGroupIds(value);
        return { ...result, strictAccepted: true, reason: 'ACCEPTED', matchesExpected: canonical(ids) === canonical([...expected].sort()) };
    } catch { /* Only safe fixed categories below; never exception text or dynamic keys. */ }
    if (!present) return { ...result, reason: 'MISSING' };
    if (value === null) return { ...result, reason: 'NULL' };
    if (!Array.isArray(value) && !object(value)) return { ...result, reason: 'SCALAR' };
    const items = Array.isArray(value) ? value : [value];
    if (items.length > 100) return { ...result, reason: 'OVERSIZE' };
    const all: string[] = [];
    for (const item of items) {
        if (recordId(item)) { all.push(item); continue; }
        if (Array.isArray(item)) return { ...result, reason: 'NESTED_ARRAY' };
        if (!object(item)) return { ...result, reason: 'BAD_ID' };
        const aliases = ['recordIds', 'record_ids', 'recordId', 'record_id', 'link_record_ids'].filter(k => Object.hasOwn(item, k));
        if (!aliases.length) return { ...result, reason: 'NO_ALIAS' };
        if (aliases.length > 1) return { ...result, reason: 'MULTIPLE_ALIASES' };
        if (Object.keys(item).some(k => ![...aliases, 'tableId', 'table_id', 'text', 'text_arr', 'type'].includes(k))) return { ...result, reason: 'UNKNOWN_KEY' };
        if (Object.hasOwn(item, 'tableId') && item.tableId !== GROUP_TABLE || Object.hasOwn(item, 'table_id') && item.table_id !== GROUP_TABLE) return { ...result, reason: 'WRONG_TABLE' };
        if (Object.hasOwn(item, 'text') && typeof item.text !== 'string' || Object.hasOwn(item, 'type') && item.type !== 'text' || Object.hasOwn(item, 'text_arr') && (!Array.isArray(item.text_arr) || item.text_arr.some(v => typeof v !== 'string'))) return { ...result, reason: 'BAD_METADATA' };
        const alias = aliases[0], v = item[alias];
        if (alias === 'recordId' || alias === 'record_id') {
            if (!recordId(v)) return { ...result, reason: 'BAD_ID' };
            all.push(v);
        } else {
            if (!Array.isArray(v) || v.some(id => !recordId(id))) return { ...result, reason: 'BAD_ID' };
            if (v.length > 100) return { ...result, reason: 'OVERSIZE' };
            all.push(...v as string[]);
        }
    }
    if (all.length > 100) return { ...result, reason: 'OVERSIZE' };
    if (new Set(all).size !== all.length) return { ...result, reason: 'DUPLICATE' };
    return result;
}
export function createEditorialTargetResolver(db: EditorialReadDb, identities: readonly EditorialPilotIdentity[]) {
    async function uniqueRow(scope: AssetScope, table: string, id: string) {
        const result = await db.prepare('SELECT key,snapshot_id,table_key,record_id,fields_json FROM idol_native_records WHERE snapshot_id=? AND record_id=? LIMIT 2').bind(scope.snapshotId, id).all<Row>();
        if (result.results.length !== 1)
            return null;
        const row = result.results[0];
        return row.key === `${scope.snapshotId}:${table}:${id}` && row.snapshot_id === scope.snapshotId && row.table_key === table && row.record_id === id ? row : null;
    }
    async function memberFields(scope: AssetScope) {
        const result = await db.prepare('SELECT key,snapshot_id,table_key,fields_json FROM idol_native_fields WHERE snapshot_id=? AND table_key=? LIMIT 2').bind(scope.snapshotId, 'members').all<SchemaRow>();
        if (result.results.length !== 1)
            return null;
        const row = result.results[0];
        if (row.key !== scope.snapshotId + ':members' || row.snapshot_id !== scope.snapshotId || row.table_key !== 'members')
            return null;
        const fields: unknown = JSON.parse(row.fields_json);
        if (!Array.isArray(fields) || fields.some(f => !object(f)))
            return null;
        for (const id of [F.members.groups, F.members.formerGroups]) {
            const hits = (fields as Field[]).filter(f => f.field_id === id);
            if (hits.length !== 1 || ![18, 21].includes(hits[0].type) || hits[0].property?.table_id !== GROUP_TABLE)
                return null;
        }
        return fields as Field[];
    }
    async function exactUdttWorkFields(scope: AssetScope) {
        const proof = editorialUdttGroupProof;
        const result = await db.prepare('SELECT key,snapshot_id,table_key,fields_json FROM idol_native_fields WHERE snapshot_id=? AND table_key=? LIMIT 2').bind(scope.snapshotId, 'works').all<SchemaRow>();
        if (result.results.length !== 1)
            return null;
        const row = result.results[0];
        if (row.key !== `${scope.snapshotId}:works` || row.snapshot_id !== scope.snapshotId || row.table_key !== 'works')
            return null;
        const fields: unknown = JSON.parse(row.fields_json);
        if (!Array.isArray(fields) || fields.some(f => !object(f)))
            return null;
        for (const [id, type, tableId] of [
            [proof.workGroupFieldId, proof.workGroupFieldType, proof.targetTableId],
            [proof.workUrlFieldId, proof.workUrlFieldType, null],
            [proof.workTypeFieldId, proof.workTypeFieldType, null],
        ] as const) {
            const hits = (fields as Field[]).filter(f => f.field_id === id);
            if (hits.length !== 1 || hits[0].type !== type)
                return null;
            const property: unknown = hits[0].property;
            if (property !== undefined && property !== null && !object(property))
                return null;
            const actualTableId = object(property) ? property.table_id : undefined;
            if (tableId === null ? actualTableId !== undefined && actualTableId !== null : actualTableId !== tableId)
                return null;
        }
        return fields as Field[];
    }
    /** Only the exact native URL object observed in the source proof is admitted. */
    function exactUdttNativeVideoUrl(value: unknown): string | null {
        if (!object(value) || Object.keys(value).sort().join('|') !== 'link|text|type'
            || value.type !== 'url' || typeof value.link !== 'string' || value.text !== value.link)
            return null;
        return value.link === editorialUdttGroupProof.nativeVideoUrl ? value.link : null;
    }
    /** No broad text coercion, concatenation, trimming, or hidden text aliases. */
    function exactUdttNativeVideoType(value: unknown): string | null {
        if (!Array.isArray(value) || value.length !== 1 || !object(value[0])
            || Object.keys(value[0]).sort().join('|') !== 'text|type'
            || value[0].type !== 'text' || value[0].text !== editorialUdttGroupProof.nativeVideoType)
            return null;
        return value[0].text;
    }
    async function resolveFixedUdttMedia(target: AssetTarget, scope: AssetScope): Promise<AssetTarget | null> {
        const proof = editorialUdttGroupProof;
        if (scope.snapshotId !== proof.snapshotId || scope.epoch !== proof.epoch
            || target.slug !== proof.slug || target.groupId !== proof.groupId)
            return null;
        const fixedTargets = target.kind === 'release-cover' ? proof.releaseTargets : target.kind === 'video' ? proof.videoTargets : [];
        const fixed = fixedTargets.filter(candidate => canonical(candidate) === canonical(target));
        if (fixed.length !== 1)
            return null;
        const identitiesForSlug = identities.filter(i => i.slug === proof.slug);
        if (identitiesForSlug.length !== 1 || identitiesForSlug[0].groupId !== proof.groupId
            || !await uniqueRow(scope, 'groups', proof.groupId))
            return null;
        // A public catalog key has no native release row; never invent one.
        if (target.kind === 'release-cover')
            return JSON.parse(canonical(fixed[0])) as AssetTarget;
        if (target.kind !== 'video' || F.works.groups !== proof.workGroupFieldId
            || F.works.url !== proof.workUrlFieldId || F.works.videoType !== proof.workTypeFieldId
            || !await exactUdttWorkFields(scope))
            return null;
        const row = await uniqueRow(scope, 'works', proof.workId);
        if (!row)
            return null;
        const fields: unknown = JSON.parse(row.fields_json);
        if (!object(fields) || !Object.hasOwn(fields, proof.workGroupFieldId)
            || !Object.hasOwn(fields, proof.workUrlFieldId) || !Object.hasOwn(fields, proof.workTypeFieldId)
            || canonical(strictEditorialGroupIds(fields[proof.workGroupFieldId])) !== canonical([proof.groupId])
            || exactUdttNativeVideoUrl(fields[proof.workUrlFieldId]) !== proof.nativeVideoUrl
            || exactUdttNativeVideoType(fields[proof.workTypeFieldId]) !== proof.nativeVideoType)
            return null;
        if (target.slot === 'stage') {
            const stage = stageForWork(proof.workId);
            if (!stage || stage.videoId !== proof.stageVideoId || stage.url !== proof.stageVideoUrl
                || stage.sourceUrl !== proof.stageVideoUrl || stage.kind !== proof.stageKind
                || stageSourceKey(stage) !== proof.stageVideoId || stage.clip != null
                || stage.sourceClass !== 'official' || stage.platform !== 'youtube' || stage.completeness !== 'full')
                return null;
        }
        return JSON.parse(canonical(fixed[0])) as AssetTarget;
    }
    async function resolve(target: AssetTarget, scope: AssetScope): Promise<AssetTarget | null> {
        validateTarget(target);
        // No generic release/video admission: only the complete fixed UDTT tuples.
        if (target.kind !== 'hero' && target.kind !== 'member')
            return resolveFixedUdttMedia(target, scope);
        const matches = identities.filter(i => i.slug === target.slug);
        if (matches.length !== 1 || matches[0].groupId !== target.groupId)
            return null;
        const identity = matches[0];
        if (!await uniqueRow(scope, 'groups', identity.groupId))
            return null;
        if (target.kind === 'hero')
            return { kind: 'hero', slug: identity.slug, groupId: identity.groupId, entityKey: identity.groupId };
        const members = identity.members.filter(m => m.memberId === target.memberId);
        const schema = members.length === 1 ? await memberFields(scope) : null;
        if (!schema)
            return null;
        const member = members[0], row = await uniqueRow(scope, 'members', member.memberId);
        if (!row)
            return null;
        const fields: unknown = JSON.parse(row.fields_json);
        if (!object(fields))
            return null;
        const current = strictEditorialGroupIds(fields[F.members.groups]);
        // One evidence-bound legacy representation only. Generic strict parsing and diagnostics stay unchanged.
        const proof = editorialEmptyFormerProof, rawFormer = fields[F.members.formerGroups];
        const provedEmptyFormer = scope.snapshotId === proof.snapshotId && scope.epoch === proof.epoch
            && target.slug === proof.slug && target.groupId === proof.groupId && target.memberId === proof.memberId && target.entityKey === proof.memberId
            && F.members.groups === proof.currentFieldId && F.members.formerGroups === proof.formerFieldId
            && schema.find(f => f.field_id === proof.currentFieldId)?.type === proof.currentFieldType
            && schema.find(f => f.field_id === proof.formerFieldId)?.type === proof.formerFieldType
            && schema.find(f => f.field_id === proof.currentFieldId)?.property?.table_id === proof.targetTableId
            && schema.find(f => f.field_id === proof.formerFieldId)?.property?.table_id === proof.targetTableId
            && canonical(current) === canonical([proof.groupId]) && canonical(member.currentGroupIds) === canonical([proof.groupId]) && member.formerGroupIds.length === 0
            && Object.hasOwn(fields, proof.formerFieldId) && object(rawFormer) && Object.keys(rawFormer).length === 0 && canonical(rawFormer) === proof.formerCanonical;
        const groupProof = editorialUdttGroupProof;
        const provedAdditionalEmptyFormer = scope.snapshotId === groupProof.snapshotId && scope.epoch === groupProof.epoch
            && target.slug === groupProof.slug && target.groupId === groupProof.groupId
            && groupProof.additionalMemberIds.includes(target.memberId) && target.entityKey === target.memberId
            && F.members.groups === groupProof.currentFieldId && F.members.formerGroups === groupProof.formerFieldId
            && schema.find(f => f.field_id === groupProof.currentFieldId)?.type === groupProof.currentFieldType
            && schema.find(f => f.field_id === groupProof.formerFieldId)?.type === groupProof.formerFieldType
            && schema.find(f => f.field_id === groupProof.currentFieldId)?.property?.table_id === groupProof.targetTableId
            && schema.find(f => f.field_id === groupProof.formerFieldId)?.property?.table_id === groupProof.targetTableId
            && canonical(current) === canonical([groupProof.groupId])
            && canonical(member.currentGroupIds) === canonical([groupProof.groupId]) && member.formerGroupIds.length === 0
            && Object.hasOwn(fields, groupProof.formerFieldId) && object(rawFormer)
            && Object.keys(rawFormer).length === 0 && canonical(rawFormer) === groupProof.formerCanonical;
        const former = provedEmptyFormer || provedAdditionalEmptyFormer ? [] : strictEditorialGroupIds(rawFormer);
        if (canonical(current) !== canonical([...member.currentGroupIds].sort()) || canonical(former) !== canonical([...member.formerGroupIds].sort()) || ![...current, ...former].includes(identity.groupId) || current.some(id => former.includes(id)))
            return null;
        return { kind: 'member', slug: identity.slug, groupId: identity.groupId, entityKey: member.memberId, memberId: member.memberId };
    }
    async function diagnoseRelations(target: AssetTarget, scope: AssetScope): Promise<EditorialRelationDiagnostic[]> {
        validateTarget(target);
        // No caller-selectable member. Only the sealed pilot identity may be inspected.
        if (target.kind !== 'member' || target.slug !== 'udtt' || target.memberId !== 'recvxAPQCFt0cc' || target.groupId !== 'rec28ldfRTiDPs' || target.entityKey !== target.memberId)
            fail('TARGET_CHANGED', 409);
        const matches = identities.filter(i => i.slug === target.slug && i.groupId === target.groupId);
        if (matches.length !== 1) fail('TARGET_CHANGED', 409);
        const members = matches[0].members.filter(m => m.memberId === target.memberId);
        if (members.length !== 1 || !await uniqueRow(scope, 'groups', target.groupId) || !await memberFields(scope)) fail('TARGET_CHANGED', 409);
        const row = await uniqueRow(scope, 'members', target.memberId);
        if (!row) fail('TARGET_CHANGED', 409);
        const fields: unknown = JSON.parse(row.fields_json);
        if (!object(fields)) fail('TARGET_CHANGED', 409);
        return [diagnoseEditorialRelation('current', Object.hasOwn(fields, F.members.groups), fields[F.members.groups], members[0].currentGroupIds),
            diagnoseEditorialRelation('former', Object.hasOwn(fields, F.members.formerGroups), fields[F.members.formerGroups], members[0].formerGroupIds)];
    }
    return Object.assign(resolve, { diagnoseRelations });
}
