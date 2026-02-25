
//---------------IMPORTACIONES------------------------------------------------

//constants
import { tiposVehiculo } from './common'

//ICONOS SECCIONES
//General
import live from "@icons/navbar/live.svg?react"
import alerts from "@icons/navbar/alerts.svg?react"
import consult from "@icons/navbar/consulting.svg?react"
import lists from "@icons/navbar/lists.svg?react"
import stats from "@icons/navbar/stats.svg?react"
import map from "@icons/navbar/map.svg?react"
import grid from "@icons/grid/grid.svg?react"
import zone from "@icons/navbar/zones.svg?react"
import report from "@icons/navbar/report.svg?react"
import prevalidation from "@icons/navbar/prevalidation.svg?react"
import sending from "@icons/navbar/sending.svg?react"
import infringements from '@icons/navbar/infringement.svg?react'
import campaigns from '@icons/navbar/police.svg?react'

//Mobility
import vehicleRecords from '@icons/navbar/vehicle_reports.svg?react'
import personRecords from '@icons/navbar/person_reports.svg?react'
import people from '@icons/navbar/people.svg?react'

//Analytic
import investigaciones from '@icons/navbar/investigation.svg?react'

//Vms
import liveVms from "@icons/navbar/live-vms.svg?react"
import files from "@icons/navbar/files.svg?react"

//Configuración
import devices from "@icons/navbar/devices.svg?react"
import cloud from "@icons/navbar/cloud.svg?react"
import users from "@icons/navbar/users.svg?react"
import permissions from "@icons/navbar/permissions.svg?react"
import clients from "@icons/navbar/clients.svg?react"
import generator from "@icons/navbar/key_generator.svg?react"
import licenses from "@icons/navbar/licenses.svg?react"
import audit from "@icons/navbar/audit.svg?react"
import sessions from "@icons/navbar/logs.svg?react"
import integrations from "@icons/navbar/integrations.svg?react"

//seguridad
import monitoring from "@icons/navbar/monitoring.svg?react"
import externalConsults from "@icons/navbar/externalConsults.svg?react"

//Mantenimiento
import servers from '@icons/navbar/servers.svg?react'

//ICONOS MÓDULOS
//Home
import configuration from "@icons/navbar/configuration.svg?react"
import maintenance from "@icons/navbar/maintenance.svg?react"
import security from "@icons/navbar/security.svg?react"
import smartcity from '@icons/navbar/smartcity.svg?react'

//módulos city
import traffic from '@icons/navbar/traffic.svg?react'
import mobility from '@icons/navbar/mobility.svg?react'
import infringement from '@icons/navbar/infringement.svg?react'
import analytic from '@icons/navbar/analytic.svg?react'
import vms from '@icons/navbar/vms.svg?react'
import recycling from '@icons/navbar/recycling.svg?react'


//ICONOS ALERTAS
//alertas Traffic
import speeding from '@icons/alerts/speeding.svg?react'
import inverse from '@icons/alerts/incorrect-road.svg?react'
import documentation from '@icons/alerts/documentation.svg?react'
import itv from '@icons/alerts/itv.svg?react'
import overtaking from '@icons/alerts/overtaking.svg?react'
import insurance from '@icons/alerts/insurance.svg?react'
import traffic_lights from '@icons/alerts/traffic-lights.svg?react'
import parking from '@icons/alerts/parking.svg?react'
import theft from '@icons/alerts/theft.svg?react'
import stop from '@icons/alerts/stop.svg?react'
import turn_around from '@icons/alerts/turn-around.svg?react'
import zona from '@icons/alerts/zar-2.svg?react'

//alertas Mobility
import zar from '@icons/alerts/zar.svg?react'
import zbe from '@icons/alerts/zbe.svg?react'
import dum from '@icons/alerts/dum.svg?react'
import snow from '@icons/alerts/snow.svg?react'
//alertas
import object_left from '@icons/alerts/object-left.svg'

//TIPOS VEHICULO
import turismoIcon from '@icons/vehicles/turismo.svg?react'
import ambulanciaIcon from '@icons/vehicles/ambulancia.svg?react'
import bicicletaIcon from '@icons/vehicles/bicicleta.svg?react'
import bomberosIcon from '@icons/vehicles/bomberos.svg?react'
import busIcon from '@icons/vehicles/bus.svg?react'
import camionIcon from '@icons/vehicles/camion.svg?react'
import ciclomotorIcon from '@icons/vehicles/ciclomotor.svg?react'
import furgonetaIcon from '@icons/vehicles/furgoneta.svg?react'
import motoIcon from '@icons/vehicles/moto.svg?react'
import policeIcon from '@icons/vehicles/police.svg?react'
import remolqueIcon from '@icons/vehicles/remolque.svg?react'
import suvIcon from '@icons/vehicles/suv.svg?react'
import questionIcon from '@icons/actions/question.svg?react'

//INDUSTRY
//Tipos dispositivos
//Iconos
import cameraIcon from "@icons/devices/camera.svg?react"
import lockIcon from "@icons/devices/lock.svg?react"
import monitorIcon from "@icons/devices/monitor.svg?react"
import ambientIcon from "@icons/devices/ambient.svg?react"
import engineIcon from "@icons/devices/engine.svg?react"
import ultrasonicIcon from "@icons/devices/ultrasonic.svg?react"

