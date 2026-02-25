# IONCORE – Documentación Técnica (Core PHP)

Este documento describe la arquitectura técnica, dependencias, convenciones y puntos de extensión del núcleo PHP del proyecto, excluyendo la carpeta `APIS/`. Sirve como referencia para mantenimiento, evolución y consumo por otros repositorios relacionados.

## Alcance y objetivos
- Centralizar cómo se inicializa el entorno y dependencias.
- Explicar la estructura del core y módulos principales.
- Unificar manejo de errores, validaciones y logs.
- Definir buenas prácticas (SOLID, legibilidad, simplicidad).

## Stack y dependencias
- `composer` con dependencias:
  - `phpmailer/phpmailer` para envío de correo.
  - `firebase/php-jwt` para generación/validación de JWT.
  - `vlucas/phpdotenv` para variables de entorno.
  - `php-mqtt/client` para operaciones MQTT.
- PHP con cURL habilitado y soporte para `DateTime` con zona horaria configurable.

## Inicialización y configuración
- `consts.php`:
  - Carga `vendor/autoload.php` y el entorno (`.env`) mediante `phpdotenv`.
  - Define constantes globales de rutas, módulos y configuración.
- `config.json`:
  - `time_zone`: zona horaria (por defecto `Europe/Madrid`).
  - `database.*`: límites y timeouts de conexiones.
  - `nx.proxy`: valor por defecto para integraciones internas NX (usado por core/VMS).
- CORS: `cors.php` expone cabeceras y políticas para peticiones HTTP del core.

## Base de datos
- `database.php` expone:
  - `obtenerConexion(tipo)`: devuelve un `PDO` con timeout configurable.
  - Helpers genéricos: `insertarDatosTabla`, `modificarDatosTabla`, `eliminarDatosTabla`, `ejecutarConsultaSQL`.

## Autenticación y seguridad
- `auth/` contiene flujos de login, 2FA y cierre de sesión.
- `verificarToken/main.php` valida tokens para endpoints que lo requieren y soporta Basic Auth como fallback.
- JWT y sesiones:
  - Usar `firebase/php-jwt` para firmar/verificar tokens cuando aplique.
  - Las respuestas deben ocultar detalles internos y devolver códigos estándar definidos.
- Se puede escapar la validación de token estableciendo la variable de sesión `$_SESSION['AUTHED'] = false;` (uso interno).

## Manejo de errores
### Estado actual
- Uso de `try-catch` para capturar excepciones y devolver respuestas JSON con `error: true` y mensaje.
- Códigos HTTP estándar (200, 400, 401, 403, 404, 500) según contexto.
- Mensajes de error genéricos para evitar exposición de detalles internos.

### Actualización a futuro
- `errors.json` contiene catálogo de errores comunes con `status` y mensajes en varios idiomas.
- Reglas:
  - Cada endpoint debe devolver errores con código y mensaje del catálogo (`ERR_00X`).
  - Evitar mensajes ambiguos; completar mensajes faltantes en idiomas cuando sea posible.
  - Usar códigos HTTP del catálogo y, si aplica, un cuerpo JSON con `error: true` y contexto.

## Logs y modo debug
- Funciones de logging (por ejemplo `EscribirLog`) deben respetar el flag `DEBUG` y escribirse en archivos ignorados por `.gitignore`.
- Convenciones:
  - No loguear credenciales ni tokens.
  - En producción, limitar logs a advertencias y errores relevantes.
  - Permitir activar debug por petición (`DEBUG` en el body JSON) o por entorno.

## Estructura principal de carpetas (core)
- `auth/`: endpoints y flujos de autenticación (login, 2FA).
- `usuarios/`: CRUD y logs de usuario.
- `dispositivos/`: gestión de dispositivos y funcionalidades PTZ.
- `integraciones/`: metadatos y registro de integraciones (no confundir con `APIS/`).
- `NX-API/`: capa de negocio y utilidades para VMS NX usadas por el core.
- `vms/`: funcionalidad de video management (eventos, miniaturas, utilidades NX).
- `CVEDIA-API/`: integración de análisis IA a nivel core.
- `XFUSION-API/`: utilidades específicas (nodos, sistemas).
- `ws/`: ingestión/routers de eventos (`jsonMls.php`, `jsonMlsNx.php`).
- `utils/`: helpers generales (`main.php`, optimización de imágenes).
- `sistema/`: información del sistema (discos, estado).
- Ficheros raíz: `consts.php`, `database.php`, `config.json`, `errors.json`, `cors.php`.

