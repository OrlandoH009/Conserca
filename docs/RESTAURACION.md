# Respaldos, restauración y aviso de disco

Qué se respalda: la **base de datos** y los **PDF** subidos (`storage/documents`), juntos en un solo archivo `conserca-AAAAMMDD-HHMMSS.tar.gz`.
Qué **no** se respalda: el archivo `.env` (lleva contraseñas). Guarda una copia en un lugar seguro aparte (por ejemplo, un gestor de contraseñas); sin él hay que volver a crear `DATABASE_URL` y `SESSION_SECRET`.

## 1. Hacer un respaldo
```
npm run db:backup
```
Deja el archivo en `storage/backups/` y conserva los últimos 14 (cambia el número con `BACKUP_KEEP` en `.env`).

## 2. Que se haga solo (en el servidor Linux)
Con `crontab -e` del usuario que corre la app (ajusta la ruta `/srv/conserca`):
```
0 3 * * *  cd /srv/conserca && npm run db:backup  >> /var/log/conserca-backup.log 2>&1
0 * * * *  cd /srv/conserca && npm run disk:check >> /var/log/conserca-disk.log 2>&1
```
El primero respalda cada día a las 3:00; el segundo revisa el disco cada hora.
Decisión por confirmar con el cliente: aquí base y PDF se respaldan **juntos y a diario**. Si los PDF llegan a pesar mucho, se puede separar (base a diario, PDF cada semana).

## 3. Copia a Google Drive del cliente
Se usa `rclone`, que copia el respaldo a una carpeta de Drive.
1. Instalar: `sudo apt install rclone` (o `curl https://rclone.org/install.sh | sudo bash`).
2. Configurar: `rclone config` → «n» (nuevo) → nombre `gdrive` → tipo `drive` → seguir el asistente. En un servidor sin navegador, el asistente indica cómo autorizar desde otro equipo (`rclone authorize "drive"`). La cuenta de Google debe ser la del cliente.
3. Probar: `rclone lsd gdrive:` debe listar carpetas.
4. En `.env` del servidor agregar: `RCLONE_REMOTE=gdrive:Conserca-respaldos`.
5. Probar de punta a punta: `npm run db:backup` debe terminar con «Copiado a la nube», y el archivo debe verse en Drive.

Si la copia a la nube falla, el respaldo local sí queda y el comando termina con error (código 2); revisa el registro `/var/log/conserca-backup.log`.
Para no llenar el Drive, opcional: `rclone delete gdrive:Conserca-respaldos --min-age 90d` (borra respaldos de más de 90 días; programarlo en cron).

## 4. Restaurar (paso a paso)
Úsalo cuando se dañó la base, se borró algo importante o se pasa a un servidor nuevo.
1. **Parar la app**: `pm2 stop conserca` (o como esté instalada).
2. **Traer el respaldo**: si está solo en Drive, `rclone copy gdrive:Conserca-respaldos/conserca-AAAAMMDD-HHMMSS.tar.gz storage/backups/`.
3. **Servidor nuevo solamente**: instalar Node y MySQL, clonar el proyecto, copiar el `.env` guardado, crear la base y el usuario con `scripts/crear-base.example.sql` (cambiando la contraseña de ejemplo), `npm ci` y `npm run build`.
4. **Ver qué haría** (no cambia nada):
   ```
   npm run db:restore -- storage/backups/conserca-AAAAMMDD-HHMMSS.tar.gz
   ```
5. **Restaurar de verdad** (agrega `--yes`). Esto **reemplaza** las tablas de la base y sobrescribe los PDF con el mismo nombre:
   ```
   npm run db:restore -- storage/backups/conserca-AAAAMMDD-HHMMSS.tar.gz --yes
   ```
6. **Arrancar la app** (`pm2 start conserca`) y comprobar: entrar con el Gerente, abrir un proyecto, abrir un PDF y revisar Cobros.
7. Si algo sale mal, la base anterior ya no existe: por eso, **antes de restaurar sobre una base con datos, haz primero un respaldo nuevo** (`npm run db:backup`).

Para ensayar sin riesgo, restaura en otra base: `npm run db:restore -- archivo.tar.gz --yes --db conserca_prueba` (la base debe existir y el usuario debe tener permisos sobre ella).

## 5. Aviso de disco
`npm run disk:check` mide el disco donde corre la app. Si pasa del 80 % (cambia con `DISK_ALERT_PCT`), deja un aviso en la campana del panel de cada Gerente (máximo uno por día) y termina con código 2. Con `DISK_PATH` se elige otra ruta a medir.
Qué hacer al recibirlo: borrar respaldos viejos de `storage/backups`, revisar `storage/documents`, o ampliar el disco en DigitalOcean.
Limitación: el aviso es dentro del sistema; cuando exista el correo se enviará también por correo.

## 6. Qué se probó y qué no
- Probado en el equipo de desarrollo: el respaldo se genera con la base y los PDF; el aviso de disco dispara y deja la notificación; la restauración en modo «ver qué haría».
- **No probado todavía:** la restauración real sobre una base vacía (necesita una base de prueba con permisos) y la copia a Google Drive (necesita la cuenta del cliente). Ambas deben probarse en el servidor antes de entregar.
