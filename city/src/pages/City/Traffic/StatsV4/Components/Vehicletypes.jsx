import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

//Components
import { HorizontalBarChart } from '../../../../../../components/Charts/HorizontalBarChart/HorizontalBarChart'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { FiltersVehicles } from './Filters/FiltersVehicles'

//Api
import { URL_OBTENER_RECONOCIMIENTOS_GROUP } from '../../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//utils
import { vehicleConversion } from '../../../../../../utils/conversions'


export const VehicleTypes = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    autocompletes,
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { requestAPI, setIsLoading } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Graph
    const [labels, setLabels] = useState([])
    const [datos, setDatos] = useState([])
    const [isFiltering, setIsFiltering] = useState(false)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        setLoadingsControl(prev => ({ ...(prev || {}), 'vehicleTypes': true }))
        try {

            let data = []
            let labels = []
            let datos = []

            //params
            let params = {
                campos: { "campo2": "tipo_vh" },
                modulos: [15],
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
            if (payload2?.list?.cod) params.cod_lista = payload2?.list?.cod

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'campos' && key !== 'order' && key !== 'modulos' && key !== 'dispositivos' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //llamar back
            data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)

            if (!data.error) {

                const sortedData = [...data].sort((a, b) => b.total - a.total);

                //dar formato datos
                sortedData.forEach(item => {
                    if (vehicleConversion(item)) {
                        labels.push(t('values.' + vehicleConversion(item)))
                        datos.push(parseInt(item.total) || 0)
                    }
                });
                //asignar datos
                setLabels(labels)
                setDatos(datos)

            } else {
                setLabels([])
                setDatos([])
            }
        } catch {
            setLabels([])
            setDatos([])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'vehicleTypes': false }))
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
                title={t('titles.vehicleTypes')}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
                type='horizontalChart'
          
            >
                <HorizontalBarChart
                    labels={labels}
                    datos={[datos]}
                    colors={["#E72584"]}

                    categoryPercentage={0.8}
                    barPercentage={0.7}
                    separation={27}
                    limitScroll={9}
                    labelsFontSize={12}

                />
            </StatsCard>
        </>
    )
}