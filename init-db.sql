-- Initialize database for GitHub CRM
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- But we can add any additional initialization here

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- The tables will be created by the application on startup
-- This file is mainly for any additional database setup
