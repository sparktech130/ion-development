# Utilidades y Constantes Comunes
> Última actualización: v3.0.4.35

Este documento centraliza la información de utilidades y constantes compartidas por toda la aplicación, con foco en:

- `src/constants/icons.js`
- `src/constants/common.js`
- `src/utils/conversions.js`
- `src/api/services/autocomplete.js`

Incluye qué exporta cada archivo, cómo se usan sus utilidades y buenas prácticas para extenderlas de forma segura.

## Resumen funcional
- Define iconografía por sección, módulo, alertas, dispositivos y análisis (`icons.js`).
- Mantiene constantes transversales: rutas base, códigos de alerta/módulo, idiomas, colores, tipos de vehículo y datos de autocompletado (`common.js`).
 - Cambios recientes relevantes:
   - `src/constants/common.js`: constante `version` actualizada a `v3.0.4.35`.
   - `src/utils/functions/functions.js`: `checkArray` ahora admite `min` para comprobar longitud mínima (`checkArray(array, min = 1)`).
- Ofrece funciones de conversión y formateo para UI y datos (números, colores, tipo de vehículo, estado, orientación, almacenamiento, paletas) (`conversions.js`).
- Proporciona servicios HTTP para obtener listas de autocompletado desde el backend (dispositivos, zonas, listas, usuarios, grids, instancias IA) (`autocomplete.js`).

## Contratos de datos comunes
- Elementos de autocompletado: `[{ cod, name, nameCode?, hex?, ...extra }]`
- Items de filtro (`FilterSectionElement`): props clave
  - `items`: array con las claves anteriores
  - `itemName`: nombre del campo a mostrar (`name` o `email`, etc.)
  - `defaultItem`: valor por defecto (string o código)
  - `strictInput`: fuerza selección entre items disponibles
- `InputItems` acepta también `itemNameInfo` para mostrar información secundaria (p.ej. `email` + `name`).

## `src/constants/icons.js`
Exportaciones clave:
- `sectionIcons`: Mapa de secciones (LIVE, CONSULTAS, ALERTAS, etc.) a sus SVGs.
- `modulesIcons`: Mapa de códigos de módulo (`0000`, `0108`, `0010`, `0015`, etc.) a iconos.
- `cityAlertsIcons`: Mapa de códigos de alerta de City (`0001`…`0103`, `0110`) a iconos.
- `vehicleIcons`: Mapa de nombre de vehículo (usa `tiposVehiculo` de `common.js`) a icono.
- `deviceIcons`: Mapa de códigos de dispositivo (`0001`…`0006`) a icono.
- `markerIcons`: Mapa de códigos de marcador a icono.
- `analysis_icons`: Conjunto de iconos para rasgos de análisis (teléfono, gafas, etc.).

Uso típico:
- Importar mapas y usarlos para pintar iconos en menús, tarjetas o listas según código/clave.
- Para vehículos, se apoya en `tiposVehiculo` para mantener consistencia entre nombre y icono.

Buenas prácticas:
- Si se añade un nuevo tipo de vehículo, sincronizar en: `constants/common.js` (`tiposVehiculo`), `constants/icons.js` (`vehicleIcons`) y `utils/conversions.js` (`vehicleConversion`).
- Mantener la correspondencia 1:1 entre códigos y recursos SVG para evitar iconos rotos.

## `src/constants/common.js`
Exportaciones clave (selección):
- Rutas base: `url_path`, `url_path_ioncity`, `url_path_city`.
- Códigos de alertas: `alert_codes`, `alert_codes_traffic`, `alerta_codes_mob`.
- Listas base: `paises` (ISO), `idiomas` (códigos y nombres).
- Clasificación de dispositivos: `streamDevices`, `sensorDevices`, `engineDevices`.
- Módulos y análisis: `infractionModules`, `lprCodes`.
- Colores de zonas: `zoneColors`.
- Datos de la pantalla de inicio: `home` y `smartcity_modules` (metadatos por módulo).
- Autocompletado local: `autocompleteColors` (cod, nameCode, hex).
- Valores comunes UI: `tiposVehiculo`, `direccionCamara`, `areaTypes` (y otros).

