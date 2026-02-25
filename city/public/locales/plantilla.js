/*
    Plantilla para generar las traducciones con IA.
    Aqui se describen todas las claves con una descripción del contexto para que la traducción sea más precisa, si es necesario.
*/

/*
    Para añadir un nuevo idioma:
    1.Generar archivo de traducción de ese idioma y ponerlo en public/locales/codIdioma/translation.js
        -Hay que generar las traducciones bloque a bloque y revisar que el número de resultados sea el mismo ya que chatGPT comete errores
    2.Añadir idioma a constants/common/idiomas
    3.Añadir url de ese idioma en utils/libraries/momentSetup/loadLocale y en utils/libraries/i18n-iso-countriesSetup/loadLocale
*/

/*
    Para añadir nueva traducción:
    Añadirla a todos los archivos. Plantilla (con comentario descriptivo si puede ser ambigua la traducción) y todos los archivos de traducción
    Ser muy cuidadoso. Que todos los archivos tengan las mismas
*/

/*
    prompt:

    Necesito las traducciones en es, ca y en de esto:

    Genérame los archivos de traducción para react-i18n con todas estas claves.
    Los comentarios son para que veas el contexto y la traducción sea correcta. No los incluyas en el archivo generado.
    respeta la estructura y si hay espacios entre claves/grupos y mantén el orden!
    usa comillas dobles "" (las simples no funcionan en json)
    Que no haya errores. Revisa bien cada traducción con su contexto!
    
    Ejemplo texto: 

        //Texto botónes
        'button': {
            'accept': 'Aceptar',
            'delete': 'Eliminar'
        },

        'login': {
            'login': "Iniciar sesión", //Título sección login
        }

    Ejemplo resultado json para catalán: 
    {

        'buttons: {
            'accept': 'Acceptar',
            'delete': 'Eliminar'
        },

        'login': {
            'login': 'Iniciar sessió',
        }
    }
*/

/*
    Promt pedir traduccion
    Creame las claves i18n para archivos separados en es ca ja y en. clave en ingles camelCase. Ejemplo "assignedChannels": "Canales asignados"
*/

