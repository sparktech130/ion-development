//Librerías
import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import moment from "moment"

//Styles
import statsStyles from '@styles/sections/StatsIndustry.module.css'
import chartsStyles from '@styles/charts.module.css'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { BarChartV4 } from "@components/Charts/BarChart/BarChartV4"
import { AccesibleIcon } from '@components/AccesibleIcon/AccesibleIcon'

//Utils
import { isMore3Days, arrayAverageDates, arrayTotal } from '@utils/functions/stats'

//Icons
import warningIcon from '@icons/alerts/warning.svg?react'
import warningRedIcon from '@icons/alerts/warning--red.svg?react'



export const Alerts = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //*----------------------------------------VARIABLES-------------------------------------------------*//

    //Context
    const { t, i18n } = useTranslation()

    //Data
    //eslint-disable-next-line
    const [datos, setDatos] = useState([])
    //eslint-disable-next-line
    const [labels, setLabels] = useState([])
    //eslint-disable-next-line
    const [media, setMedia] = useState(0)
    //eslint-disable-next-line
    const [total, setTotal] = useState(0)
    const [groupDays, setGroupDays] = useState(false)


    //*--------------------------------------LLAMADAS API------------------------------------------------*//

    //Funcion que obtiene los datos de gráfica alertas
    const getData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'alerts': true }))

        try {

            let data = []
            let labels = []
            let datos = []
            
            //Parámetros de la función
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
            
            //params
            let params = {
                campos: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                order: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //Datos
            data = undefined //await requestAPI(URL_OBTENER_ALERTAS_GROUP, params, 'city')

            if (!data.error && Array.isArray(data)) {

                //dar formato datos
                data.forEach(item => {
                    if (groupByDay) {
                        labels.push(item.fecha)
                    } else {
                        labels.push(item.fecha + '\n' + item.hora + ':00')
                    }
                    datos.push(item.total)
                });

                //Asignamos datos
                setDatos(datos);
                setLabels(labels)
                setTotal(arrayTotal(datos))
                setMedia(arrayAverageDates(datos, payload?.initial_date, payload?.final_date, 0, groupByDay))
                setGroupDays(groupByDay)
            }else{
                setDatos([]);
                setLabels([])
                setTotal(0)
                setMedia(0)
            }

        } catch {
            setDatos([]);
            setLabels([])
            setTotal(0)
            setMedia(0)
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'alerts': false }))
            }, 300)
        }
    }


    //*---------------------------------------USE EFFECT------------------------------------------------*//

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload])



    return (

        <div className={statsStyles['list']} style={{ height: 'calc(100vh - 140px)' }}>

            <div className={statsStyles['graph100']} style={{marginBottom: '5px'}}>
                <StatsCard
                    title={t('sections.ALERTAS')}
                    description={[25 + ' ' + t('terms.alerts') + ' / ' + (groupDays ? t('terms.day') : t('terms.hour'))]}
                    descriptionIcon={[warningIcon]}
                    value={85?.toLocaleString(i18n.language) || 0}
                >
                    <BarChartV4
                         labels={["00","01","02","03","04","05","06","07","08","09","10"]}
                        datos={[[53, 25, 58, 47, 60, 35, 55, 57, 41, 48, 59]]}
                        colors={['#E93636']}
                        unidades={[' ' + t('terms.alerts')]}
                        formatDateHour={!groupDays}
                        formatDate={groupDays}
                        categoryPercentage={0.7}
                        barPercentage={0.7}
                    />
                </StatsCard>
            </div>

            {Array.from({ length: 8 }, (_, i) => (
                <div key={i} className={chartsStyles['alert__wrapper']}>
                    <AccesibleIcon src={warningRedIcon}  />
                    <div className={chartsStyles['row']}>
                        <h2>Sistema operativo desactualizado</h2>
                        <p>El sistema operativo debe actualizarse</p>
                    </div>
                    <p style={{marginLeft: 'auto'}}>0{i}:00:35</p>
                </div>
            ))}
        
        </div>

    )
}