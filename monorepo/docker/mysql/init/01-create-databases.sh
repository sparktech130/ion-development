#!/bin/sh
set -eu

echo "[mysql-init] Creando bases de datos y permisos (si aplica)..."

# Permite reutilizar el script:
# - Dentro del contenedor MySQL durante el init oficial: ahí MySQL arranca con
#   `--skip-networking`, así que hay que conectar por SOCKET (sin -h/-P).
# - Desde un sidecar (db-init): ahí sí usamos TCP con MYSQL_HOST=db.
mysql_root() {
  if [ -n "${MYSQL_HOST:-}" ]; then
    mysql -h "${MYSQL_HOST}" -P "${MYSQL_PORT:-3306}" -uroot -p"${MYSQL_ROOT_PASSWORD}" "$@"
  else
    mysql -uroot -p"${MYSQL_ROOT_PASSWORD}" "$@"
  fi
}

# Esperamos a que el socket/servidor acepte conexiones (en init suele estar listo, pero es barato esperar)
for i in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23 24 25 26 27 28 29 30; do
  if mysql_root -e "SELECT 1" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

create_db_and_grant() {
  db_name="$1"
  if [ -z "$db_name" ]; then
    return 0
  fi

  echo "[mysql-init] DB: $db_name"
  mysql_root <<SQL
CREATE DATABASE IF NOT EXISTS \`$db_name\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
SQL

  if [ -n "${MYSQL_USER:-}" ]; then
    mysql_root <<SQL
GRANT ALL PRIVILEGES ON \`$db_name\`.* TO '${MYSQL_USER}'@'%';
FLUSH PRIVILEGES;
SQL
  fi
}

create_db_and_grant "${CORE_DB_NAME:-}"
create_db_and_grant "${INDUSTRY_DB_NAME:-}"
create_db_and_grant "${CITY_DB_NAME:-}"
create_db_and_grant "${SKI_DB_NAME:-}"

echo "[mysql-init] OK"

