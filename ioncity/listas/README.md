# Listas y Notificaciones

## Descripción

El módulo de listas permite gestionar listas de vehículos (listas blancas y negras) y configurar destinatarios para recibir notificaciones automáticas cuando se detecta una matrícula según el tipo de lista.

## Funcionalidades

### Gestión de Listas
- **Crear, obtener, modificar y eliminar** listas de vehículos
- **Tipos de listas:**
  - `n` (negra): Vehículos no autorizados - **Notifica cuando la matrícula ESTÁ en la lista**
  - `b` (blanca): Vehículos autorizados - **Notifica cuando la matrícula NO ESTÁ en la lista**

### Comportamiento de Notificaciones por Tipo de Lista

#### Lista Negra (`desc_lista = 'n'`)
**Propósito**: Detectar vehículos no deseados o restringidos

**Comportamiento en tiempo real:**
- ✅ Matrícula **ESTÁ** en la lista → Se envía notificación
- ❌ Matrícula **NO ESTÁ** en la lista → No se notifica

**Notificaciones históricas:**
- ✅ Al añadir matrícula → Se envían reconocimientos históricos (últimos 30 días)
- ✅ Al importar vehículos → Se envían reconocimientos históricos consolidados
- ✅ Al añadir destinatario → Recibe reconocimientos históricos de todos los vehículos

**Ejemplo de uso**: Lista de vehículos robados, vehículos prohibidos, morosos, etc.

#### Lista Blanca (`desc_lista = 'b'`)
**Propósito**: Detectar vehículos no autorizados (los que NO están en la lista)

**Comportamiento en tiempo real:**
- ❌ Matrícula **ESTÁ** en la lista → No se notifica (vehículo autorizado)
- ✅ Matrícula **NO ESTÁ** en la lista → Se envía notificación (vehículo no autorizado)

**Notificaciones históricas:**
- ❌ Al añadir matrícula → NO se envían notificaciones históricas
- ❌ Al importar vehículos → NO se envían notificaciones históricas
- ❌ Al añadir destinatario → NO se envían notificaciones históricas

**Ejemplo de uso**: Lista de residentes autorizados, vehículos VIP, personal autorizado, etc.

#### Comportamiento con Múltiples Listas

Una matrícula puede estar en varias listas simultáneamente:
- Si está en lista negra A → Notifica a destinatarios de lista A
- Si NO está en lista blanca B → Notifica a destinatarios de lista B
- **Sin prioridades**: Cada lista genera su notificación independientemente

**Ejemplo práctico:**
```
Matrícula: 1234ABC
- Lista Negra "Morosos" → 1234ABC ESTÁ → ✅ Notifica
- Lista Blanca "Residentes" → 1234ABC NO ESTÁ → ✅ Notifica
- Lista Blanca "VIP" → 1234ABC ESTÁ → ❌ No notifica

Resultado: Se envían 2 notificaciones (una por cada lista que alerta)
```

### Gestión de Vehículos en Listas
- Añadir/eliminar vehículos a listas
- Importar vehículos desde CSV
- Buscar vehículos por matrícula

### Destinatarios de Notificaciones

#### Tabla: `listas_destinatarios`

```sql
CREATE TABLE `listas_destinatarios` (
    `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
    `cod_lista` INT(4) UNSIGNED ZEROFILL NOT NULL,
    `nombre` VARCHAR(120) DEFAULT NULL,
    `canal` ENUM('email','sms','whatsapp') NOT NULL DEFAULT 'email',
    `destinatario` VARCHAR(190) NOT NULL,
    `activo` TINYINT(1) NOT NULL DEFAULT 1,
    `creado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `actualizado_en` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `idx_lista_activo` (`cod_lista`, `activo`),
    CONSTRAINT `fk_destinatario_lista`
        FOREIGN KEY (`cod_lista`) REFERENCES `listas`(`cod_lista`)
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
```

**Si ya tienes la tabla creada, ejecuta este ALTER:**
```sql
ALTER TABLE `listas_destinatarios` 
ADD COLUMN `activo` TINYINT(1) NOT NULL DEFAULT 1 AFTER `destinatario`,
DROP INDEX `idx_lista`,
ADD INDEX `idx_lista_activo` (`cod_lista`, `activo`);
```

#### Campos:
- **id**: Identificador único del destinatario
- **cod_lista**: Código de la lista asociada
- **nombre**: Nombre descriptivo del destinatario (opcional)
- **canal**: Canal de notificación (`email`, `sms`, `whatsapp`)
- **destinatario**: Dirección de email, número de teléfono o ID según el canal
- **activo**: Estado del destinatario (1 = activo, 0 = inactivo). Solo los activos reciben notificaciones
- **creado_en**: Fecha y hora de creación
- **actualizado_en**: Fecha y hora de última actualización

