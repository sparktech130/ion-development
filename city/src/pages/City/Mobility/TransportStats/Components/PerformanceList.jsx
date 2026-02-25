//Librerías
import { useState, useEffect, useContext } from "react"
import { useTranslation } from "react-i18next"

//Styles
import statsStyles from '@styles/sections/StatsIndustry.module.css'

//Assets
import arrow from "@icons/actions/arrow.svg?react"

//Components
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { BarChartV4 } from "@components/Charts/BarChart/BarChartV4"
import { AccesibleIcon } from "@components/AccesibleIcon/AccesibleIcon"

//Context
import MainDataContext from "@context/MainDataContext"

//Utils
import { isMore3Days } from '@utils/functions/stats'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'


export const PerformanceList = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    busStops,
    busStop,
    setLoadingsControl //objeto para controlar los loadings de cada card {'traffic':true, ...}
}) => {

    //*----------------------------------------VARIABLES-------------------------------------------------*//

    //Context
    const { setIsLoading } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Data
    //eslint-disable-next-line
    const [datos, setDatos] = useState([])
    //eslint-disable-next-line
    const [groupDays, setGroupDays] = useState(false)

    //Selecciones
    const [selectedBusStop, setSelectedbusStop] = useState(undefined)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


    //*--------------------------------------LLAMADAS API------------------------------------------------*//

    //Funcion que obtiene los datos de estadistica de las máquinas
    const getData = async () => {

        try {
            setLoadingsControl(prev => ({ ...(prev || {}), 'busStops': true }))
            //Parámetros de la función
            let groupByDay = isMore3Days(payload?.initial_date, payload?.final_date)
            let params = {
                group: groupByDay ? ["fecha"] : ["fecha", 'hora']
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //Endpoint
            //const url = preset === 24 ? URL_MAQUINAS_ESTADO_GROUP24 : URL_MAQUINAS_ESTADO_GROUP
            const data = [] //await requestAPI(url, params, `${url_origin}/ionindustry/`)

            //Asignamos datos
            setDatos(data);
            setGroupDays(groupByDay)

        } catch {
            setDatos([])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'busStops': false }))
            }, 300)
        }
    }


    //*-----------------------------------------UTILS---------------------------------------------------*//

    //Filtra datos
    const filterData = (p) => {
        setIsLoading(true)
        setPayload2(p)
    }


    //*---------------------------------------USE EFFECT------------------------------------------------*//

    //Actualiza datos
    useEffect(() => {
        if (!payload && busStops?.lenght > 0){
            setIsLoading(false)
        }else{
           getData()
        }
        // eslint-disable-next-line
    }, [payload, payload2, busStops, busStop])


    return (

        <>

            {/* Modal filtrar */}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('buttons.filter')} onSubmit={filterData} onReset={() => { setFilterState({}) }} rows={1} columns={1} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>
                    <FilterSectionElement title='test' name="test" inputType="text" />
                </FilterSection>
            }

            <div className={statsStyles['list']} style={{ height: 'calc(100vh - 137px)' }}>

                {busStops?.map((item, i) => (
                    <div key={i} className={statsStyles['compacted__chart']}>
                        <div className={statsStyles['compacted__header']}>
                            <h3>{item?.name}</h3>
                            <h4 style={{ marginLeft: 'auto' }}>{item?.nombre_linea}</h4>
                            <span />
                            <AccesibleIcon className={`${statsStyles['arrow']} ${selectedBusStop === item?.cod && statsStyles['arrow--dropped']}`} src={arrow} onClick={() => { setSelectedbusStop(selectedBusStop !== item?.cod ? item?.cod : undefined) }} />
                        </div>

                        {selectedBusStop === item?.cod &&
                            <>

                                <StatsCard title={t('params.busStops')} type='custom'>
                                    <div style={{ height: '150px' }}>
                                        <BarChartV4
                                            labels={[]}
                                            datos={[]}
                                            unidades={[` ${t('params.total').toLowerCase()}`]}
                                            colors={['#4CD984']}
                                            formatDateHour={true}
                                            categoryPercentage={0.65}
                                            barPercentage={1}
                                            gradient
                                            borderRadius={0}
                                            borderTopWidth={3}
                                        />
                                    </div>
                                </StatsCard>

                                <StatsCard title={t('params.boardingsAndAlightings')} type='custom'>
                                    <div style={{ height: '150px' }}>
                                        <BarChartV4
                                            labels={[]}
                                            datos={[]}
                                            unidades={[` ${t('params.boardings').toLowerCase()}`, ` ${t('params.alightings').toLowerCase()}`, ]}
                                            colors={['#AE6BCC', '#E72584']}
                                            formatDateHour={true}
                                            categoryPercentage={0.65}
                                            barPercentage={1}
                                            gradient
                                            borderRadius={0}
                                            borderTopWidth={3}
                                        />
                                    </div>
                                </StatsCard>

                            </>
                        }
                    </div>
                ))}

            </div>
        </>


    )
}