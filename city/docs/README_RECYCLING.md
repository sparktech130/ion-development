# ION Recycling — Documentación Técnica
> Última actualización: v3.0.4.26

Documento técnico del módulo ION Recycling, con información neutra y sin datos sensibles.

## Resumen funcional
- Vista en vivo de reciclaje con dispositivos y eventos asociados.
- Filtros básicos y visualización contextual.

## Navegación y rutas
Mapeo en `Dashboard.jsx`:
- `recycling-live` → `RecyclingLive`

## Permisos por sección (referencia)
Definidos en `permissionsImplemented.js`:
- `0149` → `recycling-live` → `consultas`, `editar`, `compartir`

## Arquitectura y componentes
- `Live/RecyclingLive.jsx`: renderiza el mapa/listado asociado al módulo Recycling.
- Puede reutilizar componentes compartidos de Live, Box, filtros y el contexto principal.

## Contextos e i18n
- `MainDataContext`: navegación, carga de datos y estado.
- `react-i18next`: textos con claves neutrales.

## Flujos típicos
- Live → seleccionar dispositivo/evento → ver detalle o acciones disponibles según permisos.

## Integraciones y tiempo real
- HTTP: configuradas por entorno.
- Tiempo real: suscripción global a eventos de dispositivos.

## Buenas prácticas
- Evitar exponer datos sensibles; mensajes neutrales.
- Validación de filtros y entradas.

## Estructura de archivos
```
src/pages/Suite/City/Recycling/
└── Live/RecyclingLive.jsx
```