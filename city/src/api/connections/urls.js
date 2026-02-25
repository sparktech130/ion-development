//-----------------------------------CORE--------------------------------------------------

//AUTH/LOGIN
export const URL_AUTH_LOGIN="/auth/login.php"
export const URL_AUTH_LOGOUT="/auth/logout.php"
export const URL_AUTH_COMPROBAR_2FA = "/auth/comprobar2FA.php"
export const URL_AUTH_RECUPERAR_PWD = "/auth/recuperarPassword2FA.php"
export const URL_AUHT_CAMBIAR_PWD_2FA = "/auth/cambiarPassword2FA.php"

//CLOUD_NX
export const URL_OBTENER_CLOUDS = '/cloud_nx/obtener.php'
export const URL_INSERTAR_CLOUDS = '/cloud_nx/insertar.php'
export const URL_MODIFICAR_CLOUDS ='/cloud_nx/modificar.php'
export const URL_ELIMINAR_CLOUDS ='/cloud_nx/eliminar.php'
export const URL_ONTENER_DISPOSITIVOS_SYNC = '/cloud_nx/obtenerDispositivosSincronizar.php'
export const URL_INSERTAR_DISPOSITIVOS_SYNC = '/cloud_nx/insertarDispositivosSincronizar.php'

//DISPOSITIVOS
export const URL_OBTENER_DISPOSITIVOS="/dispositivos/obtener.php"
export const URL_INSERTAR_DISPOSITIVOS = '/dispositivos/insertar.php'
export const URL_MODIFICAR_DISPOSITIVOS = '/dispositivos/modificar.php'
export const URL_ELIMINAR_DISPOSITIVOS = '/dispositivos/eliminar.php'
export const URL_OBTENER_STREAM="/dispositivos/obtenerStreamNx.php"
export const URL_OBTENER_DISPOSITIVOS_IMAGEN="/dispositivos/obtenerUltimaImagen"
export const URL_OBTENER_IMAGEN_DISPOSITIVO = '/dispositivos/obtenerImagen.php'

//DISPOSITIVOS/PTZ
export const URL_PTZ_MOVER = '/dispositivos/ptz/moverDispositivo.php'
export const URL_PTZ_FOCUS = '/dispositivos/ptz/focusDispositivo.php'
export const URL_PTZ_PRESETS = '/dispositivos/ptz/presetsDispositivo.php'
export const URL_PTZ_TOURS = '/dispositivos/ptz/toursDispositivo.php'

//FABRICANTES
export const URL_OBTENER_CATEGORIAS = '/fabricantes/categorias/obtener.php'
export const URL_OBTENER_MODELOS = '/fabricantes/modelos/obtener.php'

//INTEGRACIONES
export const URL_INTEGRACIONES_OBTENER = "/integraciones/obtener"

//LICENCIAS
export const URL_OBTENER_LICENCIAS = "/licencias/obtener.php"
export const URL_INSERTAR_LICENCIA = '/licencias/agregarLicenciaUsuario.php'
export const URL_OBTENER_CANALES = '/licencias/obtenerCanales.php'

//MÓDULOS
export const URL_OBTENER_SECCIONES = "/modulos/secciones/obtener.php"

//PROVINCIAS
export const URL_OBTENER_PROVINVIAS = '/provincias/obtener'
export const URL_OBTENER_POBLACIONES = '/provincias/poblaciones/obtener'

//RECONOCIMIENTOS
export const URL_OBTENER_RECONOCIMIENTOS_PARAM="/reconocimientos/obtener.php"
export const URL_OBTENER_RECONOCIMIENTOS_GROUP="/reconocimientos/group.php"
export const URL_OBTENER_RECONOCIMIENTOS_GROUP_24="/reconocimientos/group24.php"
export const URL_MARCAR_RECONOCIMIENTOS = '/reconocimientos/marcar'

//RECONOCIMIENTOS - PERSONAS
export const URL_RECONOCIMIENTOS_PERSONAS_OBTENER = "/reconocimientos_personas/obtener"
export const URL_RECONOCIMIENTOS_PERSONAS_GROUP = "/reconocimientos_personas/group"
export const URL_RECONOCIMIENTOS_PERSONAS_IMAGEN_ORIGINAL = "/reconocimientos_personas/obtenerFotoOriginal"
export const URL_MARCAR_RECONOCIMIENTOS_PERSONAS = '/reconocimientos_personas/marcar'

