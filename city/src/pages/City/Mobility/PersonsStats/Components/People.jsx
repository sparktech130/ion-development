import { useState, useEffect, useContext } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { BarChartV4 } from "@components/Charts/BarChart/BarChartV4"
import { Filters } from './Filters/Filters'

//Api
import { URL_RECONOCIMIENTOS_PERSONAS_GROUP } from '../../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//utils
import { isMore3Days, arrayAverageDates } from '../../../../../../utils/functions/stats'


export const People = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { setIsLoading, requestAPI } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Graph
    const [labels, setLabels] = useState([])
    const [datos, setDatos] = useState([])
    const [total, setTotal] = useState(undefined)
    const [media, setMedia] = useState(0)
    const [groupDays, setGroupDays] = useState(false)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [isFiltering, setIsFiltering] = useState(false)

    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'people': true }))
        try {

            let data = []
            let labels = []
            let datos = [[], [], []]
            let total = 0
            //params
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
            let params = {
                group: groupByDay ? ['fecha', 'genero'] : ['fecha', 'hora', 'genero'],
                order: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                modulos: [11],
                cod_dispositivo: device?.cod || undefined,
                test: payload2?.test,
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

            //llamar back
            data = await requestAPI(URL_RECONOCIMIENTOS_PERSONAS_GROUP, params)

            if (!data.error) {

                //dar formato datos
                data.forEach(item => {
                    //labels
                    let index;
                    let formatLabel = groupByDay ? item.fecha : item.fecha + '\n' + item.hora + ':00'
                    index = labels.indexOf(formatLabel)
                    if (index === -1) {
                        labels.push(formatLabel)
                    }
                    //datos
                    total += item.total
                    if (item.genero === "male") {
                        if (index !== -1) {
                            datos[0][index] = item.total
                            if (!datos[1][index]) { datos[1][index] = 0 }
                            if (!datos[2][index]) { datos[2][index] = 0 }
                        } else {
                            datos[0][labels.length - 1] = item.total
                            if (!datos[1][labels.length - 1]) { datos[1][labels.length - 1] = 0 }
                            if (!datos[2][labels.length - 1]) { datos[2][labels.length - 1] = 0 }
                        }
                    } else if (item.genero === "female") {
                        if (index !== -1) {
                            datos[1][index] = item.total
                            if (!datos[0][index]) { datos[0][index] = 0 }
                            if (!datos[2][index]) { datos[2][index] = 0 }
                        } else {
                            datos[1][labels.length - 1] = item.total
                            if (!datos[0][labels.length - 1]) { datos[0][labels.length - 1] = 0 }
                            if (!datos[2][labels.length - 1]) { datos[2][labels.length - 1] = 0 }
    
                        }
                    }else if (item.genero === "unknown") {
                        if (index !== -1) {
                            datos[2][index] = item.total
                            if (!datos[0][index]) { datos[0][index] = 0 }
                            if (!datos[1][index]) { datos[1][index] = 0 }
                        } else {
                            datos[2][labels.length - 1] = item.total
                            if (!datos[0][labels.length - 1]) { datos[0][labels.length - 1] = 0 }
                            if (!datos[1][labels.length - 1]) { datos[1][labels.length - 1] = 0 }
                        }
                    }
                });
                //asignar datos
                setLabels(labels)
                setDatos(datos)
                setGroupDays(groupByDay)
                setTotal(total)
                setMedia(arrayAverageDates([total], payload?.initial_date, payload?.final_date, 0, groupByDay))

            } else {
                setLabels([])
                setDatos([])
                setTotal(0)
                setMedia(0)
            }
        } catch {
            setLabels([])
            setDatos([])
            setTotal(0)
            setMedia(0)
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'people': false }))
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
                title={t('titles.records')}
                description={[`${media} ${t('terms.records')} / ${groupDays ? t('terms.day') : t('terms.hour')}`]}
                value={total?.toLocaleString(i18n.language) || 0}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
            >
                <BarChartV4
                    labels={labels}
                    datos={datos}
                    etiquetas={[t('values.male'), t('values.female'), t('values.Sin identificar')]}
                    colors={['#6692DB', '#E72584', '#FFE37E']}
                    formatDateHour={!groupDays}
                    formatDate={groupDays}
                />
            </StatsCard>
        </>
    )
}