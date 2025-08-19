-- Migration: Add status columns to transactions table
-- Run this with: npx prisma db execute --file=add_status_columns.sql

-- 1. Add status column
ALTER TABLE transactions 
ADD COLUMN status VARCHAR(50) DEFAULT 'pending' 
COMMENT 'Order status: pending, processing, shipped, delivered, cancelled';

-- 2. Add waybill_number column
ALTER TABLE transactions 
ADD COLUMN waybill_number VARCHAR(255) NULL 
COMMENT 'Shipping tracking number';

-- 3. Add courier column
ALTER TABLE transactions 
ADD COLUMN courier VARCHAR(100) NULL 
COMMENT 'Courier name (JNE, SiCepat, etc.)';

-- 4. Update existing transactions
UPDATE transactions 
SET status = CASE 
  WHEN payment_status = 'SUCCESS' THEN 'pending'
  WHEN payment_status = 'PENDING' THEN 'pending'
  WHEN payment_status = 'FAILED' THEN 'cancelled'
  ELSE 'pending'
END;

-- 5. Add indexes
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_waybill ON transactions(waybill_number);
