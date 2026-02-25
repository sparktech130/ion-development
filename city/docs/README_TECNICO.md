# Documento Técnico Profesional — ION SMART City

> Última actualización: v3.0.4.35
> Última actualización: v3.0.4.35

**Tabla de Contenidos**
- Arquitectura General
- Componentes Principales
- Estado y Servicios
- Conexión a APIs
- Tiempo Real
- Seguridad
- Rendimiento
- Construcción y Despliegue
- Testing y Calidad
- Observabilidad y Errores
- Rutas y Secciones
- Puntos de Mejora
- Internacionalización
- Mapas y Rutas
- Archivos Clave

**Arquitectura General**
- Frontend SPA con React 18 y Vite.
- Router superior con `react-router-dom`; navegación interna controlada por `MainDataContext.section`.
- Context API para autenticación (`LoginDataContext`) y estado de aplicación (`MainDataContext`).
 - Integraciones HTTP: APIs base configurables por entorno; sin rutas internas explícitas.
 - Tiempo real: `socket.io-client` contra servidor configurable (`wss://<socket-server>`).
- Mapas: `@vis.gl/react-maplibre` con estilos propios y rutas OSRM.

**Componentes Principales**
- `src/main.jsx`: monta `LoginDataProvider` y `App`.
- `src/App.jsx`: configura idioma en librerías (`moment` e `i18n-iso-countries`), error boundary, y rutas `/city` y `/city/videowall`.
- `src/pages/Dashboard/Dashboard.jsx`: renderiza secciones según `section`.
- `src/pages/Dashboard/Navbar/Navbar.jsx`: cambia `module` y `section`, valida permisos y licencias.

**Estado y Servicios**
- `src/context/MainDataContext.jsx`:
- Control de `section`, `module`, filtros, cache de estadísticas y modal de calendario.
- `requestAPI(url, params, baseUrl)`: wrapper `axios` con token Bearer, soporta JSON y `FormData`.
 - Bases: URLs configurables; sin exponer rutas internas en documentación pública.
- `src/context/LoginDataContextProvider.jsx`:
- `makeLogin`, `makeLogin2FA`, `logout`.
- `checkPermission(cod_modulo, cod_front, cod_sector)` y `checkLicenses`.
- Normalización de `licencias` y `permisosSecciones`.

**Conexión a APIs**
 - Bases y configuración: endpoints centralizados en `src/api/connections/urls.js`; bases de API configurables por entorno sin exponer hosts ni paths sensibles.
 - Cliente HTTP: wrapper `requestAPI` gestiona cabeceras (incl. Bearer token), soporta `JSON` y `FormData`, controla tiempos de espera y estados de carga, y unifica la propagación de mensajes de error al UI.
 - Organización de dominios:
   - Autenticación: inicio de sesión, 2FA, cierre de sesión; devuelve identidad, permisos/licencias y token.
   - Dispositivos: CRUD y operaciones (incl. control PTZ), obtención de streams e imágenes asociados.
   - Reconocimientos: consulta y agregación configurables con filtros por rango temporal, dispositivo y atributos; soporte de paginación/limit.
   - Alertas: obtener, pendientes, agrupación y validación de eventos.
   - Áreas/Investigaciones/Campañas/Listas/Padrón: CRUD e importaciones.
   - VMS: calendario, eventos y descargas de contenidos.
   - Servidores: estadísticas y estado de nodos (configurable).
 - Parámetros y filtros: uso consistente de formatos (`YYYY-MM-DD` para fechas, `HH:mm` para horas), IDs opacos, enumeraciones de estado y booleanos; filtros combinables y no obligatorios.
 - Paginación y límites: soporta `limit` y `offset` (o `page`/`pageSize` según endpoint); valores por defecto moderados y ampliables cuando se aplican filtros.
 - Respuestas: estructura estándar con `data` y `meta` (paginación/resumen); errores con `message` y `code` genéricos consumidos por el UI.
 - Seguridad: autenticación mediante token Bearer, caducidad gestionada desde el cliente (cierre de sesión y renovación de estado); CORS y credenciales según necesidad.
 - Buenas prácticas de consumo: idempotencia en operaciones críticas, timeouts razonables, reintentos controlados, y cache selectiva donde aplique (p. ej., estadísticas).

<!-- Sección inicial de Tiempo Real consolidada en el bloque ampliado más abajo -->

<!-- Sección inicial de Mapas y Rutas consolidada en el bloque ampliado más abajo -->

