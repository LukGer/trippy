CREATE TABLE `itinerary_items` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`starts_at` integer,
	`ends_at` integer,
	`all_day` integer NOT NULL,
	`place_id` text,
	`raw_location` text,
	`description` text,
	`status` text NOT NULL,
	`order_index` integer NOT NULL,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `itinerary_items_trip_id_idx` ON `itinerary_items` (`trip_id`);--> statement-breakpoint
CREATE INDEX `itinerary_items_timeline_idx` ON `itinerary_items` (`trip_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `itinerary_items_order_idx` ON `itinerary_items` (`trip_id`,`order_index`);--> statement-breakpoint
CREATE INDEX `itinerary_items_place_id_idx` ON `itinerary_items` (`place_id`);--> statement-breakpoint
CREATE TABLE `places` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL,
	`lat` real,
	`lng` real,
	`google_place_id` text,
	`metadata` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `places_trip_id_idx` ON `places` (`trip_id`);--> statement-breakpoint
CREATE INDEX `places_google_place_id_idx` ON `places` (`google_place_id`);--> statement-breakpoint
CREATE TABLE `trip_members` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text NOT NULL,
	`status` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `trip_members_trip_id_idx` ON `trip_members` (`trip_id`);--> statement-breakpoint
CREATE INDEX `trip_members_user_id_idx` ON `trip_members` (`user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `trip_members_trip_user_unique` ON `trip_members` (`trip_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `trip_segments` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`from_place_id` text,
	`to_place_id` text,
	`starts_on` integer,
	`ends_on` integer,
	`order_index` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`from_place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`to_place_id`) REFERENCES `places`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `trip_segments_trip_id_idx` ON `trip_segments` (`trip_id`);--> statement-breakpoint
CREATE INDEX `trip_segments_order_idx` ON `trip_segments` (`trip_id`,`order_index`);--> statement-breakpoint
ALTER TABLE `trips` ADD `starts_on` integer;--> statement-breakpoint
ALTER TABLE `trips` ADD `ends_on` integer;--> statement-breakpoint
ALTER TABLE `trips` ADD `description` text;