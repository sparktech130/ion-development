import { useState, useContext, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from "react-i18next"

//Components
import { BarChartV4 } from '../../../../../../components/Charts/BarChart/BarChartV4'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { Filters } from './Filters/Filters'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//utils
import { isMore3Days } from '../../../../../../utils/functions/stats'

//Assets
import capacityIcon from '@icons/alerts/people-capacity.svg?react'


export const StopTimes = ({
    payload, //payload general de todas las gráficas con las fechas
    preset, // 24, 7, 30, custom
    bus,
    autocompletes,
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //Context
    const { setIsLoading } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Graph
    const [datos, setDatos] = useState({ labels: [], datos: [], total: '0min' })
    const [groupDays, setGroupDays] = useState(false)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [isFiltering, setIsFiltering] = useState(false)


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {

        let error = true
        setLoadingsControl(prev => ({ ...(prev || {}), 'stop': true }))

        try {

            let data = []
            let labels = []
            let datos = []

            //params
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
            let params = {
                campos: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                order: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                modulos: [11],
                buses: bus?.cod ? [bus?.cod] : undefined,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //payload 2
            if (payload2?.test) params.test = payload2?.test

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'campos' && key !== 'order' && key !== 'modulos' && key !== 'buses' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //llamar back
            data = [] //await requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)

            if (!data.error && Array.isArray(data)) {

                //dar formato datos
                data?.forEach(item => {
                    //labels
                    let formatLabel = groupByDay ? item.fecha : item.fecha + '\n' + item.hora + ':00'
                    labels.push(formatLabel)
                    datos.push(item?.total || 0)
                })

                error = false

                //asignar datos
                setDatos({ labels: labels, datos: datos, total: '0min' })
                setGroupDays(groupByDay)

            }
        } finally {
            setTimeout(() => {
                if (error) {
                    setDatos({ labels: [], datos: [], total: '0min' })
                }
                setLoadingsControl(prev => ({ ...(prev || {}), 'stop': false }))
            }, 300);
        }
    }

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload, bus, payload2])


    //-------------------------FUNCIONES-----------------------------------

    //Filtra datos
    const filterData = (p) => {
        setIsLoading(true)
        setPayload2(p)
    }

    return (
        <>

            {/* Modal filtrar */}
            {filterOpen &&
                <Filters
                    setFilterOpen={setFilterOpen}
                    filterData={filterData}
                    autocompletes={autocompletes}
                    filterState={filterState} setFilterState={setFilterState}
                />
            }

            <StatsCard
                title={t('titles.stopTimes')}
                description={[0 + ' ' + t('terms.uniquePassengers'), 0 + ' ' + t('terms.reIdentification')]}
                descriptionIcon={[capacityIcon, capacityIcon]}
                value={datos?.total || '0m'}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
            >
                <BarChartV4
                    labels={datos?.labels || []}
                    datos={datos?.datos ? [datos?.datos] : []}
                    unidades={['min']}
                    colors={['#FFAB49']}

                    formatDateHour={!groupDays}
                    formatDate={groupDays}
                    categoryPercentage={0.8}
                    barPercentage={0.85}
                />
            </StatsCard>
        </>
    )
}