**Internacionalización**
- Configuración en `src/i18n.js` con recursos en `public/locales/*` (ES, EN, CA, JA, etc.).
- Fallback de idioma y detección inicial; cambios de idioma en tiempo de ejecución desde el UI.
- Formateo de fechas y horas con `moment` (zonas horarias configurables) y nombres de países con `i18n-iso-countries`.
- Convenciones de claves de traducción neutrales y desacopladas del backend.
- Buenas prácticas: textos neutrales para errores, evitar interpolar datos sensibles en cadenas.
- Consistencia de claves de error: `errors.createInstanceFirst`, `errors.request`, y mensajes relacionados validados en `public/locales/*/translation.json` y `plantilla.js`.

- Cambios recientes: el mensaje `errors.dateRangeExceeded` se ha parametrizado para aceptar `{{days}}`. Las traducciones en `public/locales/ca|en|es/translation.json` y la plantilla (`public/locales/plantilla.js`) se actualizaron para usar interpolación (`{{days}}`); la localización `ja` se ajustó a un texto con valor explícito (`1日`).

**Tiempo Real**
- Cliente de sockets encapsulado en `src/api/connections/socketHandler.js` con servidor configurable.
- Ciclo de conexión: conexión inicial, detección de desconexión, reintentos con backoff y reconexión automática cuando el estado de red cambia.
- Suscripción a eventos: métodos de `subscribe/unsubscribe` y `join/leave` para canales/salas; los eventos están namespaced por dominio funcional (p. ej., alertas, dispositivos, VMS).
- Payloads y contratos: mensajes con estructura consistente (`type`, `data`, `timestamp`) consumidos por el UI; validación ligera antes de propagar al estado global.
- Resiliencia: re-suscripción a canales tras reconexión, colas temporales para evitar pérdidas, y gestión de throttling/debounce en eventos muy frecuentes.
- Seguridad: autenticación mediante token cuando aplica; configuración de `withCredentials` y CORS según políticas del entorno, sin exponer hosts o paths sensibles.

**Seguridad**
- Autenticación 2FA con emisión de token Bearer; el cliente añade el token a cada petición mediante el wrapper de `requestAPI`.
- Permisos y licencias: validación granulada por sección/módulo desde `LoginDataContextProvider` y controles de UI que ocultan/inhabilitan acciones sin permiso.
- Manejo de sesión: expiración y cierre automático con notificación; renovación de estado tras re-login.
- Protección de datos: IDs opacos, mínimos datos sensibles en memoria y ausencia de logs con información personal en producción.
- Frontend seguro: evitar secretos en repositorio, uso de variables de entorno para bases de API y servidores; sanitización de documentación y mensajes.
- Transporte: CORS ajustado por entorno y `withCredentials` cuando se requiera para sockets; HTTPS/WSS recomendado.
- Buenas prácticas: validación de entrada en el cliente, mensajes de error neutrales, y políticas de tiempo de sesión moderado.

**Rendimiento**
- Paginación/limit por defecto en consultas y ampliación con filtros.
- Cache de estadísticas (`rightBarStatsData`).
- Carga diferida de librerías de mapas.
- Tiempo real con throttling/debounce configurable.
- Virtualización y clustering en listas/mapas cuando procede.

**Construcción y Despliegue**
- Desarrollo y build con Vite (`vite.config.js`).
- Comandos habituales: `npm run dev` (desarrollo), `npm run build` (producción), `npm run preview` (revisión del build).
- Variables de entorno: bases de API y servidores configurables mediante `.env.*` (sin secretos en el repositorio).
- Salida de build: artefactos estáticos optimizados en `dist/` con división de código y minificación.
- Recursos: estilos globales y módulos CSS en `src/styles/*`; assets en `public/` y `src/assets/`.
- CI/CD: flujos automatizados (p. ej., GitHub Actions) para lint, build y despliegue, con variables de entorno inyectadas de forma segura.

**Testing y Calidad**
- Alcance recomendado:
  - Unit tests en utilidades y componentes puros.
  - Integración en `requestAPI` (cabeceras, errores, timeouts), sockets (suscripción/reconexión) y navegación por permisos/licencias.
  - Snapshot y pruebas de interacción básicas en componentes clave.
- Linter: ESLint (`.eslintrc.cjs`) con reglas consistentes; formateo opcional con Prettier si se requiere.
- Buenas prácticas: evitar mocks de implementación interna de servicios; probar contratos y flujos críticos.
- Cobertura: priorizar módulos de mayor riesgo (autenticación, permisos, filtros) y servicios compartidos.
- Ejecución en CI: incluir tareas de test y lint en el pipeline con salida legible.

