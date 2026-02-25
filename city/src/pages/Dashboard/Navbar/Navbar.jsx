//CSS
import styles from './Navbar.module.css'

//dependencies
import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//context
import { MainDataContext } from '../../../context/MainDataContext'
import { useLoginDataContext } from '../../../context/LoginDataContext.js'

//components
import { NavOption } from './NavOption/NavOption'
import { TextModal } from '../../../components/TextModal/TextModal.jsx'

//Componentes Iconos
import { MainIcon } from './MainIcon.jsx'

//constants
import { version, smartcity_modules } from '../../../constants/common'

//Utils
import { handleKey } from '../../../utils/functions/accessibility.js'

//Iconos
//Navbar
import settingsIcon from "../../../assets/icons/navbar/settings.svg?react"
import exitIcon from "../../../assets/icons/navbar/exit.svg?react"
//import userIcon from "../../../assets/icons/navbar/user.svg?react"
import expandIcon from "../../../assets/icons/navbar/expand.svg?react"
import decreaseIcon from "../../../assets/icons/navbar/decrease.svg?react"
import notificationIcon from '../../../assets/icons/navbar/notification.svg?react'
import infoIcon from '../../../assets/icons/navbar/info.svg?react'
import lightIcon from '../../../assets/icons/navbar/light-mode.svg?react'
import darkIcon from '../../../assets/icons/navbar/dark-mode.svg?react'

//Main
import configurationIcon from "../../../assets/icons/navbar/configuration.svg?react"
import securityIcon from "../../../assets/icons/navbar/security.svg?react"
import maintenanceIcon from "../../../assets/icons/navbar/maintenance.svg?react"
import smartcityIcon from '../../../assets/icons/navbar/smartcity.svg?react'

//?Descomentar iconos a medida que los vayamos usando
//Modulos
import trafficIcon from '../../../assets/icons/navbar/traffic.svg?react'
import mobilityIcon from '../../../assets/icons/navbar/mobility.svg?react'
import infringementIcon from '../../../assets/icons/navbar/infringement.svg?react'
//import towIcon from '../../../assets/icons/navbar/tow.svg?react'
//import parkingIcon from '../../../assets/icons/navbar/parking.svg?react'
import analyticIcon from '../../../assets/icons/navbar/analytic.svg?react'
//import environmentIcon from '../../../assets/icons/navbar/environment.svg?react'
import recyclingIcon from '@icons/navbar/recycling.svg?react'
//import emergencyIcon from '../../../assets/icons/navbar/emergency.svg'
//import buildingIcon from '../../../assets/icons/navbar/smart-building.svg?react'
import vmsIcon from '../../../assets/icons/navbar/vms.svg?react'
//import storageIcon from '../../../assets/icons/navbar/storage.svg?react'

//Secciones
import { sectionIcons } from '../../../constants/icons.js'



