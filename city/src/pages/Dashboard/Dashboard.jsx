//Librerías
import { useEffect, useContext } from 'react'
import { defaults } from 'chart.js'

//Componentes
import { Navbar } from './Navbar/Navbar'
import { Loading } from '../../components/Loading/Loading'
import { CalendarModal } from '../../components/Inputs/CalendarModal/CalendarModal'
import { Alerts } from './Alerts/Alerts'
import { Downloads } from './Downloads/Downloads'
import { TextModal } from '../../components/TextModal/TextModal'
import HandleIdle from './HandleIdle/HandleIdle'
import { Notifications } from './Notifications/Notifications'
import { Info } from './Info/Info'

//Styles
import styles from './Dashboard.module.css'
import '../../styles/map.css'

//Services
import "../../api/connections/socketHandler"

//Páginas
//Dashboard
import { Modules } from '../../components/Modules/Modules'

//Configuración
import { Devices } from '../Configuration/Devices/Devices'
import { ConfigurationUsers } from '../Configuration/Users/Users'
import { Clouds } from '../Configuration/Cloud/Clouds'
import { Licenses } from '../Configuration/Licenses/LicensesV4'
import { Clients } from '../Configuration/Clients/Clients'
import { LicenseGenerator } from '../Configuration/LicenseGenerator/LicenseGenerator'
import { Permissions } from '../Configuration/Permissions/Permissions'
import { Vehicles } from '../Configuration/Vehicles/Vehicles'

//Mantenimiento
import { Servers } from '../Maintenance/Servers/Servers'

//Seguridad
import { Monitoring } from '../Security/Monitoring/Monitoring'
import { Audit } from '../Security/Audit/Audit'
import { ConsultsExt } from '../Security/ConsultsExt/ConsultsExt'
import { SecurityAlerts } from '../Security/Alerts/SecurityAlerts'
import { SecurityMap } from '../Security/Map/SecurityMap'

//Traffic
import { Consulting } from '../Suite/City/Traffic/Consulting/Consulting'
import { Prevalidation } from '../Suite/City/Traffic/Prevalidation/Prevalidation'
import { AlertsMap } from '../Suite/City/Traffic/AlertsMap/AlertsMap'
import { Lists } from '../Suite/City/Traffic/Lists/Lists'
import { Stats } from '../Suite/City/Traffic/StatsV4/Stats'
import { ConfGrid } from '../Suite/City/Traffic/ConfGrid/ConfGrid'
import { Infringements } from '../Suite/City/Traffic/Infringements/Infringements'

//Mobility
import { MobilityConsulting } from '../Suite/City/Mobility/Consulting/MobilityConsulting'
import { MobilityPedestrians } from '../Suite/City/Mobility/Pedestrians/MobilityPedestrians'
import { MobilityPrevalidation } from '../Suite/City/Mobility/Prevalidation/MobilityPrevalidation'
import { MobilityStats } from '../Suite/City/Mobility/MobilityStats/MobilityStats'
import { TransportStats } from '../Suite/City/Mobility/TransportStats/TransportStats'
import { PersonsStats } from '../Suite/City/Mobility/PersonsStats/PersonsStats'
import { MobilityAlertsMap } from '../Suite/City/Mobility/AlertsMap/MobilityAlertsMap'
import { MobilityZones } from '../Suite/City/Mobility/Zones/MobilityZones'

//Infringement
import { InfringementAlertsMap } from '../Suite/City/Infringement/AlertsMap/InfringementAlertsMap'
import { InfringementSending } from '../Suite/City/Infringement/Sending/InfringementSending'
import { InfringementConsulting } from '../Suite/City/Infringement/Consulting/InfringementConsulting'
import { Campaigns } from '../Suite/City/Infringement/Campaigns/Campaigns'
import { InfringementStats } from '../Suite/City/Infringement/StatsV4/InfringementStats'

//Smart City - Recycling
import { RecyclingLive } from '../Suite/City/Recycling/Live/RecyclingLive'

//Analytic
import { AnalyticMap } from '../Suite/City/Analytic/AnalyticMap/AnalyticMap'
import { Investigations } from '../Suite/City/Analytic/Investigations/Investigations'
import { AnalyticAudit } from '../Suite/City/Analytic/AnalyticAudit/AnalyticAudit'

//VMS
import { LiveVMS } from '../Suite/City/VMS/Live/LiveVMS'
import { Files } from '../Suite/City/VMS/Files/Files'

//Constants
import { smartcity_modules, home } from '../../constants/common'

//context
import MainDataContext from '../../context/MainDataContext'
import { useLoginDataContext } from '../../context/LoginDataContext'
import { Integrations } from '../Configuration/Integrations/Integrations'



