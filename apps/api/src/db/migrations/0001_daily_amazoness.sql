CREATE TABLE `document_links` (
	`id` text PRIMARY KEY NOT NULL,
	`document_id` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`document_id`) REFERENCES `documents`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `document_links_document_id_idx` ON `document_links` (`document_id`);--> statement-breakpoint
CREATE INDEX `document_links_entity_idx` ON `document_links` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`trip_id` text NOT NULL,
	`title` text NOT NULL,
	`kind` text NOT NULL,
	`file_key` text,
	`mime_type` text,
	`text_content` text,
	`structured_data` text,
	`sensitive` integer NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`trip_id`) REFERENCES `trips`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `documents_trip_id_idx` ON `documents` (`trip_id`);--> statement-breakpoint
CREATE INDEX `documents_created_by_idx` ON `documents` (`created_by`);