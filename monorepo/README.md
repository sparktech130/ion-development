# ION Smart Platform

Plataforma modular para soluciones Smart City, Smart Industry y Smart Building.

## 📋 Tabla de Contenidos

- [Arquitectura](#arquitectura)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Migraciones de Base de Datos](#migraciones-de-base-de-datos)
- [Módulos](#módulos)
- [Desarrollo](#desarrollo)
- [Documentación](#documentación)

---

## Arquitectura

ION Smart es una plataforma modular que consta de:

### Backend (PHP)
- **core**: Módulo principal con funcionalidades compartidas
- **ioncity**: Módulo de Smart City
- **ionindustry**: Módulo de Smart Industry
- **ionadmin**: Módulo de administración

### Frontend (React + Vite)
- **city**: Interfaz para Smart City
- **industry**: Interfaz para Smart Industry

### Infraestructura
- **MariaDB 10.11**: Base de datos principal
- **Docker & Docker Compose**: Contenedorización
- **Goose**: Sistema de migraciones de base de datos

---

## Requisitos

- Docker >= 20.10
- Docker Compose >= 2.0
- (Opcional) PHP >= 8.1 para desarrollo local
- (Opcional) Node.js >= 18 para desarrollo frontend

---

## Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd ionsmart.local
```

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` y configura las variables necesarias:

```env
# Bases de datos
CORE_DB_NAME=core
CITY_DB_NAME=city
INDUSTRY_DB_NAME=industry

# Módulos a cargar
ENABLED_DBS=core,city

# Credenciales MySQL
MYSQL_ROOT_PASSWORD=tu_password_seguro
MYSQL_USER=ionsmart_user
MYSQL_PASSWORD=ionsmart_password

# Puertos
APP_PORT=8080
PHPMYADMIN_PORT=8081
```

### 3. Iniciar el Stack

```bash
docker compose up -d
```

Esto iniciará:
- ✅ Base de datos MariaDB
- ✅ Aplicación PHP
- ✅ PHPMyAdmin (opcional)
- ✅ Migraciones automáticas con Goose

### 4. Verificar Instalación

```bash
# Ver logs
docker compose logs -f

# Verificar servicios
docker compose ps

# Verificar migraciones
./goose.sh status
```

Accede a:
- **Aplicación**: http://localhost:8080
- **PHPMyAdmin**: http://localhost:8081

---

## Migraciones de Base de Datos

ION Smart utiliza [Goose](https://github.com/pressly/goose) para gestionar las migraciones de base de datos de forma versionada e idempotente.

### Uso Rápido

```bash
# Ver estado de migraciones
./goose.sh status

# Aplicar migraciones pendientes
./goose.sh up

# Revertir última migración
./goose.sh down

# Crear nueva migración
./goose.sh create add_new_table core
```

### Estructura de Migraciones

```
migrations/
├── core/          # Migraciones del módulo CORE
├── city/          # Migraciones del módulo CITY
├── industry/      # Migraciones del módulo INDUSTRY
└── ski/           # Migraciones del módulo SKI
```

### Crear Nueva Migración

```bash
# Crear en el módulo core
./goose.sh create add_usuarios_telefono

# Crear en otro módulo
./goose.sh create add_infracciones_index city
```

Esto creará un archivo con el siguiente formato:

```sql
-- +goose Up
-- +goose StatementBegin
ALTER TABLE usuarios ADD COLUMN telefono VARCHAR(20) NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE usuarios DROP COLUMN telefono;
-- +goose StatementEnd
```

### Documentación Completa

Para más información sobre migraciones, consulta:
- [Guía de Migraciones Goose](docker/db/GOOSE.md)
- [README de Migraciones](migrations/README.md)

---

## Módulos

### CORE
Módulo principal que contiene:
- Gestión de usuarios y autenticación
- Sistema de permisos
- Configuración de dispositivos
- APIs de fabricantes
- Reconocimientos (vehículos y personas)

📖 [Documentación CORE](core/README.md)

### ION City
Módulo de Smart City que incluye:
- Gestión de infracciones
- Control de áreas restringidas
- Campañas y alertas
- Investigaciones
- Listas (blancas/negras)

📖 [Documentación Frontend City](front/city/README.md)

### ION Industry
Módulo de Smart Industry que incluye:
- Gestión de maquinaria
- Control de producción
- Departamentos y naves
- Sistema de llamadas
- Picking y logística

📖 [Documentación Frontend Industry](front/industry/README.md)

---

## Desarrollo

### Estructura del Proyecto

```
ionsmart.local/
├── core/                  # Backend principal
├── ioncity/              # Backend Smart City
├── ionindustry/          # Backend Smart Industry
├── ionadmin/             # Backend administración
├── front/
│   ├── city/            # Frontend Smart City (React)
│   └── industry/        # Frontend Smart Industry (React)
├── migrations/          # Migraciones Goose
├── docker/              # Configuración Docker
├── docker-compose.yml   # Configuración base Docker
└── docker-compose.override.yml  # Configuración desarrollo
```

### Desarrollo Backend

El código PHP se monta como volumen en desarrollo:

```bash
# Editar código en ./core, ./ioncity, etc.
# Los cambios se reflejan automáticamente

# Ver logs
docker compose logs -f app
```

### Desarrollo Frontend

```bash
# Entrar al directorio del frontend
cd front/city  # o front/industry

# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build
```

### Acceso a la Base de Datos

```bash
# Usando PHPMyAdmin
# Navega a http://localhost:8081

# Usando CLI
docker compose exec db mariadb -uroot -p

# Backup
docker compose exec db mysqldump -uroot -p --all-databases > backup.sql

# Restore
docker compose exec -T db mariadb -uroot -p < backup.sql
```

### Testing

```bash
# Backend - ejecutar tests PHPUnit (si existen)
docker compose exec app vendor/bin/phpunit

# Frontend - ejecutar tests
cd front/city
npm run test
```

---

## Comandos Útiles

### Docker Compose

```bash
# Iniciar servicios
docker compose up -d

# Detener servicios
docker compose down

# Ver logs
docker compose logs -f [servicio]

# Reconstruir servicios
docker compose up --build

# Limpiar todo (⚠️ elimina datos)
docker compose down -v
```

### Migraciones

```bash
# Ver ayuda
./goose.sh help

# Aplicar migraciones
./goose.sh up

# Ver estado
./goose.sh status

# Crear migración
./goose.sh create nombre_descriptivo [modulo]

# Ver logs de migraciones
./goose.sh logs
```

### Base de Datos

```bash
# Conectar a MySQL
docker compose exec db mariadb -uroot -p${MYSQL_ROOT_PASSWORD}

# Ejecutar query específica
docker compose exec db mariadb -uroot -p${MYSQL_ROOT_PASSWORD} -e "SHOW DATABASES;"

# Ver estado de migraciones
docker compose exec db mariadb -uroot -p${MYSQL_ROOT_PASSWORD} core -e "SELECT * FROM goose_db_version;"
```

---

## Solución de Problemas

### Error: Puerto ya en uso

```bash
# Cambiar puerto en .env
APP_PORT=8081
MYSQL_PORT=3307
PHPMYADMIN_PORT=8082

# Reiniciar
docker compose down
docker compose up -d
```

### Error: Migraciones no se aplican

```bash
# Ver logs del servicio
docker compose logs goose-migrate

# Forzar recreación
docker compose up --force-recreate goose-migrate

# Ver estado actual
./goose.sh status
```

### Resetear Base de Datos

⚠️ **ESTO ELIMINARÁ TODOS LOS DATOS**

```bash
# Detener y eliminar volúmenes
docker compose down -v

# Iniciar de nuevo
docker compose up -d
```

### Permisos de Archivos

```bash
# Si hay problemas de permisos en desarrollo
sudo chown -R $USER:$USER .

# Dar permisos a scripts
chmod +x goose.sh
chmod +x build-fronts.sh
```

---

## Documentación

### General
- [Guía de Migraciones Goose](docker/db/GOOSE.md)
- [Migraciones README](migrations/README.md)

### Backend
- [Core README](core/README.md)
- [Documentación Funcional](core/FUNCIONAL.md)
- [Documentación Técnica](core/TECNICO.md)

### Frontend
- [City Frontend](front/city/README.md)
- [Industry Frontend](front/industry/README.md)

### API
- [Documentación API](docs/api/)

---

## Licencia

[Especificar licencia del proyecto]

## Soporte

Para soporte y consultas:
- Email: [contacto]
- Documentación: [URL]
- Issues: [GitHub Issues URL]

