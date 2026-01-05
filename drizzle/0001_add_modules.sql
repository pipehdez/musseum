-- Create modules table
CREATE TABLE IF NOT EXISTS `modules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `modules_name_unique` ON `modules` (`name`);
--> statement-breakpoint
-- Add module_id column to permissions (keeps existing `module` text for backward compatibility)
ALTER TABLE `permissions` ADD COLUMN `module_id` integer;
--> statement-breakpoint
-- Backfill module_id using existing module names
INSERT OR IGNORE INTO `modules` (`name`)
SELECT DISTINCT `module` FROM `permissions` WHERE `module` IS NOT NULL;
--> statement-breakpoint
UPDATE `permissions`
SET `module_id` = (
    SELECT `id` FROM `modules` m WHERE m.`name` = `permissions`.`module`
)
WHERE `module_id` IS NULL AND `module` IS NOT NULL;
