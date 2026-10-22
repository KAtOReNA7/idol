CREATE TABLE `idol_photo_imports` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`snapshot_id` text NOT NULL,
	`epoch` integer NOT NULL,
	`candidate_id` text NOT NULL,
	`request_hash` text NOT NULL,
	`candidate_hash` text NOT NULL,
	`expected_revision` text NOT NULL,
	`object_key` text NOT NULL,
	`file_token` text NOT NULL,
	`byte_length` integer NOT NULL,
	`status` text NOT NULL,
	`before_json` text,
	`result_json` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idol_photo_imports_candidate` ON `idol_photo_imports` (`owner_id`,`snapshot_id`,`candidate_id`);