**Observabilidad y Errores**
- `ErrorBoundary` con `ErrorFallback` y registro mínimo de errores del lado cliente (sin datos sensibles).
- Manejo centralizado de errores en servicios (`requestAPI`) y sockets; mensajes neutrales para usuario.
- Métricas de rendimiento básicas (tiempos de carga y uso de memoria) observables desde el navegador.
- Notificaciones controladas y accesibles para estados de red y sesión.

**Rutas y Secciones**
- Rutas públicas: `/city` (Dashboard o Login según sesión) y `/city/videowall`.
- Navegación interna: control por `section` y `module` desde `Dashboard`; cada sección monta su página en función del estado global.
- Persistencia de filtros y estado de UI al cambiar de sección.
- Deep-linking (planificado) mediante parámetros seguros y/o hash.

**Puntos de Mejora**
- Deep-linking por `section` con validación de parámetros.
- Documentación de contratos API (OpenAPI) y casos de uso.
- Cache estratégica y Service Worker para estáticos; revisión de TTL y memoria.
- Mejoras de accesibilidad (teclado, focus management, ARIA) en componentes clave.
- Refactor progresivo de servicios a tipado más estricto y contratos compartidos.
- Migración ordenada de componentes legacy a patrones unificados (estado, efectos, estilos).
- Telemetría opcional del lado cliente sin datos personales para diagnósticos.

**Mapas y Rutas**
- Renderizado con MapLibre y estilos claro/oscuro; capas y marcadores gestionados en `src/components/Maps/MapV4/*`.
- Fuentes de datos configurables por entorno; no se exponen hosts ni paths sensibles en el repositorio.
- Geoespacial: soporte de geocercas, áreas y elementos cartográficos con actualización en tiempo real cuando aplica.
- Rutas: cálculo y visualización de trayectos sobre endpoints compatibles con OSRM; decodificación de polilíneas, ajuste de vista (fit bounds), indicación básica de distancia/tiempo y manejo de fallos de cálculo con mensajes neutrales.
- Interacción: selección de dispositivos/áreas, filtros espaciales y herramientas de inspección; controles de zoom/pan y alternancia de estilos.
- Rendimiento: clustering de marcadores, simplificación de geometrías y carga diferida de capas.

**Archivos Clave**
- `src/App.jsx`: define el armazón principal de la SPA, configura internacionalización, aplica el `ErrorBoundary` y registra las rutas públicas (`/city`, `/city/videowall`).
- `src/pages/Dashboard/Dashboard.jsx`: orquesta el renderizado por `section`; actúa como router interno que monta cada página según el estado global.
- `src/pages/Dashboard/Navbar/Navbar.jsx`: gestiona navegación (cambio de `module`/`section`), validación de permisos/licencias y controles de UI (tema, notificaciones).
- `src/context/MainDataContext.jsx`: estado global de aplicación (módulo/sección, filtros, carga, mensajes, modales) y utilidades para invocar servicios.
- `src/context/LoginDataContextProvider.jsx`: proveedor de autenticación con 2FA, manejo de sesión/token y cálculo de permisos/licencias; utilidades para comprobar acceso.
- `src/api/connections/urls.js`: centraliza endpoints de API; bases configurables por entorno sin exponer hosts/paths sensibles.
- `src/api/connections/socketHandler.js`: encapsula cliente de tiempo real (subscribe/unsubscribe, join/leave rooms, reintentos); servidor configurable.
- `src/pages/Suite/City/*/*`: implementación de módulos y secciones (live, consultas, prevalidación, estadísticas, configuración); patrón de filtros + tabla/grid + detalle.
- `src/components/Maps/MapV4/*`: componentes de mapas y rutas (capas, marcadores, estilos claro/oscuro, cálculo/visualización de rutas) sobre MapLibre.
 - `src/constants/common.js`, `src/constants/icons.js`.

- Cambios detectados en esta entrega:
  - `src/components/RegistroDeRuta/RegistroDeRutaV4.jsx`: nuevo componente añadido (vista modal de ruta/reconocimientos) junto con `Timeline` y estilos (`Timeline.module.css`, `RegistroDeRutaV4.module.css`).
  - `src/components/DetailModal/DetailModal.jsx`: import actualizado para usar `RegistroDeRutaV4` en lugar de la versión previa `RegistroDeRuta`.
  - `src/components/Maps/MapV4/Components/RouteComponent/RouteComponent.jsx`: llamada a `centerMap` extendida con un nuevo parámetro `centerPadding`.
  - `src/utils/functions/functions.js`: `checkArray` ahora acepta un parámetro `min` (`checkArray(array, min = 1)`) para validar longitud mínima.
  - `src/utils/libraries/.../EventChart.jsx`: componente `EventChart` añadido (copia localizada de la librería de charts).
  - `src/constants/common.js`: constante `version` incrementada (ver notas de versión).