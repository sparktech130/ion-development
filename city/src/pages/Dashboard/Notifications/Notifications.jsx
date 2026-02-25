//No se ha implementado en back. No traducido. No puestos AccesibleIcons en las <img>

import styles from './Notifications.module.css'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../context/MainDataContext'

//Icons
import closeIcon from "../../../assets/icons/actions/close.svg?react"
import notificationOpenIcon  from "../../../assets/icons/navbar/notification-open.svg?react"
import notificationCloseIcon  from "../../../assets/icons/navbar/notification-close.svg?react"

//Utils
import { handleKey } from '../../../utils/functions/accessibility'
import { AccesibleIcon } from '../../../components/AccesibleIcon/AccesibleIcon'



export const Notifications = () => {

    //Context
    const {notificationsOpen, setNotificationsOpen, notifications} = useContext(MainDataContext)
    const {t} = useTranslation()

    //-----------------Funciones-----------------------------

    //Cerrar Notifications
    const handleClose = () => {
        setNotificationsOpen(false)
    }


    return(
        <>
            {notificationsOpen &&
                <div className={styles['wrapper']+' '+(notificationsOpen ? styles['wrapper--open'] : '')}>
                    <div className={styles['content']}>
                        <AccesibleIcon src={closeIcon} text={t('buttons.close')} className={styles["close"]} onClick={handleClose} tabIndex={0} onKeyDown={(e)=>handleKey(e, handleClose)} />
                        <h2>Notificaciones</h2>
                        {(!notifications || notifications.length===0) ? (
                            <div className={styles['no__data']} >
                                <p>No hay notificaciones</p>
                            </div>
                        ) : (
                            <div className={styles['notifications']}>
                                {notifications.map((item, i)=>(
                                    <div className={styles['notification']+' '+(item.opened ? '' : styles['notification--closed'])} key={i}>
                                        <AccesibleIcon src={item.opened ? notificationOpenIcon : notificationCloseIcon} customStyle={styles['notification__img__wraper']} />
                                        <h4>Hoy, 10:30</h4>
                                        <h3>Solicitud de archivos aceptada</h3>
                                        <p>IONSMART ha aceptado la compartición de archivos para el módulo de Analytics.</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            }
        </>
    )
}