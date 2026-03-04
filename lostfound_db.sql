CREATE DATABASE lostfound_db;
USE lostfound_db;

CREATE TABLE users(
id INT AUTO_INCREMENT PRIMARY KEY,
email VARCHAR(100) UNIQUE,
password VARCHAR(255)
);

CREATE DATABASE IF NOT EXISTS lostfound_db;
USE lostfound_db;

CREATE TABLE users (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    email    VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE items (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT,
    location    VARCHAR(255),
    date        DATE,
    contact     VARCHAR(20),        
    email       VARCHAR(100),      
    category    VARCHAR(100),
    status      ENUM('Lost', 'Found', 'Claimed') NOT NULL,
    user_id     INT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

insert 	into users (email, password)
values 
('user123@gmail.com', 'user123');

INSERT INTO items (title, description, location, date, contact, email, category, status)
VALUES
('Black Wallet',  'Lost near library entrance',    'Library',       '2026-03-01', '0123456789', NULL,                  'Document',    'Lost'),
('Blue Backpack', 'Contains laptop and notebooks', 'Cafeteria',     '2026-03-02', '0112233445', 'ali@student.edu.my',  'Bag',         'Lost'),
('iPhone 13',     'Found beside lecture hall',     'Block A',       '2026-03-01', '0198877665', NULL,                  'Electronics', 'Found'),
('Student Card',  'Found near parking area',       'Parking Lot',   '2026-02-28', '0175566778', 'sara@student.edu.my', 'Document',    'Found'),
('Water Bottle',  'Left inside classroom B12',     'Classroom B12', '2026-03-03', '0163322114', NULL,                  'Others',      'Found'),
('Red Umbrella', 'Lost during heavy rain', 'Main Entrance', '2026-03-04', '0134455667', 'john@student.edu.my', 'Others', 'Lost'),
('Silver Watch', 'Lost near computer lab', 'Computer Lab', '2026-03-03', '0187766554', NULL, 'Accessories', 'Lost'),
('Dell Laptop', 'Forgot in study room', 'Study Room 2', '2026-03-02', '0149988776', 'mei@student.edu.my', 'Electronics', 'Lost'),
('White Earbuds', 'Dropped while jogging', 'Campus Track', '2026-03-01', '0165544332', NULL, 'Electronics', 'Lost'),
('Green Notebook', 'Notes for final exam', 'Lecture Hall B', '2026-03-03', '0172233445', 'adam@student.edu.my', 'Document', 'Lost'),
('Car Key', 'Lost near parking gate', 'Parking Gate', '2026-03-04', '0193344556', NULL, 'Accessories', 'Lost'),
('Grey Hoodie', 'Lost after evening class', 'Block C Corridor', '2026-03-04', '0128899776', 'farah@student.edu.my', 'Clothing', 'Lost'),
('Samsung Tablet', 'Found on study table', 'Library Level 2', '2026-03-03', '0132233445', NULL, 'Electronics', 'Found'),
('Black Spectacles', 'Found near cafeteria counter', 'Cafeteria', '2026-03-02', '0176655443', 'amir@student.edu.my', 'Accessories', 'Found'),
('USB Flash Drive', 'Found in computer lab PC', 'Computer Lab', '2026-03-04', '0183344556', NULL, 'Electronics', 'Found'),
('Pink Pencil Case', 'Found inside classroom A5', 'Classroom A5', '2026-03-01', '0167788990', 'lina@student.edu.my', 'Stationery', 'Found'),
('Motorcycle Helmet', 'Left at parking area', 'Parking Lot', '2026-03-03', '0195566778', NULL, 'Others', 'Found');

SELECT * FROM items;