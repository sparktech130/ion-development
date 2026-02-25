//Librerías
import { useEffect, useState, useContext } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Components
import { TextModal } from '../../../../../../components/TextModal/TextModal'
import { CheckPermission } from '../../../../../../components/CheckPermission/CheckPermission'
import { AccesibleIcon } from '../../../../../../components/AccesibleIcon/AccesibleIcon'

//CSS
import styles from './File.module.css'

//Iconos
import timelapse from '../../../../../../assets/icons/actions/timelapse.svg?react'
import close from "../../../../../../assets/icons/actions/close.svg?react"

//Constantes
import { url_path } from '../../../../../../constants/common'

//API
import { URL_ELIMINAR_VIDEO } from '../../../../../../api/connections/urls'
 

export const File = ({
    item,
    onClickItem,
    getFiles
}) => {

    const {setIsLoading, requestAPI, url_origin} = useContext(MainDataContext)
    const {t} = useTranslation()
    const [error, setError] = useState(false)
    const [caducado, setCaducado] = useState(false)
    const [initialCall, setInitialCall] = useState(true)
    const [closeModal, setCloseModal] = useState(false)

    //------------------USEEFFECT-----------------------

    //error imagen
    useEffect(()=>{
        if(!initialCall){
            setError(false)
        }
        setInitialCall(false)
    //eslint-disable-next-line
    },[item])

    //caducidad
    useEffect(()=>{
        if(moment(item.fecha_hora_caducidad, 'YYYY-MM-DD HH:mm:ss').isBefore(moment())){
            setCaducado(true)
        }
    },[item.fecha_hora_caducidad])

    //---------------API---------------------------------

    //elimina archivo
    const eliminarArchivo = async () => {
        try{
            if(item.cod_video){
                setCloseModal(false)
                setIsLoading(true)
                await requestAPI(URL_ELIMINAR_VIDEO, {cod_video: item.cod_video})
                getFiles()
            }
        }finally{
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //-------------------ONCLICKS------------------------

    //click archivo
    const onClickClose = (e) => {
        e?.stopPropagation()
        setCloseModal(true)
    }

    
    return(
        <>
            {/* Modal eliminar */}
            {closeModal &&
                <TextModal setIsOpen={setCloseModal} title={t('crud.deleteElement', {element:t('terms.file')})} aceptar={eliminarArchivo} cancelar={()=>setCloseModal(false)}>{t('crud.deleteConfirmation', {element:t('terms.file')})}</TextModal>
            }

            <CheckPermission className={`${styles.wrapper} ${caducado ? styles.noDisponible : ''}`} onClick={()=>{if(!caducado){onClickItem()}}} permissionType='consultas'>

                {/*Imagen*/}
                <div className={styles['image__wrapper']}>

                    {(error || !item.imagen) 
                        ? <p className={styles['no-image']}>{t('messages.noImage')}</p> 
                        : <img className={styles['image']} alt='foto' src={url_origin+url_path+'/'+item.imagen} onError={()=>{setError(true)}} loading='lazy'/>
                    }

                    {/*Detalles del vídeo*/}
                    <div className={styles['image-details']}>
                        <div className={styles['time__details']}>
                            <p>{item?.pos ? moment(item.pos).format('DD-MM-YYYY') : ''}</p>
                            <p>{item?.pos ? moment(item.pos).format('HH:mm:ss') : ''}</p>
                        </div>
                        <div className={styles['share__details']}>
                            {parseInt(item?.velocidad) > 1 ? <AccesibleIcon tabIndex={-1} src={timelapse} text='Timelapse'/> : null}
                        </div>
                    </div>

                    {/* cerrar */}
                    <CheckPermission tabIndex={-1} className={styles['close']} onClick={onClickClose} permissionType='editar'>
                        <AccesibleIcon src={close} text='close' />
                    </CheckPermission>

                </div>

                {/* info */}
                <div className={styles.info}>
                    <h2 className={caducado ? styles['caducado'] : ''}>{item?.titulo+' '+(caducado ? '('+t('messages.expired')+')' : '')}</h2>
                    <p>{item?.nombre ? t('messages.sharedBy', {name:item?.nombre}) : ''}</p>
                    <p>{item?.fecha_hora_caducidad ? (t('messages.expiration')+': '+moment(item?.fecha_hora_caducidad, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY HH:mm:ss')) : ''}</p>
                </div>

            </CheckPermission> 
        </>
    )
}