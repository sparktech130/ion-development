import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'
import countries from 'i18n-iso-countries'

//Components
import { HorizontalBarChart } from '../../../../../../components/Charts/HorizontalBarChart/HorizontalBarChart'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { FiltersVehicles } from './Filters/FiltersVehicles'

//Api
import { URL_OBTENER_RECONOCIMIENTOS_GROUP } from '../../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'


export const Nationality = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    autocompletes,
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { requestAPI, setIsLoading } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Graph
    const [labels, setLabels] = useState([])
    const [datos, setDatos] = useState([])
    const [titles, setTitles] = useState([])
    const [isFiltering, setIsFiltering] = useState(false)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        setLoadingsControl(prev => ({ ...(prev || {}), 'nationality': true }))
        try {

            let data = []
            let labels = []
            let datos = []
            let titles = []

            //params
            let params = {
                campos: { "campo2": "pais" },
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

                const sortedData = [...data].sort((a, b) => b.total - a.total);

                //dar formato datos
                sortedData.forEach(item => {
                    if (item?.pais) {
                        //Compruebo que sea un código correcto
                        const code3 = item.pais.toUpperCase(); //ESP
                        const code2 = countries.alpha3ToAlpha2(code3); //'ES'
                        const countryName = countries.getName(code2, i18n.language) //España
                        if(countryName){
                            labels.push(item?.pais?.toUpperCase())
                            datos.push(parseInt(item?.total) || 0)
                            titles.push(countryName)
                        }   
                    }
                });
                //asignar datos
                setLabels(labels)
                setDatos(datos)
                setTitles(titles)

            } else {
                setLabels([])
                setDatos([])
                setTitles([])
            }
        } catch {
            setLabels([])
            setDatos([])
            setTitles([])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'nationality': false }))
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
                title={t('params.nationality')}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
                type="horizontalChart"
            >
                <HorizontalBarChart
                    labels={labels}
                    datos={[datos]}
                    colors={["#FFAB49"]}
                    titles={titles}

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