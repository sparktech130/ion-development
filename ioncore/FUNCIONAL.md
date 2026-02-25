# IONCORE – Documentación Funcional (Core PHP)

Este documento explica capacidades, flujos y uso funcional del núcleo PHP del proyecto (excluyendo `APIS/`). Está orientado a equipos que consumen/operan el core y a integradores de aplicaciones relacionadas.

## Índice
- [Propósito del sistema](#propósito-del-sistema)
- [Convenciones de uso](#convenciones-de-uso)
- [Módulos principales y capacidades](#módulos-principales-y-capacidades)
- [Flujos funcionales clave](#flujos-funcionales-clave)
- [Ejemplos funcionales](#ejemplos-funcionales)
- [Usuarios Grid](#usuarios-grid)
- [Licencias](#licencias)
- [Convenciones de respuesta](#convenciones-de-respuesta)
- [Configuración funcional](#configuración-funcional)
- [Modo debug y logs](#modo-debug-y-logs)
- [Reglas funcionales (resumen)](#reglas-funcionales-resumen)
- [Integración con repos relacionados](#integración-con-repos-relacionados)
- [Errores conocidos y mejoras (backlog funcional)](#errores-conocidos-y-mejoras-backlog-funcional)

## Propósito del sistema
- Proveer servicios comunes de autenticación, usuarios, dispositivos, VMS, IA y utilidades.
- Exponer endpoints HTTP y scripts que pueden ser consumidos por aplicaciones PHP hermanas o frontend.
- Actuar como base de otros repos relacionados (`ioncity`, `ionindustry`), reutilizando módulos del core.

## Convenciones de uso
- Peticiones: preferentemente `POST` con `Content-Type: application/json` y cuerpo con parámetros.
- Respuestas JSON consistentes con `ok|error|data|message`.
- Autenticación: muchas rutas requieren token válido (ver `verificarToken/main.php`). Algunas aceptan Basic Auth.
- Zona horaria: utiliza `time_zone` de `config.json` para normalizar fechas.

## Documentación de la API PHP
Los endpoints se encuentran en el repositorio [APIDocs](https://github.com/ION-Smart/APIDocs) con detalles de parámetros, respuestas y ejemplos.
Utiliza el estándar OpenAPI 3.0, y está en desarrollo constante, se actualizará conforme se añadan nuevas rutas o cambien las existentes.

> [!NOTE]
> Se puede acceder a la documentación de la API PHP con credenciales en el siguiente enlace: [Acceder](http://vps.ionsmart.cat:9080/)

## Módulos principales y capacidades
- `auth/`
  - `login.php`: obtiene token y establece sesión.
  - `cambiarPassword2FA.php`, `comprobar2FA.php`, `logout.php`: gestionar autenticación avanzada.
- `analisis/`
  - Funciones de análisis de video (instancias, zonas, tipos de análisis, etc.).
- `cloud_nx/`
  - Interacciones con los clouds de NX en local.
- `dispositivos/`
  - CRUD de dispositivos (`insertar.php`, `modificar.php`, `eliminar.php`, `obtener.php`).
  - Funciones PTZ (`dispositivos/ptz/*`) y `mainNx.php` para operaciones específicas.
- `fabricantes/`
  - Registro/obtención de fabricantes.
  - Almacenamiento de iconos (`fabricantes/fotos/*`).
- `fabricantes/modelos/`
  - Registro/obtención de modelos de dispositivos.
  - Almacenamiento de iconos (`fabricantes/modelos/fotos/*`).
- `fabricantes/categorias/`
  - Gestión de categorías de dispositivo.
- `fotos/` y `fotos_perfil`
  - Almacenamiento y obtención de fotos genéricas y de perfil de usuario.
- `integraciones/`
  - Registro/obtención de integraciones y sus iconos (`integraciones/iconos/*`).
- `licencias/`
  - Consulta y gestión de licencias del sistema.
  - Consulta de canales activos y operaciones relacionadas.
- `modulos/`
  - Gestión de módulos instalados y sus estados.
- `paises/`, `provincias/`
  - Obtención de datos geográficos.
- `reconocimientos/` y `reconocimientos_personas/`
  - Gestión de reconocimientos (matrículas, rostros, objetos).
- `usuarios/`
  - CRUD de usuarios (`insertar.php`, `modificar.php`, `eliminar.php`, `obtener.php`).
  - Logs relacionados (`usuarios/logs/*`).
- `vms/`
  - Eventos y utilidades de video management (`obtenerEventos.php`, `main.php`).
  - Funciones internas que interactúan con NX-API del core.
- `CVEDIA-API/`
  - Gestión de instancias, áreas y soluciones de análisis IA.
  - Ejemplo: crear/modificar áreas (`instancias/areas/*/crear_*.php`, `modificar_*.php`).
- `XFUSION-API/`
  - Acciones sobre nodos y sistemas, endpoints agrupados por recursos.
- `ws/`
  - Routers de ingestión de eventos (`jsonMls.php`, `jsonMlsNx.php`). Integran fuentes externas y generan logs.
- Otros:
  - `mqtt.php`: operaciones MQTT.
  - `sistema/`: información del sistema y discos. (En desarrollo)
  - `utils/main.php`: helpers funcionales (respuesta, validaciones, logs, formato).

## Flujos funcionales clave
- Autenticación básica
  - Solicitar login (`auth/login.php`).
  - Obtener token JWT al validar 2FA (`auth/comprobar2FA`) y usarlo en llamadas subsecuentes.
  - Usar token en endpoints que lo requieren o Basic Auth donde se permita.

- Gestión de usuarios
  - Crear usuario con datos mínimos (nombre, email, permisos). 
  - Modificar/eliminar/obtener registros. Cada acción valida parámetros y usa `errors.json` para respuestas de error.

- Gestión de dispositivos
  - Alta de dispositivo con datos de identificación y credenciales.
  - Actualización de parámetros (modelo, localización, cloud), eliminación y consulta.
  - Operaciones PTZ cuando aplique.

- Gestión de Cloud NX
  - Gestión de credenciales y configuración de cloud NX por dispositivo.
  - Sincronización de dispositivos con cloud.
  - Interacciones con cloud NX (autenticación, obtención de streams, clips).
  - Usado internamente por módulos VMS y otros.

- Eventos VMS
  - Consulta de eventos por dispositivo y rango de fechas (`vms/obtenerEventos*.php`).
  - Normalización de tiempos con `DateTime` y `TIME_ZONE`.

- Ingestión de eventos externos
  - `ws/jsonMls.php` y `ws/jsonMlsNx.php` reciben JSON, validan, registran y actúan (ej. alertas, reconocimientos).

- IA (CVEDIA)
  - Crear/modificar áreas asociadas a instancias, validando parámetros y contexto (`instancias/*`).

## Ejemplos funcionales
- Alta de usuario
```bash
curl -X POST "https://<host>/core/usuarios/insertar.php" \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Juan","email":"juan@example.com","permisos":["admin"]}'
```
- Obtener dispositivos
```bash
curl -X POST "https://<host>/core/dispositivos/obtener.php" \
  -H "Content-Type: application/json" \
  -d '{"filtros":{"modelo":"NX","pagina":1}}'
```
- Eventos de VMS por fecha
```bash
curl -X POST "https://<host>/core/vms/obtenerEventos.php" \
  -H "Content-Type: application/json" \
  -d '{"cod_dispositivo":1234, "fecha_hora_ini":"2024-01-01T00:00:00", "fecha_hora_fin":"2024-01-02T00:00:00"}'
```
- Ingestión de evento Milesight
```bash
curl -X POST "https://<host>/core/ws/jsonMls.php" \
  -H "Content-Type: application/json" \
  -d '{"device":"CAM_01","time":"2024-01-01T12:00:00Z","debug":true}'
```

## Usuarios Grid
Gestión de la configuración de cuadrículas asociadas a usuarios. Las rutas siguen el patrón de los módulos del core y aceptan `Content-Type: application/json`.

- Listar configuración de grid para un usuario
```bash
curl -X POST "https://<host>/core/usuarios/grid/obtener.php" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_usuario": 123, // Opcional
    "cod_modulo": "0015",
    "cod_modulo_dispositivos": "0001",
    "cod_sector": "0001"
  }'
```

- Insertar elemento de grid
```bash
curl -X POST "https://<host>/core/usuarios/grid/insertar.php" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_usuario": 123,
    "nombre_grid": "CCTV Oficina",
    "dispositivos": "000001;000002;000003",
    "modulos": [
      {"cod_modulo":"0015","seleccionar":true},
      {"cod_modulo":"0017","seleccionar":false}
    ]
  }'
```

- Modificar elemento de grid
```bash
curl -X POST "https://<host>/core/usuarios/grid/modificar.php" \
  -H "Content-Type: application/json" \
  -d '{
    "cod_grid": 1,
    "cod_usuario": 123,
    "nombre_grid": "CCTV Oficina",
    "dispositivos": "000001;000002;000003",
    "modulos": [
      {"cod_modulo":"0015","seleccionar":true},
      {"cod_modulo":"0017","seleccionar":false}
    ]
  }'
```

- Eliminar elemento de grid
```bash
curl -X POST "https://<host>/core/usuarios/grid/eliminar.php" \
  -H "Content-Type: application/json" \
  -d '{"cod_grid": 1}'
```

## Licencias
Consulta y operaciones relacionadas con licencias del sistema.

- Obtener licencias
```bash
curl -X POST "https://<host>/licencias/obtener.php" \
  -H "Content-Type: application/json" \
  -d '{"estado": "activa"}'
```
## Convenciones de respuesta
- Éxito
```json
[{...}]
```
o
```json
{
    "total": 2,
    "data": [{...}, {...}]
}
```

- Error
```json
{ "error": true, "message": "Error de validación" }
```

## Configuración funcional
- `config.json` controla zona horaria y timeouts de BBDD; ajustar según entorno.
- Variables de entorno en `.env` (cargadas por `consts.php`) para credenciales, rutas y toggles.
- CORS y seguridad se gestionan desde `cors.php` y `verificarToken/main.php`.

## Modo debug y logs
- Enrutadores `ws/*` aceptan `debug` en el body para activar logs.
- Los logs se escriben mediante `EscribirLog` y se ignoran en control de versiones.
- Recomendado desactivar `DEBUG` en producción y mantener auditoría mínima.

## Reglas funcionales (resumen)
- Validaciones estrictas de parámetros; informar al usuario de qué falla.
- Simplicidad en endpoints y flujos; evitar complejidad excesiva.
- Categorizar endpoints por recursos (usuarios, dispositivos, sistema, vms, ia).

## Integración con repos relacionados
- `ioncity` y `ionindustry` consumen este core (por ejemplo, `ioncity/alertas/main.php` puede ser incluido de forma opcional en `ws/jsonMls.php`).
- Mantener compatibilidad de interfaces y contratos es clave para evitar roturas.
- Referencias:
  - `ioncity-main` (ver `docs/city/IONCITY_FUNCIONAL.md`): usa `core/dispositivos`, `core/reconocimientos`, `core/analisis` y `core/ftp` para flujos de alertas, infracciones y análisis.
  - `ionindustry-main` (ver `docs/industry/IONINDUSTRY_FUNCIONAL.md`): flujos de consumo eléctrico, dispositivos por nave, llamadas y pickings validados por `verificarToken` y normalizados con utilidades del Core.

### Flujos de referencia (City/Industry)
> [!NOTE]
> TODO: Añadir enlaces a los documentos funcionales específicos de City e Industry para detalles de integración y flujos comunes.

## Errores conocidos y mejoras (backlog funcional)
- Completar y utilizar mensajes e idiomas en `errors.json`.
- Unificar respuestas de validación y formatos de fecha.
- Añadir endpoints estandarizados para auditoría y health-check (`sistema/main.php`).
