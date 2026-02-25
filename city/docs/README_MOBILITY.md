# ION Mobility — Documentación Técnica
> Última actualización: v3.0.4.34

Este documento describe arquitectura, flujos y componentes del módulo ION Mobility. Se mantiene neutral y sin información sensible.

## Resumen funcional
- Monitorización de movilidad y peatones, alertas y análisis IA.
- Consultas y prevalidación de reconocimientos y eventos.
- Estadísticos de movilidad y transporte.
- Configuración de zonas, infracciones y rejillas del módulo.

## Navegación y rutas
Mapeo en `Dashboard.jsx`:
- `mobility-live` → `MobilityAlertsMap`
- `mobility-consulting-consults` → `MobilityConsulting`
- `mobility-persons-consults` → `MobilityPedestrians`
- `mobility-prevalidation` → `MobilityPrevalidation`
- `mobility-stats-mobility` → `MobilityStats`
- `mobility-stats-transport` → `TransportStats`
- `mobility-settings-zones` → `MobilityZones`
- `mobility-settings-infringements` → `Infringements modulo={11}`
- `mobility-settings-grid` → `ConfGrid modulo={11}`

## Permisos por sección (referencia)
Definidos en `permissionsImplemented.js`:
- `0066` → `mobility-live` → `consultas`, `editar`, `compartir`
- `0067` → `mobility-consulting-consults` → `consultas`, `editar`, `compartir`
- `0158` → `mobility-consulting-consults` (variante) → `consultas`, `editar`, `compartir`
- `0068` → `mobility-consulting-reports` → `consultas`, `editar`, `compartir`
- `0069` → `mobility-prevalidation` → `consultas`, `editar`, `compartir`
- `0071` → `mobility-stats-mobility` → `consultas`
- `0157` → `mobility-stats-transporte` → `consultas`
- `0073` → `mobility-settings-zones` → `consultas`, `editar`, `compartir`
- `0091` → `mobility-settings-infringements` → `consultas`, `editar`, `compartir`

## Arquitectura y componentes
- `AlertsMap/MobilityAlertsMap.jsx`: mapa con dispositivos y alertas de movilidad.
- `Consulting/MobilityConsulting.jsx`: consultas y listados de movilidad.
- `Pedestrians/MobilityPedestrians.jsx`: consultas centradas en personas/peatones.
- `Prevalidation/MobilityPrevalidation.jsx`: filtros avanzados, rejilla y reproducción del listado.
- `MobilityStats/MobilityStats.jsx`: indicadores de movilidad; subcomponentes en `Components` (edad, género, nacionalidad, tipos de vehículo, eco labels, tráfico). 
- `TransportStats/TransportStats.jsx`: métricas de transporte; subcomponentes (pasajeros, tiempos de parada, precisión, etc.).

- Nota técnica: los componentes `MobilityStats.jsx` y `TransportStats.jsx` se han actualizado para pasar `{ days: 365 }` al mensaje de error `errors.dateRangeExceeded` cuando aplica el control de rango máximo.
- `Zones/MobilityZones.jsx`: gestión de zonas; incluye modal de alta y estilos.
- `Infringements/Infringements.jsx`: catálogo reutilizado con `modulo={11}` para Mobility.
- `ConfGrid/ConfGrid.jsx`: configuración de rejillas para el módulo Mobility.

## Contextos e i18n
- `MainDataContext`: navegación, carga de datos, flags y filtros.
- `react-i18next`: `t(...)` para textos y descripciones; claves neutrales.

## Flujos típicos
- Mapa → seleccionar dispositivo/evento → navegar a `mobility-prevalidation`.
- Consultas → filtros avanzados → abrir registro → acciones según permisos.
- Estadísticos → configurar filtros → visualizar gráficos y tarjetas.
- Zonas → crear/editar zonas y aplicar en vistas.

## Integraciones y tiempo real
- HTTP: parametrizadas por entorno (ver README Técnico).
- Tiempo real: actualizaciones mediante el mecanismo global de sockets (documentado en README Técnico).

## Buenas prácticas
- Evitar datos sensibles en textos y descripciones.
- Optimizar peticiones en mapas por zoom/bounds; evitar duplicados.
- Validar entradas en filtros; permisos condicionan acciones.

## Estructura de archivos
```
src/pages/Suite/City/Mobility/
├── AlertsMap/MobilityAlertsMap.jsx
├── Consulting/MobilityConsulting.jsx
├── Pedestrians/MobilityPedestrians.jsx
├── Prevalidation/MobilityPrevalidation.jsx
├── MobilityStats/
│   ├── MobilityStats.jsx
│   └── Components/*
├── TransportStats/
│   ├── TransportStats.jsx
│   └── Components/*
└── Zones/
    ├── MobilityZones.jsx
    └── NewZoneModal/*
```