### Endpoints API

#### Destinatarios

**POST** `/ioncity/listas/destinatarios/insertar`
```json
{
  "cod_lista": "0001",
  "canal": "email",
  "destinatario": "usuario@ejemplo.com",
  "nombre": "Juan Pérez"
}
```

**POST** `/ioncity/listas/destinatarios/obtener`
```json
{
  "cod_lista": "0001",
  "canal": "email",
  "soloActivos": true
}
```

**POST** `/ioncity/listas/destinatarios/modificar`
```json
{
  "id": 1,
  "destinatario": "nuevo@ejemplo.com",
  "nombre": "Juan Actualizado",
  "activo": true
}
```

**POST** `/ioncity/listas/destinatarios/cambiarEstado`
```json
{
  "id": 1,
  "activo": false
}
```

**POST** `/ioncity/listas/destinatarios/eliminar`
```json
{
  "id": 1
}
```

## Flujo de Notificaciones

### Reconocimiento de Matrícula en Tiempo Real

Cuando se detecta una matrícula mediante los endpoints:
- `/core/ws/jsonMls.php` (Milesight estándar)
- `/core/ws/jsonMlsNx.php` (Milesight con NX)

El sistema automáticamente:

1. **Comprueba la matrícula contra TODAS las listas** (negras y blancas)
   - Listas negras: busca si la matrícula **ESTÁ** en la lista
   - Listas blancas: busca si la matrícula **NO ESTÁ** en la lista
2. **Obtiene los destinatarios activos** de cada lista que debe alertar
3. **Envía notificaciones** según el canal configurado:
   - **Email**: Mensaje HTML con detalles del reconocimiento e imagen
   - **SMS**: Mensaje de texto corto con información básica (simulado)
   - **WhatsApp**: Mensaje formateado con información del reconocimiento (simulado)

> ⚠️ **Importante**: Solo los destinatarios con `activo = 1` reciben notificaciones. Esto permite pausar temporalmente las notificaciones sin eliminar los destinatarios.

**Ejemplo de flujo:**
```
Reconocimiento: Matrícula 1234ABC detectada por Cámara-01

Comprobación automática:
├─ Lista Negra "Morosos" (tipo: n)
│  └─ ¿1234ABC está en la lista? → SÍ → ✅ Alertar
│     └─ Enviar a: seguridad@empresa.com, +34600111222
│
├─ Lista Blanca "Residentes" (tipo: b)
│  └─ ¿1234ABC está en la lista? → NO → ✅ Alertar
│     └─ Enviar a: porteria@edificio.com
│
└─ Lista Blanca "VIP" (tipo: b)
   └─ ¿1234ABC está en la lista? → SÍ → ❌ No alertar (autorizado)

Resultado: 3 notificaciones enviadas (2 listas alertan)
```

### Datos Incluidos en la Notificación

- Matrícula detectada
- Nombre de la lista
- Dispositivo que detectó el vehículo
- Fecha y hora del reconocimiento
- Enlace a la imagen capturada (si está disponible)
- País, velocidad, marca, color (si están disponibles)

### Canales de Notificación

#### Email (Implementado)
Utiliza `PHPMailer` configurado en `core/mail.php`. Envía mensajes HTML formateados con toda la información del reconocimiento.

#### SMS (Simulado)
Actualmente registra en logs la intención de envío. Para implementar:
- Integrar con proveedor SMS (Twilio, Nexmo, etc.)
- Configurar credenciales en `.env`
- Actualizar función `enviarNotificacionSMS()` en `core/utils/notificaciones.php`

#### WhatsApp (Simulado)
Actualmente registra en logs la intención de envío. Para implementar:
- Integrar con WhatsApp Business API
- Configurar credenciales en `.env`
- Actualizar función `enviarNotificacionWhatsapp()` en `core/utils/notificaciones.php`

## Archivos Principales

### Funciones DAO
- `ioncity/listas/main.php`: Funciones CRUD para listas, vehículos y destinatarios

### Utilidades
- `core/utils/notificaciones.php`: Sistema de notificaciones multi-canal

### Webhooks de Reconocimiento
- `core/ws/jsonMls.php`: Webhook para Milesight estándar
- `core/ws/jsonMlsNx.php`: Webhook para Milesight con NX

### Endpoints REST
- `ioncity/listas/destinatarios/insertar.php`
- `ioncity/listas/destinatarios/obtener.php`
- `ioncity/listas/destinatarios/modificar.php`
- `ioncity/listas/destinatarios/eliminar.php`

## Logs

Todos los eventos de notificación se registran en los logs del sistema:
- Destinatarios encontrados
- Notificaciones enviadas exitosamente
- Errores en el envío de notificaciones

