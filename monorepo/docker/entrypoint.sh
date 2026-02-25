#!/bin/sh
set -eu

: "${APACHE_SERVER_NAME:=localhost}"

# Escribe ServerName en un conf separado (mejor práctica)
echo "ServerName ${APACHE_SERVER_NAME}" > /etc/apache2/conf-available/servername.conf

# Habilita el conf (idempotente)
a2enconf servername >/dev/null 2>&1 || true

# Validación útil: si falla, el contenedor no arranca y ves el error
apache2ctl configtest

exec "$@"
