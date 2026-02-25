# ION Smart API Documentation - Docker

Esta documentación explica cómo construir y ejecutar la imagen Docker personalizada que contiene Swagger UI con todas las especificaciones OpenAPI de ION Smart embebidas.

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Requisitos Previos](#requisitos-previos)
- [Construcción de la Imagen](#construcción-de-la-imagen)
- [Ejecución](#ejecución)
  - [Con Docker Compose (Recomendado)](#con-docker-compose-recomendado)
  - [Con Docker Run](#con-docker-run)
- [Acceso a la Documentación](#acceso-a-la-documentación)
- [APIs Disponibles](#apis-disponibles)
- [Gestión del Contenedor](#gestión-del-contenedor)
- [Publicación en Registry](#publicación-en-registry-opcional)
- [Actualización de la Documentación](#actualización-de-la-documentación)
- [Troubleshooting](#troubleshooting)

## 📖 Descripción

Esta imagen Docker empaqueta Swagger UI junto con todas las especificaciones OpenAPI de ION Smart en una única imagen autocontenida. La imagen no requiere volúmenes externos ni configuración adicional, lo que la hace ideal para distribución y despliegue rápido.

### Características

- ✅ **Autocontenida**: Todos los archivos YAML están embebidos en la imagen
- ✅ **Sin dependencias externas**: No requiere volúmenes ni configuración adicional
- ✅ **Portable**: Funciona en cualquier entorno con Docker
- ✅ **Lista para usar**: Configuración pre-establecida para todas las APIs
- ✅ **Healthcheck integrado**: Monitoreo automático del estado del servicio

## 🔧 Requisitos Previos

- Docker Engine 20.10 o superior
- Docker Compose 2.0 o superior (opcional, pero recomendado)

## 🏗️ Construcción de la Imagen

### Paso 1: Navegar al directorio de documentación

```bash
cd /srv/http/ionsmart.local/docs
```

### Paso 2: Construir la imagen

```bash
docker build -t ionsmart-api-docs:latest .
```

Para especificar una versión específica:

```bash
docker build -t ionsmart-api-docs:1.0.0 .
```

### Verificar la imagen construida

```bash
docker images | grep ionsmart-api-docs
```

## 🚀 Ejecución

### Con Docker Compose (Recomendado)

La forma más sencilla de ejecutar la documentación es usando Docker Compose:

```bash
docker-compose -f docker-compose.simple.yml up -d
```

**Comandos útiles:**

```bash
# Ver logs
docker-compose -f docker-compose.simple.yml logs -f

# Detener el servicio
docker-compose -f docker-compose.simple.yml down

# Reiniciar el servicio
docker-compose -f docker-compose.simple.yml restart

# Ver estado
docker-compose -f docker-compose.simple.yml ps
```

### Con Docker Run

Alternativamente, puedes ejecutar el contenedor directamente:

```bash
docker run -d \
  --name ionsmart-api-docs \
  -p 9080:8080 \
  --restart unless-stopped \
  ionsmart-api-docs:latest
```

**Opciones del comando:**
- `-d`: Ejecuta el contenedor en segundo plano (modo detached)
- `--name`: Asigna un nombre al contenedor
- `-p 9080:8080`: Mapea el puerto 8080 del contenedor al puerto 9080 del host
- `--restart unless-stopped`: Reinicia automáticamente el contenedor si falla

## 🌐 Acceso a la Documentación

Una vez el contenedor esté en ejecución, accede a Swagger UI en:

```
http://localhost:9080
```

Si estás ejecutando en un servidor remoto, reemplaza `localhost` con la IP o dominio del servidor.

## 📚 APIs Disponibles

La imagen incluye documentación para las siguientes APIs:

1. **ION ADMIN API** - Gestión administrativa del sistema
2. **Core API** - API principal del sistema (por defecto)
3. **ION Industry API** - Módulo industrial
4. **ION City API** - Módulo de ciudad inteligente
5. **ION CVEDIA API** - Integración con CVEDIA
6. **ION XFUSION API** - Integración con XFUSION

Puedes cambiar entre las diferentes APIs usando el selector en la esquina superior derecha de la interfaz de Swagger UI.

## 🔧 Gestión del Contenedor

### Ver logs en tiempo real

```bash
docker logs -f ionsmart-api-docs
```

### Verificar el estado del contenedor

```bash
docker ps | grep ionsmart-api-docs
```

### Verificar el healthcheck

```bash
docker inspect ionsmart-api-docs | grep -A 10 Health
```

### Detener el contenedor

```bash
docker stop ionsmart-api-docs
```

### Iniciar el contenedor detenido

```bash
docker start ionsmart-api-docs
```

### Eliminar el contenedor

```bash
docker rm -f ionsmart-api-docs
```

### Acceder al shell del contenedor (para debugging)

```bash
docker exec -it ionsmart-api-docs sh
```

## 📦 Publicación en Registry (Opcional)

### Docker Hub

Si deseas compartir la imagen a través de Docker Hub:

```bash
# 1. Etiquetar la imagen con tu usuario de Docker Hub
docker tag ionsmart-api-docs:latest ghcr.io/ion-smart/ionsmart_api_docs:latest

# 2. Login en Docker Hub
docker login

# 3. Push de la imagen
docker push ghcr.io/ion-smart/ionsmart_api_docs:latest
```

### Registry Privado

Para usar un registry privado:

```bash
# 1. Login en el registry privado
docker login ghcr.io

# 2. Push de la imagen
docker push ghcr.io/ion-smart/ionsmart_api_docs:latest
```

### Uso de la imagen desde un registry

Una vez publicada, otros usuarios pueden usar la imagen directamente:

```bash
docker pull ghcr.io/ion-smart/ionsmart_api_docs:latest
docker run -d -p 9080:8080 ghcr.io/ion-smart/ionsmart_api_docs:latest
```

O actualizar el `docker-compose.simple.yml`:

```yaml
services:
  swagger-ui:
    image: ghcr.io/ion-smart/ionsmart_api_docs:latest
    # ... resto de la configuración
```

## 🔄 Actualización de la Documentación

Cuando actualices los archivos YAML de la documentación:

### 1. Reconstruir la imagen

```bash
cd /srv/http/ionsmart.local/docs
docker build -t ionsmart-api-docs:latest .
```

### 2. Detener el contenedor actual

```bash
docker stop ionsmart-api-docs
docker rm ionsmart-api-docs
```

O con docker-compose:

```bash
docker-compose -f docker-compose.simple.yml down
```

### 3. Ejecutar con la nueva imagen

```bash
docker-compose -f docker-compose.simple.yml up -d
```

### Script de actualización automática

Puedes crear un script para automatizar el proceso:

```bash
#!/bin/bash
# update-docs.sh

cd /srv/http/ionsmart.local/docs
echo "Construyendo nueva imagen..."
docker build -t ionsmart-api-docs:latest .

echo "Deteniendo contenedor actual..."
docker-compose -f docker-compose.simple.yml down

echo "Iniciando contenedor con nueva imagen..."
docker-compose -f docker-compose.simple.yml up -d

echo "Verificando estado..."
docker-compose -f docker-compose.simple.yml ps

echo "✅ Actualización completada"
```

Hazlo ejecutable:

```bash
chmod +x update-docs.sh
```

## 🐛 Troubleshooting

### El contenedor no inicia

**Verificar logs:**
```bash
docker logs ionsmart-api-docs
```

**Verificar puerto ocupado:**
```bash
# Linux/Mac
sudo netstat -tulpn | grep 9080

# Windows
netstat -ano | findstr 9080
```

### La interfaz no carga

**Verificar que el contenedor está corriendo:**
```bash
docker ps | grep ionsmart-api-docs
```

**Verificar el healthcheck:**
```bash
docker inspect ionsmart-api-docs --format='{{json .State.Health}}'
```

### Las especificaciones YAML no aparecen

**Verificar que los archivos fueron copiados a la imagen:**
```bash
docker exec ionsmart-api-docs ls -la /usr/share/nginx/html/spec/
```

**Verificar las variables de entorno:**
```bash
docker exec ionsmart-api-docs env | grep URLS
```

### Error de permisos

Si encuentras errores de permisos al construir:

```bash
# Dar permisos de lectura a los archivos YAML
chmod -R 644 api/*.yaml
chmod 755 api/
chmod -R 755 api/*/
```

### Limpiar imágenes antiguas

Para liberar espacio de imágenes antiguas:

```bash
# Ver imágenes
docker images | grep ionsmart-api-docs

# Eliminar imágenes sin tag
docker image prune

# Eliminar todas las imágenes no usadas
docker image prune -a
```

## 📝 Notas Adicionales

### Diferencias con la configuración original

La configuración original en `docker-compose.yml` incluye servicios adicionales:
- **git-puller**: Actualización automática desde repositorio Git
- **file-watcher**: Recarga automática al detectar cambios
- **swagger-editor**: Editor de especificaciones OpenAPI
- **caddy**: Reverse proxy

Esta imagen simplificada está diseñada para **distribución y deployment**, mientras que la configuración original es ideal para **desarrollo y actualización continua**.

### Cuándo usar cada solución

**Usa la imagen Docker (`docker-compose.simple.yml`)** cuando:
- ✅ Necesites distribuir la documentación a clientes/equipos externos
- ✅ Quieras un deployment rápido y sin configuración
- ✅ La documentación no cambia frecuentemente
- ✅ Necesites portabilidad máxima

**Usa la configuración completa (`docker-compose.yml`)** cuando:
- ✅ Estés desarrollando/actualizando la documentación activamente
- ✅ Necesites sincronización automática con un repositorio Git
- ✅ Quieras editar las especificaciones directamente
- ✅ Necesites recarga automática en tiempo real

## 📞 Soporte

Para reportar problemas o sugerencias sobre la documentación de la API, contacta al equipo de desarrollo de ION Smart.

---

**Versión:** 1.0.0  
**Última actualización:** Enero 2026
