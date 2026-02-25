//Version
export const version = "v3.0.4.38"

//Paths
export const url_path = '/core'
export const url_path_ioncity = '/ioncity'
export const url_path_city = '/city'

//Alerts
export const alert_codes = ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012", "0100", "0101", "0102"]
export const alert_codes_traffic = ["0001", "0002", "0003", "0004", "0005", "0006", "0007", "0008", "0009", "0010", "0011", "0012"]
export const alerta_codes_mob = ["0100", "0101", "0102"]

export const areas = { '0100': 'ZAR', '0101': 'ZBE', '0102': 'DUM', '0103': 'Nieve' }

export const paises = ["ABW", "AFG", "AGO", "AIA", "ALA", "ALB", "AND", "ARE", "ARG", "ARM", "ASM", "ATA", "ATF", "ATG", "AUS", "AUT", "AZE", "BDI", "BEL", "BEN", "BFA", "BGD", "BGR", "BHR", "BHS", "BIH", "BLM", "BLR", "BLZ", "BMU", "BOL", "BRA", "BRB", "BRN", "BTN", "BVT", "BWA", "CAF", "CAN", "CCK", "CHE", "CHL", "CHN", "CIV", "CMR", "COG", "COK", "COL", "COM", "CPV", "CRI", "CUB", "CXR", "CYM", "CYP", "CZE", "DEU", "DJI", "DMA", "DNK", "DOM", "DZA", "ECU", "EGY", "ERI", "ESH", "ESP", "EST", "ETH", "FIN", "FJI", "FRA", "FRO", "FSM", "GAB", "GBR", "GEO", "GGY", "GHA", "GIB", "GIN", "GLP", "GMB", "GNB", "GNQ", "GRC", "GRD", "GRL", "GTM", "GUF", "GUM", "GUY", "HKG", "HMD", "HND", "HRV", "HTI", "HUN", "IDN", "IMN", "IND", "IOT", "IRL", "IRN", "IRQ", "ISL", "ISR", "ITA", "JAM", "JEY", "JOR", "JPN", "KAZ", "KEN", "KGZ", "KHM", "KIR", "KNA", "KOR", "KWT", "LAO", "LBN", "LBR", "LBY", "LCA", "LIE", "LKA", "LSO", "LTU", "LUX", "LVA", "MAC", "MAR", "MCO", "MDA", "MDG", "MDV", "MEX", "MHL", "MKD", "MLI", "MLT", "MMR", "MNE", "MNG", "MOZ", "MRT", "MSR", "MTQ", "MUS", "MWI", "MYS", "MYT", "NAM", "NCL", "NER", "NFK", "NGA", "NIC", "NIU", "NLD", "NOR", "NPL", "NRU", "NZL", "OMN", "PAK", "PAN", "PCN", "PER", "PHL", "PLW", "PNG", "POL", "PRI", "PRK", "PRT", "PRY", "PSE", "PYF", "QAT", "REU", "ROU", "RUS", "RWA", "SAU", "SDN", "SEN", "SGP", "SGS", "SHN", "SJM", "SLB", "SLE", "SLV", "SMR", "SOM", "SPM", "SRB", "STP", "SUR", "SVK", "SVN", "SWE", "SWZ", "SYC", "SYR", "TCA", "TCD", "TGO", "THA", "TJK", "TKL", "TKM", "TLS", "TON", "TTO", "TUN", "TUR", "TUV", "TWN", "TZA", "UGA", "UKR", "URY", "USA", "UZB", "VAT", "VCT", "VEN", "VGB", "VIR", "VNM", "VUT", "WLF", "WSM", "YEM", "ZAF"]

//Dispositivos
export const streamDevices = ['0002', '0004']
export const sensorDevices = ['0001', '0003', '0005']
export const engineDevices = ['0006']

//Análisis IA
export const infractionModules = ['mobility', 'traffic']
export const lprCodes = ['0015', '0022']

export const idiomas = [
    { cod: "ca", name: "Català" },
    { cod: "en", name: "English" },
    { cod: "es", name: "Español" },
    { cod: "ja", name: "日本語" },
]

