import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { DoughnutChart } from '@components/Charts/DoughnutChart/DoughnutChart'

//Context
import MainDataContext from '../../../../../../../context/MainDataContext'

//Api
import { URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP } from '../../../../../../../api/connections/urls'

//Styles
import styles from './Module.module.css'
import { checkArray } from '../../../../../../../utils/functions/functions'



export const Module = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { requestAPI } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos
    const [datos, setDatos] = useState([
        {name: 'ION TRAFFIC', module: 'traffic', color: '#EA4949', value: 0},
        {name: 'ION MOBILITY', module: 'mobility', color: '#EA4949BF', value: 0},
        {name: 'ION TOW', module: 'tow', color: '#EA494980', value: 0},
        {name: 'ION CITIZEN', module: 'citizen', color: '#EA494940', value: 0}
    ])

    


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        let success = false
        setLoadingsControl(prev => ({ ...(prev || {}), 'module': true }))
        try {

            let data = []

            //params
            let params = {
                campos: ['modulo'],
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //llamar back
            data = await requestAPI(URL_OBTENER_INFRACCIONES_VEHICULOS_GROUP, params, 'city')

            //Formato datos
            if (!data.error && checkArray(data)) {

                let retorno = datos.map(obj => ({ ...obj, value: 0 }));

                data.forEach(item => {
                    if (item.nombre_modulo) {
                        const index = retorno.findIndex(r => r.module === item.nombre_modulo);
                        if (index !== -1) {
                            retorno[index].value = item.total || 0;
                        }
                    }
                });

                setDatos(retorno);
                success = true;
            }
        } finally {
            if(!success){
                setDatos(datos.map(item=>({...item, value: 0})))
            }
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'module': false }))
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
        <>

            <StatsCard
                title={t('titles.moduleAlerts')}
                type='custom'
            >
                <div className={styles['wrapper']}>


                    <div className={styles['donut__wrapper']}>
                        <DoughnutChart
                            tooltip
                            labels={datos?.map(item=>item.name)}
                            datos={datos?.map(item=>item.value)}
                            label=''
                            colors={datos?.map(item=>item.color)}
                            borderRadius={10}
                            spacing={5}
                            cutout='86%'
                        />
                    </div>

                    <div className={styles['table__wrapper']}>
                        <table className={styles['table']}>
                            <tbody>
                                {datos?.map(item=>(
                                    <tr key={item.name}>
                                        <td><div className={styles['square']} style={{backgroundColor: item.color}}></div></td>
                                        <td style={{textAlign:'right'}}><p>{item.value}</p></td>
                                        <td style={{textAlign:'left'}}><h2>{item.name}</h2></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </StatsCard>
        </>
    )
}