//USUARIOS
export const URL_OBTENER_USUARIOS = "/usuarios/obtener.php"
export const URL_MODIFICAR_USUARIO = "/usuarios/modificar.php"
export const URL_ELIMINAR_USUARIO = "/usuarios/eliminar.php"
export const URL_INSERTAR_USUARIO = "/usuarios/insertar.php"

//USUARIOS/PERMISOS
export const URL_OBTENER_PERMISOS_USUARIOS = "/usuarios/permisos/obtener.php"
export const URL_INSERTAR_PERMISOS = "/usuarios/permisos/insertar.php"
export const URL_MODIFICAR_PERMISOS = "/usuarios/permisos/modificar.php"
export const URL_ELIMINAR_PERMISOS = "/usuarios/permisos/eliminar.php"

//USUARIOS/LOGS
export const URL_OBTENER_USER_LOGS = "/usuarios/logs/obtener.php"
export const URL_OBTENER_USER_SESSIONS ='/usuarios/logs/obtenerSesiones.php'

//USUARIOS/GRID
export const URL_OBTENER_GRIDS="/usuarios/grid/obtener.php"
export const URL_ELIMINAR_GRID="/usuarios/grid/eliminar.php"
export const URL_INSERTAR_GRID="/usuarios/grid/insertar.php"
export const URL_MODIFICAR_GRID="/usuarios/grid/modificar.php"

//VMS
export const URL_OBTENER_CALENDARIO_VIDEOS_DISPOSITIVO = "/vms/obtenerCalendarioVideosDispositivo.php"
export const URL_OBTENER_DIAS_CON_VIDEO = "/vms/obtenerDiasConVideoDispositivo.php"
export const URL_OBTENER_EVENTOS_ERRORES_DISPOSITIVO = "/vms/obtenerEventosErroresDispositivo.php"
export const URL_OBTENER_RECONOCIMIENTOS_ZONA = "/vms/obtenerReconocimientosZonaVideo.php"

//VMS/VIDEOS
export const URL_COMPARTIR_VIDEO = "/vms/videos/compartirVideoUsuario.php"
export const URL_OBTENER_VIDEOS_COMPARTIDOS = "/vms/videos/obtenerVideosRecibidos.php"
export const URL_DESCARGAR_FRAGMENTO_VIDEO = "/vms/videos/descargarFragmentoVideo.php"
export const URL_ELIMINAR_VIDEO = "/vms/videos/eliminarVideo.php"
export const URL_DESCARGAR_CLIP = "/vms/videos/descargarVideoDispositivo.php"



//-----------------------------------IONCITY--------------------------------------------------

//ALERTAS
export const URL_OBTENER_ALERTAS = '/alertas/obtener.php'
export const URL_OBTENER_PREVALIDACION_ALERTAS = '/alertas/obtenerPdtes.php'
export const URL_OBTENER_ALERTAS_GROUP = '/alertas/group.php'
export const URL_OBTENER_ALERTAS_GROUP_24 = '/alertas/group24.php'
export const URL_VALIDAR_ALERTA = '/alertas/validar.php'
export const URL_MODIFICAR_ALERTAS = '/alertas/modificar.php'

//AREAS
export const URL_OBTENER_ZONAS = '/areas/restringidas/obtener.php'
export const URL_INSERTAR_ZONA = '/areas/restringidas/insertar.php'
export const URL_MODIFICAR_ZONAS = '/areas/restringidas/modificar.php'
export const URL_ELIMINAR_ZONAS = '/areas/restringidas/eliminar.php'

//AREAS/AUTORIZADOS
export const URL_OBTENER_AUTORIZADOS = '/areas/autorizados/obtener.php'
export const URL_INSERTAR_AUTORIZADO = '/areas/autorizados/insertar.php'
export const URL_MODIFICAR_AUTORIZADOS = '/areas/autorizados/modificar.php'
export const URL_ELIMINAR_AUTORIZADOS = '/areas/autorizados/eliminar.php'
export const URL_IMPORTAR_AREAS_AUTORIZADOS = "areas/autorizados/importar.php"

//CAMPAÑAS (No están hechas en backend)
export const URL_OBTENER_RECONOCIMIENTOS_CAMPAIGN="campaigns/obtenerReconocimientos.php"
export const URL_OBTENER_CAMPAIGN = '/campaigns/obtener.php'
export const URL_ELIMINAR_CAMPAIGN = '/campaigns/eliminar.php'
export const URL_MODIFICAR_CAMPAIGN = '/campaigns/modificar.php'
export const URL_INSERTAR_CAMPAIGN = '/campaigns/insertar.php'

