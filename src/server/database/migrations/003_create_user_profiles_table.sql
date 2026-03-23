CREATE TABLE IF NOT EXISTS user_profiles (
  user_email VARCHAR(191) NOT NULL,
  phone VARCHAR(50) NULL,
  location VARCHAR(120) NULL,
  bio TEXT NULL,
  photo_url VARCHAR(500) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (user_email),
  CONSTRAINT fk_user_profiles_user_email
    FOREIGN KEY (user_email)
    REFERENCES users(email)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO user_profiles (user_email, phone, location, bio, photo_url)
SELECT u.email, u.phone, u.location, u.bio, u.photo_url
FROM users u
WHERE u.phone IS NOT NULL
   OR u.location IS NOT NULL
   OR u.bio IS NOT NULL
   OR u.photo_url IS NOT NULL
ON DUPLICATE KEY UPDATE
  phone = VALUES(phone),
  location = VALUES(location),
  bio = VALUES(bio),
  photo_url = VALUES(photo_url);
