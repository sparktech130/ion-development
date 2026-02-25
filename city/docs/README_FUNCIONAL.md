# Documento Funcional Profesional — ION SMART City

> Última actualización: v3.0.4.35

**Propósito**
- Orquestar la operación integral de una Smart City: tráfico, movilidad, infracciones, VMS, reciclaje, configuración y mantenimiento.
- Proveer vistas en tiempo real y herramientas de análisis histórico con filtros avanzados, prevalidación de eventos y generación de informes.

**Alcance y Objetivos**
- Unificar la experiencia de usuario para operadores, administradores y analistas.
- Reducir tiempos de respuesta ante incidentes y mejorar la toma de decisiones basada en datos.
- Garantizar seguridad, trazabilidad y cumplimiento de permisos/licencias.

**Stakeholders y Roles**
- Administrador: gestión completa del sistema, usuarios, permisos y licencias.
- Operador: supervisión live, prevalidación y consultas históricas según permisos.
- Analista: explotación de datos y generación de informes.
- Integrador/Técnico: mantenimiento de dispositivos, servidores y conexiones.

**Permisos y Licencias**
- Permisos granulares por sección: `acceso`, `consultas`, `editar`, `compartir`.
- Licencias por módulo y canal asignadas al usuario; algunas secciones pueden no requerir licencia.
- Validación de permisos/licencias en la barra lateral y al renderizar secciones.

**Navegación y Rutas**
- Entrada principal `GET /city`.
- `Dashboard` si existe sesión; `Login` en caso contrario.
- `GET /city/videowall` para modo videowall.
- Navegación interna controlada por `section` y `module` (estado global).

**Módulos y Secciones**
- Tráfico: `traffic-live`, `traffic-consulting-consults`, `traffic-prevalidation`, `traffic-stats`, `traffic-settings-*`.
- Movilidad: `mobility-live`, `mobility-consulting-consults`, `mobility-persons-consults`, `mobility-prevalidation`, `mobility-stats-*`, `mobility-settings-*`.
- Infracciones: `infringement-live`, `infringement-sending`, `infringement-consulting-consults`, `infringement-campaigns`, `infringement-stats`.
- VMS: `vms-live`, `vms-files`, `vms-settings-grid`.
- Configuración: `configuration-devices`, `configuration-cloud`, `configuration-licenses`, `configuration-users`, `configuration-permissions`, `configuration-audit`, `configuration-vehicles`, `configuration-integrations`.
- Mantenimiento: `maintenance-servers`.
- Información: documentación y enlaces.

**Flujos Clave**
- Autenticación 2FA: login, verificación de código, obtención de `token`, `permisosSecciones`, `licencias`, `defaultCoords`, `server`.
- Live y Alertas: visualización de dispositivos, zonas y alertas; suscripción a rooms socket con reconexión automática.
- Consultas: listados y grids con filtros avanzados; detalle con visor de evidencia y reproducción secuencial.
- Prevalidación: bandeja de alertas pendientes con acciones de validación.
- Estadísticas: indicadores y gráficos por módulo.
- Exportación: CSV y PDF (según sección) para informes y evidencia.

**Entidades y Datos Clave**
- Usuario y permisos/licencias.
- Dispositivo (cámara, PTZ, VMS, canal): atributos, estado y asociación a zonas.
- Área/Zona: límites, autorizaciones y restricciones.
- Reconocimiento Vehicular: matrícula, nacionalidad, marca/modelo, color, velocidad, orientación, alertas.
- Reconocimiento de Personas: género, edad, vestimenta, conductas; evidencia asociada.
- Alerta: códigos, estados y flujo de validación.

**No Funcionales**
- Rendimiento: cache de estadísticas, paginación/limit en consultas, carga diferida de librerías.
- Seguridad: token Bearer, cierre de sesión por caducidad, CORS y sockets con credenciales.
- Disponibilidad: manejo de errores global y reconexión a tiempo real.
- Escalabilidad: separación por módulos, endpoints agrupados y filtros selectivos.

**Internacionalización y Accesibilidad**
- Idiomas `ca`, `en`, `es`, `ja` con textos gestionados vía i18n.
- Accesibilidad: iconos accesibles, foco y navegación por teclado.

**KPIs de Operación**
- Tiempo medio de respuesta en prevalidación.
- Número de reconocimientos procesados por período.
- Tasa de acierto de detecciones (confidence medio).
- Disponibilidad de servicios en tiempo real.

**Riesgos y Supuestos**
- Dependencia de terceros para mapas y enrutamiento.
- Variabilidad de calidad de datos según dispositivo y canal.
- Latencia en reconexión de sockets y carga de recursos.

**Roadmap Funcional**
- Deep-linking por `section`.
- Mejora de informes para movilidad/personas (PDF).
- Panel integrado de cumplimiento y auditoría.