export const Navbar = () => {

    const { logout, getSectionWithPermission, checkPermission } = useLoginDataContext()
    const { section, setSection, setIsLoading, module, setModule, notificationsOpen, setNotificationsOpen, notifications, hostname, lightMode, setLightMode } = useContext(MainDataContext);

    const { t } = useTranslation()

    const [expanded, setExpanded] = useState(false)

    //Modales
    const [infoModal, setInfoModal] = useState(false)

    //Notifications
    const [showAlert, setShowAlert] = useState(false)


    //cambiar de sección activando loading
    const changeSection = (newSection, newModule, comprobarPermiso, noLoading) => {

        let seccion = newSection
        if (section !== seccion) {
            //comprueba el permiso para evitar que vaya al live (seccion por defecto) si no tiene permiso
            if (comprobarPermiso) {
                let permiso = checkPermission(null, seccion)
                if (!permiso) {
                    seccion = getSectionWithPermission(null, newModule || module)
                }
            }
            if (seccion) {

                //Cambio sección y módulo
                if (!noLoading) setIsLoading(true)
                setSection(seccion)
                if (newModule) {
                    setModule(newModule)
                }
            }
        }
    }

    //Función para mostrar el nombre del módulo/sector vertical en el que nos encontramos
    const showModuleName = () => {

        //Mercados verticales y los módulos
        const markets = ['smartcity'];

        //Valor por defecto del título si estamos en una sección predeterminada
        if (['main', 'configuration', 'maintenance'].includes(module)) {
            return 'Smart';
        }

        //Devolvemos el nombre mercado vertical si estamos en uno de ellos
        if (markets.includes(module)) {
            return module;
        }

        //Comprobamos si el módulo existe
        const moduleExists = smartcity_modules.some(moduleName => moduleName.module === module);
        if (!moduleExists) {
            return null;
        }

        //Nos quedamos con el primer valor del texto de módulos
        const moduleParts = module.split('-');
        return moduleParts.length > 1 ? moduleParts[1] : module;
    };


    //--------------------NOTIFICACIONES---------------------------------

    //Actualiza alerta
    useEffect(() => {
        let estado = false
        if (Array.isArray(notifications) && notifications.length > 0) {
            if (notifications.some(item => item.opened === false)) {
                estado = true
            }
        }
        setShowAlert(estado)
    }, [notifications])


    return <>

        {/*Modal informativo*/}
        {infoModal &&
            <TextModal setIsOpen={setInfoModal} title={t('buttons.logout')} aceptar={logout} cancelarRed cancelar={() => { setInfoModal(false) }}>{t('messages.logoutConfirmation')}</TextModal>
        }
    
        <div className={styles['navbar'] + " " + (expanded ? styles['navbar--extended'] : "")} >

            <div className={styles['navbar__first__section']}>
                <div className={styles['navbar__header']} onClick={() => changeSection('home', 'main', false, true)} tabIndex={0} onKeyDown={(e) => handleKey(e, () => changeSection('home', 'main', false, true))}>
                    <MainIcon />
                    <div className={styles['navbar__module']}>
                        <p className={!expanded ? styles['hide__text'] : ''}>ION</p>
                        <p className={!expanded ? styles['hide__text'] : ''}>{showModuleName()}</p>
                    </div>
                </div>


                {module === 'main' &&
                    <div className={styles['navOptions__wrapper']}>
                        <NavOption cod_sector="001" icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />
                        <NavOption cod_modulo='0108' icon={configurationIcon} optionSection="configuration-devices" text={t('sections.CONFIGURACIÓN')} expanded={expanded} action={() => changeSection('configuration-devices', 'configuration', true)} />
                        <NavOption cod_modulo='0109' icon={securityIcon} optionSection="security-monitoring" text={t('sections.SEGURIDAD')} expanded={expanded} action={() => changeSection('security-monitoring', 'security', true)} />
                        <NavOption cod_modulo='0010' icon={maintenanceIcon} optionSection="maintenance-servers" text={t('sections.MANTENIMIENTO')} expanded={expanded} action={() => changeSection('maintenance-servers', 'maintenance', true)} />
                    </div>
                }

                {module === 'configuration' &&
                    <div className={styles['navOptions__wrapper']}>
                        <NavOption isSection icon={sectionIcons['DISPOSITIVOS']} optionSection="configuration-devices" text={t('sections.DISPOSITIVOS')} expanded={expanded} action={() => changeSection('configuration-devices', 'configuration')} />
                        <NavOption isSection icon={sectionIcons['CLOUD']} optionSection="configuration-cloud" text="Clouds" expanded={expanded} action={() => changeSection('configuration-cloud', 'configuration')} />
                        <NavOption isSection icon={sectionIcons['LICENCIAS']} optionSection="configuration-licenses" text={t('sections.LICENCIAS')} expanded={expanded} action={() => changeSection('configuration-licenses', 'configuration')} />
                        <div className={styles['separator']}>{ }</div>

                        <NavOption isSection icon={sectionIcons['USUARIOS']} optionSection="configuration-users" text={t('sections.USUARIOS')} expanded={expanded} action={() => changeSection('configuration-users', 'configuration')} />
                        <NavOption isSection icon={sectionIcons['PERMISOS']} optionSection="configuration-permissions" text={t('sections.PERMISOS')} expanded={expanded} action={() => changeSection('configuration-permissions', 'configuration')} />
                        <div className={styles['separator']}>{ }</div>

                        <NavOption isSection icon={sectionIcons['PADRON']} optionSection="configuration-vehicles" text={t('sections.PADRON')} expanded={expanded} action={() => changeSection('configuration-vehicles', 'configuration')} />
                        <NavOption isSection icon={sectionIcons['INTEGRACIONES']} optionSection="configuration-integrations" text={t('sections.INTEGRACIONES')} expanded={expanded} action={() => changeSection('configuration-integrations', 'configuration')} />


                        {((hostname === 'ionsmart.eu' || hostname === 'ionsmart.cat')) &&
                            <>
                                <NavOption isSection separator icon={sectionIcons['CLIENTES']} optionSection="configuration-clients" text={t('sections.CLIENTES')} expanded={expanded} action={() => changeSection('configuration-clients', 'configuration')} />
                                <NavOption isSection icon={sectionIcons['CLAVES']} optionSection="configuration-generator" text={t('sections.CLAVES')} expanded={expanded} action={() => changeSection('configuration-generator', 'configuration')} />
                            </>
                        }
                    </div>
                }

                {module === 'security' &&
                    <div className={styles['navOptions__wrapper']}>
                        <NavOption isSection icon={sectionIcons['MONITORIZACION']} optionSection="security-monitoring" text={t('sections.MONITORIZACION')} expanded={expanded} action={() => changeSection('security-monitoring', 'security')} />
                        <NavOption wrapperOption icon={sectionIcons['AUDITORIA']} text={t('sections.AUDITORIA')} expanded={expanded}>
                            <NavOption subOption isSection icon={sectionIcons['SESIONES']} optionSection="configuration-audit" text={t('sections.SESIONES')} expanded={expanded} action={() => changeSection('configuration-audit', 'security')} />
                            <NavOption subOption isSection icon={sectionIcons['CONSULTAS_EXT']} optionSection="security-consultsExt" text={t('sections.CONSULTAS_EXT')} expanded={expanded} action={() => changeSection('security-consultsExt', 'security')} />
                            <NavOption subOption isSection icon={sectionIcons['MAPA']} optionSection="security-map" text={t('sections.MAPA')} expanded={expanded} action={() => changeSection('security-map', 'security')} />
                        </NavOption>
                        <NavOption isSection icon={sectionIcons['ALERTAS']} optionSection="security-alerts" text={t('sections.ALERTAS')} expanded={expanded} action={() => changeSection('security-alerts', 'security')} />
                    </div>
                }

                {module === 'maintenance' &&
                    <div className={styles['navOptions__wrapper']}>
                        <NavOption isSection icon={sectionIcons['SERVIDORES']} optionSection="maintenance-servers" text={t('sections.SERVIDORES')} expanded={expanded} action={() => changeSection('maintenance-servers', 'maintenance')} />
                    </div>
                }

                {/* Mercados verticales */}

                {module === 'smartcity' &&
                    <div className={styles['navOptions__wrapper']}>
                        <NavOption cod_modulo={'0015'} icon={trafficIcon} optionSection="traffic-live" text="ION Traffic" expanded={expanded} action={() => changeSection('traffic-live', 'traffic', true)} />
                        <NavOption cod_modulo={'0011'} icon={mobilityIcon} optionSection="mobility-live" text="ION Mobility" expanded={expanded} action={() => changeSection('mobility-live', 'mobility', true)} />
                        <NavOption cod_modulo={'0008'} icon={infringementIcon} optionSection="infringement-live" text="ION Infringement" expanded={expanded} action={() => changeSection('infringement-live', 'infringement', true)} />
                        {/*<NavOption cod_modulo={'0007'} icon={towIcon} optionSection="tow-live" text="ION Tow" expanded={expanded} action={()=>changeSection('tow-live', 'tow', true)} />*/}
                        {/*<NavOption cod_modulo={'0013'} icon={parkingIcon} optionSection="parking-live" text="ION Parking" expanded={expanded} action={()=>changeSection('parking-live', 'parking', true)} />*/}
                        <NavOption cod_modulo={'0001'} icon={analyticIcon} optionSection="analytic-live" text="ION Analytic" expanded={expanded} action={() => changeSection('analytic-live', 'analytic', true)} />
                        {/*<NavOption cod_modulo={'0006'} icon={environmentIcon} optionSection="environment-live" text="ION Environment" expanded={expanded} action={()=>changeSection('environment-live', 'environment', true)} />*/}
                        <NavOption cod_modulo={'0014'} icon={recyclingIcon} optionSection="recycling-live" text="ION Recycling" expanded={expanded} action={() => changeSection('recycling-live', 'recycling', true)} />
                        {/*<NavOption cod_modulo={'0005'} icon={emergencyIcon} optionSection="emergency-live" text="ION Emergency" expanded={expanded} action={()=>changeSection('emergency-live', 'emergency', true)} />*/}
                        {/*<NavOption cod_modulo={'0002'} icon={buildingIcon} optionSection="smart-building-live" text="ION Building" expanded={expanded} action={()=>changeSection('smart-building-live', 'smart-building', true)} />*/}
                        <NavOption cod_modulo={'0017'} icon={vmsIcon} optionSection="vms-live" text="ION VMS" expanded={expanded} action={() => changeSection('vms-live', 'vms', true)} />
                        {/*<NavOption cod_modulo={'0018'} icon={storageIcon} optionSection="storage-live" text="ION Storage" expanded={expanded} action={()=>changeSection('storage-live', 'storage', true)} />*/}
                    </div>
                }

                {/* Smart City */}

                {module === 'traffic' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['LIVE']} optionSection="traffic-live" text={t('sections.LIVE')} expanded={expanded} action={() => { changeSection('traffic-live', 'traffic') }} />
                            <NavOption wrapperOption icon={sectionIcons['CONSULTAS']} text={t('sections.CONSULTAS')} expanded={expanded}>
                                <NavOption subOption isSection icon={sectionIcons['VEHICULOS']} optionSection="traffic-consulting-consults" text={t('sections.VEHICULOS')} expanded={expanded} action={() => { changeSection('traffic-consulting-consults', 'traffic') }} />
                                <NavOption subOption isSection icon={sectionIcons['PREVALIDACION']} optionSection="traffic-prevalidation" text={t('sections.PREVALIDACION')} expanded={expanded} action={() => { changeSection('traffic-prevalidation', 'traffic') }} />
                            </NavOption>   
                            <NavOption isSection icon={sectionIcons['ESTADISTICAS']} optionSection="traffic-stats" text={t('sections.ESTADISTICAS')} expanded={expanded} action={() => changeSection('traffic-stats', 'traffic')} />
                        
                            <NavOption wrapperOption separator icon={settingsIcon} text={t('sections.CONFIGURACIÓN')} expanded={expanded}>
                                <NavOption subOption isSection icon={sectionIcons['LISTAS']} optionSection="traffic-settings-lists" text={t('sections.LISTAS')} expanded={expanded} action={() => changeSection('traffic-settings-lists', 'traffic')} />
                                <NavOption subOption isSection icon={sectionIcons['INFRACCIONES']} optionSection="traffic-settings-infringements" text={t('sections.INFRACCIONES')} expanded={expanded} action={() => changeSection('traffic-settings-infringements', 'traffic')} />
                                <NavOption subOption isSection icon={sectionIcons['LAYOUTS']} optionSection="traffic-settings-grid" text={t('sections.LAYOUTS')} expanded={expanded} action={() => changeSection('traffic-settings-grid', 'traffic')} />
                            </NavOption>
                        </div>
                    </>
                }

                {module === 'mobility' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['LIVE']} optionSection="mobility-live" text={t('sections.LIVE')} expanded={expanded} action={() => { changeSection('mobility-live', 'mobility') }} />
                            <NavOption wrapperOption icon={sectionIcons['CONSULTAS']} text={t('sections.CONSULTAS')} expanded={expanded}>
                                <NavOption subOption isSection icon={sectionIcons['VEHICULOS']} optionSection="mobility-consulting-consults" text={t('sections.VEHICULOS')} expanded={expanded} action={() => { changeSection('mobility-consulting-consults', 'mobility') }} />
                                <NavOption subOption isSection icon={sectionIcons['ESTADISTICAS_PERSONAS']} optionSection="mobility-persons-consults" text={t('titles.people')} expanded={expanded} action={() => { changeSection('mobility-persons-consults', 'mobility') }} />
                                <NavOption subOption isSection icon={sectionIcons['PREVALIDACION']} optionSection="mobility-prevalidation" text={t('sections.PREVALIDACION')} expanded={expanded} action={() => { changeSection('mobility-prevalidation', 'mobility') }} />
                            </NavOption>
                            <NavOption wrapperOption icon={sectionIcons['ESTADISTICAS']} text={t('sections.ESTADISTICAS')} expanded={expanded}>
                                <NavOption isSection subOption icon={sectionIcons['VEHICULOS']} optionSection="mobility-stats-mobility" text={t('sections.VEHICULOS')} expanded={expanded} action={() => { changeSection('mobility-stats-mobility', 'mobility') }} />
                                <NavOption isSection subOption icon={sectionIcons['ESTADISTICAS_PERSONAS']} optionSection="mobility-stats-persons" text={t('titles.people')} expanded={expanded} action={() => { changeSection('mobility-stats-persons', 'mobility') }} />
                            </NavOption>

                            <NavOption wrapperOption separator icon={settingsIcon} text={t('sections.CONFIGURACIÓN')} expanded={expanded}>
                                <NavOption isSection subOption icon={sectionIcons['ZONAS']} optionSection="mobility-settings-zones" text={t('sections.ZONAS')} expanded={expanded} action={() => { changeSection('mobility-settings-zones', 'mobility') }} />
                                <NavOption isSection subOption icon={sectionIcons['INFRACCIONES']} optionSection="mobility-settings-infringements" text={t('sections.INFRACCIONES')} expanded={expanded} action={() => changeSection('mobility-settings-infringements', 'mobility')} />
                                <NavOption isSection subOption icon={sectionIcons['LAYOUTS']} optionSection="mobility-settings-grid" text={t('sections.LAYOUTS')} expanded={expanded} action={() => changeSection('mobility-settings-grid', 'mobility')} />
                            </NavOption>
                        </div>
                    </>
                }

                {module === 'infringement' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['LIVE']} optionSection="infringement-live" text={t('sections.LIVE')} expanded={expanded} action={() => { changeSection('infringement-live', 'infringement') }} />
                            <NavOption isSection icon={sectionIcons['ENVIO']} optionSection="infringement-sending" text={t('sections.ENVIO')} expanded={expanded} action={() => { changeSection('infringement-sending', 'infringement') }} />
                            <NavOption isSection icon={sectionIcons['CONSULTAS']} optionSection="infringement-consulting-consults" text={t('sections.CONSULTAS')} expanded={expanded} action={() => { changeSection('infringement-consulting-consults', 'infringement') }} />
                            <NavOption isSection icon={sectionIcons['CAMPAÑAS']} optionSection="infringement-campaigns" text={t('sections.CAMPAÑAS')} expanded={expanded} action={() => { changeSection('infringement-campaigns', 'infringement') }} />
                            <NavOption isSection icon={sectionIcons['ESTADISTICAS']} optionSection="infringement-stats" text={t('sections.ESTADISTICAS')} expanded={expanded} action={() => changeSection('infringement-stats', 'infringement')} />
                        </div>
                    </>
                }

                {module === 'analytic' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['LIVE']} optionSection="analytic-live" text={t('sections.ANALISIS')} expanded={expanded} action={() => { changeSection('analytic-live', 'analytic') }} />
                            <NavOption isSection icon={sectionIcons['INVESTIGACIONES']} optionSection="analytic-consulting" text={t('sections.INVESTIGACIONES')} expanded={expanded} action={() => { changeSection('analytic-consulting', 'analytic') }} />

                            <NavOption separator isSection icon={sectionIcons['AUDITORIA']} optionSection="analytic-audit" text={t('sections.AUDITORIA')} expanded={expanded} action={() => { changeSection('analytic-audit', 'analytic') }} />
                        </div>

                    </>
                }

                {module === 'recycling' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['LIVE']} optionSection="recycling-live" text={t('sections.LIVE')} expanded={expanded} action={() => { changeSection('recycling-live', 'recycling') }} />

                        </div>


                    </>
                }

                {module === 'vms' &&
                    <>
                        <div className={styles['navOptions__wrapper']}>
                            <NavOption separatorBottom icon={smartcityIcon} optionSection="smartcity" text="Smart City" expanded={expanded} action={() => changeSection('smartcity', 'smartcity', false, true)} />

                            <NavOption isSection icon={sectionIcons['VMS']} optionSection="vms-live" text={t('sections.VMS')} expanded={expanded} action={() => { changeSection('vms-live', 'vms') }} />
                            <NavOption isSection icon={sectionIcons['ARCHIVOS']} optionSection="vms-files" text={t('sections.ARCHIVOS')} expanded={expanded} action={() => { changeSection('vms-files', 'vms') }} />

                            <NavOption wrapperOption separator icon={settingsIcon} text={t('sections.CONFIGURACIÓN')} expanded={expanded}>
                                <NavOption isSection subOption icon={sectionIcons['LAYOUTS']} optionSection="vms-settings-grid" text={t('sections.LAYOUTS')} expanded={expanded} action={() => changeSection('vms-settings-grid', 'vms')} />
                            </NavOption>
                        </div>
                    </>
                }

            </div>


            {/* Opciones inferiores */}
            <div className={styles['navOptions__wrapper']}>
                {/*<NavOption icon={userIcon} optionSection="profile" text={t('buttons.profile')} expanded={expanded} action={() => setSection('profile')} />*/}
                <NavOption icon={!lightMode ? lightIcon : darkIcon} text={!lightMode ? t('titles.lightMode') : t('titles.darkMode')} expanded={expanded} action={() => { localStorage.setItem("lightMode", JSON.stringify(!lightMode)); setLightMode(!lightMode) }} />
                <NavOption icon={infoIcon} text={t('buttons.info')} expanded={expanded} optionSection="info" action={() => setSection('info')} />
                {false && <NavOption icon={notificationIcon} text={t('buttons.notifications')} expanded={expanded} action={() => setNotificationsOpen(!notificationsOpen)} forceSelected={notificationsOpen || showAlert} showAlert={showAlert} />}
                <NavOption icon={expanded ? decreaseIcon : expandIcon} text={expanded ? t('buttons.collapse') : t('buttons.expand')} expanded={expanded} action={() => setExpanded(!expanded)} />
                <NavOption icon={exitIcon} text={t('buttons.logout')} expanded={expanded} action={() => { setInfoModal(true) }} />
                <p className={styles['version']}>{version}</p>
            </div>
        </div>
    </>
}