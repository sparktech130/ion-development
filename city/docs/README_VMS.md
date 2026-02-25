# ION VMS — Documentación Técnica
> Última actualización: v3.0.4.26

Documento técnico del módulo ION VMS (Video Management System), sin información sensible.

## Resumen funcional
- Visualización en vivo de cámaras y paneles.
- Gestión y exploración de ficheros asociados.

## Navegación y rutas
Rutas típicas mapeadas desde `Dashboard.jsx` (según permisos y configuración):
- `vms-live` → `LiveVMS`
- `ms-files` → `Files`

## Permisos por sección (referencia)
Definidos en `permissionsImplemented.js`:
- `0079` → `vms-live` → `consultas`, `editar`, `compartir`
- `0080` → `ms-files` → `consultas`, `editar`, `compartir`

## Arquitectura y componentes
- `Live/LiveVMS.jsx`: vista principal de VMS.
  - Subcomponentes: `Grid`, `Menu`, `VMSRight` (con subcarpetas: `Movements`, `Recognitions`, `RecognitionsV2`, `VmsAlerts`).
- `Files/Files.jsx`: gestor de ficheros.
  - Subcomponentes: `File/File.jsx` y estilos.

## Contextos e i18n
- `MainDataContext`: navegación, carga de datos y estado.
- `react-i18next`: textos con claves neutrales.

## Flujos típicos
- VMS Live → seleccionar cámara/panel → visualizar movimientos/reconocimientos/alertas.
- Files → buscar/filtrar → abrir fichero → acciones según permisos.

## Integraciones y tiempo real
- HTTP: servicios parametrizados por entorno.
- Tiempo real: suscripción y actualización de streams/eventos.

## Buenas prácticas
- Mensajes neutros; no exponer rutas internas ni tokens en UI.
- Validar entradas de filtros y nombres de ficheros.

## Estructura de archivos
```
src/pages/Suite/City/VMS/
├── Live/
│   ├── LiveVMS.jsx
│   ├── Grid/*
│   ├── Menu/*
│   └── VMSRight/*
└── Files/
    ├── Files.jsx
    └── File/*
```