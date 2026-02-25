import { useState, useContext, useEffect } from 'react'
import moment from 'moment'
import { useTranslation } from "react-i18next"

//Components
import { BarChartV4 } from '../../../../../../components/Charts/BarChart/BarChartV4'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { FiltersVehicles } from './Filters/FiltersVehicles'

//Api
import { URL_OBTENER_RECONOCIMIENTOS_GROUP } from '../../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//utils
import { isMore3Days, arrayAverageDates } from '../../../../../../utils/functions/stats'

//Assets
import trafficIcon from '@icons/navbar/traffic.svg?react'


export const Traffic = ({
    payload, //payload general de todas las gráficas de vehículos con las fechas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    autocompletes,
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //Context
    const { requestAPI, setIsLoading } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Graph
    const [labels, setLabels] = useState([])
    const [datos, setDatos] = useState([])
    const [total, setTotal] = useState(0)
    const [media, setMedia] = useState(0)
    const [groupDays, setGroupDays] = useState(false)
    const [isFiltering, setIsFiltering] = useState(false)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'traffic': true }))

        try {

            let data = []
            let labels = []
            let datos = [[], [], []]
            let total = 0

            //params
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
            let params = {
                campos: groupByDay ? ['fecha', 'zona'] : ['fecha', 'hora', 'zona'],
                order: groupByDay ? ['fecha'] : ['fecha', 'hora'],
                modulos: [11],
                dispositivos: device?.cod ? [device?.cod] : undefined,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //payload 2
            if (payload2?.initial_hour) params.hora_ini = payload2?.initial_hour
            if (payload2?.final_hour) params.hora_fin = payload2?.final_hour
            if (payload2?.licensePlate) params.matricula = payload2?.licensePlate
            if (payload2?.color?.cod) params.color = payload2?.color?.cod
            if (payload2?.brand) params.marca = payload2?.brand
            if (payload2?.model) params.modelo = payload2?.model
            if (payload2?.nacionality?.cod) params.pais = payload2?.nacionality?.cod
            if (payload2?.confidence) params.confidence = payload2?.confidence
            if (payload2?.direction?.cod) params.orientacion = payload2?.direction?.cod
            if (payload2?.speed) params.velocidad_vehiculo = payload2?.speed
            if (payload2?.alerts) params.alertas = payload2?.alerts
            if (payload2?.areaType?.name) params.tipo_area = payload2?.areaType?.name

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'campos' && key !== 'order' && key !== 'modulos' && key !== 'dispositivos' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //llamar back
            data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)

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
                    if (item.tipo_area === "ZAR") {
                        total += item.total
                        if (index !== -1) {
                            datos[0][index] = item.total
                            if (!datos[1][index]) { datos[1][index] = 0 }
                            if (!datos[2][index]) { datos[2][index] = 0 }
                        } else {
                            datos[0][labels.length - 1] = item.total
                            if (!datos[1][labels.length - 1]) { datos[1][labels.length - 1] = 0 }
                            if (!datos[2][labels.length - 1]) { datos[2][labels.length - 1] = 0 }
                        }
                    } else if (item.tipo_area === "ZBE") {
                        total += item.total
                        if (index !== -1) {
                            datos[1][index] = item.total
                            if (!datos[0][index]) { datos[0][index] = 0 }
                            if (!datos[2][index]) { datos[2][index] = 0 }
                        } else {
                            datos[1][labels.length - 1] = item.total
                            if (!datos[0][labels.length - 1]) { datos[0][labels.length - 1] = 0 }
                            if (!datos[2][labels.length - 1]) { datos[2][labels.length - 1] = 0 }
                        }
                    } else if (item.tipo_area === "DUM") {
                        total += item.total
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
                setMedia(arrayAverageDates([total], payload?.initial_date, payload?.final_date, 0, groupByDay))
                setGroupDays(groupByDay)
                setTotal(total)

            } else {
                setLabels([])
                setDatos([])
                setTotal(0)
            }
        } catch {
            setLabels([])
            setDatos([])
            setTotal(0)
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'traffic': false }))
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
                <FiltersVehicles
                    setFilterOpen={setFilterOpen}
                    filterData={filterData}
                    autocompletes={autocompletes}
                    filterState={filterState} setFilterState={setFilterState}
                />
            }

            <StatsCard
                title={t('titles.areaAccess')}
                description={[(media || 0) + ' ' + t('terms.vehicles') + ' / ' + ( groupDays ? t('terms.day') : t('terms.hour'))]}
                descriptionIcon={[trafficIcon]}
                value={total?.toLocaleString(i18n.language) || 0}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}

            >
                {datos[0] &&
                    <BarChartV4
                        labels={labels}
                        datos={datos}
                        etiquetas={[t('values.ZAR'), t('values.ZBE'), t('values.DUM')]}
                        colors={['#E72584', '#AE6BCC', '#FFAB49']}

                        formatDateHour={!groupDays}
                        formatDate={groupDays}
                        ticksY={false}
                        categoryPercentage={0.8}
                        barPercentage={0.85}
                    />
                }

            </StatsCard>
        </>
    )
}