-- Database
DROP DATABASE IF EXISTS cs6400_fa25_team58;
SET default_storage_engine = InnoDB;
SET GLOBAL time_zone = '+00:00';
SET time_zone = '+00:00';
SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci;
SET GLOBAL cte_max_recursion_depth = 1500;

-- SELECT @@GLOBAL.time_zone, @@SESSION.time_zone;

CREATE DATABASE IF NOT EXISTS cs6400_fa25_team58 
    DEFAULT CHARACTER SET utf8mb4 
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE cs6400_fa25_team58;

-- Tables
CREATE TABLE IF NOT EXISTS City (
    city_id INT UNSIGNED NOT NULL PRIMARY KEY,
    city VARCHAR(250) NOT NULL,
    state VARCHAR(50) NOT NULL,
    population INT NOT NULL,
    UNIQUE (city, state)
);

CREATE TABLE IF NOT EXISTS Store (
    store_number INT NOT NULL PRIMARY KEY,
    phone VARCHAR(20) NOT NULL,
    street_address VARCHAR(250) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    city_id INT UNSIGNED NOT NULL,
    FOREIGN KEY (city_id) REFERENCES City (city_id),
    UNIQUE (phone, street_address, zip_code)
);

CREATE TABLE IF NOT EXISTS MembershipType (
    type_name VARCHAR(50) NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Membership (
    membership_id INT NOT NULL PRIMARY KEY,
    signup_date DATE NOT NULL,
    signup_store INT NOT NULL,
    membership_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (signup_store) REFERENCES Store (store_number),
    FOREIGN KEY (membership_type) REFERENCES MembershipType (type_name)
);

CREATE TABLE IF NOT EXISTS Manufacturer (
    manufacturer_id INT NOT NULL PRIMARY KEY,
    manufacturer_name VARCHAR(250) UNIQUE NOT NULL,
    manufacturer_max_discount DOUBLE(3, 2) DEFAULT 0.90 CHECK (manufacturer_max_discount BETWEEN 0.00 AND 0.90)
);

CREATE TABLE IF NOT EXISTS Product (
    product_id INT NOT NULL PRIMARY KEY,
    product_name VARCHAR(250) NOT NULL,
    retail_price DOUBLE(16, 2) NOT NULL,
    manufacturer_id INT NOT NULL,
    FOREIGN KEY (manufacturer_id) REFERENCES Manufacturer (manufacturer_id)
);

CREATE TABLE IF NOT EXISTS StoreProduct (
    store_number INT NOT NULL,
    product_id INT NOT NULL,
    PRIMARY KEY (store_number, product_id),
    FOREIGN KEY (store_number) REFERENCES Store (store_number),
    FOREIGN KEY (product_id) REFERENCES Product (product_id)
);

CREATE TABLE IF NOT EXISTS Category (
    category_name VARCHAR(250) NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS ProductCategory (
    product_id INT NOT NULL,
    category_name VARCHAR(250) NOT NULL,
    PRIMARY KEY (product_id, category_name),
    FOREIGN KEY (product_id) REFERENCES Product (product_id),
    FOREIGN KEY (category_name) REFERENCES Category (category_name)
);

CREATE TABLE IF NOT EXISTS Calendar (
    calendar_date DATE NOT NULL PRIMARY KEY
);

CREATE TABLE IF NOT EXISTS Holiday (
    holiday_date DATE NOT NULL PRIMARY KEY,
    holiday_name VARCHAR(250) NOT NULL,
    FOREIGN KEY (holiday_date) REFERENCES Calendar (calendar_date)
);

CREATE TABLE IF NOT EXISTS Promotion (
    promotion_date DATE NOT NULL,
    product_id INT NOT NULL,
    discount_percent DOUBLE(4, 2) NOT NULL,
    PRIMARY KEY (promotion_date, product_id),
    FOREIGN KEY (promotion_date) REFERENCES Calendar (calendar_date),
    FOREIGN KEY (product_id) REFERENCES Product (product_id)
);

CREATE TABLE IF NOT EXISTS Sale (
    sale_date DATE NOT NULL,
    store_number INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    PRIMARY KEY (sale_date, store_number, product_id),
    FOREIGN KEY (sale_date) REFERENCES Calendar (calendar_date),
    FOREIGN KEY (store_number) REFERENCES Store (store_number),
    FOREIGN KEY (product_id) REFERENCES Product (product_id)
)
