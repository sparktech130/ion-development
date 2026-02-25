# ION Traffic — Documentación Técnica
> Última actualización: v3.0.4.35

Este documento describe la arquitectura, flujos y componentes del módulo ION Traffic dentro de la Suite City. Se mantiene neutral y evita incluir información sensible. Los nombres de rutas y componentes reflejan la estructura actual del código.

## Resumen funcional
- Monitoriza en tiempo real dispositivos y alertas en el mapa.
- Permite consultar y prevalidar reconocimientos y eventos.
- Proporciona estadísticos agregados y vistas analíticas básicas.
- Ofrece configuración de listas, rejillas y catálogos de infracciones del módulo.

## Navegación y rutas
Las rutas se gestionan desde `Dashboard.jsx`, mapeando claves de sección a componentes:
- `traffic-live` → `AlertsMap`
- `traffic-consulting-consults` → `Consulting`
- `traffic-prevalidation` → `Prevalidation`
- `traffic-stats` → `Stats`
- `traffic-settings-lists` → `Lists`
- `traffic-settings-infringements` → `Infringements modulo={15}`
- `traffic-settings-grid` → `ConfGrid modulo={15}`

Además, la navbar usa `cod_modulo` y claves de sección para cambiar entre módulos.

## Permisos por sección (referencia)
Definidos en `src/pages/Configuration/Permissions/permissionsImplemented.js`:
- `0001` → `traffic-live` → `consultas`, `editar`, `compartir`
- `0003` → `traffic-consulting-consults` → `consultas`, `editar`, `compartir`
- `0060` → `traffic-consulting-reports` → `consultas`, `editar`, `compartir`
- `0061` → `traffic-prevalidation` → `consultas`, `editar`, `compartir`
- `0009` → `traffic-stats` → `consultas`
- `0064` → `traffic-settings-lists` → `consultas`, `editar`, `compartir`
- `0090` → `traffic-settings-infringements` → `consultas`, `editar`, `compartir`

## Arquitectura y componentes

### AlertsMap (Live)
Ruta: `src/pages/Suite/City/Traffic/AlertsMap/AlertsMap.jsx`
- Renderiza el mapa con dispositivos, alertas y controles. Integra `CityVisualization` para foco en dispositivo concreto.
- Props relevantes hacia `CityVisualization`:
  - `recons`, `alerts`, `analysisStats`, `graphInfo`: datos de reconocimientos y alertas por dispositivo.
  - `instances`: instancias para autocompletado y filtrado.
  - `consulting_section` = `traffic-consulting-consults` para navegación contextual.
- Acciones frecuentes: abrir videowall, alternar capas (policía, info, 112), ver estadísticas por dispositivo.
- Usa datos del contexto principal (`MainDataContext`) para estado del módulo, carga de dispositivos y filtros.

#### Capa de tráfico externo
En el mapa V4 existe `TrafficComponent` (`src/components/Maps/MapV4/Components/TrafficComponent/TrafficComponent.jsx`):
- Obtiene flujo de tráfico vía tiles vectoriales del proveedor externo y los procesa a `FeatureCollection`.
- Optimiza peticiones según `zoom` y `bounds` del mapa, y evita solicitudes duplicadas.
- Claves API deben venir de variable de entorno (p. ej., `MAP_TOMTOM_API_KEY`). No se deben hardcodear claves en el código.

### CityVisualization (interacción)
Ruta: `src/components/DataVisualization/City/CityVisualization.jsx`
- Muestra análisis IA por módulo y lanza navegación contextual:
  - Para `traffic`: cambia a `traffic-prevalidation` si existe permiso.
- Actualiza `setSection`, `setModule` y estado de dispositivo actual en el contexto.
- Gestión de instancias IA:
  - Endpoints: `URL_OBTENER_INSTANCIAS_AI` y `URL_CREAR_INSTANCIAS_AI` definidos en `src/api/connections/urlsAI.js`.
  - Operaciones soportadas:
    - Obtener instancias existentes (`requestAPI(URL_OBTENER_INSTANCIAS_AI, {}, \`${url_origin}/core/CVEDIA-API/\`)`).
    - Crear instancia asociada al dispositivo (`requestAPI(URL_CREAR_INSTANCIAS_AI, { cod_dispositivo, solutionId }, \`${url_origin}/core/CVEDIA-API/\`)`).
  - Mensajería/UI:
    - Usa `t('errors.createInstanceFirst')` para advertir si no hay instancias activas antes de iniciar/parar.
    - Usa `t('errors.request')` ante errores de solicitud.
    - Integra `TextModal` para avisos/contexto de creación y acciones informativas.
  - Control de estado relacionado: `instanceOpen`, `setInfoMessage`, `setIsLoading`.

### Consulting (Consultas)
Ruta: `src/pages/Suite/City/Traffic/Consulting/Consulting.jsx`
- Listado y búsqueda de registros/consultas del módulo Traffic.
- Integra la misma rejilla de resultados utilizada en Prevalidación para consistencia visual.
- Flujo típico: filtrar → listar → abrir detalle → acciones de compartir/editar según permisos.
- Uso de `useTranslation` para textos (`react-i18next`) y `MainDataContext` para solicitudes HTTP.

### Prevalidation (Prevalidación)
Ruta: `src/pages/Suite/City/Traffic/Prevalidation/Prevalidation.jsx`
- Gestiona un listado de prevalidaciones con:
  - Filtro avanzado (`filterOpen`), corrección (`correctionOpen`), y reproducción del listado.
  - Estados locales: `data`, `sortedData`, `currentData`, subtítulo con resultados (`t('messages.results', { value })`).
