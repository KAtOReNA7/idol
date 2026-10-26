CREATE TABLE `idol_record_locks` (
	`key` text PRIMARY KEY NOT NULL,
	`save_id` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_saves` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`table_key` text NOT NULL,
	`record_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`status` text NOT NULL,
	`before_json` text NOT NULL,
	`patch_json` text NOT NULL,
	`result_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
