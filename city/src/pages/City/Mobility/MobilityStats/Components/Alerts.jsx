//Librerías
import { useState, useEffect, useContext } from "react"
import { useTranslation } from "react-i18next"
import moment from "moment"

//Styles
import statsStyles from '@styles/sections/StatsIndustry.module.css'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { BarChartV4 } from "@components/Charts/BarChart/BarChartV4"
import { FiltersVehicles } from "./Filters/FiltersVehicles"
import { VisualizationElement } from "../../../../../../components/VisualizationElement/VisualizationElement"

//Context
import MainDataContext from "@context/MainDataContext"

//Utils
import { isMore3Days, arrayAverageDates, arrayTotal } from '@utils/functions/stats'

//Urls
import { URL_OBTENER_ALERTAS_GROUP } from "../../../../../../api/connections/urls"

//Icons
import warningIcon from '@icons/alerts/warning.svg?react'

//Constants
import { alerta_codes_mob } from "../../../../../../constants/common"
import { cityAlertsIcons } from "../../../../../../constants/icons"
import { checkArray } from "../../../../../../utils/functions/functions"



export const Alerts = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device,
    autocompletes,
    order, //'ASC', 'DESC'
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //*----------------------------------------VARIABLES-------------------------------------------------*//

    //Context
    const { requestAPI, setIsLoading } = useContext(MainDataContext)
    const { t, i18n } = useTranslation()

    //Data
    //eslint-disable-next-line
    const [datos, setDatos] = useState([])
    const [labels, setLabels] = useState([])
    const [media, setMedia] = useState(0)
    const [total, setTotal] = useState(0)
    const [groupDays, setGroupDays] = useState(false)
    const [alertsList, setAlertsList] = useState([])

    //Filter
    const [isFiltering, setIsFiltering] = useState(false)
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


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
            if (payload2?.list?.cod) params.cod_lista = payload2?.list?.cod
            if (payload2?.alerts) params.alertas = payload2?.alerts

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'campos' && key !== 'order' && key !== 'modulos' && key !== 'dispositivos' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //Datos
            data = await requestAPI(URL_OBTENER_ALERTAS_GROUP, params, 'city')

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

    //Funcion que obtiene los datos lista alertas
    const getTypeData = async () => {

        setLoadingsControl(prev => ({ ...(prev || {}), 'alertsType': true }))

        try {

            let data = []
            let datos = alerta_codes_mob?.map(item=>({code: item}))
            
            //params
            let params = {
                campos: ["cod_alertagest"],
                order: ['total DESC'],
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
            if (payload2?.list?.cod) params.cod_lista = payload2?.list?.cod

            //Datos
            data = await requestAPI(URL_OBTENER_ALERTAS_GROUP, params, 'city')

            if (!data.error && Array.isArray(data)) {
                
                //dar formato datos
                data.forEach(item => {
                    if(item.cod_alertagest){
                        const index = datos.findIndex(d => d.code === item.cod_alertagest);
                        if (index !== -1) {
                            datos[index].total = item.total;
                        }
                    }
                });

                //Orden
                let orderedData = orderData(datos)

                //Asignamos datos
                setAlertsList(orderedData);
            }else{
                setAlertsList(datos);
            }

        } catch {
            setAlertsList([]);
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'alertsType': false }))
            }, 300)
        }
    }


    //*-----------------------------------------UTILS---------------------------------------------------*//

    //Filtra datos
    const filterData = (p) => {
        setIsLoading(true)
        setPayload2(p)
    }

    //Ordenar datos
    const orderData = (datos) => {
        if(checkArray(datos)){
            return [...datos].sort((a, b) => 
                order === 'ASC'
                    ? (a.total || 0) - (b.total || 0)
                    : (b.total || 0) - (a.total || 0)
            );
        }else{
            return []
        }
    };


    //*---------------------------------------USE EFFECT------------------------------------------------*//

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()
        getTypeData()

        // eslint-disable-next-line
    }, [payload, device, payload2])

    //Actualiza orden
    useEffect(()=>{
        if(checkArray(alertsList)){
            let orderedData = orderData(alertsList)
            setAlertsList(orderedData)
        }
    //eslint-disable-next-line
    },[order])


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

            <div className={statsStyles['list']} style={{ height: 'calc(100vh - 140px)' }}>

                <div className={statsStyles['graph100']}>
                    <StatsCard
                        title={t('sections.ALERTAS')}
                        description={[media + ' ' + t('terms.alerts') + ' / ' + (groupDays ? t('terms.day') : t('terms.hour'))]}
                        descriptionIcon={[warningIcon]}
                        value={total?.toLocaleString(i18n.language) || 0}
                        //onFilter={() => setFilterOpen(true)} //No tiene filtros la función. Pedidos a back
                        activeFilter={isFiltering}
                    >
                        <BarChartV4
                            labels={labels}
                            datos={[datos]}
                            colors={['#E93636']}
                            unidades={[' ' + t('terms.alerts')]}
                            formatDateHour={!groupDays}
                            formatDate={groupDays}
                            categoryPercentage={0.8}
                            barPercentage={0.85}
                        />
                    </StatsCard>
                </div>

                {alertsList?.map(item=>(
                    <VisualizationElement
                        key={item.code}
                        iconStyle={{color: '#E93636', height: '20px', width: '20px'}}
                        titleStyle={statsStyles['alert__title']}
                        textStyle={statsStyles['alert__text']}
                        titleIcon={cityAlertsIcons[item.code]}
                        title={t('codes.cityAlerts.'+item.code)}
                        text={item.total || 0}
                    />
                ))}
            
            </div>
        </>


    )
}