- Usa `ConsultingGrid` con `consultingSection = 'traffic-consulting-consults'`, enlazando con la sección de consultas.
- Renderiza descripciones de alertas con claves internacionales (`codes.cityAlerts.*`) y, cuando aplica, detalles como velocidad actual y límite.

### Stats (Estadísticos)
Ruta: `src/pages/Suite/City/Traffic/Stats/Stats.jsx`
- Subcomponentes:
  - `MapChart` y `TrafficChart`: mapas y gráficos de intensidad/flujo.
  - `SpeedChart`: distribución de velocidades.
  - `VehiclesChart`: agregación por tipo de vehículo.
  - `Filters`: fecha/rango e instancias.
- Orquesta consultas agregadas y muestra indicadores con tarjetas y gráficos.

- Nota técnica: `Stats` en Traffic (`Stats.jsx` / `StatsV4/Stats.jsx`) ahora pasa `{ days: 365 }` al mensaje `errors.dateRangeExceeded` para compatibilidad con las traducciones parametrizadas.

### Lists (Listas de configuración)
Ruta: `src/pages/Suite/City/Traffic/Lists/Lists.jsx`
- Mantiene catálogos y listas operativas utilizadas por el módulo (p. ej., tipos de alertas, códigos visibles).
- Permite editar/compartir según permisos configurados.

### Infringements (Catálogo de infracciones)
Ruta: `src/pages/Suite/City/Traffic/Infringements/Infringements.jsx`
- Componente genérico reutilizado con `modulo={15}` para Traffic (el mismo se usa en otros módulos con distinto `modulo`).
- Administra catálogo de infracciones y sus atributos visibles.

### ConfGrid (Configuración de rejilla)
Ruta: `src/pages/Suite/City/Traffic/ConfGrid/ConfGrid.jsx`
- Configura columnas/orden y comportamiento de rejillas de listado para el módulo Traffic (`modulo={15}`).
- Subcomponentes: `Menu`, `ModalAdd`, `ModalUpdate`, `SortableGrid`.

## Contextos, datos e internacionalización
- `MainDataContext`: provee estado del módulo, navegación (`setSection`, `setModule`), carga de datos (`requestAPI`), flags de interfaz, y filtros compartidos.
- `react-i18next`: uso de `t(...)` para textos en UI y descripciones de alertas.
- Claves de traducción neutrales y parametrizadas; evitar interpolar datos sensibles en textos.

## Flujos típicos
- Mapa → seleccionar dispositivo → `CityVisualization` → navegar a `traffic-prevalidation` y focalizar datos.
- Prevalidación → aplicar filtros → revisar listado → abrir detalle → acción de corrección/edición.
- Consultas → búsqueda avanzada → abrir registro → compartir/editar según permisos.
- Estadísticos → configurar filtros → visualizar gráficos y tarjetas.

## Integraciones HTTP y Tiempo Real
- HTTP: las integraciones se describen de forma general en el README técnico; las URLs y claves se parametrizan por entorno.
- Tiempo real: el módulo consume actualizaciones y eventos de dispositivos mediante el mecanismo ya documentado en la sección “Tiempo Real”.

## Buenas prácticas
- Variables de entorno: claves API (mapa/tráfico) deben configurarse vía `.env` y no hardcodearse.
- Errores y mensajes: mantener neutralidad y no exponer detalles internos.
- Rendimiento: limitar peticiones por zoom/map bounds, evitar duplicados y aplicar debounce donde corresponda.
- Seguridad: respetar permisos por sección y acciones; validar entrada y sanitizar salida.

## Extensión y pruebas
- Extender gráficos: añadir nuevos charts en `Stats` siguiendo el patrón de componentes.
- Ampliar filtros: reutilizar `Filters` y contexto para coherencia global.
- Pruebas: cubrir ordenación/filtrado en Prevalidación y Consultas, navegación entre secciones, y renderizado condicional por permisos.

## Mapa de archivos (estructura)
```
src/pages/Suite/City/Traffic/
├── AlertsMap/AlertsMap.jsx
├── ConfGrid/
│   ├── ConfGrid.jsx
│   ├── ConfGrid.module.css
│   ├── Menu/Menu.jsx
│   ├── Menu/Menu.module.css
│   ├── ModalAdd/ModalAdd.jsx
│   ├── ModalAdd/ModalAdd.module.css
│   ├── ModalUpdate/ModalUpdate.jsx
│   └── SortableGrid/
│       ├── SortableGrid.jsx
│       └── SortableGrid.module.css
├── Consulting/Consulting.jsx
├── Infringements/Infringements.jsx
├── Lists/Lists.jsx
├── Prevalidation/Prevalidation.jsx
└── Stats/
    ├── Filters/Filters.jsx
    ├── MapChart/MapChart.jsx
    ├── MapChart/MapChart.module.css
    ├── SpeedChart/SpeedChart.jsx
    ├── Stats.jsx
    ├── Stats.module.css
    ├── TrafficChart/TrafficChart.jsx
    └── VehiclesChart/
        ├── VehiclesChart.jsx
        └── VehiclesChart.module.css

components/Maps/MapV4/Components/TrafficComponent/TrafficComponent.jsx
components/DataVisualization/City/CityVisualization.jsx
```

## Notas de configuración
- Definir `MAP_TOMTOM_API_KEY` (o equivalente) en el entorno de despliegue.
- Alinear las URLs de backends y servicios con la sección “Construcción y Despliegue” del README técnico.