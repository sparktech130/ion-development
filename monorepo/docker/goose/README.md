# Goose Migrations Docker Image

Esta imagen personalizada contiene Goose y el cliente MariaDB/MySQL para ejecutar migraciones de base de datos.

## 🐳 Construcción de la Imagen

La imagen se construye automáticamente cuando ejecutas:

```bash
docker compose up --build goose-migrate
```

O manualmente:

```bash
cd docker/goose
docker build -t ionsmart/goose:latest .
```

## 📦 Arquitectura Multi-Stage Build

El Dockerfile utiliza un **build multi-stage** para crear una imagen ligera y optimizada:

### Stage 1: Builder (golang:1.23-alpine)
- Imagen base con Go runtime completo
- Instala Goose via `go install github.com/pressly/goose/v3/cmd/goose@v3.26.0`
- Compila el binario de goose

### Stage 2: Final (alpine:3.19)
- Imagen base mínima Alpine Linux
- Copia **solo el binario de goose** desde el stage builder
- Instala cliente MariaDB/MySQL y bash
- **NO incluye el runtime de Go**
- Resultado: imagen ligera (~50-60MB vs ~320MB con Go completo)

### Componentes Incluidos

**Goose v3.26.0**
- Herramienta de migraciones de base de datos
- Binario compilado copiado desde el builder
- Ubicación: `/usr/local/bin/goose`
- **Soporta migraciones SQL** (formato actual del proyecto)

**Cliente MariaDB**
- Cliente MySQL/MariaDB para conexión a BD
- Necesario para que Goose pueda conectarse

**Bash**
- Shell para ejecutar el script `goose-runner.sh`

## 🔧 Uso

### Desde Docker Compose

```bash
# Aplicar migraciones SQL (comportamiento actual)
docker compose up goose-migrate

# Ver estado de migraciones
GOOSE_CMD=status docker compose run --rm goose-migrate

# Crear nueva migración SQL
docker compose run --rm goose-migrate goose -dir /migrations/core create add_table sql

# Rollback última migración
GOOSE_CMD=down docker compose run --rm goose-migrate
```

### Variables de Entorno

El servicio `goose-migrate` recibe las siguientes variables desde `docker-compose.override.yml`:

**Conexión a Base de Datos:**
- `MYSQL_HOST` - Host del servidor MySQL (default: `db`)
- `MYSQL_PORT` - Puerto MySQL (default: `3306`)
- `MYSQL_ROOT_PASSWORD` - Contraseña root de MySQL

**Nombres de Bases de Datos:**
- `CORE_DB_NAME` - Base de datos del módulo CORE (default: `core`)
- `CITY_DB_NAME` - Base de datos del módulo CITY (default: `city`)
- `INDUSTRY_DB_NAME` - Base de datos del módulo INDUSTRY (default: `industry`)
- `SKI_DB_NAME` - Base de datos del módulo SKI (default: `ski`)
- `IONADMIN_DB_NAME` - Base de datos del módulo IONADMIN (default: `ionadmin`)

**Control de Ejecución:**
- `ENABLED_DBS` - Módulos a migrar (ej: `core,city` o `core,industry`)
- `GOOSE_CMD` - Comando goose a ejecutar (default: `up`, opciones: `status`, `down`, `version`)

**Script Runner:**
- El script `/docker/db/goose-runner.sh` orquesta la ejecución de migraciones
- Aplica migraciones en orden: CORE primero, luego módulos según `ENABLED_DBS`

### Manualmente

```bash
# Ejecutar Goose directamente
docker run --rm \
  -v $(pwd)/migrations:/migrations \
  --network ionsmart_net \
  -e MYSQL_HOST=db \
  -e MYSQL_ROOT_PASSWORD=password \
  ionsmart/goose:latest \
  goose -dir /migrations/core mysql "root:password@tcp(db:3306)/core" up
```

## 📝 Versiones

- **Goose**: v3.26.0
- **Go** (builder): 1.23
- **Alpine** (final): 3.19
- **MariaDB Client**: Latest (vía apk)

## 🔄 Actualización de Goose

Para actualizar la versión de Goose, edita el `Dockerfile`:

```dockerfile
# Cambiar esta línea en el stage builder
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.26.0

# Por ejemplo, a v3.27.0
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.27.0
```

Luego reconstruye:

```bash
docker compose build goose-migrate
```

## 🐛 Troubleshooting

### Error: "goose: command not found"

Verifica que la imagen se construyó correctamente:

```bash
docker compose build goose-migrate
docker run --rm ionsmart/goose:latest goose --version
```

### Error de conexión a la base de datos

Verifica las variables de entorno en `docker-compose.override.yml`:

```yaml
environment:
  MYSQL_HOST: db  # Debe ser el nombre del servicio de BD
  MYSQL_PORT: 3306
  MYSQL_ROOT_PASSWORD: ${MYSQL_ROOT_PASSWORD}
```

### La imagen ocupa espacio moderado

La imagen utiliza multi-stage build para minimizar el tamaño:

```bash
docker images | grep ionsmart/goose
# REPOSITORY         TAG       SIZE
# ionsmart/goose    latest    ~50-60MB
```

**¿Por qué no es más pequeña?**
- Incluye Alpine base (~8MB)
- Binario de Goose (~15-20MB)
- Cliente MariaDB (~20-25MB)
- Bash y dependencias (~5-10MB)

## 🔮 Soporte para Migraciones Go (Futuro)

**Estado actual:** El proyecto utiliza exclusivamente migraciones SQL. La imagen actual **NO soporta migraciones Go** porque no incluye el runtime de Go.

**Si en el futuro necesitas migraciones Go** (para lógica compleja, variables de entorno, foreign keys dinámicos):

### Modificación necesaria del Dockerfile

Reemplaza el multi-stage build con una imagen única que incluya Go:

```dockerfile
FROM golang:1.23-alpine

# Instalar dependencias
RUN apk add --no-cache \
    mariadb-client \
    bash \
    ca-certificates \
    git

# Instalar Goose
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.26.0

# Copiar módulos Go (si es necesario)
WORKDIR /migrations
COPY go.mod go.sum ./
RUN go mod download

# Verificar instalación
RUN goose --version

ENTRYPOINT ["/bin/bash"]
```

**Trade-offs:**
- ✅ Permite migraciones `.go` con lógica compleja
- ✅ Acceso a variables de entorno en tiempo de migración
- ❌ Imagen más grande (~320MB vs ~60MB)
- ❌ Mayor tiempo de descarga inicial

**Ejemplo de migración Go:**

```go
// migrations/city/00013_add_dynamic_fk.go
package migrations

import (
    "database/sql"
    "fmt"
    "os"
    "github.com/pressly/goose/v3"
)

func init() {
    goose.AddMigration(upAddDynamicFK, downAddDynamicFK)
}

func upAddDynamicFK(tx *sql.Tx) error {
    coreDB := os.Getenv("CORE_DB_NAME")
    query := fmt.Sprintf(`
        ALTER TABLE infracciones
        ADD CONSTRAINT fk_infraccion_usuario
        FOREIGN KEY (usuario_id) REFERENCES %s.usuarios(id)
    `, coreDB)
    _, err := tx.Exec(query)
    return err
}

func downAddDynamicFK(tx *sql.Tx) error {
    _, err := tx.Exec("ALTER TABLE infracciones DROP FOREIGN KEY fk_infraccion_usuario")
    return err
}
```

## 📚 Referencias

- [Goose Documentation](https://pressly.github.io/goose/)
- [Goose GitHub](https://github.com/pressly/goose)
- [Docker Multi-Stage Builds](https://docs.docker.com/build/building/multi-stage/)