const plantilla = {


    "analysis": {
        "00001": {
            "name": "1. Contradirección (línea)",
            "description": "Detecta cuando un vehículo circula contradirección."
        },
        "00002": {
            "name": "2. Adelantamiento en línea continua (línea)",
            "description": "Detecta el evento de un adelantamiento en línea continua."
        },
        "00003": {
            "name": "2. Subida al remontador (área)",
            "description": "Obtiene el número de usuarios que suben a la silla del remontador para obtener su ocupación."
        },
        "00004": {
            "name": "3. Foto-rojo (área)",
            "description": "Detecta cuando un vehículo se salta un semáforo en rojo."
        },
        "00005": {
            "name": "4. Prohibido estacionar (área)",
            "description": "Detecta cuando un vehículo estaciona en un área prohibida."
        },
        "00008": {
            "name": "7. Detección de matrículas (área)",
            "description": "Realiza la detección de matrículas."
        },
        "00009": {
            "name": "1. Detección de persona caída",
            "description": "Obtiene eventos cuando detecta una caída. (área)"
        },
        "00010": {
            "name": "3. Detección de persona armada",
            "description": "Obtiene eventos cuando detecta una persona armada. (área)"
        },
        "00011": {
            "name": "2. Detección de multitudes",
            "description": "Obtiene eventos cuando detecta una gran cantidad de afluencia. (área)"
        },
        "00015": {
            "name": "1. Estimación de aforo (área)",
            "description": "Obtiene los datos de aforo de una o más regiones seleccionadas (método especializado para obtener la cola de entrada)."
        },
        "00016": {
            "name": "4. Salida del remontador (área)",
            "description": "Cuenta cuántas personas se han transportado."
        },
        "00018": {
            "name": "2. Ventanilla",
            "description": "Detecta cuando un usuario sale de la zona de ventanilla y lo marca como atendido. (área)"
        },
        "00019": {
            "name": "1. Estimación de aforo",
            "description": "Obtiene los datos de aforo de una o más regiones seleccionadas (método especializado para obtener la cola de espera)."
        },
        "00020": {
            "name": "3. Detección de merodeo",
            "description": "Obtiene eventos cuando detecta el merodeo de uno o varios usuarios en un área determinada. (área)"
        },
        "00021": {
            "name": "4. Detección de intrusión",
            "description": "Obtiene eventos cuando detecta la intrusión de uno o varios usuarios en un área determinada. (área)"
        },
        "00022": {
            "name": "5. Objeto dejado",
            "description": "Obtiene eventos al recibir el registro de un objeto dejado en el área seleccionada. (área)"
        },
        "00023": {
            "name": "6. Objeto recogido",
            "description": "Obtiene eventos al recibir el registro de un objeto recogido en el área seleccionada. (área)"
        },
        "00024": {
            "name": "7. Detección de persona armada",
            "description": "Obtiene eventos cuando detecta una persona armada. (área)"
        },
        "00025": {
            "name": "3. Subida al remontador (línea)",
            "description": "Obtiene el número de usuarios que suben a la silla del remontador para obtener su ocupación."
        },
        "00026": {
            "name": "5. Salida del remontador (línea)",
            "description": "Cuenta cuántas personas se han transportado."
        },
        "00027": {
            "name": "5. Giro indebido (línea)",
            "description": "Detecta el evento de un giro indebido."
        },
        "00028": {
            "name": "6. Área reservada (área)",
            "description": "Detecta cuando un vehículo entra en un área reservada, de carga/descarga, etc..."
        },
        "00030": {
            "name": "8. Estimación de aforo (área)",
            "description": "Obtiene los datos de aforo de una o más regiones seleccionadas."
        },
        "00031": {
            "name": "8. Estimación de aforo",
            "description": "Obtiene los datos de aforo de una o más regiones seleccionadas (método especializado para obtener la cola de espera)."
        },
        "00032": {
            "name": "1. Entrada al parking (área)",
            "description": "Detecta cuando un vehículo entra al parking"
        },
        "00033": {
            "name": "2. Salida del parking (área)",
            "description": "Detecta cuando un vehículo sale del parking"
        },
        "00035": {
            "name": "1. Estimación de aforo (área)",
            "description": "Obtiene los datos de aforo de una o más regiones seleccionadas"
        },
        "00036": {
            "name": "2. Estimación de cola (área)",
            "description": "Obtiene los datos de aforo de una región para estimar la cola de espera"
        },
        "00037": {
            "name": "3. Salida restaurante (línea)",
            "description": "Cuenta la salida de personas del restaurante"
        },
        "00038": {
            "name": "6. Silla pasada (línea)",
            "description": "Obtiene datos cuando un vehículo pasa por la línea"
        },
        "00039": {
            "name": "1. Objeto dejado",
            "description": "Obtiene eventos al recibir el registro de un objeto dejado en el área seleccionada. (área)"
        }
    },

    //Texto botones
    'buttons': {
        "accept": "Aceptar",
        'add': 'Añadir',
        "assign": "Asignar",
        'authenticate': 'Autenticar', //validar código 2FA
        'back': 'Atrás', //Volver a sección/Menú anterior
        "cancel": "Cancelar",
        "calendar": "Calendario",
        "collapse": "Contraer",
        "close": "Cerrar",
        "numberDays": "{{count}} días",
        'delete': 'Eliminar',
        "download": "Descargar",
        "draw": "Dibujar",
        'edit': 'Modificar',
        "expand": "Expandir",
        "export": "Exportar",
        "finish": "Finalizar",
        'filter': 'Filtrar',
        "import": "Importar", //importar archivo
        "info": "Información",
        'login': 'Acceder', //Validar usuario y contraseña
        "logout": "Cerrar sesión",
        "next": "Siguiente",
        "notifications": "Notificaciones",
        "play": "Reproducir",
        "pause": "Pausar",
        "profile": "Perfil",
        "reject": "Rechazar",
        'reset': 'Restablecer',
        'resetPassword': 'Restablecer contraseña',
        "save": "Guardar", "save": "Guardar",
        "search": "Buscar",
        'sendCode': 'Enviar código de recuperación', //Enviar código 2FA al email
        "selectAll": "Seleccionar todo",
        "start": "Iniciar",
        "sync": "Sincronizar",
        "update": "Actualizar",
        "view": "Visualizar",
        "estimatedRoute": "Recorrido estimado",
        "history": "Histórico", //Ver todos los registros de un vehículo
        "share": "Compartir",
        "send": "Enviar",
        "validate": "Validar",
        "goHome": "Volver al inicio",
        "grid": "Cuadrícula",
        "rewind": "Rebobinar", //reproductor
        "forward": "Avanzar", //reproductor
        "approve": "Aprobar", //Aprobar que la infracción se ha cometido
        "deshacer": "Deshacer",
        "actions": "Acciones",
        "today": "Hoy",
        "week": "Última semana",
        "month": "Último mes",
        "deleteBlur": "Desactivar desenfoque facial",
        "addInterest": "Añadir a la lista de interés",
        "removeInterest": "Quitar de la lista de interés",
        "watchlist": "Listado de interés"
    },

    //Traducción a partir de códigos
    "codes": {
        'deviceCategories': {
            '0001': "Sensor ambiente",
            '0002': 'Cámara',
            '0003': 'Sensor acceso',
            '0004': 'Monitor',
            '0005': 'Sensor ultrasonidos',
            "0006": "Máquina industrial",
        },
        "cityAlerts": {
            "0001": "Exceso de velocidad",
            "0002": "Carril incorrecto",
            "0003": "Vehículo sin documentación",
            "0004": "Vehículo sin ITV",
            "0005": "Adelantamiento en línea continua",
            "0006": "Vehículo sin seguro",
            "0007": "Salto semafórico",
            "0008": "Prohibido aparcar",
            "0009": "Vehículo robado",
            "0010": "Salto STOP",
            "0011": "Giro indebido",
            "0012": "Área reservada",
            "0100": "Zona de Acceso Restringido (ZAR)",
            "0101": "Zona de Bajas Emisiones (ZBE)",
            "0102": "Distribución Urbana de Mercancías (DUM)",
            "0103": "Nieve",
            "0104": "Área reservada",
            "0105": "Giro indebido",
            "0106": "Carril incorrecto",
            "0107": "Adelantamiento en línea continua",
            "0108": "Salto semafórico",
            "0109": "Prohibido aparcar",
            "0110": "Objeto abandonado"
        },
        "containerTypes": {
            "01": "General",
            "02": "Orgánico",
            "03": "Vidrio",
            "04": "Plástico",
            "05": "Cartón",
        }
    },

    //Colores
    "colors": {
        "yellow": "Amarillo",
        "blue": "Azul",
        "white": "Blanco",
        "maroon": "Granate",
        "gray": "Gris",
        "silver gray": "Plata",
        "black": "Negro",
        "red": "Rojo",
        "green": "Verde",
        "brown": "Marrón",
        "orange": "Naranja",
        "beige": "Beige",
        "purple": "Morado",
        "pink": "Rosa",
    },

    //CRUD
    'crud': {
        'addElement': 'Añadir {{element}}',
        "selectElement": "Seleccionar {{element}}",
        'deleteElement': 'Eliminar {{element}}',
        'editElement': 'Modificar {{element}}',
        'filterElements': 'Filtrar {{elements}}',

        "elementAdded": "Se ha añadido correctamente",
        "elementDeleted": "Se ha eliminado correctamente",
        "elementEdited": "Se ha modificado correctamente",

        "deleteConfirmation": "¿Eliminar {{element}}?",
        "deleteConfirmationName": "¿Eliminar {{element}}? ({{name}})"
    },

    //descriptions
    'descriptions': {
        "access": "Tiene acceso a esta sección",
        "edit": "Tiene permitido editar los datos",
        "queries": "Tiene permitido hacer consultas",
        "share": "Tiene permitido compartir datos"
    },

    //errores
    'errors': {
        "aiInstancesError": "No se han podido obtener las instancias de análisis IA del dispositivo. Inténtelo de nuevo más tarde",
        'capsLockOn': 'Bloq. Mayús. Está activo',
        'code': 'El código introducido no es correcto',
        "createInstanceFirst": "Cree una instancia antes de poder encenderla o apagarla",
        'credentials': 'El usuario o contraseña no coinciden',
        'email': 'Email no encontrado',
        'fillRequiredFields': 'Introduzca todos los campos obligatorios',
        "importFailed": "No se ha podido realizar la importación",
        'mismatch': 'No coinciden',
        'noChannels': 'No hay canales disponibles',
        'noChannelsModules': 'No se ha podido asignar a los siguientes módulos: ',
        "noDevicesInserted": "No se ha podido insertar los siguientes dispositivos: ",
        "notAssigned": "La cámara seleccionada no está asignada a este módulo y no puede visualizarse",
        "noRecordingAtThisPoint": "No hay grabación en ese punto",
        'passwordMinLength': 'Mínimo 6 caracteres',
        'passwordLowerCase': 'Mínimo una minúscula',
        'passwordRequirements': 'Mayúscula, número o caracter especial',
        "request": "No se ha podido realizar la solicitud. Inténtelo de nuevo más tarde.",
        'required': 'Campo obligatorio',
        "selectAtLeastOneDetection": "Se debe seleccionar como mínimo un tipo de detección",
        "unknownLocation": "Ubicación desconocida",
        "startDateBeforeEndDate": "La fecha inicial tiene que ser anterior a la fecha final",
        "duplicateFields": "Hay campos repetidos en la base de datos.",
        "duplicatePlates": "Las siguientes matrículas están repetidas",
        "selectLocation": "Seleccione la ubicación",
        "dateRangeExceeded": "Las fechas superan el máximo rango ({{days}} días)"
    },

    //hints inputs
    "hints": {
        "selectOrCreateInvestigation": "Seleccione una investigación existente o escriba el nombre de una nueva",
        "speed": "Ejemplo: >120",
        "confidence": "Ejemplo: >80"
    },

    //Integraciones
    "integrations": {
        "linkIntegration": "Vincular integración",
        "unlinkIntegration": "Desvincular integración",
        "unlinkIntegrationConfirm": "¿Desea desvincular la integración con: {{integration}}?",
        "linkWithIntegration": "Vincular con {{integration}}",
        "types": {
            "organization": "Organismo",
            "paymentGateway": "Pasarela de pago",
            "software": "Software" //Dejar en inglés si queda bien
        },
        "status": {
            "unlinked": "Sin vincular",
            "pending": "Pendiente aprobación",
            "linked": "Vinculado"
        }
    },

    //Sección Login
    'login': {
        '2faDescription': 'Introduce el código de autentificación de doble factor enviado al correo electrónico de su usuario',
        '2faEmailDescription': 'Introduzca el código de recuperación enviado al correo electrónico: ',
        'codeNotReceived': 'No he recibido el código',
        'forgotten': '¿Has olvidado la contraseña?',
        'login': 'Iniciar sesión',
        'recover': 'Recuperar contraseña',
        'recoverDescription': 'Introduce el correo eléctronico de su usuario para reestablecer la contraseña',
        'recoverSuccess': 'La contraseña se ha restablecido de forma correcta',
        'slogan': 'Cambiando el futuro',
        'waitToResend': 'Espera {{seconds}}s para volver a enviar',
        "showPassword": "Mostrar contraseña",
        "hidePassword": "Ocultar contraseña"
    },

    //Auditoría. traducción códigos back
    "logs": {
        "0-AUTH": "Autenticar",
        "1-LGI": "Acceso",
        "2-LGO": "Cierre",
        "10-ABR": "Abrir",
        "11-IMG": "Abrir imagen",
        "12-ZOOM": "Ampliar imagen",
        "13-ELM1": "Seleccionar elemento",
        "14-ELM2": "Seleccionar elemento 2",
        "15-PDF": "Generar PDF",
        "16-CSV": "Generar CSV",
        "17-DESC": "Descargar",
        "18-ENV": "Enviar",
        "20-2FA": "Autenticado 2FA",
        "21-NOAUTH": "No autenticado",
        "22-NO2FA": "No autenticado 2FA",
        "23-LOUT": "Cerrar sesión",
        "24-TOUT": "Cierre por inactividad",
        "25-EXIT": "Cierre abrupto",
        "26-UPD": "Actualizar datos",
        "27-VAL": "Validar",
        "28-RECH": "Rechazar",
        "29-LPR": "Activar LPR",
        "30-EDIT": "Modo edición",
        "INS-INV": "Investigación añadida",
        "UPD-INV": "Datos de la investigación modificados",
        "DEL-INV": "Investigación eliminada",
        "INS-DISP-INV": "Añadir dispositivos a la investigación",
        "DEL-DISP-INV": "Eliminar dispositivos de la investigación",
        "SOL-ARC": "Solicitud de archivos",
        "ADD-ARC": "Añadir archivos"
    },

    //Mensajes
    'messages': {
        "assignedChannels": "Canales asignados", //Ejemplo: 1/4 canales asignados
        "aiAnalysisOff": "Apagar análisis IA",
        "aiAnalysisOn": "Encender análisis IA",
        "aiLPROff": "Apagar LPR",
        "aiLPROn": "Encender LPR",
        "downloadingFiles": "Descargando {{count}} archivo(s)",
        "cannotModifyAdmin": "No se puede modificar el administrador",
        "columnOfField": "Columna de {{fieldName}}", //columna de un excel que contiene ese campo
        "example": "Ejemplo",
        "fileImported": "Archivo importado correctamente",
        "logoutConfirmation": "¿Quiere cerrar sesión?",
        "manualHeaderSelection": "Si la primera fila no es un título, selecciónela manualmente",
        "nextExpiration": "Próxima caducidad", //La siguiente fecha de caducidad
        "noAlertsFound": "No se han encontrado alertas",
        "noNewRecognition": "No se ha detectado ningún reconocimiento nuevo",
        "noAlertsLastHours": "No se han detectado alertas en las últimas {{count}}h",
        "noNewAlertsDetected": "No se ha detectado ninguna alerta nueva",
        "noNewIncidentsDetected": "No se ha detectado ninguna incidencia nueva",
        "noImage": "Sin imagen",
        "noItemSelected": "Ningún elemento seleccionado",
        "noSignal": "Sin señal",
        "loadingData": "Cargando datos",
        "limitExceeded": "Límite excedido. Máximo 1000 registros",
        "rejectedSuccess": "Se ha rechazado correctamente",
        'results': '{{value}} resultados',
        'resultsLast': 'Últimos {{value}} resultados',
        'resultsFiltered': 'Filtrados {{value}} resultados',
        'resultsFilteredLast': 'Filtrados últimos {{value}} resultados',
        'resultsNone': 'No se han encontrado resultados',
        "resultsTotal": "Últimos {{value}} resultados ({{total}} totales)",
        "speedAlertThreshold": "Velocidad a partir de la cual saltará la alerta",
        "unassigned": "Sin asignar",
        "addCamera": "Añada una cámara",
        "selectFirstOnTimeline": "Haga una selección primero en la línea de tiempo",
        "sharedSuccessfully": "Se ha compartido correctamente",
        "licensesExpiringSoon": "Licencias próximas a caducar",
        "licensesInExtension": "Licencias en prórroga",
        "channelsWithoutLicense": "Canales asignados sin licencia",
        "newAlertDetected": "Se ha detectado una nueva alerta",
        "newSharedFile": "Tiene un nuevo archivo compartido",
        "sharedFile": "Archivo compartido",
        "incidencesSummary": "Se han detectado {{count}} incidencias de {{countVehicles}} vehículos analizados",
        "requestSuccess": "La solicitud se ha realizado correctamente",
        "noDeviceFound": "No se ha encontrado ningún dispositivo",
        "reopenInvestigationConfirmation": "¿Quiere reabrir la investigación?",
        "closeInvestigationConfirmation": "¿Quiere cerrar la investigación?",
        "closeInvestigation": "Finzalizar investigación",
        "reopenInvestigation": "Reabrir investigación",
        "availableCapacityLow": "La capacidad disponible del contenedor es baja",
        "availableCapacityModerate": "La capacidad disponible del contenedor es moderada",
        "availableCapacityHigh": "La capacidad disponible del contenedor es alta",
        "maxCamerasReached": "Superado el máximo de cámaras simultáneas. ({{count}})",
        "expired": "Caducado",
        "expiration": "Caducidad",
        "sharedBy": "Compartido por {{name}}",
        "technologiesAndResourcesUsed": "Tecnologías y recursos utilizados en este proyecto",
        "sessionTimeout": "Cerrando sesión por inactividad",
        "tokenExpired": "Token caducado. Cerrando sesión",
        "last24h": "Últimas 24h",
        "last7d": "Últimos 7 días",
        "lastMonth": "Último mes",
        "customDate": "Fecha personalizada",
        "unfiltered": "Sin filtrar",
        "general": "General",
        "averageStayDays": "{{count}} días de estancia media",
        "screenTooSmall": "El tamaño de pantalla es demasiado pequeño para mostrar los datos de forma correcta",
        "serviceUnavailable": "Servicio temporalmente no disponible",
        "selectItemsOnList": "Seleccione los registros que quiere exportar en el modo de visualización tipo lista",
        "technicalDifficulties1": "Actualmente estamos experimentando dificultades técnicas.",
        "technicalDifficulties2": "Nuestro equipo ya está al tanto de la situación y trabaja para solucionarlo lo más breve posible.",
        "tryAgain": "Por favor, intente acceder nuevamente en unos minutos.",
        "contactUs": "Si el problema persiste, por favor contáctenos a info@ionsmart.eu",
        "sorryForInconvenience": "Disculpe las molestias.",
        "minSelection": "Seleccione al menos 5 segundos",
        "favoriteAdd": "Establecer favorito",
        "favoriteRemove": "Quitar favorito",
        "unresolved": "Sin resolver",
        "newDevicesDetected": "Se han detectado {{count}} nuevos dispositivos al sincronizar el cloud. ¿Desea añadirlos?",
        "noNewDevicesFound": "No se han encontrado dispositivos nuevos para la sincronización",
        "cloudHasAssociatedDevices": "El cloud que ha añadido tiene varios dispositivos asociados. ¿Desea añadirlos ahora?",
        "detectedTypes": "tipos detectados",
        "speedingIncidents": "excesos de velocidad",
        "validatedSuccess": "Se ha validado correctamente",
        "noModules": "El dispositivo no tiene módulos asignados",
        "actionRequested": "Acción solicitada correctamente",
        "thereAreSpeedExcesses": "Hay horas con excesos de velocidad",
        "thereAreNoSpeedExcesses": "No hay horas con excesos de velocidad",
        "noPersonAttribute": "La extracción de características de personas no está activada. Para habilitarla, vaya a la sección 'Extracción de atributos' dentro de la configuración de instancias.",
        "needInstanceToConfig": "Para acceder a la configuración, primero debe crear una instancia. ¿Desea crearla ahora?",
        "systemHasModerateUserFlow": "El sistema tiene un flujo de usuarios moderado",
        "viewUserInformation": "Consultar información sobre los usuarios",
        "timeAgo": "Hace {{value}} {{unit}}",
        "pendingVulnerabilities": "{{value}} vulnerabilidades pendientes de revisar",
        "lastAnalysisMinutesAgo": "Último análisis realizado hace {{value}} min",
        "serverHighRiskIndex": "El servidor tiene un índice de riesgo alto",
        "viewServerSecurityInfo": "Consultar información de seguridad del servidor",
        "lastBackupAt": "Último backup realizado a las {{value}}",
        "serverHighCompliance": "El servidor cumple la normativa de forma elevada",
        "viewServerSecurityRegulation": "Consultar normativa de seguridad del servidor",
        "activateNotifications": "Activar notificaciones",
        "activateNotificationsText": "El destinatario recibirá las notificaciones"
    },

    "permissions": {
        "editar": "Editar",
        "compartir": "Compartir",
        "consultas": "Consultas",

        "noPermission": "No tiene permisos ({{permissionType}})",
        "noPermissionSection": "No tiene permisos para ir a esa sección",
    },

    //Parámetros datos
    'params': {
        "action": "Acción",
        "alert": "Alerta",
        "area": "Área",
        "areaType": "Tipo de área",
        "zoneType": "Tipo de zona",
        "activationDate": "Fecha activación",
        'brand': 'Marca',
        "bitWidth": "Ancho de bits", //memoria servidor
        "capacity": "Capacidad", //disco duro
        'category': 'Categoría', //tipo dispositivo
        "channels": "Canales",
        "cloudUser": "Usuario del cloud",
        "code": "Código",
        "color": "Color",
        "commerceUrl": "URL comercio",
        "currency": "Moneda",
        "currentFrequency": "Frecuencia actual", //memoria servidor
        "date": "Fecha",
        "days": "Días",
        "description": "Descripción",
        "deviceId": "ID dispositivo",
        "dhcpServer": "servidor DHCP",
        "duration": "Duración",
        'email': 'Email',
        "endDate": "Fecha final",
        "endTime": "Hora final",
        "expirationDate": "Fecha expiración",
        "failureUrl": "URL pago incorrecto",
        "fanSpeed": "Velocidad del ventilador",
        "file": "Archivo",
        "gateway": "Puerta de enlace",
        "holderName": "Nombre titular",
        "ibmaDriver": "Driver iBMA",
        "ibmaService": "Servicio iBMA",
        "ibmaStatus": "Estado iBMA",
        "interfaceType": "Tipo de interfaz",
        "ipAddress": "Dirección IP",
        "ipProtocol": "Protocolo IP",
        "key": "Clave",
        "lastName": "Apellidos",
        "licensePlate": "Matrícula", //de un vehículo
        "location": "Ubicación",
        "macAddress": "Direccion MAC",
        "memory": "Memoria", //memoria servidor
        "memoryCapacity": "Capacidad de memoria", //ram
        "memoryUsage": "Uso de memoria", //ram
        "minVoltage": "Voltaje mínimo",
        'model': 'Modelo',
        "module": "Módulo",
        'modules': 'Módulos',
        'name': 'Nombre',
        "negotiatedSpeed": "Velocidad negociada", //disco duro
        "networkMask": "Máscara de red",
        'node': 'Nodo',
        "nominalFrequency": "Frecuencia nominal", //memoria servidor
        "originalPartNumber": "Número de pieza original", //memoria servidor
        "osKernel": "Kernel SO",
        "osVersion": "Versión SO",
        "outputPower": "Potencia de salida",
        "partNumber": "Número de pieza", //memoria servidor
        'password': 'Contraseña',
        "permissions": "Permisos",
        "telefono": "Teléfono",
        "powerOnHours": "Horas encendido",
        "productionEndpoint": "Endpoint producción",
        "procedureCode": "Código del procedimiento",
        "procedureName": "Nombre del procedimiento",
        "processingUnit": "Unidad tramitadora",
        "processingUnitCode": "Código unidad tramitadora",
        "raidCards": "Tarjetas RAID",
        "rankCount": "Cantidad de rango", //memoria servidor
        "requesterId": "Identificador solicitante",
        "requesterName": "Nombre solicitante",
        "sasAddress": "Dirección SAS",
        "section": "Sección",
        "sessionStart": "Inicio sesión",
        "sessionEnd": "Fin sesión",
        "serialNumber": "Número de serie",
        "speed": "Velocidad",
        "startDate": "Fecha inicial",
        "startTime": "Hora inicial",
        "status": "Estado",
        "storage": "Almacenamiento",
        "successUrl": "URL pago correcto",
        "systemId": "ID del sistema",
        "systemName": "Nombre del sistema",
        "technology": "Tecnología",
        "temperature": "Temperatura",
        "testEndpoint": "Endpoint pruebas",
        "time": "Hora",
        "total": "Total",
        "tpvTerminal": "Terminal TPV",
        "type": "Tipo",
        'verticalMarket': 'Sector vertical', //Partes de la aplicación (Traffic, Ski, Industry)
        'user': 'Usuario',
        "cloudPassword": "Contraseña del cloud",
        "version": "Versión",
        "inputPower": "Potencia de entrada", //fuente alimentación
        "devicePosition": "Posición dispositivo",
        "cpuCoresThreads": "Núcleos / Hilos CPU",
        "cache": "Caché",
        "cpuUsage": "Uso CPU",
        "cpuTemperature": "Temperatura CPU",
        "chip": "Chip",
        "networkPorts": "Puertos de red",
        "baseResource": "Recurso base",
        "gpuUsage": "Uso GPU",
        "gpuTemperature": "Temperatura GPU",
        "maxSpeed": "Velocidad máxima",
        "infraction": "Infracción",
        "averageSpeed": "Velocidad media",
        "reason": "Motivo",
        "device": "Dispositivo",
        "direction": "Sentido", // sentido hacia el que va el vehículo (away, approach)
        "confidence": "Fiabilidad",
        "sector": "Sector",
        "parking": "Aparcamiento",
        "country": "País",
        "vehicleType": "Tipo de vehículo",
        "licensePlateType": "Tipo de matrícula",
        "nationality": "Nacionalidad",
        "list": "Lista",
        "province": "Provincia",
        "municipality": "Población",
        "amount": "Importe", //importe de una multa
        "reduced": "Reducido", //importe reducido de una multa
        "points": "Puntos",
        "zone": "Zona",
        "recipient": "Destinatario",
        "exportedVideoDuration": "Duración del vídeo exportado",
        "imageInterval": "Intervalo de imágenes",
        "quality": "Calidad",
        "responsible": "Responsable", ////El que se hace cargo de realizar una tarea
        "investigation": "Investigación",
        "gender": "Género", //Si es hombre o mujer
        "age": "Edad",
        "energyConsumption": "Consumo de energía", //fuente alimentación
        "hours": "Horas",
        "values": "Valores",
        "minutes": "Minutos",
        "person": "Persona",
        "vehicle": "Vehículo",
        "animal": "Animal",
        "face": "Cara",
        "motion": "Movimiento",
        "route": "Ruta",
        "boardings": "Subidas",
        "alightings": "Bajadas",
        "busStops": "Paradas",
        "alertDescription": "Descripción de la alerta",
        "ledIndicator": "Indicador LED",
        "protocol": "Protocolo",
        "powerSupply": "Tipo de fuente de alimentación",
        "firmwareVersion": "Versión del firmware",
        "ratedPower": "Potencia nominal",
        "inputVoltage": "Voltaje de entrada",
        "ouputVoltage": "Voltaje de salida",
        "inputWatts": "Vatios de entrada",
        "outputWatts": "Vatios de salida",
        "drivers": "Controladores",
        "rootBDF": "BDF raíz",
        "ipConfiguration": "Tipo de configuración IP",
        "subnetMask": "Máscara de subred",
        "ratio": "Relación",
        "upper_clothing": "Ropa superior",
        "lower_clothing": "Ropa inferior",
        "pedestrian_keys": "Características clave del peatón",
        "gafas": "Gafas",
        "carga_bolsa": "Bolsa",
        "asistido": "Asistido",
        "fumando": "Fumando",
        "tatuado": "Tatuajes",
        "cara_tapada": "Rostro cubierto",
        "externalRequests": "Peticiones ext.",
        "internalRequests": "Peticiones int.",
        "externalSubmissions": "Solicitudes ext.",
        "risk": "Riesgo",
        "breaches": "Vulneraciones",
        "data": "Datos",
        "lastBackup": "Último backup",
        "server": "Servidor",
        "systemSecurity": "Seguridad del sistema",
        "securityCompliance": "Cumplimiento normativo de seguridad",
        "channel": "Canal", //Medio por donde se envia la información, como por ejemplo Mail, SMS o Whatsapp
        "receivers": "Destinatarios", //Destino del envio, ya se un email, número de telefono...
        "impact": "Impacto",
        "severity": "Severidad"
    },

    //Placeholders inputs
    'placeholders': {
        'newPassword': 'Nueva contraseña',
        'repeatNewPassword': 'Repita nueva constraseña'
    },

    //Secciones. Se han traducido con nombre_seccion de la tabla de BD para poder traducir con lo que viene de back
    'sections': {
        "ACCESOS": 'Accesos',
        "ALERTAS": 'Alertas',
        "ANALISIS": 'Análisis',
        "ARCHIVOS": 'Archivos',
        "AUDITORIA": "Auditoría",
        "CAMPAÑAS": "Campañas", //Campañas de itv, etc
        "CLAVES": "Claves",
        "CLIENTES": "Clientes",
        "CLOUD": "Clouds", // No traducir
        "CONFIGURACIÓN": 'Configuración',
        "CONSULTAS": 'Consultas',
        "DEPARTAMENTOS": "Departamentos",
        "DISPOSITIVOS": 'Dispositivos',
        "ENVIO": 'Envío',
        "ESTADISTICAS": "Estadísticas",
        "EXPEDICIONES": "Expediciones", //Expedición de mercancías
        "INFORMES": "Informes",
        "INFRACCIONES": "Infracciones",
        "INTEGRACIONES": "Integraciones",
        "INVESTIGACIONES": 'Investigaciones',
        "LAYOUTS": 'Layouts', //No traducir
        "LICENCIAS": "Licencias",
        "LIFTERS": "Remontadores", //Remontadores pistas ski
        "LISTAS": "Listas",
        "LLAMADAS": "Llamadas", //de teléfono
        "LIVE": "En directo",
        'MANTENIMIENTO': 'Mantenimiento',
        "MAPA": "Mapa",
        "TRANSPORTE": "Transporte",
        "MOVILIDAD": "Movilidad",
        "PARKINGS": "Parkings",
        "PADRON": "Padrón", //Padrón de tráfico
        "PERMISOS": "Permisos",
        "PICKING": "Pedidos", //Traducir 'Pedidos'
        "PLATAFORMA": 'Plataforma', //Plataforma web que incluye los distintos sectores verticales de la aplicación (tráfico, ski, ...)
        "PREVALIDACION": "Prevalidación", //prevalidar alertas
        "PUNTOS DE VENTA": "Puntos de venta", //Puntos de venta entradas ski
        "RECONOCIMIENTOS": "Reconocimientos", //imágenes que se ha hecho a vehículos con cámara de tráfico
        "RESTAURANTS": 'Restaurantes',
        "REUNIONES": "Reuniones",
        "SECTORES": "Sectores",
        "SERVIDORES": "Servidores",
        "TAQUILLAS": "Taquillas", //taquillas. cada taquilla donde se venden entradas ski dentro de un punto de venta
        "USUARIOS": "Usuarios",
        "VMS": "VMS", //No traducir
        "ZONAS": "Zonas",
        "REGISTRO_PERSONAS": "Registro de personas",
        "REGISTRO_VEHICULOS": "Registro de vehículos",
        "ESTADISTICAS_VEHICULOS": "Estadísticas vehículos",
        "ESTADISTICAS_PERSONAS": "Estadísticas personas",
        "ESTADISTICAS_TRANSPORTE": "Estadísticas transporte",
        "VEHICULOS": "Vehículos",
        "SEGURIDAD": "Seguridad",
        "MONITORIZACION": "Monitorización",
        "SESIONES": "Sesiones",
        "CONSULTAS_EXT": "Consultas ext." //Abreviación de externas
    },

    //Descripciones secciones
    'sectionDescriptions': {
        'PLATAFORMA': 'Accede a la plataforma y descubre los diversos módulos y mercados verticales',
        'CONFIGURACIÓN': 'Realiza la configuración de los diferentes parametros de la Suite',
        'MANTENIMIENTO': 'Consulta el estado y mantenimiento de la Suite y sus componentes',
        "SEGURIDAD": "Supervisa y protege el sistema garantizando su correcto funcionamiento",
        'CITY': 'Control de la ciudad',
        'VMS': 'Visualiza las grabaciones y archivos compartidos',
        'TRAFFIC': 'Visualiza el estado del tráfico',
        'MOBILITY': 'Gestión de la movilidad y zonas restringidas',
        'INFRINGEMENT': 'Gestión de las infracciones',
        'ANALYTIC': 'Realiza investigaciones vehiculares o personales mediante el uso de IA',
        'RECYCLING': 'Gestión de residuos en el municipio'
    },

    //Palabras sueltas para poner en medio de frases (por ejemplo en crud)
    'terms': {
        "alert": "alerta",
        "alerts": "alertas",
        "area": "área",
        "areas": "áreas",
        "cameras": "cámaras",
        "campaign": "campaña", //Ejemplo: Campaña de ITV (operativa temporal para detectar coches sin ITV, seguro , etc)
        "campaigns": "campañas", //Ejemplo: Campaña de ITV (operativa temporal para detectar coches sin ITV, seguro , etc)
        'devices': 'dispositivos',
        'device': 'dispositivo',
        "file": "archivo",
        "files": "archivos",
        "hour": "hora",
        "infraction": "infracción",
        "infractions": "infracciones",
        "incidence": "incidencia",
        "incidences": "incidencias",
        "integrations": "integraciones",
        "investigation": "investigación",
        "investigations": "investigaciones",
        "layout": "Layout", //No traducir si queda bien
        "license": "licencia",
        "licenses": "licencias",
        "list": "lista",
        "lists": "listas",
        "location": "ubicación",
        "model": "modelo",
        "modules": "módulos",
        "permission": "permiso",
        "permissions": "permisos",
        "records": "registros",
        "recognitions": "reconocimientos", //reconocimientos de un vehículo por una cámara de tráfico
        "sector": "sector",
        "server": "servidor",
        "servers": "servidores",
        "sessions": "sesiones",
        "user": "usuario",
        "users": "usuarios",
        "vehicle": "vehículo",
        "vehicles": "vehículos",
        "zone": "zona",
        "zones": "zonas",
        "maxCapacityShort": "aforo máx.",
        "maleShort": "masc.",
        "femaleShort": "fem.",
        "uniquePassengers": "pasajeros únicos",
        "reIdentification": "de re-identificación",
        "boardings": "subidas",
        "alightings": "bajadas",
        "demand": "demanda",
        "accuracy": "precisión",
        "insurance": "Seguro", //seguro coche
        "day": "día",
        "days": "días",
    },

    //Títulos
    'titles': {
        "aiAnalysis": "Análisis AI", //no traducir AI si queda bien
        "aiAnalysisTypes": "Tipos de análisis AI",
        "assignments": "Asignaciones",
        "cameras": "Cámaras",
        "capacityEstimation": "Estimación de aforo",
        "chronology": "Cronología",
        "details": "Detalles",
        "deviceInfo": "Información del dispositivo",
        "fans": "Ventiladores",
        "features": "Características",
        "firmware": "Firmware",
        "graphicsProcessingUnit": "Unidad de Procesamiento Gráfico",
        "heatmap": "Mapa de calor",
        'info': 'Aviso',
        "listing": "Listado",
        "networkCard": "Tarjeta de red",
        "notifications": "Notificaciones",
        "peripheralComponentInterconnect": "Interconexión de Componentes Periféricos",
        "policeVehicles": "Vehículos policiales",
        "powerSource": "Fuente de alimentación",
        "processors": "Procesadores",
        "sections": "Secciones",
        "speedConfig": "Configurar exceso de velocidad",
        "systemInfo": "Información del sistema",
        "tasks": "Tareas",
        "trafficFlow": "Afluencia de tráfico",
        "trafficInfo": "Información del tráfico",
        "traffic": "Tráfico",
        "recognitionReport": "Informe de reconocimiento",
        "rejectInfraction": "Rechazar infracción",
        "record": "Registro",
        "records": "Registros",
        "selectFile": "Seleccionar archivo",
        "selectImage": "Seleccionar imagen",
        "userDetails": "Detalles del usuario",
        "verticalMarkets": "Sectores verticales",
        "videowallOpen": "Abrir videowall", //no traducir videowall si queda bien
        "vehicleRecord": "Registro del vehículo",
        "vehicleCapture": "Captura del vehículo",
        "captureInfo": "Información de la captura",
        "ecoLabels": "Distintivos ambientales", //de un vehículo
        "ecoLabel": "Distintivo {{label}}", //de un vehículo. Ejemplos: Distintivo A, Distintivo ECO
        "snowLevel": "Nivel de nieve en la carretera",
        "itvCampaigns": "Campañas ITV", ////Operativa temporal para detectar coches sin seguro
        "insuranceCampaigns": "Campañas seguro", //Operativa temporal para detectar coches sin seguro
        "vehicleInfo": "Información del vehículo",
        "vehicleTypes": "Tipo de vehículos",
        "alertTypes": "Tipo de alertas",
        "summary": "Resumen",
        "analyzedVehicles": "Vehículos analizados",
        "sanctionsCount": "Número de sanciones",
        "sanctionsByModule": "Sanciones por módulo",
        "radar": "Radar",
        "investigations": "Investigaciones",
        "vehicles": "Vehículos",
        "facialRecognition": "Reconocimiento facial",
        "fileShareRequest": "Solicitud compartición de archivos",
        "peopleFlow": "Afluencia de personas",
        "ageRange": "Rango de edad",
        "averageStay": "Estancia media",
        "collectionPoints": "Puntos de recogida", //basura
        "collectionVehicles": "Vehículos de recogida", //basura
        "incidences": "Incidencias",
        "motionDetection": "Detección de movimiento",
        "libraries": "Librerías", //de software
        "resources": "Recursos",
        "occupancy": "Ocupación", //cuanto de lleno está
        "recordImage": "Imagen del registro",
        "alertInfo": "Información de la alerta",
        "peopleMobility": "Movilidad de personas",
        "objectDetection": "Detección de objetos",
        "personAttributeRestriction": "Restricción por atributo de la persona",
        "vehicleAttributeRestriction": "Restricción por atributo del vehículo",
        "transport": "Transporte",
        "mobility": "Movilidad",
        "areaAccess": "Acceso a áreas",
        "dailyBoardings": "Subidas diarias",
        "dailyAlightings": "Bajadas diarias",
        "averageStopTime": "Tiempo medio de parada",
        "reidentificationRate": "Tasa re-identificación",
        "uniquePassengers": "Viajeros únicos",
        "averageDurationPerPassenger": "Duración media por pasajero",
        "passageTimeDeviation": "Desviación del tiempo de paso",
        "boardingsAndAlightings": "Subidas y bajadas",
        "transportedPassengers": "Pasajeros transportados",
        "stopTimes": "Tiempos de parada",
        "passengerDuration": "Duración del pasajero",
        "demandAccuracy": "Precisión de la demanda",
        "passengersOnBoard": "Pasajeros a bordo",
        "visualization": "Visualización",
        "lightMode": "Modo claro",
        "darkMode": "Modo oscuro",
        "indexRisk": "Índice de riesgo",
        "componentsTemperature": "Temperatura de los componentes",
        "higherValue": "Valor máximo: {{value}}",
        "lowerValue": "Valor mínimo: {{value}}",
        "trafficCongestionByHour": "Congestión de tráfico por hora",
        "speedVariationByHour": "Variación de la velocidad por hora",
        "ascending": "Ascendente",
        "descending": "Descendente",
        "people": "Personas",
        "averageAge": "Average age",
        "comparison": "Comparativa",
        "itvCampaignRecognitions": "Reconocimientos en campañas de ITV",
        "insuranceCampaignRecognitions": "Reconocimientos en campañas de seguros",
        "itvCampaignAlerts": "Alertas en campañas de ITV",
        "insuranceCampaignAlerts": "Alertas en campañas de seguros",
        "alertStatus": "Estado de las alertas",
        "moduleAlerts": "Alertas por módulo",
        "vulnerabilities": "Vulnerabilidades",
        "activeUsers": "Usuarios activos",
        "onlineUsers": "Usuarios online",
        "offlineUsers": "Usuarios offline",
        "systemUsers": "Usuarios del sistema",
        "systemConnections": "Conexiones del sistema",
        "latency": "Latencia",
        "dataUsage": "Uso de datos",
        "serverList": "Listado de servidores",
        "securityReview": "Revisión de seguridad",
        "serverRiskIndex": "Índice de riesgo del servidor",
        "lastBackup": "Último backup",
        "securityCertifications": "Certificaciones de seguridad",
        "securityComplianceIndex": "Índice de cumplimiento normativo de seguridad",
        "serverUsage": "Uso del servidor",
        "securityTrend": "Tendencia de seguridad",
        "serverConnections": "Conexiones del servidor",
        "metrics": "Métricas",
        "serverSecurityStatus": "Estado de seguridad del servidor",
        "connectionNetwork": "Red de conexiones",
        "dataVolume": "Volumen de datos",
        "internalConnections": "Conexiones internas",
        "externalConnections": "Conexiones externas",
        "internal": "Internas",
        "external": "Externas",
        "connection": "Conexión",
        "request": "Petición"
    },

    //Valores
    'values': {
        "": "",
        "-": "-",
        "available": "Disponible",
        "critical": "Crítico",
        "off": "Apagado",
        "ok": "OK", // No traducir si queda bien
        "on": "Encendido",
        "warning": "Advertencia",
        "static": "Estática",

        "stable": "Estable",
        "highRisk": "Alto riesgo de degradación",
        "mediumRisk": "Riesgo medio de degradación",

        "speedRatio": "Relación de velocidad",
        "reading": "Lectura",

        //Estados
        "EXPIRADA": "Expirada", //licencia
        "EN USO": "En uso",
        "PRORROGA": "Prórroga",
        "VALIDA": "Válida", //licencia
        "Finalizada": "Finalizada", //campaña
        "En curso": "En curso",
        "Pendiente": "Pendiente",
        "Enviada": "Enviada", //infracción
        "Rechazada": "Rechazada", //infracción
        "Procesando": "Procesando",

        //orientación vehículo (valor de orientationConversion)
        "Sin identificar": "Sin identificar",
        "Entrada": "Entrada",
        "Salida": "Salida",

        //dirección análisis
        "Both": "Bidireccional",
        "Up": "Arriba",
        "Down": "Abajo",

        //Tipos vehículo (valor de vehicleConversión)
        "Turismo": "Turismo", //tipo de vehículo "Car"
        "Sedán": "Sedán",
        "Camión": "Camión",
        "Moto": "Moto",
        "Furgoneta": "Furgoneta",
        "Autobús": "Autobús",
        "SUV": "SUV",
        "Policía": "Policía",
        "Ambulancia": "Ambulancia",
        "Ciclomotor": "Ciclomotor",
        "Bicicleta": "Bicicleta",
        "Bomberos": "Bomberos",
        "Remolque": "Remolque",
        "Construcción": "Construcción", //vehículo usado en construcción de edificios

        //Género
        "male": "Masculino",
        "female": "Femenino",

        //Tipos lista
        "b": "Lista blanca",
        "n": "Lista negra",

        //Tipo zonas
        "ZAR": "ZAR", //Zona acceso restringido
        "ZBE": "ZBE", //Zona bajas emisiones
        "DUM": "DUM", //Distribución Urbana de Mercancías
        "Nieve": "Nieve",

        //Edades
        "young": "Joven",
        "adult": "Adulto",
        "middle": "Mediana edad",
        "senior": "Anciano",
        "unknown": "Desconocido"
    },

    //Nomenclatura para las acciones de los servidores
    "server_actions": {
        "forced_power_off": {
            "name": "Forzar apagado",
            "message": "¿Desea forzar el apagado del servidor?"
        },
        "forced_restart": {
            "name": "Forzar reinicio",
            "message": "¿Desea forzar el reinicio del servidor?"
        },
        "refresh": {
            "name": "Actualizar",
            "message": "¿Desea actualizar el servidor?"
        },
        "uid_on": {
            "name": "Modificar UID",
            "message": "¿Desea modificar la luz UID del servidor?",
            "status": {
                "lit": "Encendido",
                "off": "Apagado",
                "blinking": "Parpadeando"
            }
        },
        "jump_to_ibmc": {
            "name": "Acceso al servidor",
            "message": "¿Desea acceder al servidor?"
        },
        "kvm": {
            "name": "Acceso remoto",
            "message": "¿Desea acceder remotamente al servidor?"
        },
        "export_logs": {
            "name": "Exportar logs",
            "message": "¿Desea exportar los registros del servidor?"
        },
        "remove": {
            "name": "Eliminar servidor",
            "message": "¿Está seguro de que desea eliminar el servidor?"
        },
        "change_mgmt_password": {
            "name": "Cambiar contraseña",
            "message": "¿Está seguro de que desea cambiar la contraseña del servidor?"
        },
        "format_disk": {
            "name": "Formatear disco",
            "message": "¿Está seguro de que desea formatear el disco seleccionado?"
        },
        "ibmc_ip_config": {
            "name": "Modificar dirección IP",
            "message": "¿Está seguro de que desea modificar la dirección IP de acceso iBMC?"
        }
    },
    "analysis_settings": {
        "warning": "Una configuración incorrecta puede hacer que el sistema consuma más recursos de los necesarios, lo que provocará una degradación del rendimiento.",
        "resolution": {
            "name": "Resolución de vídeo",
            "hint": "Define la resolución de vídeo sobre la cual se realizará el análisis de IA. Seleccionar una resolución más alta mejora la precisión, pero también aumenta el consumo de recursos del sistema y puede limitar el número de flujos de IA que se ejecutan simultáneamente.",
            "values": {
                "native": "Nativa",
                "default": "Predeterminada",
                "0.3": "0.3 megapíxeles",
                "1": "1 megapíxel",
                "2": "2 megapíxeles",
                "4": "4 megapíxeles",
                "5": "5 megapíxeles",
                "8": "8 megapíxeles",
                "low": "Baja",
                "medium": "Media",
                "high": "Alta"
            }
        },
        "tracking": {
            "name": "Velocidad de seguimiento de IA",
            "hint": "La función de velocidad de seguimiento de IA permite ajustar la frecuencia de fotogramas a la que la IA procesa los datos.\nModificar este valor respecto al ajuste predeterminado puede afectar al rendimiento del servidor y reducir el número de flujos de IA que pueden ejecutarse simultáneamente en el mismo dispositivo.",
            "values": {
                "low": "5 FPS - Optimizado para la mayoría de los casos de vigilancia de seguridad",
                "medium": "10 FPS - Optimizado para el seguimiento de objetivos de movimiento rápido (por ejemplo, ciclistas)",
                "high": "15 FPS - Optimizado para capturar objetivos que se mueven muy rápido (por ejemplo, patinetes eléctricos)"
            }
        },
        "detection": {
            "name": "Modo de detección",
            "hint": "La configuración del modo de detección determina cómo se activa la detección:\n- Detección inteligente: se basa en el movimiento para activar las detecciones, lo que la hace eficiente en escenarios donde el movimiento es el principal indicador de interés. Ideal para entornos con poca actividad, minimizando la carga de procesamiento al centrarse solo en las áreas con movimiento.\n- Detección activa: realiza detección en toda la pantalla independientemente del movimiento, garantizando un análisis completo. Este modo es especialmente útil en escenas densas o en escenarios que requieren la detección de objetos estáticos, como personas o vehículos en conteo.",
            "values": {
                "smart": "Detección inteligente",
                "active": "Detección activa"
            }
        },
        "sensitivity": {
            "name": "Sensibilidad de detección",
            "hint": "Aumentar la sensibilidad de detección mejora la capacidad de detectar objetivos difíciles (por ejemplo, más pequeños, parcialmente ocultos o afectados por el ruido del objetivo), pero puede generar más falsos positivos.\nCambie la configuración de 'Sensibilidad de detección' a 'Alta' si el sistema omite eventos que implican objetos pequeños o en escenas muy concurridas.",
            "values": {
                "low": "Baja",
                "medium": "Media",
                "high": "Alta"
            }
        },
        "movement": {
            "name": "Sensibilidad al movimiento",
            "hint": "La sensibilidad al movimiento controla cómo determina el sistema si se está produciendo movimiento.\nFactores ambientales como la lluvia, la nieve, el ruido de la cámara o los reflejos de luz pueden causar detecciones de movimiento falsas. Reducir la sensibilidad puede minimizar estas detecciones erróneas, aunque aumenta el riesgo de perder objetos que se mueven rápidamente o que son visibles durante muy poco tiempo.",
            "values": {
                "low": "Baja",
                "medium": "Media",
                "high": "Alta"
            }
        },
        "attributes_extraction": {
            "name": "Extracción de atributos",
            "hint": "La extracción de atributos permite recopilar diversas características de vehículos y personas — como el color, tipo de vehículo, género, edad, si llevan una bolsa, si están fumando y más."
        }
    }

}