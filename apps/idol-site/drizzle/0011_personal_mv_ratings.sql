CREATE TABLE `idol_personal_mv_ratings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`snapshot_id` text NOT NULL,
	`work_id` text NOT NULL,
	`video_id` text NOT NULL,
	`member_id` text NOT NULL,
	`score` real,
	`styling_score` real,
	`revision` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idol_personal_mv_rating_identity` ON `idol_personal_mv_ratings` (`owner_id`,`snapshot_id`,`work_id`,`video_id`,`member_id`);