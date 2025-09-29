-- Initialize CSM Clinic Dashboard Database
-- This file is executed when the PostgreSQL container starts for the first time

-- Create database if it doesn't exist (this is handled by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS csm_clinic_dashboard;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password_hash VARCHAR(255),
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table (for caching posts from Postiz API)
CREATE TABLE IF NOT EXISTS posts_cache (
    id VARCHAR(255) PRIMARY KEY,
    content TEXT,
    publish_date TIMESTAMP WITH TIME ZONE,
    release_url TEXT,
    state VARCHAR(50),
    tags TEXT[],
    integration_id VARCHAR(255),
    integration_name VARCHAR(255),
    integration_provider VARCHAR(255),
    integration_picture TEXT,
    customer_id VARCHAR(255),
    customer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create integrations table (for caching integrations from Postiz API)
CREATE TABLE IF NOT EXISTS integrations_cache (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255),
    identifier VARCHAR(255),
    picture TEXT,
    disabled BOOLEAN DEFAULT FALSE,
    profile VARCHAR(255),
    customer_id VARCHAR(255),
    customer_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_cache_publish_date ON posts_cache(publish_date);
CREATE INDEX IF NOT EXISTS idx_posts_cache_state ON posts_cache(state);
CREATE INDEX IF NOT EXISTS idx_posts_cache_integration_id ON posts_cache(integration_id);
CREATE INDEX IF NOT EXISTS idx_posts_cache_customer_id ON posts_cache(customer_id);

CREATE INDEX IF NOT EXISTS idx_integrations_cache_identifier ON integrations_cache(identifier);
CREATE INDEX IF NOT EXISTS idx_integrations_cache_customer_id ON integrations_cache(customer_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_cache_updated_at BEFORE UPDATE ON posts_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_integrations_cache_updated_at BEFORE UPDATE ON integrations_cache FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (password: admin123)
INSERT INTO users (email, name, password_hash, role) VALUES 
('admin@csm.com', 'Admin User', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (email) DO NOTHING;

-- Create a view for posts with customer information
CREATE OR REPLACE VIEW posts_with_customers AS
SELECT 
    p.*,
    i.customer_name
FROM posts_cache p
LEFT JOIN integrations_cache i ON p.integration_id = i.id;

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE csm_clinic_dashboard TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres;
