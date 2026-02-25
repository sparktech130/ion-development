#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PIDS_DIR="$ROOT/bin/.pids"
LOGS_DIR="$ROOT/bin/logs"

mkdir -p "$PIDS_DIR" "$LOGS_DIR"

log()  { echo "[$(date +'%H:%M:%S')] $*"; }
warn() { echo "[$(date +'%H:%M:%S')] WARN: $*"; }

# ── Avisos (no fatales) ───────────────────────────────────────────────────────
[ ! -f "$ROOT/monorepo/.env" ]      && warn "monorepo/.env no existe — copia monorepo/.env.example y rellena las credenciales"
[ ! -f "$ROOT/TrafficSocket/.env" ] && warn "TrafficSocket/.env no existe — copia TrafficSocket/.env.example y rellena las credenciales"

# ── 1. Build frontend city → monorepo/city/ (servido por Apache en /city) ─────
# Apache (dentro del contenedor) sirve /city desde /var/www/html/city/.
# El volumen .:/var/www/html monta monorepo/ en vivo, por lo que basta con
# copiar el build aquí antes de levantar el contenedor (o incluso después).
# En dev, un fallo de build no es fatal — el backend levanta igualmente.
if [ ! -d "$ROOT/city/src" ]; then
    warn "city/src/ no existe — frontend city no construido. Añade el código fuente y re-ejecuta."
elif command -v npm &>/dev/null; then
    log "Construyendo frontend city..."
    cd "$ROOT/city"
    npm install --legacy-peer-deps --silent 2>/dev/null || true
    if npm run build; then
        log "Copiando build de city a monorepo/city/..."
        rm -rf "$ROOT/monorepo/city"
        mkdir -p "$ROOT/monorepo/city"
        cp -r dist/* "$ROOT/monorepo/city/"
        cat > "$ROOT/monorepo/city/.htaccess" << 'EOF'
CGIPassAuth On
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF
        log "Frontend city → disponible en http://localhost:${FRONTEND_PORT:-8080}/city"
    else
        warn "Build de city fallido — el backend sigue levantando. Revisa city/ y repite el build."
    fi
else
    warn "npm no encontrado — frontend city no construido. Construye manualmente: cd city && npm run build"
fi

# ── 2. Backend PHP + MariaDB (Docker Compose, modo dev) ──────────────────────
# Se ejecuta desde monorepo/ para que docker compose encuentre sus ficheros.
# El override (docker-compose.override.yml) se aplica automáticamente:
#   - Usa Dockerfile.dev (OPcache desactivado, display_errors On)
#   - Monta .:/var/www/html en vivo — los cambios PHP se reflejan sin rebuild
# CASE inyecta FRONTEND_PORT / DATABASE_PORT / BACKEND_PORT; los mapeamos
# a las variables propias del monorepo (APP_PORT / MYSQL_PORT / PHPMYADMIN_PORT).
log "Levantando backend PHP + MariaDB (dev)..."
cd "$ROOT/monorepo"
APP_PORT="${FRONTEND_PORT:-8080}" \
MYSQL_PORT="${DATABASE_PORT:-3306}" \
PHPMYADMIN_PORT="${BACKEND_PORT:-8081}" \
docker compose -p ion up -d --build
log "Backend (PHP/Apache) → http://localhost:${FRONTEND_PORT:-8080}"
log "phpMyAdmin           → http://localhost:${BACKEND_PORT:-8081}"

# ── 3. TrafficSocket (nodemon, HTTP :8101) ────────────────────────────────────
if command -v npm &>/dev/null; then
    log "Levantando TrafficSocket (dev)..."
    cd "$ROOT/TrafficSocket"
    npm install --silent 2>/dev/null || true
    nohup npm run dev > "$LOGS_DIR/trafficsocket.log" 2>&1 &
    echo $! > "$PIDS_DIR/trafficsocket.pid"
    log "TrafficSocket → http://localhost:8101  (log: bin/logs/trafficsocket.log)"
else
    warn "npm no encontrado — TrafficSocket no levantado. Arranca manualmente: cd TrafficSocket && npm run dev"
fi

log ""
log "────────────────────────────────────────────"
log "  Backend  (PHP/Apache) →  http://localhost:${FRONTEND_PORT:-8080}"
log "  City (Apache @/city)  →  http://localhost:${FRONTEND_PORT:-8080}/city"
log "  phpMyAdmin            →  http://localhost:${BACKEND_PORT:-8081}"
log "  TrafficSocket         →  http://localhost:8101"
log "────────────────────────────────────────────"
log "  Para parar todo: bin/stop.sh"
