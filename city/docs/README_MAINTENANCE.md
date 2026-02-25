# Mantenimiento — Documentación Técnica
> Última actualización: v3.0.4.34

Documento técnico de la sección de Mantenimiento, con enfoque neutral y sin datos sensibles.

## Resumen funcional
- Monitoriza servidores y servicios asociados.
- Visualiza métricas de estado y rendimiento.

## Navegación y rutas
Mapeo en `Dashboard.jsx`:
- `maintenance-servers` → `Servers`

## Arquitectura y componentes
- `Servers/Servers.jsx`: vista principal para listar/gestionar servidores.
- `Servers/CurrentServer.jsx`: detalle del servidor seleccionado.
- `Servers/Stats/*`: métricas y visualizaciones específicas:
  - `ProcessorStats.jsx`, `MemoryStats.jsx`, `PowerStats.jsx`, `ThermalStats.jsx`.
  - `StatsWrapper.jsx`: contenedor de métricas.
  - `Stats.module.css`: estilos de la sección.

## Contextos e i18n
- `MainDataContext`: navegación y carga de datos.
- `react-i18next`: textos internacionalizados con claves neutrales.

## Flujos típicos
- Lista de servidores → seleccionar uno → revisar métricas en tiempo cercano a real.
- Visualización por tipo de métrica → analizar tendencias y valores actuales.

## Integraciones y entorno
- HTTP: endpoints y servicios parametrizados por entorno (ver `README_TECNICO.md`).
- Evitar hardcodear host/credenciales; usar variables de entorno.

## Buenas prácticas
- Neutralidad en mensajes de error; no exponer detalles internos.
- Controles de rendimiento: evitar peticiones duplicadas; aplicar intervalos razonables.
- Validación de entradas en filtros/selecciones.

## Estructura de archivos
```
src/pages/Maintenance/
└── Servers/
    ├── Servers.jsx
    ├── CurrentServer.jsx
    └── Stats/
        ├── ProcessorStats.jsx
        ├── MemoryStats.jsx
        ├── PowerStats.jsx
        ├── ThermalStats.jsx
        ├── StatsWrapper.jsx
        └── Stats.module.css
```