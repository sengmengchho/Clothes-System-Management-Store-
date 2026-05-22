-- ============================================================
-- Cloth Store Database  | Improved Version
-- ============================================================

CREATE DATABASE IF NOT EXISTS Cloth_Store
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;
USE Cloth_Store;

-- ============================================================
-- 1. Categories
-- ============================================================
CREATE TABLE IF NOT EXISTS Categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. Products (master record)
-- ============================================================
CREATE TABLE IF NOT EXISTS Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2) NOT NULL,
    image_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);

-- ============================================================
-- 3. Product_Variants
-- ============================================================
CREATE TABLE IF NOT EXISTS Product_Variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size ENUM('XS','S','M','L','XL','XXL') NOT NULL,
    color VARCHAR(30) NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    price DECIMAL(10,2) NULL,
    sku VARCHAR(80) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    CONSTRAINT chk_stock CHECK (stock >= 0)
);

-- ============================================================
-- 4. Users
-- ============================================================
CREATE TABLE IF NOT EXISTS Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role ENUM('Admin','Sale','Customer') NOT NULL DEFAULT 'Customer',
    status ENUM('Active','Inactive') NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 5. Orders
-- ============================================================
CREATE TABLE IF NOT EXISTS Orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('Pending','Paid','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
    shipping_address TEXT NOT NULL,
    total_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    ordered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- ============================================================
-- 6. Order_Items
-- ============================================================
CREATE TABLE IF NOT EXISTS Order_Items (
    item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
    FOREIGN KEY (variant_id) REFERENCES Product_Variants(variant_id),
    CONSTRAINT chk_qty CHECK (quantity > 0)
);

-- ============================================================
-- TRIGGERS
-- ============================================================
DELIMITER $$

-- Check stock & deduct before inserting an order item
CREATE TRIGGER trg_check_stock
BEFORE INSERT ON Order_Items
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT stock INTO v_stock FROM Product_Variants WHERE variant_id = NEW.variant_id;

    IF v_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Product variant not found.';
    END IF;

    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Insufficient stock for the requested quantity.';
    END IF;

    UPDATE Product_Variants
    SET stock = stock - NEW.quantity
    WHERE variant_id = NEW.variant_id;
END$$

-- Recalculate Orders.total_price after each item insert
CREATE TRIGGER trg_update_order_total
AFTER INSERT ON Order_Items
FOR EACH ROW
BEGIN
    UPDATE Orders
    SET total_price = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM Order_Items
        WHERE order_id = NEW.order_id
    )
    WHERE order_id = NEW.order_id;
END$$

-- Restore stock if an order is Cancelled
CREATE TRIGGER trg_restore_stock_on_cancel
AFTER UPDATE ON Orders
FOR EACH ROW
BEGIN
    IF NEW.status = 'Cancelled' AND OLD.status <> 'Cancelled' THEN
        UPDATE Product_Variants pv
        JOIN Order_Items oi ON oi.variant_id = pv.variant_id
        SET pv.stock = pv.stock + oi.quantity
        WHERE oi.order_id = NEW.order_id;
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- STORED PROCEDURES
-- ============================================================
DELIMITER $$

-- Register a new customer (email must be unique)
CREATE PROCEDURE RegisterCustomer(
    IN p_name VARCHAR(100),
    IN p_email VARCHAR(150),
    IN p_password VARCHAR(100),
    IN p_phone VARCHAR(20),
    IN p_address TEXT
)
BEGIN
    IF EXISTS (SELECT 1 FROM Users WHERE email = p_email) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Email is already registered.';
    END IF;

    INSERT INTO Users(name, email, password, phone, address, role, status)
    VALUES(p_name, p_email, p_password, p_phone, p_address, 'Customer', 'Active');
END$$

