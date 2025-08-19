/*
  Warnings:

  - You are about to drop the column `categoryName` on the `categories` table. All the data in the column will be lost.
  - Added the required column `category_name` to the `categories` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `categories` DROP COLUMN `categoryName`,
    ADD COLUMN `category_name` VARCHAR(191) NOT NULL;
