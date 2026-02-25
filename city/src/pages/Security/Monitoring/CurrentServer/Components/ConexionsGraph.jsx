import { useState, useContext, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from "react-i18next"

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'

//Components
import { LinearChart } from '@components/Charts/LinearChart/LinearChart'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'

//Api

//Context
import MainDataContext from '@context/MainDataContext'

//utils
import { isMore3Days } from '@utils/functions/stats'



export const ConexionsGraph = ({
    payload, //payload general de todas las gráficas de vehículos con las fechas
    preset, // 24, 7, 30, custom
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //Context
    //eslint-disable-next-line
    const { requestAPI} = useContext(MainDataContext)
    const { t} = useTranslation()

    //Graph
    //eslint-disable-next-line
    const [labels, setLabels] = useState([])
    //eslint-disable-next-line
    const [datos, setDatos] = useState([])
    //eslint-disable-next-line
    const [groupDays, setGroupDays] = useState(false)


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'conexions': true }))

        try {

            let data = []
            let labels = []
            let datos = []

            //params
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
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

            //llamar back
            data = undefined// await requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)

            if (data && !data.error) {

                //dar formato datos
                data.forEach(item => {
                    if (groupByDay) {
                        labels.push(item.fecha)
                    } else {
                        labels.push(item.fecha + '\n' + item.hora + ':00')
                    }
                    datos.push(item.total)
                });

                //asignar datos
                setLabels(labels)
                setDatos(datos)
                setGroupDays(groupByDay)

            } else {
                setLabels([])
                setDatos([])
            }
        } catch {
            setLabels([])
            setDatos([])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'conexions': false }))
            }, 300);
        }
    }

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload])



    return (
        <div className={styles['graph']} style={{height: 'calc((100vh - 478px) / 2)', minHeight:'230px'}}>
            <StatsCard
                title={t('titles.serverConnections')}
                type="custom"
            >
                <div style={{height: 'calc(100% - 20px)', marginTop:'-20px'}}>
                    <LinearChart
                        labels={["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]}
                        datos={[[53, 25, 58, 47, 60, 35, 55, 57, 41, 48, 59, 44, 51, 43, 26, 49, 54, 46, 52, 60, 40, 58, 47, 25],[41, 33, 16, 39, 44, 36, 42, 50, 30, 48, 37, 15, 43, 15, 48, 37, 50, 25, 45, 47, 31, 38, 49, 34],[69, 54, 63, 35, 68, 57, 70, 45, 65, 61, 53, 36, 59, 64, 56, 62, 70, 50, 68, 57, 35, 67, 51, 58]]}
                        etiquetas={[t('params.externalRequests'), t('params.externalSubmissions'), t('params.internalRequests')]}
                        colors={['#6692DB', '#FFAB49', '#6EEAD8']}
                        legend={true}

                        gradient={false}
                        tension={0}
                        pointRadius={1}
                        borderWidth={1}
                    />
                </div>
            </StatsCard>
        </div>
    )
}