Uso típico:
- Fuente única de verdad para claves y listas compartidas en filtros, menús y validaciones.
- `autocompleteColors` se usa en filtros y conversiones para mantener texto y color consistente con i18n (`nameCode`).

Buenas prácticas:
- Al añadir elementos (vehículos, colores, áreas), mantener `nameCode` alineado con las claves de `react-i18next`.
- Evitar duplicados de códigos y mantener compatibilidad con componentes que esperan propiedades estándar (`cod`, `name`, `nameCode`, `hex`).

## `src/utils/conversions.js`
Funciones disponibles:
- `numberConversion(total)`: Formatea números grandes con sufijos `K/M/B/T/Q`.
- `confidenceConversion(currentData)`: Devuelve clase CSS por fiabilidad (`low/medium/high`).
- `orientationConversion(currentData)`: Mapea dirección/orientación a texto (`Entrada/Salida/Sin identificar`).
- `colorConversion(color)`: Convierte un `cod` de color a `nameCode` usando `autocompleteColors`.
- `vehicleConversion(currentData)`: Convierte `tipo_vh` a texto estándar (usa lista fija).
- `statusConversion(status)`: Mapea estado de alerta/expediente a texto (`Pendiente/Rechazada/Enviada`).
- `validField(value)`: Devuelve valor o `-` si está vacío/indefinido.
- `occupationIndexConversion(percentage, type)`: Texto y color por ocupación (p.ej. residuos).
- `convertGB(valueInGB)`: Convierte GB a `MB/GB/TB` según magnitud.
- `generateMatchingColors(baseColor, count)`: Genera paleta armónica desde un `hex` base.

Uso típico:
- En componentes de consulta, prevalidación y live para homogeneizar presentación y lógica UI.
- `colorConversion` y `vehicleConversion` se emplean en tarjetas de reconocimiento y filtros.

Buenas prácticas:
- Si se amplía el set de vehículos/colores, actualizar los mapeos aquí para evitar valores sin traducir.
- Mantener funciones puras y sin efectos secundarios; retornar valores estables para facilitar tests.

## `src/api/services/autocomplete.js`
Servicios disponibles:
- `getAutocompleteListas()`: Listas de Traffic → `[{ name, cod }]`.
- `getAutocompleteAreas()`: Zonas de Mobility → `[{ name, cod }]`.
- `getAutocompleteTowns()`: Poblaciones → `[{ cod, name, cod_provincia }]`.
- `getAutocompleteRegions()`: Provincias → `[{ cod, name }]`.
- `getAutocompleteDevices(params)`: Dispositivos → `[{ cod, name, cod_category, model }]`.
- `getAutocompleteClouds()`: Clouds de NX → `[{ cod, name }]`.
- `getAutocompleteCategories()`: Categorías de dispositivos → `[{ cod, name }]`.
- `getAutocompleteClients()`: Clientes → `[{ cod, name }]`.
- `getAutocompleteUsers()`: Usuarios → `[{ cod, name, email }]`.
- `getAutocompleteGrids(cod_modulo)`: Grids por módulo → `[{ cod, name, devices }]`.
- `getAutocompleteInstances()`: Instancias IA CVEDIA → `instances`.

Detalles técnicos:
- Depende de `getRequestAPI()` y `getUrlOriginAcces()` de `context/accesContext`.
- Usa rutas definidas en `src/api/connections/urls.js` y `urlsAI`.
- Endpoints IA relevantes: `URL_OBTENER_INSTANCIAS_AI` (`/instancias/obtener.php`) y `URL_CREAR_INSTANCIAS_AI` (`/instancias/crear.php`).
- Estructuras de retorno estandarizadas para compatibilidad con componentes de filtros (`FilterSectionElement`, `InputItems`).

