#!/bin/bash

# Script para inicializar el proyecto ION COP

echo "🚔 Inicializando ION COP..."
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar si Node está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js no está instalado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detectado: $(node --version)${NC}"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Dependencias instaladas${NC}"
echo ""

# Información de credenciales
echo -e "${YELLOW}📋 Credenciales de Prueba:${NC}"
echo ""
echo "Usuario: admin"
echo "Contraseña: Admin123!"
echo ""
echo "Usuario: officer1"
echo "Contraseña: Officer123!"
echo ""
echo "Usuario: officer2"
echo "Contraseña: Officer123!"
echo ""

# Próximos pasos
echo -e "${GREEN}✅ Configuración completada${NC}"
echo ""
echo "Próximos pasos:"
echo "1. Para ejecutar en Android: npm run android"
echo "2. Para ejecutar en iOS: npm run ios"
echo "3. Para iniciar el servidor de desarrollo: npm start"
echo ""
