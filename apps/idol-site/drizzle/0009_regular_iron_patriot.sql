CREATE TABLE `idol_archive_quarantine` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`candidate_id` text NOT NULL,
	`old_operation_id` text NOT NULL,
	`old_created_at` integer NOT NULL,
	`old_epoch` integer NOT NULL,
	`resume_epoch` integer NOT NULL,
	`manifest_json` text NOT NULL,
	`object_key` text NOT NULL,
	`reserve_bytes` integer NOT NULL,
	`evidence_json` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idol_archive_quarantine_old_operation_id_unique` ON `idol_archive_quarantine` (`old_operation_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idol_archive_quarantine_object_key_unique` ON `idol_archive_quarantine` (`object_key`);