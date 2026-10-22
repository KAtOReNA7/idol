CREATE TABLE `idol_archive_runs` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`status` text NOT NULL,
	`snapshot_id` text NOT NULL,
	`backup_key` text NOT NULL,
	`cursor` integer NOT NULL,
	`restore_report_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_native_fields` (
	`key` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`table_key` text NOT NULL,
	`fields_json` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_native_media` (
	`key` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`file_token` text NOT NULL,
	`status` text NOT NULL,
	`object_key` text,
	`sha256` text,
	`byte_length` integer,
	`content_type` text,
	`error` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_native_records` (
	`key` text PRIMARY KEY NOT NULL,
	`snapshot_id` text NOT NULL,
	`table_key` text NOT NULL,
	`record_id` text NOT NULL,
	`fields_json` text NOT NULL,
	`revision` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_native_snapshots` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`status` text NOT NULL,
	`captured_at` text NOT NULL,
	`data_hash` text NOT NULL,
	`manifest_json` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_storage_control` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`mode` text NOT NULL,
	`epoch` integer NOT NULL,
	`active_snapshot` text,
	`run_id` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TRIGGER idol_legacy_write_gate BEFORE INSERT ON idol_record_locks
WHEN EXISTS (SELECT 1 FROM idol_storage_control WHERE id = 'main' AND mode <> 'feishu')
BEGIN SELECT RAISE(ABORT, 'native_storage_cutover'); END;
