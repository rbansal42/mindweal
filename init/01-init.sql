-- Initialize MindWeal Database
-- This script runs automatically when the container starts for the first time

-- Create additional databases if needed
CREATE DATABASE IF NOT EXISTS mindweal_strapi;

-- Grant permissions
GRANT ALL PRIVILEGES ON mindweal.* TO 'mindweal'@'%';
GRANT ALL PRIVILEGES ON mindweal_strapi.* TO 'mindweal'@'%';
FLUSH PRIVILEGES;