-- Place an order (JSON array of items)
CREATE PROCEDURE PlaceOrder(
    IN p_user_id INT,
    IN p_shipping_address TEXT,
    IN p_items_json JSON
)
BEGIN
    DECLARE v_order_id INT;
    DECLARE v_i INT DEFAULT 0;
    DECLARE v_count INT;
    DECLARE v_vid INT;
    DECLARE v_qty INT;
    DECLARE v_price DECIMAL(10,2);

    IF NOT EXISTS (SELECT 1 FROM Users WHERE user_id = p_user_id AND status = 'Active') THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User not found or inactive.';
    END IF;

    INSERT INTO Orders(user_id, shipping_address, status)
    VALUES(p_user_id, p_shipping_address, 'Pending');

    SET v_order_id = LAST_INSERT_ID();
    SET v_count = JSON_LENGTH(p_items_json);

    WHILE v_i < v_count DO
        SET v_vid = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].variant_id')));
        SET v_qty = JSON_UNQUOTE(JSON_EXTRACT(p_items_json, CONCAT('$[', v_i, '].quantity')));

        SELECT COALESCE(pv.price, p.base_price)
        INTO v_price
        FROM Product_Variants pv
        JOIN Products p ON p.product_id = pv.product_id
        WHERE pv.variant_id = v_vid;

        INSERT INTO Order_Items(order_id, variant_id, quantity, unit_price)
        VALUES(v_order_id, v_vid, v_qty, v_price);

        SET v_i = v_i + 1;
    END WHILE;

    SELECT v_order_id AS new_order_id;
END$$

-- Add or update a product with one variant
CREATE PROCEDURE UpsertProduct(
    IN p_category_name VARCHAR(50),
    IN p_product_name VARCHAR(100),
    IN p_description TEXT,
    IN p_base_price DECIMAL(10,2),
    IN p_image_url VARCHAR(255),
    IN p_size ENUM('XS','S','M','L','XL','XXL'),
    IN p_color VARCHAR(30),
    IN p_stock INT,
    IN p_sku VARCHAR(80)
)
BEGIN
    DECLARE v_cat_id INT;
    DECLARE v_prod_id INT;

    INSERT IGNORE INTO Categories(name) VALUES(p_category_name);
    SELECT category_id INTO v_cat_id FROM Categories WHERE name = p_category_name;

    INSERT INTO Products(category_id, product_name, description, base_price, image_url)
    VALUES(v_cat_id, p_product_name, p_description, p_base_price, p_image_url);

    SET v_prod_id = LAST_INSERT_ID();

    INSERT INTO Product_Variants(product_id, size, color, stock, sku)
    VALUES(v_prod_id, p_size, p_color, p_stock, p_sku);
END$$

DELIMITER ;

-- ============================================================
-- ROLES & USERS
-- ============================================================

-- Create roles
CREATE ROLE IF NOT EXISTS Sale;
CREATE ROLE IF NOT EXISTS Customer;

-- Sale: view products/variants, manage orders
GRANT SELECT, INSERT, UPDATE ON Cloth_Store.Orders TO Sale;
GRANT SELECT, INSERT ON Cloth_Store.Order_Items TO Sale;
GRANT SELECT ON Cloth_Store.Products TO Sale;
GRANT SELECT ON Cloth_Store.Product_Variants TO Sale;
GRANT SELECT ON Cloth_Store.Categories TO Sale;
GRANT SELECT ON Cloth_Store.Users TO Sale;

-- Customer: view catalogue only, can execute registration & place order
GRANT SELECT ON Cloth_Store.Products TO Customer;
GRANT SELECT ON Cloth_Store.Product_Variants TO Customer;
GRANT SELECT ON Cloth_Store.Categories TO Customer;
GRANT EXECUTE ON PROCEDURE Cloth_Store.PlaceOrder TO Customer;
GRANT EXECUTE ON PROCEDURE Cloth_Store.RegisterCustomer TO Customer;

-- Admin user
CREATE USER IF NOT EXISTS 'Th34n'@'%' IDENTIFIED BY 'Th34n90s';
GRANT ALL PRIVILEGES ON Cloth_Store.* TO 'Th34n'@'%' WITH GRANT OPTION;
GRANT CREATE USER, CREATE ROLE, DROP ROLE, GRANT OPTION ON *.* TO 'Th34n'@'%';
GRANT ROLE_ADMIN       ON *.*         TO 'Th34n'@'%';
FLUSH PRIVILEGES;