Patrones de uso:
- Cargar autocompletes al montar el componente si el estado local está vacío; cachear en `MainDataContext` cuando aplique (p.ej. `autocompleteCountries`).
- Pasar `modulos` al solicitar dispositivos para limitar por módulo (`getAutocompleteDevices({ modulos: ['0011'] })`).

## Guías de extensión
- Añadir un color nuevo al autocompletado
  - Incluir en `constants/common.js` un objeto `{ nameCode, cod, hex }`.
  - Crear la clave `nameCode` en ficheros de traducción (`public/locales/*/*.json|js`).
  - Si aplica, ajustar estilos donde se muestre el color (`.module.css`).
  - Confirmar que `colorConversion` retorna la nueva clave correctamente.
- Añadir un tipo de vehículo nuevo
  - Añadir entrada en `constants/common.js` → `tiposVehiculo`.
  - Mapear icono en `constants/icons.js` → `vehicleIcons`.
  - Actualizar `vehicleConversion` para contemplar los nuevos códigos.
- Añadir una alerta nueva
  - Añadir código en `constants/common.js` (`alert_codes` o específico por módulo).
  - Mapear icono en `constants/icons.js` → `cityAlertsIcons`.
  - Añadir traducción y uso en filtros/tarjetas que referencien el código.

## Autocomplete: patrones y recomendaciones
- Carga perezosa y cache
  - Cargar listas en `useEffect` solo si el estado está vacío.
  - Centralizar datos globales (p.ej. `autocompleteCountries`) en `MainDataContext`.
- Concurrencia y UX
  - Lanzar llamadas en paralelo cuando no existan dependencias (p.ej. listas y dispositivos).
  - Mostrar estado de carga con `setIsLoading` y mensajes con `setInfoMessage` si aplica.
- Errores y resiliencia
  - Servicios devuelven `[]` en error; validar siempre la estructura antes de usar.
  - Evitar suposiciones de longitud; proteger selecciones con `strictInput`.

## Internacionalización
- Las claves `nameCode` referencian entradas de `react-i18next`.
- Mantener consistencia de claves (`values.*`, `colors.*`, `sections.*`).
- Añadir nuevas traducciones en `public/locales/*` y validar que se resuelven en UI.

## Rendimiento y consistencia
- Evitar renders innecesarios memorizando listas estáticas en contexto o constantes.
- Mantener estructuras homogéneas para que `FilterSectionElement` e `InputItems` funcionen sin ramificaciones.
- Reutilizar `conversions.js` en lugar de duplicar lógica en componentes.

## Testing rápido
- Unidad: probar entradas y salidas de cada conversión (vehículo, color, estado, orientación).
- Integración: verificar que los servicios de `autocomplete` mapean correctamente la respuesta del backend.
- UI: comprobar que los filtros muestran texto traducido y aplican `strictInput` cuando corresponde.

## Dependencias y rutas
- Iconos SVG usan import con `?react` para generar componentes.
- Aliases de import (p.ej. `@api`, `@constants`, `@icons`) configurados en `vite.config.js`.
- Contextos relevantes: `src/context/MainDataContext.jsx` (p.ej. `autocompleteCountries`).

## Buenas prácticas y extensibilidad
- Mantener un único origen para listas: si son estáticas, en `common.js`; si son dinámicas, en servicios de `autocomplete.js`.
- Añadir nuevas opciones de UI siguiendo el contrato `{ cod, name, nameCode?, hex? }`.
- Actualizar en conjunto `common.js`, `icons.js` y `conversions.js` cuando se introducen nuevos tipos/colores/códigos.
- Alinear `nameCode` con claves de traducción en `react-i18next`.

## Ubicación y dependencias
- Constantes: `src/constants/`.
- Utilidades: `src/utils/`.
- Servicios: `src/api/services/`.
- Contexto: `src/context/MainDataContext.jsx` expone `autocompleteCountries` y otros estados comunes.