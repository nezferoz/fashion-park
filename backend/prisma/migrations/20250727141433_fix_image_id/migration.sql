/*
  Warnings:

  - The primary key for the `product_images` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `imageId` on the `product_images` table. All the data in the column will be lost.
  - Added the required column `image_id` to the `product_images` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `product_images` DROP PRIMARY KEY,
    DROP COLUMN `imageId`,
    ADD COLUMN `image_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`image_id`);
