# Configuración — Documentación Técnica
> Última actualización: v3.0.4.26

Documento técnico de la sección de Configuración, con contenido neutral y sin datos sensibles. Describe rutas, permisos, arquitectura y flujos.

## Resumen funcional
- Administración de dispositivos, usuarios, permisos y clientes.
- Gestión de licencias y generación de licencias.
- Configuración de integraciones y servicios externos.
- Catálogo de vehículos y auditoría.

## Navegación y rutas
Mapeo en `Dashboard.jsx` (secciones principales):
- `configuration-devices` → `Devices`
- `configuration-users` → `Users`
- `configuration-cloud` → `Clouds`
- `configuration-licenses` → `LicensesV4`
- `configuration-clients` → `Clients`
- `configuration-generator` → `LicenseGenerator`
- `configuration-permissions` → `Permissions`
- `configuration-vehicles` → `Vehicles`
- `configuration-audit` → `Audit`
- `configuration-integrations` → `Integrations`

## Permisos por sección (referencia)
Definidos en `src/pages/Configuration/Permissions/permissionsImplemented.js`:
- `0082` → `configuration-devices` → `consultas`, `editar`, `compartir`
- `0083` → `configuration-cloud` → `consultas`, `editar`, `compartir`
- `0084` → `configuration-users` → `consultas`, `editar`, `compartir`
- `0085` → `configuration-permissions` → `consultas`, `editar`, `compartir`
- `0086` → `configuration-licenses` → `consultas`, `editar`
- `0087` → `configuration-audit` → `consultas`, `compartir`
- `0088` → `configuration-clients` → `consultas`, `editar`
- `0089` → `configuration-generator` → `consultas`, `editar`
- `0106` → `configuration-vehicles` → `consultas`, `editar`, `compartir`
- `0147` → `configuration-integrations` → `consultas`, `editar`

## Arquitectura y componentes
- `Devices/Devices.jsx` (+ `DeviceCard`, `CurrentDevice`, modales de alta/actualización): gestión de dispositivos.
- `Users/Users.jsx`: administración de usuarios.
- `Permissions/Permissions.jsx`: gestión de permisos y perfiles; soporta acciones según permisos definidos.
- `Licenses/LicensesV4.jsx`: gestión de licencias, modales de detalle (`LicensesModal`, `LicensesCard`).
- `LicenseGenerator/LicenseGenerator.jsx`: generación de licencias.
- `Clients/Clients.jsx`: administración de clientes.
- `Vehicles/Vehicles.jsx`: catálogo de vehículos.
- `Audit/Audit.jsx`: auditoría de eventos/acciones.
- `Cloud/Clouds.jsx`: configuración de integración cloud; modales de sincronización (`SyncModal`, `LocationModal`, `ModelModal`, `ModuleModal`).
- `Integrations/Integrations.jsx`: configuración de integraciones con servicios externos.

## Contextos e i18n
- `MainDataContext`: navegación, carga de datos y estado global.
- `react-i18next`: textos y descripciones con claves neutrales.

## Flujos típicos
- Dispositivos → alta/actualización → asociar a instancias/servicios.
- Usuarios → crear/editar → asignar permisos.
- Permisos → definir perfiles → aplicar a secciones.
- Licencias → gestionar licencias existentes → generar nuevas.
- Cloud/Integrations → configurar endpoints/credenciales por entorno.
- Auditoría → revisar eventos y acciones registradas.

## Integraciones y entorno
- HTTP y servicios externos parametrizados por entorno (ver `README_TECNICO.md`).
- No almacenar claves de servicios en el código; usar variables de entorno.

## Buenas prácticas
- Validar formularios y sanitizar entradas.
- Mensajes neutrales sin detalles internos.
- Respetar permisos antes de mostrar acciones.

## Estructura de archivos
```
src/pages/Configuration/
├── Devices/*
├── Users/*
├── Permissions/*
├── Licenses/*
├── LicenseGenerator/*
├── Clients/*
├── Vehicles/*
├── Audit/*
├── Cloud/*
└── Integrations/*
```