Los logs se pueden encontrar en `core/errors.log` o el archivo configurado en `FICHERO_LOGS_DEFAULT`.

## Ejemplo de Uso

### 1. Crear una lista
```bash
POST /ioncity/listas/insertar
{
  "cod_poblacion": "000004",
  "cod_provincia": "03",
  "nombre_lista": "Vehículos VIP",
  "desc_lista": "b",
  "tipo_alerta": "0001"
}
```

### 2. Añadir vehículo a la lista
```bash
POST /ioncity/listas/vehiculos/insertar
{
  "cod_lista": "0001",
  "matricula": "1234ABC",
  "descripcion_vehiculo": "Mercedes S-Class"
}
```

### 3. Configurar destinatarios
```bash
POST /ioncity/listas/destinatarios/insertar
{
  "cod_lista": "0001",
  "canal": "email",
  "destinatario": "seguridad@empresa.com",
  "nombre": "Equipo Seguridad"
}
```

### 4. Reconocimiento automático
Cuando un dispositivo detecte la matrícula `1234ABC`, automáticamente se enviará un email a `seguridad@empresa.com` con todos los detalles del reconocimiento.

### 5. Gestionar estado de destinatarios

**Desactivar temporalmente:**
```bash
POST /ioncity/listas/destinatarios/cambiarEstado
{
  "id": 1,
  "activo": false
}
```

**Reactivar:**
```bash
POST /ioncity/listas/destinatarios/cambiarEstado
{
  "id": 1,
  "activo": true
}
```

**Ver todos (incluyendo inactivos):**
```bash
POST /ioncity/listas/destinatarios/obtener
{
  "cod_lista": "0001",
  "soloActivos": false
}
```

## Notificaciones Históricas Automáticas

> ⚠️ **Importante**: Las notificaciones históricas **SOLO se envían para listas negras** (`desc_lista = 'n'`). Las listas blancas no generan notificaciones históricas.

### Al añadir matrícula a lista negra

Cuando se añade una nueva matrícula a una **lista negra** que ya tiene destinatarios configurados:

1. El sistema responde inmediatamente confirmando la inserción
2. **Post-respuesta** (solo si es lista negra): Busca reconocimientos de esa matrícula en los últimos 30 días
3. Si encuentra reconocimientos, envía automáticamente notificaciones a todos los destinatarios activos
4. Las notificaciones incluyen una tabla HTML (email) o resumen (SMS/WhatsApp) con todos los reconocimientos históricos

**Ejemplo de uso:**
```bash
POST /ioncity/listas/vehiculos/insertar
{
  "cod_lista": "0001",  # Lista negra
  "matricula": "1234ABC",
  "descripcion_vehiculo": "Mercedes S-Class"
}

# Respuesta inmediata: {"success": true}
# Background (solo lista negra): Se envían notificaciones con reconocimientos históricos
```

**Si es lista blanca:**
```bash
POST /ioncity/listas/vehiculos/insertar
{
  "cod_lista": "0002",  # Lista blanca
  "matricula": "5678DEF",
  "descripcion_vehiculo": "BMW X5"
}

# Respuesta inmediata: {"success": true}
# Background: NO se envían notificaciones históricas (lista blanca)
# Log: "Lista [nombre] es de tipo 'b' (no negra). No se envían notificaciones históricas."
```

### Al importar vehículos a lista negra (CSV)

Cuando se importan múltiples vehículos mediante CSV a una **lista negra**:

1. El sistema responde inmediatamente con resultado de importación (éxitos/errores)
2. **Post-respuesta** (solo si es lista negra): Busca reconocimientos de cada matrícula importada exitosamente (últimos 30 días)
3. Si encuentra reconocimientos, envía notificaciones automáticas a todos los destinatarios activos
4. Las notificaciones agrupan todos los reconocimientos de todos los vehículos importados
5. Contexto especial: "X vehículos importados a [nombre_lista]"

**Ejemplo de uso (lista negra):**
```bash
POST /ioncity/listas/vehiculos/importar
Content-Type: multipart/form-data

cod_lista=0001  # Lista negra
archivo_csv=[archivo CSV]

# CSV format:
# matricula,descripcion_vehiculo
# 1234ABC,Mercedes S-Class
# 5678DEF,BMW X5

# Respuesta inmediata: {"insert": ["1234ABC", "5678DEF"], "errors": []}
# Background (solo lista negra): Se envían notificaciones consolidadas con reconocimientos históricos
```

**Ejemplo de uso (lista blanca):**
```bash
POST /ioncity/listas/vehiculos/importar
Content-Type: multipart/form-data

cod_lista=0002  # Lista blanca
archivo_csv=[archivo CSV]

# Respuesta inmediata: {"insert": ["1234ABC", "5678DEF"], "errors": []}
# Background: NO se envían notificaciones históricas (lista blanca)
```

