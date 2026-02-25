#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/.."
PIDS_DIR="$ROOT/bin/.pids"

log() { echo "[$(date +'%H:%M:%S')] $*"; }

kill_service() {
    local name="$1"
    local pidfile="$PIDS_DIR/$name.pid"

    if [ ! -f "$pidfile" ]; then
        log "$name: sin PID guardado, nada que parar."
        return
    fi

    local pid
    pid=$(cat "$pidfile")

    if kill -0 "$pid" 2>/dev/null; then
        kill "$pid" 2>/dev/null || true
        # Matar procesos hijo (nodemon y vite spawnean hijos)
        pkill -P "$pid" 2>/dev/null || true
        log "$name (PID $pid) parado."
    else
        log "$name: proceso $pid ya no existe."
    fi

    rm -f "$pidfile"
}

# ── Servicios de fondo ────────────────────────────────────────────────────────
kill_service "trafficsocket"
kill_service "city"

# ── Docker Compose ────────────────────────────────────────────────────────────
# Se ejecuta desde monorepo/ donde están los ficheros de compose.
# -p ion coincide con el proyecto usado en los start scripts.
log "Parando Docker Compose..."
cd "$ROOT/monorepo"
docker compose -p ion down && log "Docker Compose parado." || log "Error al parar Docker Compose."

log ""
log "Todo parado."
