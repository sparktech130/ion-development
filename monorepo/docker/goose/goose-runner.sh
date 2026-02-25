#!/bin/bash
set -euo pipefail

# ============================================================
# ION Smart - Goose Migration Runner
# ============================================================
# Este script ejecuta migraciones con goose para cada módulo.
#
# Variables esperadas:
#   MYSQL_HOST, MYSQL_PORT, MYSQL_ROOT_PASSWORD
#   CORE_DB_NAME, CITY_DB_NAME, INDUSTRY_DB_NAME, SKI_DB_NAME
#   ENABLED_DBS (ej: "core,city" o "core,industry")
#   GOOSE_CMD (default: "up")
# ============================================================

GOOSE_CMD="${GOOSE_CMD:-up}"
ENABLED_DBS="${ENABLED_DBS:-core}"
MYSQL_HOST="${MYSQL_HOST:-db}"
MYSQL_PORT="${MYSQL_PORT:-3306}"

echo "[goose-runner] ========================================"
echo "[goose-runner] ION Smart - Goose Migration Runner"
echo "[goose-runner] Comando: ${GOOSE_CMD}"
echo "[goose-runner] Módulos habilitados: ${ENABLED_DBS}"
echo "[goose-runner] ========================================"

# Función para ejecutar goose en un módulo
run_goose() {
  local module="$1"
  local db_name="$2"
  local migrations_dir="/migrations/${module}"
  
  # Verificar si existe el directorio de migraciones
  if [ ! -d "$migrations_dir" ]; then
    echo "[goose-runner] ⚠️  SKIP: No hay migraciones en ${migrations_dir}"
    return 0
  fi
  
  # Contar migraciones
  local migration_count=$(find "$migrations_dir" -name "*.sql" -o -name "*.go" | wc -l)
  if [ "$migration_count" -eq 0 ]; then
    echo "[goose-runner] ⚠️  SKIP: Directorio ${module} vacío"
    return 0
  fi
  
  echo ""
  echo "[goose-runner] 📦 Módulo: ${module}"
  echo "[goose-runner] 💾 Base de datos: ${db_name}"
  echo "[goose-runner] 📁 Migraciones: ${migrations_dir}"
  echo "[goose-runner] 📊 Total archivos: ${migration_count}"
  
  # Construir DSN para MySQL
  local dsn="root:${MYSQL_ROOT_PASSWORD}@tcp(${MYSQL_HOST}:${MYSQL_PORT})/${db_name}?parseTime=true"
  
  # Verificar conexión antes de ejecutar
  echo "[goose-runner] 🔌 Verificando conexión a ${db_name}..."
  if ! mariadb -h"${MYSQL_HOST}" -P"${MYSQL_PORT}" -uroot -p"${MYSQL_ROOT_PASSWORD}" -e "USE ${db_name};" 2>/dev/null; then
    echo "[goose-runner] ❌ ERROR: No se puede conectar a la base de datos ${db_name}"
    return 1
  fi
  
  echo "[goose-runner] ✅ Conexión exitosa"
  echo "[goose-runner] 🚀 Ejecutando: goose -dir ${migrations_dir} mysql ${GOOSE_CMD}"
  
  # Ejecutar goose
  if goose -dir "$migrations_dir" mysql "$dsn" ${GOOSE_CMD}; then
    echo "[goose-runner] ✅ Migraciones aplicadas correctamente para ${module}"
  else
    echo "[goose-runner] ❌ ERROR al aplicar migraciones de ${module}"
    return 1
  fi
}

# Función para mostrar el estado de las migraciones
show_status() {
  local module="$1"
  local db_name="$2"
  local migrations_dir="/migrations/${module}"
  
  if [ ! -d "$migrations_dir" ]; then
    return 0
  fi
  
  local dsn="root:${MYSQL_ROOT_PASSWORD}@tcp(${MYSQL_HOST}:${MYSQL_PORT})/${db_name}?parseTime=true"
  
  echo ""
  echo "[goose-runner] 📊 Estado de migraciones - ${module}:"
  goose -dir "$migrations_dir" mysql "$dsn" status || true
}

# ============================================================
# MAIN: Aplicar migraciones en orden
# ============================================================
# 2. Siempre ejecutar CORE primero (contiene tablas base)
echo ""
echo "[goose-runner] =========================================="
echo "[goose-runner] PASO 1: Aplicando migraciones BOOTSTRAP"
echo "[goose-runner] =========================================="
run_goose "bootstrap" "mysql"

# 2. Siempre ejecutar CORE primero (contiene tablas base)
echo ""
echo "[goose-runner] =========================================="
echo "[goose-runner] PASO 2: Aplicando migraciones de CORE"
echo "[goose-runner] =========================================="
run_goose "core" "${CORE_DB_NAME}"

# 2. Ejecutar módulos habilitados
IFS=',' read -ra MODULES <<< "$ENABLED_DBS"
for module in "${MODULES[@]}"; do
  # Remover espacios en blanco
  module=$(echo "$module" | xargs)
  
  # Saltar core (ya se ejecutó)
  if [ "$module" = "core" ]; then
    continue
  fi
  
  echo ""
  echo "[goose-runner] =========================================="
  echo "[goose-runner] PASO 3: Aplicando migraciones de ${module^^}"
  echo "[goose-runner] =========================================="
  
  case "$module" in
    city)
      run_goose "city" "${CITY_DB_NAME}"
      ;;
    industry)
      run_goose "industry" "${INDUSTRY_DB_NAME}"
      ;;
    ski)
      run_goose "ski" "${SKI_DB_NAME}"
      ;;
    ionadmin)
      run_goose "ionadmin" "${IONADMIN_DB_NAME:-ionadmin}"
      ;;
    *)
      echo "[goose-runner] ⚠️  Módulo desconocido: ${module}"
      ;;
  esac
done

# ============================================================
# Mostrar estado final (solo si el comando fue "up")
# ============================================================
if [ "$GOOSE_CMD" = "up" ] || [ "$GOOSE_CMD" = "status" ]; then
  echo ""
  echo "[goose-runner] =========================================="
  echo "[goose-runner] ESTADO FINAL DE MIGRACIONES"
  echo "[goose-runner] =========================================="
  
  show_status "core" "${CORE_DB_NAME}"
  
  for module in "${MODULES[@]}"; do
    module=$(echo "$module" | xargs)
    if [ "$module" = "core" ]; then
      continue
    fi
    
    case "$module" in
      city)
        show_status "city" "${CITY_DB_NAME}"
        ;;
      industry)
        show_status "industry" "${INDUSTRY_DB_NAME}"
        ;;
      ski)
        show_status "ski" "${SKI_DB_NAME}"
        ;;
      ionadmin)
        show_status "ionadmin" "${IONADMIN_DB_NAME:-ionadmin}"
        ;;
    esac
  done
fi

echo ""
echo "[goose-runner] =========================================="
echo "[goose-runner] ✅ Proceso completado exitosamente"
echo "[goose-runner] =========================================="

exit 0
