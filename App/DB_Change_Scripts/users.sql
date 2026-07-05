CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,

    full_name VARCHAR(100) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    role ENUM('Admin', 'Employee') NOT NULL DEFAULT 'Employee',

    remember_token VARCHAR(255) DEFAULT NULL,

    status TINYINT(1) NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


INSERT INTO users
(
    full_name,
    email,
    password,
    role
)
VALUES
(
    'Admin',
    'admin@gmail.com',
    '$2b$10$abcdefghijklmnopqrstuv',
    'Admin'
);