//Colors
export const zoneColors = {

    //Zonas Mobility
    "ZAR": '#E72584',
    "ZBE": '#AE6BCC',
    "DUM": '#FFAB49',

    //Campañas
    "Vehículo sin ITV": '#4C95D9',
    "Vehículo sin seguro": '#AE6BCC'
}

//*-----DASHBOARD----*//

//Pantalla principal
export const home = [
    {
        'code': '0000',
        'letter_code': 'SC',
        'name': 'SMART CITY',
        'name_simplified': 'City',
        'subtitle': 'sectionDescriptions.CITY',
        'image': 'images/smartcity.webp',
        'alt': 'Imagen de Smart CIty',
        'icon': 'icons/smartcity.svg',
        'module': 'smartcity',
        'main': 'smartcity',
        'noLoading': true,
        'disabled': false,
        'isSector': true
    },
    {
        'code': '0108',
        'name': 'CONFIGURACIÓN',
        'name_simplified': 'Configuración',
        'name_code': 'sections.CONFIGURACIÓN',
        'subtitle': 'sectionDescriptions.CONFIGURACIÓN',
        'image': 'images/configuration.webp',
        'alt': 'Imagen de Configuración',
        'icon': 'icons/configuration.svg',
        'module': 'configuration',
        'main': 'configuration-devices',
        'disabled': false,
        'isModule': true
    },
    {
        'code': '0109',
        'name': 'SEGURIDAD',
        'name_simplified': 'Seguridad',
        'name_code': 'sections.SEGURIDAD',
        'subtitle': 'sectionDescriptions.SEGURIDAD',
        'image': 'images/security.webp',
        'alt': 'Imagen de Seguridad',
        'icon': 'icons/security.svg',
        'module': 'security',
        'main': 'security-monitoring',
        'disabled': false,
        'isModule': true
    },
    {
        'code': '0010',
        'name': 'MANTENIMIENTO',
        'name_simplified': 'Mantenimiento',
        'name_code': 'sections.MANTENIMIENTO',
        'subtitle': 'sectionDescriptions.MANTENIMIENTO',
        'image': 'images/maintenance.webp',
        'alt': 'Imagen de Mantenimiento',
        'icon': 'icons/maintenance.svg',
        'module': 'maintenance',
        'main': 'maintenance-servers',
        'disabled': false,
        'isModule': true
    },
]

