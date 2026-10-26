import { sqliteTable, text, integer, uniqueIndex } from 'drizzle-orm/sqlite-core';
export const saves = sqliteTable('idol_saves', {
  id: text('id').primaryKey(), userId: text('user_id').notNull(), tableKey: text('table_key').notNull(), recordId: text('record_id').notNull(), requestHash: text('request_hash').notNull(), status: text('status').notNull(), beforeJson: text('before_json').notNull(), patchJson: text('patch_json').notNull(), resultJson: text('result_json'), createdAt: integer('created_at').notNull(), updatedAt: integer('updated_at').notNull(),
});
export const locks = sqliteTable('idol_record_locks', { key: text('key').primaryKey(), saveId: text('save_id').notNull(), createdAt: integer('created_at').notNull() });

export const catalogState = sqliteTable('idol_catalog_state', {
 userId:text('user_id').primaryKey(), generation:integer('generation').notNull().default(0), snapshotId:text('snapshot_id'), checksum:text('checksum'), partCount:integer('part_count'), capturedAt:text('captured_at'),
});
export const catalogParts = sqliteTable('idol_catalog_parts', {
 id:text('id').primaryKey(), userId:text('user_id').notNull(), snapshotId:text('snapshot_id').notNull(), partIndex:integer('part_index').notNull(), payload:text('payload').notNull(), createdAt:integer('created_at').notNull(),
});

// Authoritative native storage is separate from the expendable read cache.
export const storageControl=sqliteTable('idol_storage_control',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),mode:text('mode').notNull(),epoch:integer('epoch').notNull(),activeSnapshot:text('active_snapshot'),runId:text('run_id'),updatedAt:integer('updated_at').notNull(),
});
export const nativeSnapshots=sqliteTable('idol_native_snapshots',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),status:text('status').notNull(),capturedAt:text('captured_at').notNull(),dataHash:text('data_hash').notNull(),manifestJson:text('manifest_json').notNull(),createdAt:integer('created_at').notNull(),
});
export const nativeFields=sqliteTable('idol_native_fields',{
 key:text('key').primaryKey(),snapshotId:text('snapshot_id').notNull(),tableKey:text('table_key').notNull(),fieldsJson:text('fields_json').notNull(),
});
export const nativeRecords=sqliteTable('idol_native_records',{
 key:text('key').primaryKey(),snapshotId:text('snapshot_id').notNull(),tableKey:text('table_key').notNull(),recordId:text('record_id').notNull(),fieldsJson:text('fields_json').notNull(),revision:text('revision').notNull(),version:integer('version').notNull().default(1),updatedAt:integer('updated_at').notNull(),sourceOrder:integer('source_order').notNull().default(0),
});
export const nativeMedia=sqliteTable('idol_native_media',{
 key:text('key').primaryKey(),snapshotId:text('snapshot_id').notNull(),fileToken:text('file_token').notNull(),status:text('status').notNull(),objectKey:text('object_key'),sha256:text('sha256'),byteLength:integer('byte_length'),contentType:text('content_type'),error:text('error'),updatedAt:integer('updated_at').notNull(),
});
export const archiveRuns=sqliteTable('idol_archive_runs',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),status:text('status').notNull(),snapshotId:text('snapshot_id').notNull(),backupKey:text('backup_key').notNull(),cursor:integer('cursor').notNull(),restoreReportJson:text('restore_report_json'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
});

export const archivePhases=sqliteTable('idol_archive_phases',{
 id:text('id').primaryKey(),runId:text('run_id').notNull(),phase:integer('phase').notNull(),photoBytesLimit:integer('photo_bytes_limit').notNull(),photoCountLimit:integer('photo_count_limit').notNull(),startPhotoBytes:integer('start_photo_bytes').notNull(),startPhotoCount:integer('start_photo_count').notNull(),startOtherBytes:integer('start_other_bytes').notNull(),reportJson:text('report_json').notNull(),createdAt:integer('created_at').notNull(),
});
export const archiveStepLocks=sqliteTable('idol_archive_step_locks',{
 id:text('id').primaryKey(),operationId:text('operation_id').notNull(),createdAt:integer('created_at').notNull(),
});

// Immutable audit for one reviewed abandoned operation; never a successful page.
export const archiveQuarantine=sqliteTable('idol_archive_quarantine',{
 id:text('id').primaryKey(),runId:text('run_id').notNull(),ownerId:text('owner_id').notNull(),candidateId:text('candidate_id').notNull(),oldOperationId:text('old_operation_id').notNull().unique(),oldCreatedAt:integer('old_created_at').notNull(),oldEpoch:integer('old_epoch').notNull(),resumeEpoch:integer('resume_epoch').notNull(),manifestJson:text('manifest_json').notNull(),objectKey:text('object_key').notNull().unique(),reserveBytes:integer('reserve_bytes').notNull(),evidenceJson:text('evidence_json').notNull(),status:text('status').notNull(),createdAt:integer('created_at').notNull(),
});

// Small, owner-only photo maintenance jobs. Staging is never a published media row.
export const photoImports=sqliteTable('idol_photo_imports',{
 id:text('id').primaryKey(),ownerId:text('owner_id').notNull(),snapshotId:text('snapshot_id').notNull(),epoch:integer('epoch').notNull(),candidateId:text('candidate_id').notNull(),requestHash:text('request_hash').notNull(),candidateHash:text('candidate_hash').notNull(),expectedRevision:text('expected_revision').notNull(),objectKey:text('object_key').notNull(),fileToken:text('file_token').notNull(),byteLength:integer('byte_length').notNull(),status:text('status').notNull(),beforeJson:text('before_json'),resultJson:text('result_json'),createdAt:integer('created_at').notNull(),updatedAt:integer('updated_at').notNull(),
},table=>[uniqueIndex('idol_photo_imports_candidate').on(table.ownerId,table.snapshotId,table.candidateId)]);
