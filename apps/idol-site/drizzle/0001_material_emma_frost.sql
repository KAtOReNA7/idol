CREATE TABLE `idol_catalog_parts` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`snapshot_id` text NOT NULL,
	`part_index` integer NOT NULL,
	`payload` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `idol_catalog_state` (
	`user_id` text PRIMARY KEY NOT NULL,
	`generation` integer DEFAULT 0 NOT NULL,
	`snapshot_id` text,
	`checksum` text,
	`part_count` integer,
	`captured_at` text
);