//Modulos Smart City
export const smartcity_modules = [
    {
        'code': '0015',
        'letter_code': 'TR',
        'name': 'ION TRAFFIC',
        'subtitle': 'sectionDescriptions.TRAFFIC',
        'name_simplified': 'Traffic',
        'image': 'images/traffic.webp',
        'alt': 'Imagen de ION Traffic',
        'icon': 'icons/traffic.svg',
        'module': 'traffic',
        'main': 'traffic-live',
        'disabled': false
    },
    {
        'code': '0011',
        'letter_code': 'MOB',
        'name': 'ION MOBILITY',
        'subtitle': 'sectionDescriptions.MOBILITY',
        'name_simplified': 'Mobility',
        'image': 'images/mobility.webp',
        'alt': 'Imagen de ION Mobility',
        'icon': 'icons/mobility.svg',
        'module': 'mobility',
        'main': 'mobility-live',
        'disabled': false
    },
    {
        'code': '0008',
        'letter_code': 'IFG',
        'name': 'ION INFRINGEMENT',
        'subtitle': 'sectionDescriptions.INFRINGEMENT',
        'name_simplified': 'Infringement',
        'image': 'images/infringement.webp',
        'alt': 'Imagen de ION Infringement',
        'icon': 'icons/infringement.svg',
        'module': 'infringement',
        'main': 'infringement-live',
        'disabled': false
    },
    {
        'code': '0007',
        'letter_code': 'GRA',
        'name': 'ION TOW',
        'subtitle': '',
        'name_simplified': 'Tow',
        'image': 'images/tow.webp',
        'alt': 'Imagen de ION Tow',
        'icon': 'icons/tow.svg',
        'module': 'tow',
        'main': 'tow-live',
        'disabled': true
    },
    {
        'code': '0013',
        'letter_code': 'PRK',
        'name': 'ION PARKING',
        'subtitle': '',
        'name_simplified': 'Parking',
        'image': 'images/parking.webp',
        'alt': 'Imagen de ION Parking',
        'icon': 'icons/parking.svg',
        'module': 'parking',
        'main': 'parking-live',
        'disabled': true
    },
    {
        'code': '0001',
        'letter_code': 'ATC',
        'name': 'ION ANALYTIC',
        'subtitle': 'sectionDescriptions.ANALYTIC',
        'name_simplified': 'Analytic',
        'image': 'images/analytic.webp',
        'alt': 'Imagen de ION Analytic',
        'icon': 'icons/analytic.svg',
        'module': 'analytic',
        'main': 'analytic-live',
        'disabled': false
    },
    {
        'code': '0006',
        'letter_code': 'EVR',
        'name': 'ION ENVIRONMENT',
        'subtitle': '',
        'name_simplified': 'Environment',
        'image': 'images/environment.webp',
        'alt': 'Imagen de ION Environment',
        'icon': 'icons/environment.svg',
        'module': 'environment',
        'main': 'environment-live',
        'disabled': true
    },
    {
        'code': '0014',
        'letter_code': 'RCL',
        'name': 'ION RECYCLING',
        'subtitle': 'sectionDescriptions.RECYCLING',
        'name_simplified': 'Recycling',
        'image': 'images/recycling.webp',
        'alt': 'Imagen de ION Recycling',
        'icon': 'icons/recycling.svg',
        'module': 'recycling',
        'main': 'recycling-live',
        'disabled': false
    },
    {
        'code': '0005',
        'letter_code': 'EMC',
        'name': 'ION EMERGENCY',
        'subtitle': '',
        'name_simplified': 'Emergency',
        'image': 'images/emergency.webp',
        'alt': 'Imagen de ION Emergency',
        'icon': 'icons/emergency.svg',
        'module': 'emergency',
        'main': 'emergency-live',
        'disabled': true
    },
    {
        'code': '0002',
        'letter_code': 'BLD',
        'name': 'ION SMART BUILDING',
        'subtitle': '',
        'name_simplified': 'Building',
        'image': 'images/smart-building.webp',
        'alt': 'Imagen de ION Smart Building',
        'icon': 'icons/smart-building.svg',
        'module': 'smart-building',
        'main': 'smart-building-live',
        'disabled': true
    },
    {
        'code': '0017',
        'letter_code': 'VMS',
        'name': 'ION VMS',
        'subtitle': 'sectionDescriptions.VMS',
        'name_simplified': 'VMS',
        'image': 'images/vms.webp',
        'alt': 'Imagen de ION VMS',
        'icon': 'icons/vms.svg',
        'module': 'vms',
        'main': 'vms-live',
        'noRequiresLicense': true,
        'disabled': false
    },
    {
        'code': '0018',
        'letter_code': 'STG',
        'name': 'ION STORAGE',
        'subtitle': '',
        'name_simplified': 'Storage',
        'image': 'images/storage.webp',
        'alt': 'Imagen de ION Storage',
        'icon': 'icons/storage.svg',
        'module': 'storage',
        'main': 'storage-live',
        'disabled': true
    }
]


//*-----Valores autocompletar----*//

//Colores
export const autocompleteColors = [
  { "nameCode": "colors.white", "cod": "white", "hex": "#FFFFFF" },
  { "nameCode": "colors.yellow", "cod": "yellow", "hex": "#F7EFA2" },
  { "nameCode": "colors.beige", "cod": "beige", "hex": "#F4E7D3" },
  { "nameCode": "colors.silver gray", "cod": "silver gray", "hex": "#DDE1E4" },
  { "nameCode": "colors.pink", "cod": "pink", "hex": "#F7C9DA" },
  { "nameCode": "colors.gray", "cod": "gray", "hex": "#CFCFCF" },
  { "nameCode": "colors.orange", "cod": "orange", "hex": "#F6C39B" },
  { "nameCode": "colors.green", "cod": "green", "hex": "#A9D7A0" },
  { "nameCode": "colors.blue", "cod": "blue", "hex": "#A8C6E7" },
  { "nameCode": "colors.red", "cod": "red", "hex": "#F2A3A3" },
  { "nameCode": "colors.maroon", "cod": "maroon", "hex": "#C79AA6" },
  { "nameCode": "colors.black", "cod": "black", "hex": "#4A4A4A" }
]

