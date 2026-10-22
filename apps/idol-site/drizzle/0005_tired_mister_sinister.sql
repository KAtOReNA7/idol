CREATE TABLE `idol_archive_step_locks` (
	`id` text PRIMARY KEY NOT NULL,
	`operation_id` text NOT NULL,
	`created_at` integer NOT NULL
);
