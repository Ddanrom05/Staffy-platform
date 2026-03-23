CREATE DATABASE IF NOT EXISTS staffy;
USE staffy;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  full_name VARCHAR(120) NOT NULL,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('voluntario', 'empresa', 'admin') NOT NULL DEFAULT 'voluntario',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_profiles (
  user_email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  location VARCHAR(120) NULL,
  bio TEXT NULL,
  photo_url LONGTEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_email),
  CONSTRAINT fk_user_profiles_user_email
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_skills (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(191) NOT NULL,
  skill_name VARCHAR(120) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_skills_user_email_skill_name (user_email, skill_name),
  CONSTRAINT fk_user_skills_user_email
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS volunteer_history (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(191) NOT NULL,
  title VARCHAR(180) NOT NULL,
  organization VARCHAR(180) NOT NULL,
  activity_date DATE NULL,
  hours INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('completado', 'proximo') NOT NULL DEFAULT 'proximo',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_volunteer_history_user_email (user_email),
  CONSTRAINT fk_volunteer_history_user_email
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS user_badges (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_email VARCHAR(191) NOT NULL,
  badge_name VARCHAR(160) NOT NULL,
  status ENUM('earned', 'locked') NOT NULL DEFAULT 'locked',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_badges_user_email_badge_name (user_email, badge_name),
  CONSTRAINT fk_user_badges_user_email
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role ENUM('voluntario', 'empresa', 'admin') NOT NULL DEFAULT 'voluntario' AFTER password_hash;
