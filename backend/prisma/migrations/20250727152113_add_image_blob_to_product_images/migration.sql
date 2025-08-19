-- AlterTable
ALTER TABLE `product_images` ADD COLUMN `image` LONGBLOB NULL,
    ADD COLUMN `mime_type` VARCHAR(191) NULL,
    MODIFY `imageUrl` VARCHAR(191) NULL;
