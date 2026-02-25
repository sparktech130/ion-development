import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { DoughnutChart } from '@components/Charts/DoughnutChart/DoughnutChart'
import { AccesibleIcon } from '../../../../../../../components/AccesibleIcon/AccesibleIcon'
import { Filters } from '../Filters/Filters'

//Context
import MainDataContext from '../../../../../../../context/MainDataContext'

//Api
import { URL_RECONOCIMIENTOS_PERSONAS_GROUP } from '../../../../../../../api/connections/urls'

//Assets
import femIcon from '@icons/analysis/fem.svg?react'
import mascIcon from '@icons/analysis/masc.svg?react'
import clockIcon from "@icons/actions/clock.svg?react"

//Styles
import styles from './Gender.module.css'

//Utils
import { arrayAverageDates, isMore3Days } from '../../../../../../../utils/functions/stats'



export const Gender = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { setIsLoading, requestAPI } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Graph
    const [datos, setDatos] = useState([])
    const [medias, setMedias] = useState([])
    const [groupDays, setGroupDays] = useState(false) //Para las medias

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [isFiltering, setIsFiltering] = useState(false)

    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        setLoadingsControl(prev => ({ ...(prev || {}), 'gender': true }))
        try {

            let data = []
            let datos = [0,0]

            //params
            let params = {
                group: ['genero'],
                modulos: [11],
                cod_dispositivo: device?.cod || undefined,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
                ropa_superior: payload2?.upper_clothing,
                ropa_inferior: payload2?.lower_clothing,
                ...(payload2?.keys?.length
                    ? Object.fromEntries(payload2.keys.map(i => [i, true]))
                    : {})
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'group' && key !== 'order' && key !== 'modulos' && key !== 'cod_dispositivo' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //Agrupar media por días o horas
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)

            //llamar back
            data = await requestAPI(URL_RECONOCIMIENTOS_PERSONAS_GROUP, params)

            if (!data.error) {

                //dar formato datos
                data.forEach(item => {
                    if (item.genero === "male") {
                        datos[0] = parseInt(item.total) || 0
                    }else if (item.genero === "female") {
                        datos[1] = parseInt(item.total) || 0
                    }
                });
                //asignar datos
                setDatos(datos)
                setMedias([
                    arrayAverageDates([datos?.[0] || 0], payload?.initial_date, payload?.final_date, 0, groupByDay),
                    arrayAverageDates([datos?.[1] || 0], payload?.initial_date, payload?.final_date, 0, groupByDay)
                ])
                setGroupDays(groupByDay)

            } else {
                setDatos([])
                setMedias([0,0])
            }
        } catch {
            setDatos([])
            setMedias([0,0])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'gender': false }))
            }, 300);
        }
    }

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload, device, payload2])


    //-------------------------FUNCIONES-----------------------------------

    //Filtra datos
    const filterData = (p) => {
        setIsLoading(true) //Para que no se vea un instante sin loading
        setPayload2(p)
    }


    return (
        <>
            {/* Modal filtrar */}
            {filterOpen &&
                <Filters
                    setFilterOpen={setFilterOpen}
                    filterData={filterData}
                    filterState={filterState} setFilterState={setFilterState}
                />
            }

            <StatsCard
                title={t('params.gender')}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
                type='custom'
            >
                <div className={styles['wrapper']}>

                    <div className={styles['info']}>

                        <div className={styles['row']} style={{ color: '#6692DB' }}>
                            <AccesibleIcon src={mascIcon} />
                            <h3>{datos?.[0]?.toLocaleString(i18n.language) || 0}</h3>
                        </div>
                        <div className={styles['row--small']}>
                            <AccesibleIcon src={clockIcon} />
                            <h4>{`${medias?.[0] || 0} ${t('terms.records')} ${t('terms.maleShort')} / ${groupDays ? t('terms.day') : t('terms.hour')}`}</h4>
                        </div>

                        <div className={styles['row']} style={{ color: '#E72584' }}>
                            <AccesibleIcon src={femIcon} />
                            <h3>{datos?.[1]?.toLocaleString(i18n.language) || 0}</h3>
                        </div>
                        <div className={styles['row--small']}>
                            <AccesibleIcon src={clockIcon} alt="time" />
                            <h4>{`${medias?.[1] || 0} ${t('terms.records')} ${t('terms.femaleShort')} / ${groupDays ? t('terms.day') : t('terms.hour')}`}</h4>
                        </div>

                    </div>


                    <div className={styles['donut__wrapper']}>
                        <DoughnutChart
                            tooltip
                            labels={[t('values.male'), t('values.female')]}
                            datos={[datos?.[0] || 0, datos?.[1] || 0]}
                            label=''
                            colors={["#6692DB", "#E72584"]}
                            borderRadius={10}
                            spacing={2}
                            cutout='85%'
                        />
                    </div>

                </div>
            </StatsCard>
        </>
    )
}