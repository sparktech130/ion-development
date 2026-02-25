// Librerias
import React, { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement'
import { ConsultingGrid } from '../../../components/ConsultingGridImage/ConsultingGrid'
import { CurrentServer } from './CurrentServer'
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'

//Utils
import { numberConversion } from '../../..//utils/conversions'
import { handleKey } from '../../../utils/functions/accessibility'

//API
import { URL_NODOS_OBTENER } from '@api/connections/urls'

//Context
import MainDataContext from '../../../context/MainDataContext'

//Icons
import update from '@icons/actions/update.svg?react'
import filter from "@icons/actions/filter.svg?react"

//Images
import server1000 from '../../../assets/images/servers/server-1000.png'
import server4000 from '../../../assets/images/servers/server-5000.png'

//Styles
import consultingStyles from '../../../styles/sections/Consulting.module.css'
import cardStyles from '../../../styles/card.module.css'


export function Servers() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de los servidores
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})


    //*-------------------------------------LLAMADAS API------------------------------------------------*//

    //Obtiene los servidores
    const getServers = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros
        const params = {
            nombre_servidor: payload?.name,
        }

        //Comprobamos si estamos filtrando
        let isFiltering = Object.entries(params).some(([key, value]) => (value !== null && value !== undefined && value !== ''))

        //Comprobar filtros activos / reset de filtros
        setDataFiltered(isFiltering)
        !isFiltering && handleReset()

        //Petición API
        const data = await requestAPI(URL_NODOS_OBTENER, { ...params })

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos
        if (data?.nodes) {
            setData(data.nodes)
            isFiltering
                ? setSubtitle(t('messages.resultsFilteredLast', { value: data?.nodes?.length }))
                : setSubtitle(t('messages.resultsTotal', { value: data?.nodes?.length, total: numberConversion(data?.nodes?.length || '0') }))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false) }, 300)
    }


    //*------------------------------------------FILTRO------------------------------------------------*//

    //limpia filtros
    const handleReset = () => {
        setFilterState({})
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los datos
    useEffect(() => {
        getServers()

        //eslint-disable-next-line
    }, [])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            handleReset()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    return (
        <>
            {/*Filtro*/}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.servers') })} onSubmit={getServers} onReset={handleReset} rows={1} unequalRows columns={1} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }}>
                    {/*Columna 1*/}
                    <FilterSectionElement title={t('params.name')} name="name" inputType="text" />
                </FilterSection>
            }
            {/* Servidor */}
            {currentData && <CurrentServer item={currentData} close={() => { setCurrentData(undefined) }} />}

            {/* servidores */}
            <main className={consultingStyles['registers']}>
                {!currentData &&
                    <Box routes={[{ name: t('sections.SERVIDORES') }]}>
                        <h2 className='subtitle'>{subtitle}</h2>

                        {/* Grid */}
                        <div className={consultingStyles['grid']}>
                            {/* Cabecera */}
                            <div className={consultingStyles['grid__header']}>
                                <ButtonComponent icon={filter} text={t('buttons.filter')} onClick={() => { setFilterOpen(true) }} permissionType='consultas' selected={dataFiltered} />
                                <ButtonComponent icon={update} text={t('buttons.update')} onClick={() => { getServers() }} />
                            </div>
                            <ConsultingGrid data={data} className={consultingStyles['grid__body--card']}>
                                {(item, index) =>
                                    <Card key={index} item={item} onClick={() => { setCurrentData(item) }} />
                                }
                            </ConsultingGrid>
                        </div>
                    </Box>
                }
            </main>
        </>
    )
}

/* Card */
export const Card = ({ item, onClick }) => {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Traducción
    const { t } = useTranslation()

    //Estado de los servidores
    const statusConversion = {
        warning: {
            'OK': { text: t('values.available'), color: '#4CD984' },
            'Warning': { text: t('values.warning'), color: '#FFAB49' },
            'Critical': { text: t('values.critical'), color: '#E93636' },
        },
        power: {
            'Disabled': { text: t('values.off'), color: '#E93636' },
            'Enabled': { text: t('values.on'), color: '#4CD984' },
        },
        prediction: {
            'Stable': { text: t('values.stable') },
            'High risk of degradation': { text: t('values.highRisk') },
            'Medium risk of degradation': { text: t('values.mediumRisk') },
        }
    }

    const image = {
        "ION-SI-2108HG1R": server1000
    }

    return (
        <div className={cardStyles['wrapper']} onClick={onClick} tabIndex={0} onKeyDown={(e) => handleKey(e, onClick)}>
            <div className={cardStyles['image__wrapper']}>
                <img src={image[item?.Model]} alt={item?.Model} />
            </div>
            <hr />
            <div className={cardStyles['section--column']}>
                <div className={cardStyles['second__line']}>
                    <h2>{`${item?.Name}`}</h2>
                    <span className={cardStyles['separator']} />
                    <p>{`${item?.Model}`}</p>
                </div>
                <p>{`${t('params.serialNumber')}: ${item?.SerialNumber}`}</p>
            </div>
            <hr />
            <div className={cardStyles['section--row']}>
                <div className={cardStyles['info']}>
                    <span style={{ backgroundColor: statusConversion['power'][item?.Status?.State]?.color }} />
                    <p>{statusConversion['power'][item?.Status?.State]?.text}</p>
                </div>
                <span className={cardStyles['separator']} />
                <div className={cardStyles['info']}>
                    <span style={{ backgroundColor: statusConversion['warning'][item?.Status?.Health]?.color }} />
                    <p>{statusConversion['warning'][item?.Status?.Health]?.text}</p>
                </div>
            </div>
            <hr />
            <div className={cardStyles['section--row']}>
                <div className={cardStyles['info']}>
                    <p className='bold' style={{ opacity: 1 }}>{item?.Status?.Prediction?.risk_score}</p>
                    <p>{t('titles.indexRisk').toLowerCase()}</p>
                </div>
                <span className={cardStyles['separator']} />
                <div className={cardStyles['info']}>
                    <p className='bold' style={{ opacity: 1 }}>{statusConversion['prediction'][item?.Status?.Prediction?.prediction]?.text}</p>
                    <p>{`(${item?.Status?.Prediction?.days} ${t('params.days').toLowerCase()})`}</p>
                </div>
            </div>
        </div>
    )
}