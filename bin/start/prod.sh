#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PIDS_DIR="$ROOT/bin/.pids"
LOGS_DIR="$ROOT/bin/logs"

mkdir -p "$PIDS_DIR" "$LOGS_DIR"

log()  { echo "[$(date +'%H:%M:%S')] $*"; }
warn() { echo "[$(date +'%H:%M:%S')] WARN: $*"; }

# ── Validaciones críticas (bloquean producción) ───────────────────────────────
if [ ! -f "$ROOT/TrafficSocket/cert/private.key" ] || [ ! -f "$ROOT/TrafficSocket/cert/certfinal.crt" ]; then
    echo "ERROR: faltan certificados SSL en TrafficSocket/cert/ (private.key y certfinal.crt)"
    exit 1
fi
[ ! -f "$ROOT/monorepo/.env" ]      && warn "monorepo/.env no existe — usando credenciales por defecto (NO apto para producción)"
[ ! -f "$ROOT/TrafficSocket/.env" ] && warn "TrafficSocket/.env no existe — copia TrafficSocket/.env.example"

# ── 1. Build frontend city → monorepo/city/ (se hornea en la imagen Docker) ───
# COPY . /var/www/html/ en el Dockerfile incluye monorepo/city/ en la imagen,
# así Apache sirve /city directamente sin servidor adicional.
if command -v npm &>/dev/null; then
    log "Construyendo frontend city..."
    cd "$ROOT/city"
    npm install --legacy-peer-deps --silent || true
    npm run build
    log "Copiando build de city a monorepo/city/..."
    rm -rf "$ROOT/monorepo/city"
    mkdir -p "$ROOT/monorepo/city"
    cp -ra dist/. "$ROOT/monorepo/city/"
    cat > "$ROOT/monorepo/city/.htaccess" << 'EOF'
CGIPassAuth On
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF
    log "Frontend city listo en monorepo/city/ → se incluye en la imagen Docker"
else
    echo "ERROR: npm no encontrado — no se puede construir el frontend city"
    exit 1
fi

# ── 2. Backend PHP + MariaDB (Docker Compose, modo producción) ────────────────
# Se ejecuta desde monorepo/ para que docker compose encuentre sus ficheros.
# Se pasa -f docker-compose.yml explícitamente para omitir el override de dev:
#   - Usa Dockerfile (OPcache activado, imagen de producción)
#   - No monta código en vivo — el código (incluido city/) está copiado en la imagen
# CASE inyecta FRONTEND_PORT / DATABASE_PORT / BACKEND_PORT; los mapeamos
# a las variables propias del monorepo (APP_PORT / MYSQL_PORT / PHPMYADMIN_PORT).
log "Levantando backend PHP/Apache + MariaDB (producción)..."
cd "$ROOT/monorepo"
APP_PORT="${FRONTEND_PORT:-8080}" \
MYSQL_PORT="${DATABASE_PORT:-3306}" \
PHPMYADMIN_PORT="${BACKEND_PORT:-8081}" \
docker compose -f docker-compose.yml -p ion up -d --build
log "Backend (PHP/Apache) → http://localhost:${FRONTEND_PORT:-8080}"
log "phpMyAdmin           → http://localhost:${BACKEND_PORT:-8081}"

# ── 3. TrafficSocket (HTTPS :443) ────────────────────────────────────────────
if [ -f "$ROOT/TrafficSocket/.env" ]; then
    log "Levantando TrafficSocket (producción)..."
    cd "$ROOT/TrafficSocket"
    npm install --omit=dev --silent 2>/dev/null || true
    nohup npm start > "$LOGS_DIR/trafficsocket.log" 2>&1 &
    echo $! > "$PIDS_DIR/trafficsocket.pid"
    log "TrafficSocket → https://<host>:443  (log: bin/logs/trafficsocket.log)"
else
    warn "TrafficSocket/.env no encontrado — TrafficSocket no levantado. Arranca manualmente: cd TrafficSocket && npm start"
fi

log ""
log "────────────────────────────────────────────"
log "  Backend  (PHP/Apache) →  http://localhost:${FRONTEND_PORT:-8080}"
log "  City (Apache @/city)  →  http://localhost:${FRONTEND_PORT:-8080}/city"
log "  phpMyAdmin            →  http://localhost:${BACKEND_PORT:-8081}"
log "  TrafficSocket         →  https://<host>:443"
log "────────────────────────────────────────────"
log "  Para parar todo: bin/stop.sh"
