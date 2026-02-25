//Librerías
import { useState, useEffect, useContext } from "react"
import { useTranslation } from "react-i18next"
import moment from "moment"

//Styles
import statsStyles from '@styles/sections/StatsIndustry.module.css'

//Components
import { VisualizationElement } from "../../../../../../components/VisualizationElement/VisualizationElement"

//Context
import MainDataContext from "@context/MainDataContext"

//Urls
import { URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP } from "../../../../../../api/connections/urls"

//Constants
import { alert_codes } from "../../../../../../constants/common"
import { cityAlertsIcons } from "../../../../../../constants/icons"
import { checkArray } from "../../../../../../utils/functions/functions"



export const Alerts = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    order, //'ASC', 'DESC'
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //*----------------------------------------VARIABLES-------------------------------------------------*//

    //Context
    const { requestAPI } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Data
    const [alertsList, setAlertsList] = useState([])

    //*--------------------------------------LLAMADAS API------------------------------------------------*//

    //Funcion que obtiene los datos lista alertas
    const getData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'alerts': true }))

        try {

            let data = []
            let datos = alert_codes?.map(item=>({code: item}))
            
            //params
            let params = {
                campos: ["cod_alertagest"],
                order: ['total DESC'],
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //Datos
            data = await requestAPI(URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP, params, 'city')

            if (!data.error && Array.isArray(data)) {
                
                //dar formato datos
                data.forEach(item => {
                    if(item.cod_alertagest){
                        const index = datos.findIndex(d => d.code === item.cod_alertagest);
                        if (index !== -1) {
                            datos[index].total = item.total;
                        }
                    }
                });

                //Orden
                let orderedData = orderData(datos)

                //Asignamos datos
                setAlertsList(orderedData);
            }else{
                setAlertsList(datos);
            }

        } catch {
            setAlertsList([]);
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'alerts': false }))
            }, 300)
        }
    }


    //*-----------------------------------------UTILS---------------------------------------------------*//

    //Ordenar datos
    const orderData = (datos) => {
        if(checkArray(datos)){
            return [...datos].sort((a, b) => 
                order === 'ASC'
                    ? (a.total || 0) - (b.total || 0)
                    : (b.total || 0) - (a.total || 0)
            );
        }else{
            return []
        }
    };


    //*---------------------------------------USE EFFECT------------------------------------------------*//

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload])

    //Actualiza orden
    useEffect(()=>{
        if(checkArray(alertsList)){
            let orderedData = orderData(alertsList)
            setAlertsList(orderedData)
        }
    //eslint-disable-next-line
    },[order])


    return (
        <>
            {alertsList?.map(item=>(
                <VisualizationElement
                    key={item.code}
                    iconStyle={{color: '#E93636', height: '20px', width: '20px'}}
                    titleStyle={statsStyles['alert__title']}
                    textStyle={statsStyles['alert__text']}
                    titleIcon={cityAlertsIcons[item.code]}
                    title={t('codes.cityAlerts.'+item.code)}
                    text={item.total || 0}
                />
            ))}    
        </>
    )
}