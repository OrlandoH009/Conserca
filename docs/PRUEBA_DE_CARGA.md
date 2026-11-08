# Prueba de carga (8 a 15 usuarios simultáneos)

Fecha: 2026-11-08. Criterio acordado: el 95 % de las respuestas en menos de 1,5 s y 0 errores.

## Resultado
| Escenario | Peticiones | Mediana | p95 | Máximo | Errores | Resultado |
|---|---|---|---|---|---|---|
| **15 usuarios** durante 60 s (el caso de la propuesta) | 445 (7,1/s) | 29 ms | 54 ms | 219 ms | 0 | **Aprueba** |
| 60 usuarios durante 30 s (4 veces lo previsto) | 891 (27,1/s) | 40 ms | 748 ms | 775 ms | 0 | Aprueba |

Memoria del servidor de producción tras las dos pruebas: unos 350 MB (el servidor de DigitalOcean tendrá 2 GB).

## Qué se midió
- Servidor de producción real (`next build` + `next start`), no el de desarrollo.
- Los usuarios virtuales reparten roles (Gerente, Ing. Diseñador, Técnico, Cliente), navegan entre páginas con pausas de 1 a 3 s y descargan un PDF. Es solo lectura: no cambia datos.
- Páginas: panel, lista y pestañas de proyecto (cargas, distribución, documentos, cobros, supervisión, actividad), clientes, calculadoras, catálogo, avisos, portal del cliente, sitio público y descarga de PDF.
- Una redirección al login se cuenta como error (la sesión sería rechazada).

## Qué NO dice esta prueba (límites)
- Se hizo en el equipo de desarrollo (12 procesadores, base de datos en el mismo equipo y con pocos datos). El servidor será de **1 CPU**, más lento que un procesador de escritorio. Con 15 usuarios sobra margen (54 ms contra 1 500 ms permitidos), pero **la cifra definitiva debe repetirse en el servidor de DigitalOcean** con el mismo comando.
- No incluye el login (cada inicio de sesión gasta CPU en el cifrado de la contraseña), ni subir PDF, ni guardar cálculos o cobros (escrituras).
- La base tiene pocos proyectos y documentos; con el volumen de un año (unos 50 proyectos) las consultas siguen siendo simples, pero no se probó con ese volumen.
- Con 60 usuarios la latencia ya sube (p95 748 ms): el servidor es de un solo proceso. No es un problema con 8 a 15 usuarios.

## Cómo repetirla (en el servidor)
```
NEXT_DIST_DIR=.next-load npx next build      # compila sin pisar nada (en el servidor basta npm run build)
npm run start                                  # o ya está corriendo con pm2
npm run load:test -- --url http://localhost:3000 --users 15 --seconds 60
```
El script firma sesiones con el `SESSION_SECRET` del `.env`, por eso debe correr en el servidor con ese mismo `.env`. Termina con código 0 si aprueba. Mientras corre, `htop` muestra el uso de CPU y memoria.
En el equipo de desarrollo, `NEXT_DIST_DIR` evita pisar el servidor de `npm run dev`. Si la compilación modifica `tsconfig.json`, revierte ese archivo.
