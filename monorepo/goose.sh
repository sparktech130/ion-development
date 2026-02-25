#!/usr/bin/env bash
# Wrapper para ejecutar migraciones Goose via Docker Compose.
# Uso: ./goose.sh <comando> [args]
set -euo pipefail

COMPOSE="docker compose -p ion"

usage() {
  cat <<EOF
Uso: ./goose.sh <comando> [args]

Comandos:
  status                    Ver estado de todas las migraciones
  up                        Aplicar migraciones pendientes
  down                      Revertir la última migración
  create <nombre> [módulo]  Crear nueva migración (módulo: core, city, industry, ski)
  logs                      Ver logs del servicio goose-migrate
  help                      Mostrar esta ayuda

Ejemplos:
  ./goose.sh status
  ./goose.sh up
  ./goose.sh down
  ./goose.sh create add_usuarios_telefono
  ./goose.sh create add_infracciones_index city
EOF
}

case "${1:-help}" in
  status)
    GOOSE_CMD=status $COMPOSE run --rm goose-migrate
    ;;
  up)
    $COMPOSE up goose-migrate
    ;;
  down)
    GOOSE_CMD=down $COMPOSE run --rm goose-migrate
    ;;
  create)
    NAME="${2:-}"
    MODULE="${3:-core}"
    if [ -z "$NAME" ]; then
      echo "Error: falta el nombre de la migración"
      echo "Uso: ./goose.sh create <nombre> [módulo]"
      exit 1
    fi
    $COMPOSE run --rm goose-migrate \
      goose -dir "/migrations/${MODULE}" create "${NAME}" sql
    ;;
  logs)
    $COMPOSE logs goose-migrate
    ;;
  help|--help|-h)
    usage
    ;;
  *)
    echo "Comando desconocido: ${1}"
    usage
    exit 1
    ;;
esac