//DISPOSITIVOS
export const URL_ESTABLECER_VELOCIDAD = '/dispositivos/establecerVelocidadLimite.php'
export const URL_OBTENER_VELOCIDAD = '/dispositivos/obtenerVelocidadLimite.php'

//INFRACCIONES
export const URL_OBTENER_INFRACCIONES = '/infracciones/obtener.php'
export const URL_ENVIAR_INFRACCIONES = '/infracciones/enviar.php'
export const URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP = '/infracciones/group.php'
export const URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP_24 = '/infracciones/group24.php'

//INFRACCIONES/GESTION
export const URL_OBTENER_INFRACCIONES_GESTION = '/infracciones/gestion/obtener.php'
export const URL_ELIMINAR_INFRACCIONES_GESTION = '/infracciones/gestion/eliminar.php'
export const URL_INSERTAR_INFRACCIONES_GESTION = '/infracciones/gestion/insertar.php'
export const URL_MODIFICAR_INFRACCIONES_GESTION = '/infracciones/gestion/modificar.php'
export const URL_IMPORTAR_INFRACCIONES_GESTION = '/infracciones/gestion/importar.php'

//INVESTIGACIONES (No están hechas en backend)
export const URL_OBTENER_INVESTIGACIONES = '/investigaciones/obtener.php'
export const URL_INSERTAR_INVESTIGACION = '/investigaciones/insertar.php'
export const URL_MODIFICAR_INVESTIGACION = '/investigaciones/modificar.php'
export const URL_OBTENER_LOGS_INVESTIGACIONES = '/investigaciones/obtenerLogs.php'

//LISTAS
export const URL_OBTENER_LISTAS = '/listas/obtener.php'
export const URL_INSERTAR_LISTAS = '/listas/insertar.php'
export const URL_EDITAR_LISTAS = '/listas/modificar.php'
export const URL_ELIMINAR_LISTAS = '/listas/eliminar.php'

//LISTAS/VEHICULOS
export const URL_INSERTAR_VEHICULO_LISTAS = '/listas/vehiculos/insertar.php'
export const URL_MODIFICAR_VEHICULO_LISTAS = '/listas/vehiculos/modificar.php'
export const URL_ELIMINAR_VEHICULO_LISTAS = '/listas/vehiculos/eliminar.php'
export const URL_IMPORTAR_ARCHIVO = '/listas/vehiculos/importar.php'

//LISTAS/DESTINATARIOS
export const URL_OBTENER_DESTINATARIO_LISTAS = '/listas/destinatarios/obtener'
export const URL_INSERTAR_DESTINATARIO_LISTAS = '/listas/destinatarios/insertar'
export const URL_MODIFICAR_DESTINATARIO_LISTAS = '/listas/destinatarios/modificar'
export const URL_ELIMINAR_DESTINATARIO_LISTAS = '/listas/destinatarios/eliminar'
export const URL_IMPORTAR_DESTINATARIOS = '/listas/destinatarios/importar'



//PADRÓN
export const URL_OBTENER_VEHICULOS = '/padron/obtener.php'
export const URL_INSERTAR_VEHICULO = '/padron/insertar.php'
export const URL_MODIFICAR_VEHICULO = '/padron/modificar.php'
export const URL_ELIMINAR_VEHICULO = '/padron/eliminar.php'
export const URL_IMPORTAR_VEHICULOS = '/padron/importar.php'


//Servidores
export const URL_NODOS_OBTENER = "/XFUSION-API/nodos/obtener"
export const URL_NODOS_DETALLE = "/XFUSION-API/nodos/detalles"
export const URL_NODOS_ESTADISTICAS = "XFUSION-API/estadisticas/obtener"
export const URL_NODOS_ACCIONES = "/XFUSION-API/nodos/accion"




//---------------------OBSOLETAS ELIMINAR CUANDO SE QUITE CLIENTES Y GENERADOR KEYS  LICENCIAS. Se hará desde ION ADMIN------------------

//LICENCIAS
export const URL_GENERAR_LICENCIAS = '/licencias/generarClavesLicencia.php'
export const URL_MODIFICAR_LICENCIAS = '/licencias/modificarLicencia.php'
export const URL_ELIMINAR_LICENCIA = '/licencias/eliminarLicencia.php'

//Clientes
export const URL_OBTENER_CLIENTES = '/clientes/obtener.php'
export const URL_INSERTAR_CLIENTES = '/clientes/insertar.php'
export const URL_MODIFICAR_CLIENTES = '/clientes/modificar.php'
export const URL_ELIMINAR_CLIENTES = '/clientes/eliminar.php'