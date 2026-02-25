# ION Smart Platform

Plataforma modular Smart City / Smart Industry. El repositorio raíz orquesta varios sub-repos mediante Docker Compose y scripts de arranque en `bin/`.

## Estructura

```
ion/
├── monorepo/          # Backend PHP 8.3 + Apache (+ Dockerfiles + migraciones Goose)
├── ioncore/           # Módulo PHP: Core (auth, usuarios, dispositivos, reconocimientos)
├── ioncity/           # Módulo PHP: Smart City (infracciones, alertas, áreas, campañas)
├── city/              # Frontend React + Vite (Smart City)
├── cop/               # App móvil React Native (iOS / Android)
├── TrafficSocket/     # WebSocket Node.js (MQTT → socket.io)
├── docker-compose.yml          # Stack de producción
├── docker-compose.override.yml # Overrides de desarrollo (aplicado automáticamente)
├── case.json          # Registro de servicios para CASE
└── bin/
    ├── start/
    │   ├── dev.sh     # Arranca el entorno de desarrollo
    │   └── prod.sh    # Arranca el entorno de producción
    └── stop.sh        # Para todos los servicios
```

## Requisitos

- Docker >= 20.10 y Docker Compose >= 2.0
- Node.js >= 18 + npm
- Certificados SSL en `TrafficSocket/cert/` (solo producción)

## Variables de entorno

```bash
cp monorepo/.env.example monorepo/.env        # credenciales PHP / DB
cp TrafficSocket/.env.example TrafficSocket/.env  # config MQTT y socket
```

Variables clave en `monorepo/.env`:

| Variable | Default | Descripción |
|---|---|---|
| `MYSQL_ROOT_PASSWORD` | `root_password` | Contraseña root MariaDB |
| `MYSQL_USER` / `MYSQL_PASSWORD` | `mysql_user` / `mysql_password` | Usuario de la app |
| `CORE_DB_NAME` | `core` | Base de datos principal |
| `CITY_DB_NAME` | `city` | Base de datos Smart City |
| `ENABLED_DBS` | `core` | Módulos a migrar (`core,city`) |
| `APP_PORT` | `8080` | Puerto host del backend PHP |
| `PHPMYADMIN_PORT` | `8081` | Puerto host de phpMyAdmin |

## Modo desarrollo

```bash
bin/start/dev.sh
```

El script ejecuta `docker compose` desde `monorepo/`, por lo que el override (`docker-compose.override.yml`) se aplica automáticamente:
- Usa `Dockerfile.dev` (OPcache desactivado)
- Monta `monorepo/` como volumen en vivo en el contenedor — los cambios PHP se reflejan sin rebuild

El frontend `city/` se sirve con el servidor de desarrollo de Vite (HMR activo).

| Servicio | URL | Notas |
|---|---|---|
| Backend PHP/Apache | http://localhost:8080 | Código montado en vivo |
| phpMyAdmin | http://localhost:8081 | Admin DB |
| City (Vite dev) | http://localhost:5173 | HMR activo |
| TrafficSocket | http://localhost:8101 | nodemon |

Para ver los logs de los procesos en segundo plano:

```bash
tail -f bin/logs/city.log
tail -f bin/logs/trafficsocket.log
cd monorepo && docker compose -p ion logs -f
```

Para parar todo:

```bash
bin/stop.sh
```

## Modo producción

```bash
bin/start/prod.sh
```

El script ejecuta `docker compose -f docker-compose.yml` desde `monorepo/`, omitiendo el override de dev:
- Usa `Dockerfile` (OPcache activado, imagen de producción)
- El código PHP está copiado en la imagen — no se monta en vivo

El frontend `city/` se construye con `vite build` y se sirve mediante `vite preview` (servidor HTTP estático sobre `city/dist/`).

| Servicio | URL | Notas |
|---|---|---|
| Backend PHP/Apache | http://localhost:8080 | Imagen de producción |
| phpMyAdmin | http://localhost:8081 | Admin DB |
| City (HTTP estático) | http://localhost:4173 | Bundle compilado en `city/dist/` |
| TrafficSocket | https://\<host\>:443 | Requiere certificados SSL |

Certificados requeridos en `TrafficSocket/cert/`:

```
TrafficSocket/cert/
├── private.key
└── certfinal.crt
```

## Migraciones de base de datos

Las migraciones se aplican automáticamente al iniciar el stack mediante el servicio `goose-migrate`. Para gestionarlas manualmente:

```bash
# Estado de migraciones
cd monorepo && ./goose.sh status

# Aplicar migraciones pendientes
./goose.sh up

# Crear nueva migración
./goose.sh create add_nombre_tabla city
```

## Frontend city (standalone)

El frontend está en `city/` y es una aplicación React + Vite independiente.

```bash
cd city
npm install --legacy-peer-deps

# Desarrollo (HMR)
npm run dev -- --host

# Build de producción
npm run build       # genera city/dist/
npm run preview     # sirve city/dist/ en :4173
```

## TrafficSocket

Servidor Node.js que actúa de bridge entre MQTT (dispositivos) y los clientes web via socket.io.

```bash
cd TrafficSocket
cp .env.example .env   # configurar MQTT_BROKER, DB, etc.

npm run dev    # desarrollo (nodemon, HTTP :8101)
npm start      # producción (HTTPS :443)
```

## Servicios CASE

`case.json` registra los servicios para el dashboard CASE:

| Servicio | Puerto contenedor/proceso |
|---|---|
| `frontend` | 80 (Apache/PHP en Docker) |
| `backend` | 80 (phpMyAdmin en Docker) |
| `database` | 3306 (MariaDB en Docker) |
| `city` | 5173 (Vite, proceso local) |
| `trafficsocket` | 8101 (Node.js, proceso local) |
