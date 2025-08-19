-- AlterTable
ALTER TABLE `transaction_details` ADD COLUMN `variant_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `transactions` ADD COLUMN `fee_amount` DECIMAL(12, 2) NULL;

-- AddForeignKey
ALTER TABLE `transaction_details` ADD CONSTRAINT `transaction_details_variant_id_fkey` FOREIGN KEY (`variant_id`) REFERENCES `product_variants`(`variant_id`) ON DELETE SET NULL ON UPDATE CASCADE;
