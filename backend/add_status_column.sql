-- Migration: Add status column to transactions table
-- This column will store order status like 'pending', 'processing', 'shipped', 'delivered', 'cancelled'

ALTER TABLE transactions 
ADD COLUMN status VARCHAR(50) DEFAULT 'pending' 
COMMENT 'Order status: pending, processing, shipped, delivered, cancelled';

-- Update existing transactions to have appropriate status
UPDATE transactions 
SET status = CASE 
  WHEN payment_status = 'SUCCESS' THEN 'pending'
  WHEN payment_status = 'PENDING' THEN 'pending'
  WHEN payment_status = 'FAILED' THEN 'cancelled'
  ELSE 'pending'
END;

-- Add index for better performance
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