**Ventajas de importación:**
- Notificación consolidada (no una por vehículo) para listas negras
- Más eficiente para lotes grandes
- Logs detallados del proceso
- Respeta el tipo de lista (negra vs blanca)

### Al añadir destinatario a lista

Cuando se añade un nuevo destinatario a una lista que ya tiene vehículos:

1. El sistema responde inmediatamente con el ID del destinatario creado
2. **Post-respuesta**: Busca reconocimientos de todos los vehículos de la lista (últimos 30 días)
3. Si encuentra reconocimientos, envía automáticamente una notificación al nuevo destinatario
4. La notificación incluye todos los reconocimientos históricos de todos los vehículos de la lista

**Ejemplo de uso:**
```bash
POST /ioncity/listas/destinatarios/insertar
{
  "cod_lista": "0001",
  "canal": "email",
  "destinatario": "nuevo@ejemplo.com",
  "nombre": "Nuevo Usuario"
}

# Respuesta inmediata: {"id": 5}
# Background: Se envía email con tabla de reconocimientos históricos
```

### Al importar destinatarios a lista (CSV)

Cuando se importan múltiples destinatarios mediante CSV:

1. El sistema responde inmediatamente con resultado de importación (éxitos/errores)
2. **Post-respuesta**: Busca reconocimientos de todos los vehículos de la lista (últimos 30 días)
3. Si encuentra reconocimientos, envía notificaciones automáticas a cada destinatario importado
4. Cada destinatario recibe su propia notificación de bienvenida con todos los reconocimientos
5. Contexto especial: "Bienvenida a [nombre_lista]"

**Ejemplo de uso:**
```bash
POST /ioncity/listas/destinatarios/importar
Content-Type: multipart/form-data

cod_lista=0001
archivo_csv=[archivo CSV]

# CSV format:
# canal,nombre,destinatario
# email,Juan Pérez,juan@ejemplo.com
# sms,María García,+34600123456

# Respuesta inmediata: {"insert": ["juan@ejemplo.com", "+34600123456"], "errors": []}
# Background: Cada destinatario recibe notificación de bienvenida con reconocimientos históricos
```

**Ventajas de importación de destinatarios:**
- Onboarding automático de nuevos usuarios
- Cada destinatario recibe su notificación personalizada
- Logs detallados del proceso

### Características de las notificaciones históricas

- **Solo para listas negras**: Las listas blancas NO generan notificaciones históricas
- **Límite temporal**: 30 días hacia atrás
- **Ejecución**: Post-respuesta (no bloquea la API)
- **Formato email**: Tabla HTML responsive con:
  - Fecha y hora
  - Matrícula
  - Dispositivo
  - Velocidad
  - Enlace a imagen
- **Formato SMS/WhatsApp**: Resumen con:
  - Total de detecciones
  - Rango de fechas
  - Desglose por matrícula

### ¿Por qué solo listas negras?

**Listas negras** (`desc_lista = 'n'`):
- Notifican cuando la matrícula **ESTÁ** en la lista
- Tiene sentido enviar histórico: "Esta matrícula que acabas de añadir ya fue detectada X veces"
- Ejemplo: Añades un vehículo robado → recibes alertas de dónde fue visto

**Listas blancas** (`desc_lista = 'b'`):
- Notifican cuando la matrícula **NO ESTÁ** en la lista
- NO tiene sentido enviar histórico: "Esta matrícula autorizada no generó alertas porque estaba autorizada"
- Ejemplo: Añades un residente → no necesitas saber cuándo pasó (era esperado)

### Logging

Todas las notificaciones históricas se registran en logs:
- Inicio del procesamiento post-respuesta
- Cantidad de reconocimientos encontrados
- Cantidad de destinatarios notificados
- Éxito/error por cada envío
- No interrumpe el proceso si falla un envío individual

### Rendimiento

- La respuesta HTTP es inmediata (< 100ms típicamente)
- El procesamiento de notificaciones ocurre después de cerrar la conexión
- No afecta la experiencia del usuario
- Utiliza `fastcgi_finish_request()` en PHP-FPM o fallback compatible

## Próximas Mejoras

- [ ] Implementación real de SMS con Twilio
- [ ] Implementación real de WhatsApp Business API
- [ ] Configuración de horarios de notificación
- [ ] Plantillas personalizables de mensajes
- [ ] Panel de estadísticas de notificaciones enviadas
- [ ] Webhooks personalizados como canal adicional
- [ ] Configurar límite de días históricos por lista
- [ ] Opción de deshabilitar notificaciones históricas por lista

