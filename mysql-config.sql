-- =====================================================
-- MYSQL CONFIGURATION: Fashion Park Inventory System
-- =====================================================

-- Set proper character set and collation
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
SET collation_connection = 'utf8mb4_unicode_ci';

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS fashion_park 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE fashion_park;

-- Set SQL mode for better compatibility
SET sql_mode = 'STRICT_TRANS_TABLES,NO_ZERO_DATE,NO_ZERO_IN_DATE,ERROR_FOR_DIVISION_BY_ZERO';

-- Enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- Set timezone (adjust as needed)
SET time_zone = '+07:00';

-- Show current settings
SELECT 
    @@character_set_database as 'Database Charset',
    @@collation_database as 'Database Collation',
    @@sql_mode as 'SQL Mode',
    @@time_zone as 'Timezone',
    @@foreign_key_checks as 'Foreign Key Checks';
