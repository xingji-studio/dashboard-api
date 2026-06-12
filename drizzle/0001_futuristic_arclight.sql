ALTER TABLE `users` RENAME COLUMN "name" TO "username";--> statement-breakpoint
DROP INDEX `users_name_unique`;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);