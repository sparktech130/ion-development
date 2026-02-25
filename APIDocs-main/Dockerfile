# Imagen base de Swagger UI oficial
FROM swaggerapi/swagger-ui:latest

# Metadata
LABEL maintainer="ION Smart"
LABEL description="ION Smart API Documentation - Swagger UI con especificaciones OpenAPI embebidas"
LABEL version="1.0.0"

# Copiar todos los archivos de especificación OpenAPI al contenedor
COPY ./api /usr/share/nginx/html/spec

# Configurar las URLs de las APIs disponibles
ENV URLS='[ \
  { "url": "/spec/ionadmin.yaml", "name": "ION Admin API" }, \
  { "url": "/spec/core.yaml", "name": "Core API" }, \
  { "url": "/spec/industry.yaml", "name": "ION Industry API" }, \
  { "url": "/spec/city.yaml", "name": "ION City API" }, \
  { "url": "/spec/cvedia.yaml", "name": "ION CVEDIA API" }, \
  { "url": "/spec/xfusion.yaml", "name": "ION xFusion API" } \
]'

# Establecer "Core API" como la API principal por defecto
ENV URLS_PRIMARY_NAME="Core API"

# Habilitar la persistencia de autorización entre recargas
ENV PERSIST_AUTHORIZATION="true"

# El puerto 8080 es el puerto por defecto de Swagger UI
EXPOSE 8080

# Healthcheck para verificar que el servicio está funcionando
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080 || exit 1

# No es necesario especificar CMD, se hereda de la imagen base
