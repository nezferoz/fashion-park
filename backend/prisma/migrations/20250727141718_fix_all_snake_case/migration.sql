/*
  Warnings:

  - The primary key for the `cart` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cartId` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `cart` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `cart` table. All the data in the column will be lost.
  - The primary key for the `categories` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `categories` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `categories` table. All the data in the column will be lost.
  - The primary key for the `notifications` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `isRead` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `notificationId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `notifications` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product_images` table. All the data in the column will be lost.
  - The primary key for the `product_variants` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `stockQuantity` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `product_variants` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `product_variants` table. All the data in the column will be lost.
  - The primary key for the `products` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `categoryId` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `products` table. All the data in the column will be lost.
  - The primary key for the `refunds` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `approvedAt` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `approvedById` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedAt` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `initiatedById` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `refundId` on the `refunds` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `refunds` table. All the data in the column will be lost.
  - The primary key for the `stock_movements` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `movementDate` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `movementId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `movementType` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `stock_movements` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `stock_movements` table. All the data in the column will be lost.
  - The primary key for the `transaction_details` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `transaction_details` table. All the data in the column will be lost.
  - You are about to drop the column `detailId` on the `transaction_details` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `transaction_details` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `transaction_details` table. All the data in the column will be lost.
  - You are about to drop the column `unitPrice` on the `transaction_details` table. All the data in the column will be lost.
  - The primary key for the `transactions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `cashierId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `finalAmount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentReference` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `totalAmount` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transactionCode` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transactionDate` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `transactionId` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `cart_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `cart` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category_id` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `categories` table without a default value. This is not possible if the table is not empty.
  - Added the required column `notification_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `notifications` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_images` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stock_quantity` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `variant_id` to the `product_variants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `product_id` to the `products` table without a default value. This is not possible if the table is not empty.
  - Added the required column `initiated_by_id` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `refund_id` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `refunds` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movement_id` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `movement_type` to the `stock_movements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detail_id` to the `transaction_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `transaction_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `unit_price` to the `transaction_details` table without a default value. This is not possible if the table is not empty.
  - Added the required column `final_amount` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payment_method` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `total_amount` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_code` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transaction_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `cart_productId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `cart_userId_fkey`;

-- DropForeignKey
ALTER TABLE `cart` DROP FOREIGN KEY `cart_variantId_fkey`;

-- DropForeignKey
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_userId_fkey`;

-- DropForeignKey
ALTER TABLE `product_images` DROP FOREIGN KEY `product_images_productId_fkey`;

-- DropForeignKey
ALTER TABLE `product_variants` DROP FOREIGN KEY `product_variants_productId_fkey`;

-- DropForeignKey
ALTER TABLE `products` DROP FOREIGN KEY `products_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `refunds` DROP FOREIGN KEY `refunds_approvedById_fkey`;

-- DropForeignKey
ALTER TABLE `refunds` DROP FOREIGN KEY `refunds_initiatedById_fkey`;

-- DropForeignKey
ALTER TABLE `refunds` DROP FOREIGN KEY `refunds_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `stock_movements` DROP FOREIGN KEY `stock_movements_productId_fkey`;

-- DropForeignKey
ALTER TABLE `stock_movements` DROP FOREIGN KEY `stock_movements_userId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_details` DROP FOREIGN KEY `transaction_details_productId_fkey`;

-- DropForeignKey
ALTER TABLE `transaction_details` DROP FOREIGN KEY `transaction_details_transactionId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_cashierId_fkey`;

-- DropForeignKey
ALTER TABLE `transactions` DROP FOREIGN KEY `transactions_userId_fkey`;

-- DropIndex
DROP INDEX `cart_productId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `cart_userId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `cart_variantId_fkey` ON `cart`;

-- DropIndex
DROP INDEX `notifications_userId_fkey` ON `notifications`;

-- DropIndex
DROP INDEX `product_images_productId_fkey` ON `product_images`;

-- DropIndex
DROP INDEX `product_variants_productId_fkey` ON `product_variants`;

-- DropIndex
DROP INDEX `products_categoryId_fkey` ON `products`;

-- DropIndex
DROP INDEX `refunds_approvedById_fkey` ON `refunds`;

-- DropIndex
DROP INDEX `refunds_initiatedById_fkey` ON `refunds`;

-- DropIndex
DROP INDEX `refunds_transactionId_fkey` ON `refunds`;

-- DropIndex
DROP INDEX `stock_movements_productId_fkey` ON `stock_movements`;

-- DropIndex
DROP INDEX `stock_movements_userId_fkey` ON `stock_movements`;

-- DropIndex
DROP INDEX `transaction_details_productId_fkey` ON `transaction_details`;

-- DropIndex
DROP INDEX `transaction_details_transactionId_fkey` ON `transaction_details`;

-- DropIndex
DROP INDEX `transactions_cashierId_fkey` ON `transactions`;

-- DropIndex
DROP INDEX `transactions_userId_fkey` ON `transactions`;

-- AlterTable
ALTER TABLE `cart` DROP PRIMARY KEY,
    DROP COLUMN `cartId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `productId`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    DROP COLUMN `variantId`,
    ADD COLUMN `cart_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `product_id` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD COLUMN `variant_id` INTEGER NULL,
    ADD PRIMARY KEY (`cart_id`);

-- AlterTable
ALTER TABLE `categories` DROP PRIMARY KEY,
    DROP COLUMN `categoryId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `category_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD PRIMARY KEY (`category_id`);

-- AlterTable
ALTER TABLE `notifications` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `isRead`,
    DROP COLUMN `notificationId`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_read` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `notification_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`notification_id`);

-- AlterTable
ALTER TABLE `product_images` DROP COLUMN `productId`,
    ADD COLUMN `product_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `product_variants` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `isActive`,
    DROP COLUMN `productId`,
    DROP COLUMN `stockQuantity`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `variantId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `is_active` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `product_id` INTEGER NOT NULL,
    ADD COLUMN `stock_quantity` INTEGER NOT NULL,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `variant_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`variant_id`);

-- AlterTable
ALTER TABLE `products` DROP PRIMARY KEY,
    DROP COLUMN `categoryId`,
    DROP COLUMN `productId`,
    ADD COLUMN `category_id` INTEGER NULL,
    ADD COLUMN `product_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`product_id`);

-- AlterTable
ALTER TABLE `refunds` DROP PRIMARY KEY,
    DROP COLUMN `approvedAt`,
    DROP COLUMN `approvedById`,
    DROP COLUMN `initiatedAt`,
    DROP COLUMN `initiatedById`,
    DROP COLUMN `refundId`,
    DROP COLUMN `transactionId`,
    ADD COLUMN `approved_at` DATETIME(3) NULL,
    ADD COLUMN `approved_by_id` INTEGER NULL,
    ADD COLUMN `initiated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `initiated_by_id` INTEGER NOT NULL,
    ADD COLUMN `refund_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `transaction_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`refund_id`);

-- AlterTable
ALTER TABLE `stock_movements` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `movementDate`,
    DROP COLUMN `movementId`,
    DROP COLUMN `movementType`,
    DROP COLUMN `productId`,
    DROP COLUMN `userId`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `movement_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `movement_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `movement_type` ENUM('IN', 'OUT', 'ADJUSTMENT') NOT NULL,
    ADD COLUMN `product_id` INTEGER NULL,
    ADD COLUMN `user_id` INTEGER NULL,
    ADD PRIMARY KEY (`movement_id`);

-- AlterTable
ALTER TABLE `transaction_details` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `detailId`,
    DROP COLUMN `productId`,
    DROP COLUMN `transactionId`,
    DROP COLUMN `unitPrice`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `detail_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `product_id` INTEGER NULL,
    ADD COLUMN `transaction_id` INTEGER NOT NULL,
    ADD COLUMN `unit_price` DECIMAL(12, 2) NOT NULL,
    ADD PRIMARY KEY (`detail_id`);

-- AlterTable
ALTER TABLE `transactions` DROP PRIMARY KEY,
    DROP COLUMN `cashierId`,
    DROP COLUMN `createdAt`,
    DROP COLUMN `finalAmount`,
    DROP COLUMN `paymentMethod`,
    DROP COLUMN `paymentReference`,
    DROP COLUMN `paymentStatus`,
    DROP COLUMN `totalAmount`,
    DROP COLUMN `transactionCode`,
    DROP COLUMN `transactionDate`,
    DROP COLUMN `transactionId`,
    DROP COLUMN `updatedAt`,
    DROP COLUMN `userId`,
    ADD COLUMN `cashier_id` INTEGER NULL,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `final_amount` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `payment_method` ENUM('CASH', 'DIGITAL', 'QRIS') NOT NULL,
    ADD COLUMN `payment_reference` VARCHAR(191) NULL,
    ADD COLUMN `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `total_amount` DECIMAL(12, 2) NOT NULL,
    ADD COLUMN `transaction_code` VARCHAR(191) NOT NULL,
    ADD COLUMN `transaction_date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `transaction_id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `updated_at` DATETIME(3) NOT NULL,
    ADD COLUMN `user_id` INTEGER NULL,
    ADD PRIMARY KEY (`transaction_id`);

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`category_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_variants` ADD CONSTRAINT `product_variants_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `product_images` ADD CONSTRAINT `product_images_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `stock_movements` ADD CONSTRAINT `stock_movements_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_cashier_id_fkey` FOREIGN KEY (`cashier_id`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`transaction_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_transaction_id_fkey` FOREIGN KEY (`transaction_id`) REFERENCES `transactions`(`transaction_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_initiated_by_id_fkey` FOREIGN KEY (`initiated_by_id`) REFERENCES `users`(`userId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refunds` ADD CONSTRAINT `refunds_approved_by_id_fkey` FOREIGN KEY (`approved_by_id`) REFERENCES `users`(`userId`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`product_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `cart` ADD CONSTRAINT `cart_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`userId`) ON DELETE CASCADE ON UPDATE CASCADE;
