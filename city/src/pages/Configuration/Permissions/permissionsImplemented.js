
const CONS = 'consultas'
const EDIT = 'editar'
const SHARE = 'compartir'

//info de qué permisos son modificables en cada sección ('consultas', 'editar', 'compartir')
export const permissionsImplemented = {

    //Configuración
    '0082': [CONS, EDIT, SHARE], //configuration-devices
    '0083': [CONS, EDIT, SHARE], //configuration-cloud
    '0084': [CONS, EDIT, SHARE], //configuration-users
    '0085': [CONS, EDIT, SHARE], //configuration-permissions
    '0086': [CONS, EDIT], //configuration-licenses
    '0088': [CONS, EDIT], //configuration-clients
    '0089': [CONS, EDIT], //configuration-generator
    '0106': [CONS, EDIT, SHARE], //configuration-vehicles
    '0147': [CONS, EDIT], //configuration-integrations

    //Seguridad
    '0160': [CONS], //security-monitoring
    '0087': [CONS, SHARE], //configuration-audit
    '0161': [CONS, SHARE], //security-consultsExt
    '0163': [CONS, SHARE], //security-alerts

    //Mantenimiento
    '0148': [CONS, EDIT], //maintenance-servers

    //*---------------------------SMART CITY---------------------------*//

    //Traffic
    '0001': [CONS, EDIT, SHARE], //traffic-live
    '0003': [CONS, EDIT, SHARE], //traffic-consulting-consults
    '0060': [CONS, EDIT, SHARE], //traffic-consulting-reports
    '0061': [CONS, EDIT, SHARE], //traffic-prevalidation
    '0009': [CONS], //traffic-stats
    '0064': [CONS, EDIT, SHARE], //traffic-settings-lists
    '0090': [CONS, EDIT, SHARE], //traffic-settings-infringements

    //Mobility
    '0066': [CONS, EDIT, SHARE], //mobility-live
    '0067': [CONS, EDIT, SHARE], //mobility-consulting-consults
    '0158': [CONS, EDIT, SHARE], //mobility-consulting-consults
    '0068': [CONS, EDIT, SHARE], //mobility-consulting-reports
    '0069': [CONS, EDIT, SHARE], //mobility-prevalidation
    '0071': [CONS], //mobility-stats-mobility
    '0157': [CONS], //mobility-stats-transporte
    '0159': [CONS], //mobility-stats-persons
    '0073': [CONS, EDIT, SHARE], //mobility-settings-zones
    '0091': [CONS, EDIT, SHARE], //mobility-settings-infringements

    //Infringement
    '0070': [CONS, EDIT, SHARE], //infringement-live
    '0075': [CONS, EDIT, SHARE], //infringement-sending
    '0076': [CONS, EDIT, SHARE], //infringement-consulting-consults
    '0077': [CONS, EDIT, SHARE], //infringement-consulting-reports
    '0078': [CONS], //infringement-stats
    '0105': [CONS, EDIT, SHARE], //infringement-campaigns

    //Recycling
    '0149': [CONS, EDIT, SHARE], //recycling-live

    //Analytic
    '0092': [CONS, EDIT, SHARE], //analytic-live
    '0093': [CONS, EDIT, SHARE], //analytic-consulting
    '0094': [CONS, SHARE], //analytic-audit

    //VMS
    '0079': [CONS, EDIT, SHARE], //vms-live
    '0080': [CONS, EDIT, SHARE], //ms-files

}