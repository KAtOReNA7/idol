CREATE TABLE `idol_archive_phases` (
	`id` text PRIMARY KEY NOT NULL,
	`run_id` text NOT NULL,
	`phase` integer NOT NULL,
	`photo_bytes_limit` integer NOT NULL,
	`photo_count_limit` integer NOT NULL,
	`start_photo_bytes` integer NOT NULL,
	`start_photo_count` integer NOT NULL,
	`report_json` text NOT NULL,
	`created_at` integer NOT NULL
);
