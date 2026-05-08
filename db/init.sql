-- Setup the main database
CREATE DATABASE sqli_demo;

\c sqli_demo;

-- Create the application user with restricted privileges
CREATE USER demouser WITH PASSWORD 'demopass';

-- Revoke all default privileges from public
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO demouser;

-- Create necessary tables
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    role VARCHAR(20) DEFAULT 'user'
);

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2)
);

CREATE TABLE secret_data (
    id SERIAL PRIMARY KEY,
    document_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL
);

-- Prepopulate data
INSERT INTO users (username, password, role) VALUES
('admin', 'supersecretpassword123', 'admin'),
('user1', 'password', 'user'),
('jane', 'janepass', 'user');

INSERT INTO products (name, description, price) VALUES
('Laptop', 'High-end gaming laptop', 1299.99),
('Smartphone', 'Latest model with great camera', 899.50),
('Headphones', 'Noise-canceling over-ear headphones', 199.99);

INSERT INTO secret_data (document_name, content) VALUES
('Q3_Earnings', 'CONFIDENTIAL: Q3 earnings show a 20% increase...'),
('Project_X_Plans', 'CONFIDENTIAL: Project X will launch next month...'),
('Employee_Salaries', 'CONFIDENTIAL: CEO: 500k, CTO: 300k...');

-- Grant permissions to demouser
GRANT SELECT ON users TO demouser;
GRANT SELECT ON products TO demouser;
GRANT SELECT ON secret_data TO demouser;

-- Make sure demouser can't modify schema or data
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON users FROM demouser;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON products FROM demouser;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON secret_data FROM demouser;

-- Keep a copy for reset procedure (optional, but easy way to reset)
CREATE SCHEMA backup_schema;
CREATE TABLE backup_schema.users AS SELECT * FROM users;
CREATE TABLE backup_schema.products AS SELECT * FROM products;
CREATE TABLE backup_schema.secret_data AS SELECT * FROM secret_data;

-- Function to reset the public schema data
CREATE OR REPLACE FUNCTION reset_db() RETURNS void AS $$
BEGIN
    TRUNCATE TABLE users, products, secret_data RESTART IDENTITY;
    INSERT INTO users SELECT * FROM backup_schema.users;
    INSERT INTO products SELECT * FROM backup_schema.products;
    INSERT INTO secret_data SELECT * FROM backup_schema.secret_data;
END;
$$ LANGUAGE plpgsql;

-- Grant execution to postgres (the backend admin connection)
-- Demouser doesn't get execution rights on this
REVOKE EXECUTE ON FUNCTION reset_db() FROM PUBLIC;
