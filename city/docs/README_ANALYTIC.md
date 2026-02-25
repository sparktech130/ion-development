# ION Analytic — Documentación Técnica
> Última actualización: v3.0.4.26

Documento técnico del módulo ION Analytic, orientado a mapas analíticos, investigaciones y auditoría, sin información sensible.

## Resumen funcional
- Mapa analítico con carga de ficheros, filtros y visualizaciones avanzadas.
- Investigaciones con organización de casos y elementos.
- Auditoría de acciones y eventos.

## Navegación y rutas
Mapeo base en `Dashboard.jsx`:
- `analytic-live` → `AnalyticMap`

Componentes adicionales presentes en el repositorio (activables según configuración):
- `Investigations/Investigations.jsx` → Gestión de investigaciones, vista de `Investigation.jsx` por caso.
- `AnalyticAudit/AnalyticAudit.jsx` → Vista de auditoría.

## Permisos por sección (referencia)
Definidos en `permissionsImplemented.js`:
- `0092` → `analytic-live` → `consultas`, `editar`, `compartir`
- `0093` → `analytic-consulting` → `consultas`, `editar`, `compartir`
- `0094` → `analytic-audit` → `consultas`, `compartir`

## Arquitectura y componentes
- `AnalyticMap/AnalyticMap.jsx`: mapa analítico.
  - Modales: `AddFileModal`, `AddModal`, `FilesModal`, `FilterModal`, `RadarModal`, `UpdateModal`.
- `Investigations/Investigations.jsx`: lista y detalle de investigaciones (`Investigation.jsx`).
- `AnalyticAudit/AnalyticAudit.jsx`: auditoría con estilos dedicados.

## Contextos e i18n
- `MainDataContext`: navegación, carga de datos y estado.
- `react-i18next`: textos neutralizados.

## Flujos típicos
- Analytic Map → aplicar filtros/cargar ficheros → visualizar capas y resultados.
- Investigations → crear/editar casos → gestionar elementos relacionados.
- Audit → consultar eventos/auditorías según permisos.

## Integraciones y tiempo real
- HTTP: URLs y claves parametrizadas por entorno.
- Tiempo real: uso del mecanismo global cuando aplica.

## Buenas prácticas
- No hardcodear claves en modales de ficheros; usar entorno.
- Mensajes de error neutrales; sanitizar valores al renderizar.

## Estructura de archivos
```
src/pages/Suite/City/Analytic/
├── AnalyticMap/*
├── Investigations/*
└── AnalyticAudit/*
```