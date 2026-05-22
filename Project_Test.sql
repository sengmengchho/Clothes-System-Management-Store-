CREATE DATABASE Store;
USE Store;

-- Users table
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    email VARCHAR(100),
    role ENUM('Admin','Staff','Sales','Test'),
    status ENUM('Active','Inactive'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE Products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    stock INT,
    price DECIMAL(10,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE Sales (
    sale_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    user_id INT,
    quantity INT,
    sale_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);

-- Backup log table
CREATE TABLE Backup_Log (
    backup_id INT AUTO_INCREMENT PRIMARY KEY,
    type ENUM('Logical','Physical'),
    triggered_by VARCHAR(50),
    backup_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    file_path VARCHAR(200)
);


-- Insert Sample Data

-- Users
INSERT INTO Users(name,email,role,status) VALUES
('Alice','alice@mail.com','Admin','Active'),
('Bob','bob@mail.com','Staff','Active'),
('Carol','carol@mail.com','Sales','Active'),
('Dave','dave@mail.com','Test','Active');

-- Products
INSERT INTO Products(name,stock,price) VALUES
('Laptop',10,1200),
('Mouse',50,25),
('Keyboard',30,40);

-- Sales
INSERT INTO Sales(product_id,user_id,quantity) VALUES
(1,3,1),
(2,3,2);

-- Users Roles & Privileges 

-- Create MySQL users
CREATE USER 'Alice'@'localhost' IDENTIFIED BY 'admin123';
CREATE USER 'Bob'@'localhost' IDENTIFIED BY 'staff123';
CREATE USER 'Carol'@'localhost' IDENTIFIED BY 'sales123';
CREATE USER 'Dave'@'localhost' IDENTIFIED BY 'test123';

-- Grant privileges
GRANT ALL PRIVILEGES ON Store.* TO 'Alice'@'localhost';
GRANT CREATE USER ON *.* TO 'Alice'@'localhost' WITH GRANT OPTION;
GRANT PROCESS ON *.* TO 'Alice'@'localhost';
GRANT SELECT, INSERT, UPDATE ON Store.Products TO 'Bob'@'localhost';
GRANT SELECT, INSERT ON Store.Sales TO 'Carol'@'localhost';
GRANT SELECT ON Store.Products TO 'Dave'@'localhost';
FLUSH PRIVILEGES;



-- Add Trigger
DELIMITER $$

CREATE TRIGGER trg_check_stock
BEFORE INSERT ON Sales
FOR EACH ROW
BEGIN
    DECLARE v_stock INT;
    SELECT stock INTO v_stock FROM Products WHERE product_id = NEW.product_id;
    
    IF v_stock < NEW.quantity THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Insufficient stock!';
    END IF;

    -- Reduce stock after sale
    UPDATE Products SET stock = stock - NEW.quantity WHERE product_id = NEW.product_id;
END$$

DELIMITER ;






