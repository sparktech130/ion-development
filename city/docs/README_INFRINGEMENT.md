# ION Infringement — Documentación Técnica
> Última actualización: v3.0.4.34

Este documento recoge arquitectura, flujos y componentes del módulo ION Infringement, en términos neutros y sin exponer datos sensibles.

## Resumen funcional
- Monitorización en mapa con altas/actualizaciones de infracciones.
- Envíos y gestión de expedientes/casos.
- Consultas y campañas.
- Estadísticos del módulo.

## Navegación y rutas
Mapeo en `Dashboard.jsx`:
- `infringement-live` → `InfringementAlertsMap`
- `infringement-sending` → `InfringementSending`
- `infringement-consulting-consults` → `InfringementConsulting`
- `infringement-campaigns` → `Campaigns`
- `infringement-stats` → `InfringementStats`

## Permisos por sección (referencia)
Definidos en `permissionsImplemented.js`:
- `0070` → `infringement-live` → `consultas`, `editar`, `compartir`
- `0075` → `infringement-sending` → `consultas`, `editar`, `compartir`
- `0076` → `infringement-consulting-consults` → `consultas`, `editar`, `compartir`
- `0077` → `infringement-consulting-reports` → `consultas`, `editar`, `compartir`
- `0078` → `infringement-stats` → `consultas`
- `0105` → `infringement-campaigns` → `consultas`, `editar`, `compartir`

## Arquitectura y componentes
- `AlertsMap/InfringementAlertsMap.jsx`: mapa con infracciones; modales de alta (`AddModal`) y actualización (`UpdateModal`).
- `Sending/InfringementSending.jsx`: flujo de envío/gestión de expedientes.
- `Consulting/InfringementConsulting.jsx`: consultas y listados; abre detalle para editar/compartir según permisos.
- `Campaigns/Campaigns.jsx`: campañas y la vista de `Campaign.jsx` por elemento.
- `Stats/InfringementStats.jsx`: estadísticas del módulo; subcomponentes para gráficos (`ModuleChart`, `TrafficChart`) y filtros.

## Contextos e i18n
- `MainDataContext`: estado de módulo, navegación, carga de datos y filtros.
- `react-i18next`: textos y descripciones con claves neutrales.

## Flujos típicos
- Live → alta/actualización de infracción → consulta y seguimiento.
- Envío → preparar expediente → gestionar estados y acciones.
- Campañas → crear/editar campañas → seguimiento.
- Estadísticos → filtrar por rango/instancia → visualizar métricas.

## Integraciones y tiempo real
- HTTP: parametrizadas por entorno.
- Tiempo real: notificaciones y actualizaciones vía sockets globales.

## Buenas prácticas
- Mensajes de error neutrales y sin detalles internos.
- Validar y sanitizar entradas en modales y formularios.
- Aplicar permisos por sección antes de mostrar acciones.

## Estructura de archivos
```
src/pages/Suite/City/Infringement/
├── AlertsMap/
│   ├── InfringementAlertsMap.jsx
│   ├── AddModal/*
│   └── UpdateModal/*
├── Sending/InfringementSending.jsx
├── Consulting/InfringementConsulting.jsx
├── Campaigns/
│   ├── Campaigns.jsx
│   └── Campaign/Campaign.jsx
└── Stats/
    ├── InfringementStats.jsx
    ├── Filters/Filters.jsx
    ├── ModuleChart/*
    └── TrafficChart/TrafficChart.jsx
```