CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`story_slug` text,
	`message` text NOT NULL,
	`name` text,
	`email` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`delivered` integer DEFAULT false NOT NULL
);
