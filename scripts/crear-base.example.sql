-- Plantilla: copia este archivo como scripts/crear-base.sql, cambia la contraseña e impórtalo en phpMyAdmin
-- (pestaña Importar) entrando como root. Ese archivo ya contiene la contraseña y no se sube a git.
CREATE DATABASE IF NOT EXISTS conserca CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
CREATE USER IF NOT EXISTS 'conserca_app'@'localhost' IDENTIFIED BY 'CAMBIA_ESTA_CONTRASEÑA';
CREATE USER IF NOT EXISTS 'conserca_app'@'127.0.0.1' IDENTIFIED BY 'CAMBIA_ESTA_CONTRASEÑA';
GRANT ALL PRIVILEGES ON conserca.* TO 'conserca_app'@'localhost';
GRANT ALL PRIVILEGES ON conserca.* TO 'conserca_app'@'127.0.0.1';
FLUSH PRIVILEGES;
