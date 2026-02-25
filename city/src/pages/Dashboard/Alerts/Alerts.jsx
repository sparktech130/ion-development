import styles from './Alerts.module.css'
import { useEffect, useState, useContext, useRef } from "react"
import { useTranslation } from 'react-i18next'

//context
import MainDatacontext from '../../../context/MainDataContext'
import { useLoginDataContext } from '../../../context/LoginDataContext'

//services
import { subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom } from '../../../api/connections/socketHandler'

//icons
import closeIcon from '../../../assets/icons/actions/close.svg?react'

//iconos alertas
import alert from '../../../assets/icons/navbar/alerts.svg?react'
import { cityAlertsIcons } from '../../../constants/icons'

//otros iconos
import filesIcon from "../../../assets/icons/navbar/files.svg?react"

//constants
import { smartcity_modules } from '../../../constants/common'

//Utils
import { handleKey } from '../../../utils/functions/accessibility'

//Components
import {AccesibleIcon} from '@components/AccesibleIcon/AccesibleIcon'


export const Alerts = () => {

    const { codUsuario, checkPermission, server } = useLoginDataContext()
    const { setSection, module, setModule, section, setIsLoading, setFilterAlertCode, joinedAlertRoom, setJoinedAlertRoom, setLastAlert, forceUpdateModule, setForceUpdateModule } = useContext(MainDatacontext)
    const { t } = useTranslation()

    const [alerts, setAlerts] = useState([])
    const moduleRef = useRef(module);
    //alertas prueba: 
    //{modulo:"mobility",cod_alerta: "00001",cod_alertagest: "0012",cod_dispositivo: "000001",cod_reconoc: "1695580",coordenadas: "39.72214379777906, 2.912770800914763",detecciones: [],estat: "p",fecha_hora: "2024-03-19 12:44:04",foto: "2024-03-19_12-44-04_STOPPED_DETECTION.jpg",marca: "",matricula: "3034llg",modelo: "",nom_dispositivo: "INCA001",nombre_alerta: "Área reservada",tipo_vh: "Van"}

    // Actualiza `moduleRef` cuando `module` cambia (para tener el valor actualizado dentro del useEffect del socket sin tenerlo que pedir cada vez que cambia module)
    useEffect(() => {
        moduleRef.current = module;
    }, [module]);

    /* ------------------PEDIR DATOS----------------- */

    //pide las nuevas alertas por socket
    useEffect(() => {

        if (!server) return

        //limpio anterior socket alertas
        if (joinedAlertRoom && (joinedAlertRoom !== module)) {
            unsubscribeFromEvent('nueva_alerta_' + joinedAlertRoom)
            unsubscribeFromEvent('nueva_alerta_finalizada' + joinedAlertRoom)
            leaveRoom(`alertas_${server}_${joinedAlertRoom}`)
        }

        //activo socket del módulo
        if (module === 'traffic' || module === 'infringement' || module === 'mobility') {
            setLastAlert(null)
            setJoinedAlertRoom(module)
            joinRoom(`alertas_${server}_${module}`)
            subscribeToEvent('nueva_alerta_' + module, (data) => {
                let alerta = data.data
                //controlo por si vienen repetidas
                if (alerta.cod_alerta) {
                    alerta.modulo = module
                    setLastAlert(alerta)
                    setAlerts(prevState => {
                        if (!prevState.some(item => item.cod_alerta === alerta.cod_alerta && item.modulo === module)) {
                            let updatedAlerts;
                            //si hay más de tres las borro
                            if (prevState.length >= 3) {
                                updatedAlerts = [alerta, ...prevState.slice(0, 2)];
                            } else {
                                updatedAlerts = [alerta, ...prevState];
                            }
                            return updatedAlerts;
                        } else {
                            return prevState
                        }
                    })
                }
            })

        //módulo sin alertas
        } else {
            setJoinedAlertRoom(null)
        }
        //eslint-disable-next-line
    }, [module])

    //pide notifición archivo compartido socket
    useEffect(() => {

        if (!server) return

        //Accede a la room
        const roomName = `video_${server}_${codUsuario}`
        joinRoom(roomName)

        subscribeToEvent('nuevo_video', (data) => {
            let alerta = data.data
            alerta.modulo = 'file'
            //solo la mostramos si el cod vms de la alerta es de el sector vertical en el que estamos (city, ski,...)
            if ((alerta.cod_modulo === 17) && smartcity_modules.some(item => item.module === moduleRef.current))
                setAlerts(prevState => {
                    let updatedAlerts;
                    //si hay más de tres las borro
                    if (prevState.length >= 3) {
                        updatedAlerts = [alerta, ...prevState.slice(0, 2)];
                    } else {
                        let alert = { ...alerta, cod_alerta: 'file' + alerta.cod_video }
                        updatedAlerts = [alert, ...prevState];
                    }
                    return updatedAlerts;
                })
        });
        //limpia socket
        return () => {
            unsubscribeFromEvent('nuevo_video')
            leaveRoom(roomName)
        }
        //eslint-disable-next-line
    }, [codUsuario])



    /* ----------------ONCLICKS------------------------ */

    //elimina la alerta
    const closeAlert = (alert, e) => {
        if (e) { e.stopPropagation() }
        setAlerts(prevState => {
            const nuevasAlertas = prevState.filter(alerta => ((alerta.cod_alerta !== alert.cod_alerta) || (alerta.modulo !== alert.modulo)));
            return nuevasAlertas;
        });
    }

    //click alerta. te lleva a sección
    const onClickAlert = (alert) => {
        //mobility
        if (alert.modulo === 'mobility' && checkPermission(null, 'mobility-prevalidation')) {
            closeAlert(alert)
            setIsLoading(true)
            setFilterAlertCode(alert.cod_alerta)
            setSection('mobility-prevalidation')
            setModule('mobility')
        //traffic
        } else if (alert.modulo === 'traffic' && checkPermission(null, 'traffic-prevalidation')) {
            closeAlert(alert)
            setIsLoading(true)
            setFilterAlertCode(alert.cod_alerta)
            setSection('traffic-prevalidation')
            setModule('traffic')
        //Archivo compartido
        }else if (alert.modulo === 'file') {
            if (alert.cod_modulo === 17 && checkPermission(null, 'vms-files')) {
                closeAlert(alert)
                setIsLoading(true)
                if (section === 'vms-files') {
                    setForceUpdateModule(forceUpdateModule + 1)
                } else {
                    setSection('vms-files')
                    setModule('vms')
                }
            }
        }
    }



    return (
        <div className={styles['alerts__wrapper']}>
            {alerts.map((item, i) => (
                <div key={i} className={styles['alert']} onClick={() => { onClickAlert(item) }} tabIndex={0} onKeyDown={(e) => handleKey(e, () => onClickAlert(item))}>
                    <AccesibleIcon src={closeIcon} text={t('buttons.close')} customStyle={styles['close']} onClick={(e) => closeAlert(item, e)} />

                    {/* contenido alertas tráfico */}
                    {(item.modulo === 'traffic' || item.modulo === 'mobility') &&
                        <>
                            <AccesibleIcon src={cityAlertsIcons[item.cod_alertagest] || alert} customStyle={styles['alertIcon']} />
                            <div>
                                <h2>{t('codes.cityAlerts.' + item.cod_alertagest)}</h2>
                                <h3>{t('messages.newAlertDetected')}</h3>
                            </div>
                            <div className={styles['blocks__wrapper']}>
                                <div className={styles['block']}>
                                    <h3>{t('params.licensePlate')}</h3>
                                    <h3>{t('params.device')}</h3>
                                </div>
                                <div className={styles['block']}>
                                    <p>{item.matricula || "-"}</p>
                                    <p>{item.nom_dispositivo || "-"}</p>
                                </div>
                            </div>
                        </>
                    }


                    {/* contenido notificación archivo compartido */}
                    {(item.modulo === 'file') &&
                        <>
                            <AccesibleIcon src={filesIcon} customStyle={styles['alertIcon']} />
                            <div>
                                <h2>{t('messages.sharedFile')}</h2>
                                <h3>{t('messages.newSharedFile')}</h3>
                            </div>
                            <div className={styles['blocks__wrapper']}>
                                <div className={styles['block']}>
                                    <h3>{t('params.description')}</h3>
                                    <h3>{t('params.device')}</h3>
                                </div>
                                <div className={styles['block']}>
                                    <p>{item.titulo || '-'}</p>
                                    <p>{item.nom_dispositivo || "-"}</p>
                                </div>
                            </div>
                        </>
                    }
                </div>
            ))}
        </div>
    )
}