//TiposVehiculo //    //añadir sedán cuando se le busque icono. añadir en constants/icons y vehicleConversion: {name:"Sedán",nameCode:"values.Sedán",cod:"sedan"},
export const tiposVehiculo = [
    { name: "Turismo", nameCode: "values.Turismo", cod: "car" },
    { name: "Camión", nameCode: "values.Camión", cod: "truck" },
    { name: "Moto", nameCode: "values.Moto", cod: "bike" },
    { name: "Furgoneta", nameCode: "values.Furgoneta", cod: "van" },
    { name: "Autobús", nameCode: "values.Autobús", cod: "bus" },
    { name: "SUV", nameCode: "values.SUV", cod: "suv" },
    { name: "Policía", nameCode: "values.Policía", cod: "police" },
    { name: "Ambulancia", nameCode: "values.Ambulancia", cod: "ambulance" },
    { name: "Ciclomotor", nameCode: "values.Ciclomotor", cod: "moped" },
    { name: "Bicicleta", nameCode: "values.Bicicleta", cod: "bicycle" },
    { name: "Bomberos", nameCode: "values.Bomberos", cod: "fire engine" },
    { name: "Remolque", nameCode: "values.Remolque", cod: "trailer" },
    { name: "Sin identificar", nameCode: "values.Sin identificar", cod: "unknown" },
]

//Direccion camara 
export const direccionCamara = [
    { name: 'Entrada', nameCode: 'values.Entrada', cod: 'approach' },
    { name: 'Salida', nameCode: 'values.Salida', cod: 'away' }
]

export const areaTypes = [
    { name: 'ZAR', nameCode: 'codes.cityAlerts.0100', cod: '0100' },
    { name: 'ZBE', nameCode: 'codes.cityAlerts.0101', cod: '0101' },
    { name: 'DUM', nameCode: 'codes.cityAlerts.0102', cod: '0102' },
]

//Tipos de listas
export const lists = [{ cod: 'b', nameCode: 'values.b', name: 'Lista blanca' }, { cod: 'n', nameCode: 'values.n', name: 'Lista negra' }]

//regex
export const regexCoordenadas = /^\s*-?\d+(\.\d+)?\s*,\s*-?\d+(\.\d+)?\s*$/
export const regexMail = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

//*-----Valores autocompletar IA----*//

export const ai_resolution = [
    { cod: 'low', nameCode: 'analysis_settings.resolution.values.low' },
    { cod: 'high', nameCode: 'analysis_settings.resolution.values.high' }
]

export const ai_tracking = [
    { cod: '5', nameCode: 'analysis_settings.tracking.values.low' },
    { cod: '10', nameCode: 'analysis_settings.tracking.values.medium' },
    { cod: '15', nameCode: 'analysis_settings.tracking.values.high' }
]

export const ai_detection = [
    { cod: 'SmartDetection', nameCode: 'analysis_settings.detection.values.smart' },
    { cod: 'Detection', nameCode: 'analysis_settings.detection.values.active' },
]

export const ai_sensivity = [
    { cod: 'Low', nameCode: 'analysis_settings.sensitivity.values.low' },
    { cod: 'Medium', nameCode: 'analysis_settings.sensitivity.values.medium' },
    { cod: 'High', nameCode: 'analysis_settings.sensitivity.values.high' }
]

export const ai_movement = [
    { cod: 'Low', nameCode: 'analysis_settings.movement.values.low' },
    { cod: 'Medium', nameCode: 'analysis_settings.movement.values.medium' },
    { cod: 'High', nameCode: 'analysis_settings.movement.values.high' }
]

//*-----Valores autocompletar personas----*//

export const pedestrian_age = [
    { cod: 'young', nameCode: 'values.young' },
    { cod: 'adult', nameCode: 'values.adult' },
    { cod: 'middle', nameCode: 'values.middle' },
    { cod: 'senior', nameCode: 'values.senior' },
    { cod: 'unknown', nameCode: 'values.unknown' }
]

export const pedestrian_gender = [
    { cod: 'male', nameCode: 'values.male' },
    { cod: 'female', nameCode: 'values.female' },
]
