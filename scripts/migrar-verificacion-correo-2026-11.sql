-- Confirmación de correo (nov. 2026). Correr UNA vez en cada base (local y servidor) ANTES de desplegar el código nuevo:
-- la columna nueva no molesta al código anterior, pero el código nuevo la necesita para que funcione el login.
ALTER TABLE users ADD COLUMN email_verified_at TIMESTAMP NULL DEFAULT NULL;

-- Las cuentas que ya existían quedan confirmadas, para que nadie se quede sin poder entrar.
UPDATE users SET email_verified_at = NOW() WHERE email_verified_at IS NULL;
