import styles from './Download.module.css'
import { useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//context
import MainDataContext from '../../../../context/MainDataContext'

//icons
import closeIcon from '../../../../assets/icons/actions/close.svg?react'
import errorIcon from '../../../../assets/icons/actions/error.svg'

//Components
import { AccesibleIcon } from '../../../../components/AccesibleIcon/AccesibleIcon'



export const Download = ({
    item 
    /* 
    item: objeto {id, url, writable, name}
        id: Date.now() timestamp en ms
        url: url de la descarga
        writable: contiene información de ubición y nombre de la descarga de forma segura (File System API)
        name: nombre archivo
    */
    
}) =>{

    const {t} = useTranslation()
    const {setDownloads} = useContext(MainDataContext)
    const abortControllerRef = useRef(null);


    //------------------USEEFFECT--------------------------------

    //llama a la descarga
    useEffect(()=>{
        descargar()
    //eslint-disable-next-line
    },[item.id])

    //-------------------FUNCIONES-----------------------

    //hace la descarga
    const descargar = async () => {
        try{
            if(item.url && item.writable && !item.state){
                //para poder cancelar la descarga
                abortControllerRef.current = new AbortController();
                const { signal } = abortControllerRef.current;
                //descarga el video 
                const response = await fetch(item.url, { signal });
                const blob = await response.blob();
                // Lo escribe en el archivo
                await item.writable.write(blob);
                await item.writable.close();
                //la marco como cerrada
                setTimeout(() => {
                    changeState('closed') 
                }, 500);
            }else{
                changeState('error')
            }
        }catch(error){
            if (error.name === 'AbortError') {
                setTimeout(() => {
                    changeState('closed')
                }, 500);
            }else{
                changeState('error')
            }
        }
    }

    //cambia estado alerta
    const changeState = (state) => {
        setDownloads(prevValue=>
            prevValue.map(descarga=>
                descarga.id === item.id ? { ...descarga, state: state } : descarga
            )
        )
    }

    //cancela descarga
    const cancelDownload = () => {
        //si está descargando la cancelamos
        if(!item.state && abortControllerRef.current){
            abortControllerRef.current.abort()
        //si no estaba descargando la cerramos
        }else{
            changeState('closed')
        }
    }

    return(
        <>
            {(item.state !== 'closed') &&
                <div className={styles['item']}>
                    <div className={styles['left']}>
                        {(item?.state !== 'error') ?
                                <div className='small__spinner'></div>
                                :
                                <img className={styles['errorIcon']} src={errorIcon} alt='error' />
                            }
                        <p className={styles['text']}>{item?.name ? item.name : 'Download'}</p>
                    </div>
                    <AccesibleIcon src={closeIcon} text={t('buttons.cancel')} customStyle={styles['close']} onClick={cancelDownload} />
                </div>
            }
        </>
    )
}