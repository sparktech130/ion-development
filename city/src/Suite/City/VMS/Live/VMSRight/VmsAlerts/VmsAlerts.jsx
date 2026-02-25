import styles from './VmsAlerts.module.css'
import { useEffect, useState, useContext } from "react"
import moment from "moment"

//services
import { URL_OBTENER_EVENTOS_ERRORES_DISPOSITIVO } from "../../../../../../../api/connections/urls"

//context
import MainDataContext from '../../../../../../../context/MainDataContext'


export const VmsAlerts = ({
    device
}) => {
    const {requestAPI} = useContext(MainDataContext)
    const [alerts, setAlerts] = useState([])

    //-----------------pedir datos------------------------

    //obtiene alertas
    const getAlerts = async () => {
        try{
            setAlerts([])
            if(device?.cod_dispositivo){
                let params = {
                    cod_dispositivo: device.cod_dispositivo,
                    fecha_hora_ini: moment().subtract(1, 'day').format('YYYY-MM-DD HH:mm:ss'),
                    fecha_hora_fin: moment().format('YYYY-MM-DD HH:mm:ss'),
                    limit: 25
                }
                let data = await requestAPI(URL_OBTENER_EVENTOS_ERRORES_DISPOSITIVO, params)
                if(!data.error && Array.isArray(data)){
                    setAlerts(data)
                }else{
                    setAlerts([])
                }
            }else{
                setAlerts([])
            }
        }catch{
            setAlerts([])
        }
    }

    //actualiza alertas
    useEffect(()=>{
        getAlerts()
        const intervalId = setInterval(() => {
            getAlerts()
        }, 120000);
        return () => clearInterval(intervalId);
    //eslint-disable-next-line
    },[device])


    return(
        <div className={styles['recognitions']}>
            <div className={styles['recognitions__wrapper']}>
                {alerts && alerts.map((item, i)=>(
                    <div className={styles['recognition']} key={i}>
                        <h2>{item.eventType}</h2>
                        <div className={styles['info__times']}>                             
                            <p>{item.timestamp ? moment(parseInt(item.timestamp)*1000).format('DD-MM-YYYY') : ''}</p>
                            <p>{item.timestamp ? moment(parseInt(item.timestamp)*1000).format('HH:mm:ss') : ''}</p>                                
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}