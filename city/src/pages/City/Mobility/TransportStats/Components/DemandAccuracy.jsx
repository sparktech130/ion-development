import { useState, useContext, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from "react-i18next"

//Components
import { LinearChart } from '@components/Charts/LinearChart/LinearChart'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { Filters } from './Filters/Filters'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//utils
import { isMore3Days } from '../../../../../../utils/functions/stats'

//Assets
import capacityIcon from '@icons/alerts/people-capacity.svg?react'


export const DemandAccuracy = ({
    payload, //payload general de todas las gráficas con las fechas
    preset, // 24, 7, 30, custom
    bus,
    autocompletes,
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //Context
    const { setIsLoading } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Graph
    const [datos, setDatos] = useState({ labels: [], datos: [[], []], total: 0 })
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
        setLoadingsControl(prev => ({ ...(prev || {}), 'demand': true }))

        try {

            let data = []
            let labels = []
            let datos = [[], []]
            let total = 0

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
                    datos[0].push(0)
                    datos[1].push(0)
                    total += item?.total || 0
                })

                error = false

                //asignar datos
                setDatos({ labels: labels, datos: datos, total: total })
                setGroupDays(groupByDay)

            }
        } finally {
            setTimeout(() => {
                if (error) {
                    setDatos({ labels: [], datos: [[], []], total: 0 })
                }
                setLoadingsControl(prev => ({ ...(prev || {}), 'demand': false }))
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
                title={t('titles.demandAccuracy')}
                description={[0 + ' ' + t('terms.demand'), 0 + ' ' + t('terms.accuracy')]}
                descriptionIcon={[capacityIcon, capacityIcon]}
                value={(datos?.total?.toLocaleString(i18n?.language) || 0) + '%'}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
            >
                <LinearChart
                    labels={datos?.labels || []}
                    datos={datos?.datos || []}
                    unidades={['% ' + t('terms.accuracy'), '% ' + t('terms.demand')]}
                    colors={['#AE6BCC', '#E72584']}

                    formatDateHour={!groupDays}
                    formatDate={groupDays}
                    categoryPercentage={0.8}
                    barPercentage={0.85}
                />
            </StatsCard>
        </>
    )
}