#!/bin/bash

# Script para construir los frontends basados en ENABLED_DBS
# Uso: ./build-fronts.sh

set -e  # Salir si hay algún error

# Función para mostrar mensajes
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Leer ENABLED_DBS del archivo .env (usado por docker-compose.yml)
if [ ! -f ".env" ]; then
    log "Error: Archivo .env no encontrado"
    exit 1
fi

ENABLED_DBS=$(grep "^ENABLED_DBS=" .env | cut -d'=' -f2 | tr -d '"' | tr -d "'")
if [ -z "$ENABLED_DBS" ]; then
    log "Error: ENABLED_DBS no definido en .env (variable usada por docker-compose.yml)"
    exit 1
fi

log "ENABLED_DBS configurado como: $ENABLED_DBS"

# Función para construir un frontend específico
build_frontend() {
    local module=$1
    local frontend_dir="front/$module"
    local output_dir="$module"

    if [ ! -d "$frontend_dir" ]; then
        log "Advertencia: Directorio $frontend_dir no existe, saltando $module"
        return
    fi

    log "Construyendo frontend para $module..."

    # Cambiar al directorio del frontend
    cd "$frontend_dir"

    # Pull cambios
    git pull

    # Instalar dependencias
    log "Instalando dependencias para $module..."
    npm install --force

    # Construir el proyecto
    log "Construyendo $module..."
    npm run build

    # Verificar que se creó el directorio dist
    if [ ! -d "dist" ]; then
        log "Error: Directorio dist no encontrado después del build de $module"
        cd - > /dev/null
        exit 1
    fi

    # Volver al directorio raíz
    cd - > /dev/null

    # Crear directorio de salida si no existe
    mkdir -p "$output_dir"

    # Copiar archivos del build
    log "Copiando archivos de $module a /$output_dir..."
    cp -r "$frontend_dir/dist/"* "$output_dir/"

    # Crear .htaccess
    log "Creando .htaccess para $module..."
    cat > "$output_dir/.htaccess" << 'EOF'
CGIPassAuth On
Options -Indexes
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^ index.html [L]
EOF

    log "Frontend $module construido exitosamente"
}

# Procesar cada módulo habilitado
IFS=',' read -ra MODULES <<< "$ENABLED_DBS"
for module in "${MODULES[@]}"; do
    module=$(echo "$module" | xargs)  # Trim whitespace

    case $module in
        city|industry)
            build_frontend "$module"
            ;;
        *)
            log "Saltando módulo $module (no tiene frontend)"
            ;;
    esac
done

log "Construcción de frontends completada"

