# ============================================================
# ION Smart - Goose Migrations Dockerfile
# ============================================================
# Imagen personalizada con Goose y MariaDB cliente

FROM golang:1.23-alpine AS builder

# Instalar dependencias de construcción
RUN apk add --no-cache git

# Instalar Goose
RUN go install github.com/pressly/goose/v3/cmd/goose@v3.26.0

# Imagen final ligera
FROM alpine:3.19

# Instalar cliente MariaDB/MySQL y bash
RUN apk add --no-cache \
    mariadb-client \
    bash \
    ca-certificates

# Copiar binario de Goose desde builder
COPY --from=builder /go/bin/goose /usr/local/bin/goose

# Verificar instalación
RUN goose --version

# Copiar migraciones completas (bootstrap, core, city, industry, etc.)
COPY ./migrations /migrations

# Copiar script runner
COPY docker/goose/goose-runner.sh /goose-runner.sh

# Dar permisos de ejecución
RUN chmod +x /goose-runner.sh

# Directorio de trabajo
WORKDIR /migrations

# Punto de entrada
ENTRYPOINT ["/bin/bash"]