//Marcadores
import marker from '@icons/markers/marker-cam.svg?react'
import sensorMarker from '@icons/markers/sensor_marker.svg?react'
import accessMarker from '@icons/markers/access.svg?react'
import monitorMarker from '@icons/markers/monitor.svg?react'

//Analysis
import assisted from '@icons/analysis/assisted.svg?react'
import carrying_bag from '@icons/analysis/carrying_bag.svg?react'
import face_covered from '@icons/analysis/face_covered.svg?react'
import glasses from '@icons/analysis/glasses.svg?react'
import phone from '@icons/analysis/phone.svg?react'
import smoking from '@icons/analysis/smoking.svg?react'
import tattoo from '@icons/analysis/tattoo.svg?react'



//----------------------------------GRUPOS ICONOS---------------------------------------

//Iconos secciones. los nombres son los de la tabla de seccions BD
export const sectionIcons = {
    //GENERAL
    "LIVE": live,
    "CONSULTAS": consult,
    "VEHICULOS": suvIcon,
    "ALERTAS": alerts,
    "LISTAS": lists,
    "ESTADISTICAS": stats,
    "MAPA": map,
    "LAYOUTS": grid,
    "ZONAS": zone,
    "INFORMES": report,
    "PREVALIDACION": prevalidation,
    "ENVIO": sending,
    "INFRACCIONES": infringements,

    //MOBILITY
    "MOVILIDAD": mobility,
    "TRANSPORTE": busIcon,
    "REGISTRO_PERSONAS": personRecords,
    "REGISTRO_VEHICULOS": vehicleRecords,
    "ESTADISTICAS_VEHICULOS": suvIcon,
    "ESTADISTICAS_PERSONAS": people,
    "ESTADISTICAS_TRANSPORTE": busIcon,

    //VMS
    "VMS": liveVms,
    "ARCHIVOS": files,
    //CONF
    "DISPOSITIVOS": devices,
    "CLOUD": cloud,
    "USUARIOS": users,
    "PERMISOS": permissions,
    "LICENCIAS": licenses,
    "AUDITORIA": audit,
    "SESIONES" : sessions,
    "CLIENTES": clients,
    "CLAVES": generator,
    "PADRON": traffic,
    "INTEGRACIONES": integrations,
    //SEGURIDAD
    'MONITORIZACION': monitoring,
    'CONSULTAS_EXT' : externalConsults,
    //MANTENIMIENTO
    'SERVIDORES': servers,
    //ANALYTIC
    'ANALISIS': investigaciones,
    'INVESTIGACIONES': consult,
    //INRINGEMENT
    'CAMPAÑAS': campaigns,
}

//Iconos módulos
export const modulesIcons = {
    //Home
    '0000': smartcity,
    '0108': configuration,
    '0109': security,
    '0010': maintenance,

    //City
    '0015': traffic,
    '0011': mobility,
    '0008': infringement,
    '0014': recycling,
    '0001': analytic,
    '0017': vms,

}

//----------------------------------ALERTAS---------------------------------------

//iconos alertas city
export const cityAlertsIcons = {
    '0001': speeding,
    '0002': inverse,
    '0003': documentation,
    '0004': itv,
    '0005': overtaking,
    '0006': insurance,
    '0007': traffic_lights,
    '0008': parking,
    '0009': theft,
    '0010': stop,
    '0011': turn_around,
    '0012': zona,
    '0100': zar,
    '0101': zbe,
    '0102': dum,
    '0103': snow,
    '0110': object_left
}

//------------------VEHICULOS--------------------------

//Si se añaden añadir a vehicleConversion y constants/common/tiposVehiculo
export const vehicleIcons = {
    [tiposVehiculo[0].name]: turismoIcon,
    [tiposVehiculo[1].name]: camionIcon,
    [tiposVehiculo[2].name]: motoIcon,
    [tiposVehiculo[3].name]: furgonetaIcon,
    [tiposVehiculo[4].name]: busIcon,
    [tiposVehiculo[5].name]: suvIcon,
    [tiposVehiculo[6].name]: policeIcon,
    [tiposVehiculo[7].name]: ambulanciaIcon,
    [tiposVehiculo[8].name]: ciclomotorIcon,
    [tiposVehiculo[9].name]: bicicletaIcon,
    [tiposVehiculo[10].name]: remolqueIcon,
    [tiposVehiculo[11].name]: bomberosIcon,
    'Sin identificar': questionIcon,
}

//-----------------------DISPOSITIVOS---------------------

export const deviceIcons = {
    "0001": ambientIcon,
    "0002": cameraIcon,
    "0003": lockIcon,
    "0004": monitorIcon,
    "0005": ultrasonicIcon,
    "0006": engineIcon,
}

//--------------------MARCADORES------------------------------

//marcadores
export const markerIcons = {
    '0001': sensorMarker,
    '0002': marker,
    '0003': accessMarker,
    '0004': monitorMarker,
}

//--------------------ANALYSIS------------------------------

//marcadores
export const analysis_icons = {
    telefono: phone,
    gafas: glasses,
    carga_bolsa: carrying_bag,
    asistido: assisted,
    fumando: smoking,
    tatuado: tattoo,
    cara_tapada: face_covered,
}