## Convenciones de endpoints (core)
- Entradas: `Content-Type: application/json` cuando se envía body.
- Salidas: JSON consistente con claves `ok|error|data|message` y uso de `acabarRequest` para terminar la petición con `status`.
- Validaciones:
  - Presencia de parámetros obligatorios y tipos correctos.
  - Normalización de fechas/horas a `DateTime` con `TIME_ZONE`.

## Interoperabilidad con repos vinculados
- Este core es consumido por otras aplicaciones PHP (por ejemplo, incluye opcionales a `ioncity/alertas/main.php` en `ws/jsonMls.php`).
- Repos relacionados (mencionados): [`ioncity`](https://github.com/ION-Smart/ioncity/) y [`ionindustry`](https://github.com/ION-Smart/ionindustry/) consumen utilidades del core.
  - Patrón recomendado: incluir `core/*` (consts, utils, módulos) evitando duplicación.
  - Mantener compatibilidad de rutas y minimalismo de dependencias para facilitar despliegue.

### Referencias específicas a City e Industry
- City (`ioncity/TECNICO.md`):
  - Integra `core/dispositivos/main.php`, `core/reconocimientos/main.php`, `core/analisis/main.php` y `core/ftp.php`.
  - Consulta avanzada en `infracciones` combina tablas `{{.CORE}}` y `{{.CITY}}`.
  - Alertas pueden solicitar clips NX a través de `core/cloud_nx/main.php`.
- Industry (`ionindustry/TECNICO.md`):
  - Usa `verificarToken/main.php` para endpoints críticos y `core/dispositivos/main.php` para validaciones y datos.
  - `pickings` integra con Navision mediante el Core/APIS.
  - `consumo` emplea joins con `nave` y `distribuidora` y helpers de BD del Core.

## Principios de diseño (SOLID)
- Responsabilidad única: separar controladores HTTP de lógica de negocio (utils/ y módulos dedicados).
- Abierto/cerrado: extender módulos mediante nuevas funciones/clases sin modificar las existentes.
- Sustitución de Liskov: interfaces concretas para conexiones (por ejemplo, `NxConnection`) y respetar contratos.
- Segregación de interfaces: evitar métodos con demasiados parámetros; usar DTOs o arreglos con claves claras.
- Inversión de dependencias: preferir inyección de dependencias (por configuración o factorías) sobre llamadas estáticas.

## Patrones recomendados
- Enrutadores ligeros por archivo con `action` y switch de casos.
- Utilidades compartidas para HTTP y JSON (serialización y errores).
- Cache controlada para recursos pesados (por ejemplo, dispositivos o eventos VMS) y expiraciones razonables.

## Buenas prácticas de desarrollo
- Código limpio y legible; evitar abstracción excesiva.
- Parámetros mínimos por método; agrupar en objetos/arrays cuando aplique.
- Excepciones simples y unificadas; capturar y convertir a respuesta JSON.
- Documentar clases y endpoints (parámetros, flujos, ejemplos) y marcar TODOs/mejoras.

## Ejemplos de respuesta consistente
```json
[
    {
        "cod_dispositivo": "000001",
        "nom_dispositivo": "Dispositivo 1"
    },
    {
        "cod_dispositivo": "000002",
        "nom_dispositivo": "Dispositivo 2"
    }
]
```
o
```json
{
    "total": 2,
    "data": [{...}, {...}]
}
```
Errores:
```json
{
  "error": true,
  "message": "Error al obtener datos"
}
```

## Tareas y mejoras (backlog técnico)
- Unificar capa de excepciones para el core (aplicar en `usuarios/`, `dispositivos/`, `vms/`, `ws/`, ...).
- Completar mensajes en `errors.json` para `ca` y `en` donde falten.
- Validar parámetros y tipos antes de ejecutar SQL.
- Manejo de errores debe mapearse a `errors.json`.
- Centralizar logging en una clase `Logger` con niveles y sinks configurables.
- Adoptar PSR-4 para autoload de módulos del core (si procede).
- Añadir tests unitarios y de integración (mínimo para `database.php`, `verificarToken`, `vms/eventos`).
- Definir DTOs/validador de entrada común para evitar duplicación de chequeos de parámetros.
- Normalizar fechas de eventos (ms vs s) en funciones VMS y ws.
- Aplicar SOLID en módulos existentes (refactorizar funciones monolíticas).