export const Dashboard = () => {
    
    defaults.font.family = "var(--text-font)" //fuente gráficos
    const { section, isLoading, isLoading2, isCalendarModalOpen, calendarData, infoMessage, setInfoMessage } = useContext(MainDataContext);
    const { setPermisosSeccionActual, permisosSecciones, permisos } = useLoginDataContext()

    //--------------------------------USEEFFECTS------------------------------------------------


    //guarda en context los permisos de la sección actual
    useEffect(() => {
        if (permisos === '000001') {
            setPermisosSeccionActual({ acceso: true, consultas: true, editar: true, compartir: true })
        } else if (Array.isArray(permisosSecciones) && permisosSecciones.length > 0 && section) {
            let permisos = permisosSecciones.find(item => item.cod_front === section)
            if (permisos) {
                setPermisosSeccionActual({ acceso: permisos?.acceso === 1, consultas: permisos?.consultas === 1, editar: permisos?.editar === 1, compartir: permisos?.compartir === 1 })
            } else {
                setPermisosSeccionActual({ acceso: false, consultas: false, editar: false, compartir: false })
            }
        } else {
            setPermisosSeccionActual({ acceso: false, consultas: false, editar: false, compartir: false })
        }
        //eslint-disable-next-line
    }, [section, permisosSecciones])


    

    return (
        <div id="dashboard-wrapper-id">

            {/* Control cierre sesión por inactividad */}
            <HandleIdle />

            {/* Loading */}
            {(isLoading || isLoading2) && <Loading />}

            {/* Selector fecha */}
            {isCalendarModalOpen && <CalendarModal {...calendarData} />}

            {/* mensaje informativo */}
            {infoMessage && <TextModal zIndex={25} setIsOpen={() => setInfoMessage(null)} aceptar={() => setInfoMessage(null)}>{infoMessage}</TextModal>}

            {/* Dashboard */}
            <div className={styles['dashboard']}>

                <Navbar />
                <Alerts />
                <Downloads />

                <div className={styles['sections__wrapper']}>

                    <Notifications />

                    {{
                        //Inicio
                        'home': <Modules objects={home} />,

                        //Modulos Smart City
                        'smartcity': <Modules objects={smartcity_modules} isModule />,

                        //Configuración
                        'configuration-devices': <Devices />,
                        'configuration-users': <ConfigurationUsers />,
                        'configuration-cloud': <Clouds />,
                        'configuration-licenses': <Licenses />,
                        'configuration-clients': <Clients />,
                        'configuration-generator': <LicenseGenerator />,
                        'configuration-permissions': <Permissions />,
                        'configuration-vehicles': <Vehicles />,
                        'configuration-integrations': <Integrations />,
                        
                        //Seguridad
                        'security-monitoring': <Monitoring />,
                        'configuration-audit': <Audit />,
                        'security-consultsExt': <ConsultsExt />,
                        'security-map': <SecurityMap />,
                        'security-alerts': <SecurityAlerts />,

                        //Mantenimiento
                        'maintenance-servers': <Servers />,

                        //Smart City - Traffic
                        'traffic-live': <AlertsMap />,
                        'traffic-consulting-consults': <Consulting />,
                        'traffic-prevalidation': <Prevalidation />,
                        'traffic-stats': <Stats />,
                        'traffic-settings-lists': <Lists />,
                        'traffic-settings-infringements': <Infringements modulo={15} />,
                        'traffic-settings-grid': <ConfGrid modulo={15} />,

                        //Smart City - Mobility
                        'mobility-live': <MobilityAlertsMap />,
                        'mobility-consulting-consults': <MobilityConsulting />,                        
                        'mobility-persons-consults': <MobilityPedestrians />    ,                        
                        'mobility-prevalidation': <MobilityPrevalidation />,
                        'mobility-stats-mobility': <MobilityStats />,
                        'mobility-stats-transport': <TransportStats />,
                        'mobility-stats-persons': <PersonsStats />,
                        'mobility-settings-zones': <MobilityZones />,
                        'mobility-settings-infringements': <Infringements modulo={11} />,
                        'mobility-settings-grid': <ConfGrid modulo={11} />,

                        //Smart City - Infringement
                        'infringement-live': <InfringementAlertsMap />,
                        'infringement-sending': <InfringementSending />,
                        'infringement-consulting-consults': <InfringementConsulting />,
                        'infringement-campaigns': <Campaigns />,
                        'infringement-stats': <InfringementStats />,

                        //Smart City - Recycling
                        'recycling-live': <RecyclingLive />,

                        //Smart City - Analytic
                        'analytic-live': <AnalyticMap />,
                        'analytic-consulting': <Investigations />,
                        'analytic-audit': <AnalyticAudit />,

                        //Smart City - VMS
                        'vms-live': <LiveVMS modulo={17} vertical_sector={'001'} />,
                        'vms-files': <Files modulo={17} />,
                        'vms-settings-grid': <ConfGrid modulo={17} />,

                        //Info
                        'info': <Info />

                    }[section]}
                </div>
            </div>
        </div>
    )
}