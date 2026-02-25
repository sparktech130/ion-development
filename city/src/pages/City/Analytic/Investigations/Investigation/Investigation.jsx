import consultingStyles from '../../../../../../styles/sections/Consulting.module.css'

// Librerias
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import moment from 'moment'
import { useTranslation } from 'react-i18next';

//Componentes
import { Box } from '../../../../../../components/Box/Box';
import { FilterSection } from '../../../../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../../../../components/FilterSection/FilterSectionElement';
import { DetailModal } from '../../../../../../components/DetailModal/DetailModal';
import { ConsultingGrid } from '../../../../../../components/ConsultingGridImage/ConsultingGrid';
import { GridReport } from '../../../../../../components/ConsultingGridImage/GridReport';
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'

//URLS
import { URL_OBTENER_RECONOCIMIENTOS_PARAM } from '../../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../../context/MainDataContext';

//Utils
import { numberConversion, colorConversion, vehicleConversion, orientationConversion } from '../../../../../../utils/conversions'
import { getAutocompleteDevices, getAutocompleteListas } from '../../../../../../api/services/autocomplete';
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../../constants/common'

//constants
import { autocompleteColors } from '../../../../../../constants/common';

//Icons
import filterIcon from '@icons/actions/filter.svg?react'


export function Investigation({
    investigation,
    setInvestigation
}) {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setInfoMessage, setIsLoading, filterTrafficAlert, setFilterTrafficAlert, requestAPI, autocompleteCountries } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(filterTrafficAlert ? true : false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Reproducción del grid
    const [isPlaying, setIsPlaying] = useState(false)
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    //Modales
    const [openVisualization, setOpenVisualization] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //Autocomplete data
    const [autocompleteLists, setAutocompleteLists] = useState([])
    const [autocompleteDevices, setAutocompleteDevices] = useState([])

    //valores por defecto
    const defaultInitialDate = useMemo(() => moment().subtract(1, 'month').format('YYYY-MM-DD'), [])
    const defaultFinalDate = useMemo(() => moment().format('YYYY-MM-DD'), [])


    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes() {

        //Inicialización llamadas
        const listsCall = getAutocompleteListas()
        const devicesCall = getAutocompleteDevices({ modulos: ['0015'] })

        //Realizamos todas las llamadas a la vez
        const [lists, devices] = await Promise.all([listsCall, devicesCall]);

        //Asignamos los respectivos datos
        setAutocompleteLists(lists)
        setAutocompleteDevices(devices)
    }


    //*---------------------------------FUNCIONES RECONOCIMIENTOS--------------------------------------*//

    //Obtiene los reconocimientos
    const getRecognitions = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: filterTrafficAlert ?? payload?.license,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_dispositivo: payload?.device?.cod,
            cod_alerta_gest: payload === 'reset' ? null : payload?.alerts,
            pais: payload?.nacionality?.cod,
            confidence: payload?.confidence,
            orientacion: payload?.direction?.cod,
            velocidad_vehiculo: payload?.speed,
            tipo_vh: payload?.vehicle?.cod,
            nombre_lista: payload?.list?.name,
            order: ["fecha DESC", "hora DESC"],
            modulos: [15]
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' && key !== 'order' && key !== 'modulos' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                value !== true &&
                value !== 'Fecha inválida' &&
                !(key === 'fecha_ini' && value === defaultInitialDate) &&
                !(key === 'fecha_fin' && value === defaultFinalDate)
            )
        );

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        //Params de la llamada adicionales
        const requestPayload = {
            ...params,
            limit: isFiltering ? 1000 : 200,
            ...(isFiltering ? {} : { fecha_ini: defaultInitialDate, fecha_fin: defaultFinalDate })
        }

        //Llamada API
        const data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_PARAM, requestPayload)


        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data?.rows || [])
        isFiltering ? setSubtitle(t('messages.resultsFilteredLast', { value: data?.rows?.length })) : setSubtitle(t('messages.resultsTotal', { value: data?.rows?.length, total: numberConversion(data?.total || '0') }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }


    //*--------------------------------------FUNCIONES GRID--------------------------------------------*//

    //Reproducción del grid
    const playGrid = () => {
        if (!isPlaying) {
            setIsPlaying(true)
            intervalRef.current = setInterval(() => {
                setIndex((prevIndex) => {
                    setCurrentData(data[prevIndex + 1])
                    return prevIndex + 1
                })
            }, 1500)
        } else {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
        }
    }

    //Salir del modal de reproducción
    const exitPlayer = () => {
        setCurrentData(undefined)
        setIsPlaying(false)
        clearInterval(intervalRef.current)
    }


    //*------------------------------------------FILTRO------------------------------------------------*//

    //Reseteamos todos los filtros
    const resetFilter = () => {
        setFilterState({})
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getAutocompletes()
        getRecognitions('reset')
        setFilterTrafficAlert(null)
        //eslint-disable-next-line
    }, [])

    //Si hacemos click en el Histórico del modal de Consultas, que nos recargue la página
    useEffect(() => {

        if (filterTrafficAlert !== null) {
            setOpenVisualization(false)
            getRecognitions()
            setFilterTrafficAlert(null)
        }
        //eslint-disable-next-line
    }, [filterTrafficAlert])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            resetFilter()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //Al cerrar el modal de visualización de datos, reseteamos la reproducción de datos
    useEffect(() => {

        if (!openVisualization) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
            setIndex(0)
        }
    }, [openVisualization])

    //Gestión del index de posición
    useEffect(() => {

        //Si el index es igual o superior al número total de registros, pararemos el isPlaying
        if (index >= data.length - 1) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
        }

        //Si el index cambia mientras no se está reproduciendo el listado, asignaremos el nuevo currentData
        !isPlaying && setCurrentData(data[index])

        //eslint-disable-next-line
    }, [index])



    return <>


        {/*Filtro*/}
        {filterOpen &&
            <FilterSection title={t('crud.filterElements', { elements: t('terms.recognitions') })} submitText={t('buttons.filter')} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getRecognitions} rows={6} columns={4} onChange={setFilterState} state={filterState} unequalRows customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" initialValue={defaultInitialDate} />
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={autocompleteDevices} itemName='name' strictInput />
                <FilterSectionElement title={t('params.list')} name="list" inputType="ITEMS" items={autocompleteLists} itemName='name' strictInput />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={4} traffic />


                {/*Columna 2*/}
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" initialValue={defaultFinalDate} />
                <FilterSectionElement title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" items={autocompleteTiposVehiculo} itemName='name' strictInput />
                <FilterSectionElement title={t('params.model')} name="model" inputType="text" />
                <FilterSectionElement title={t('params.direction')} name="direction" inputType="ITEMS" items={autocompleteDireccion} itemName='name' strictInput />
                <span />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                <FilterSectionElement title={t('params.nationality')} name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
                <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
                <FilterSectionElement title={t('params.speed')} name="speed" inputType="text" hint={t('hints.speed')} />
                <span />

                {/*Columna 4*/}
                <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />
                <span />
                <span />
                <FilterSectionElement title={t('params.confidence')} name="confidence" inputType="text" hint={t('hints.confidence')} />
                <span />


            </FilterSection>
        }

        {/* Modal de información y reproducción del registro */}
        {currentData &&
            <DetailModal
                currentData={currentData}
                setIsOpen={() => { exitPlayer() }}
                licensePlate={currentData?.matricula}
                isPlayable
                playGrid={playGrid}
                isPlaying={isPlaying}
                index={index}
                setIndex={setIndex}
                totalData={data.length}
                disableButtons
            />
        }

        {/*Página consultas de Traffic*/}
        <main className={consultingStyles['consulting']}>

            {/*Sección registros*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.INVESTIGACIONES'), action: () => setInvestigation(null) }, { name: investigation?.nombre_investigacion }]}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                    </div>
                    <div className={consultingStyles['grid']}>
                        <ConsultingGrid data={data}>
                            {(item, index) =>
                                <GridReport
                                    key={`${item?.cod_reconoc}:${index}`}
                                    item={item}
                                    data={{
                                        index: index,
                                        code: item.cod_reconoc,
                                        title: item.matricula,
                                        subtitle: `${t('values.' + vehicleConversion(item))} ${item?.marca} ${item?.modelo} ${t(colorConversion(item?.color))}`,
                                        description: `${item?.nom_dispositivo} - ${t('values.' + orientationConversion(item))}`,
                                        alert: item?.cod_alertagest
                                    }}
                                    onClick={() => { setCurrentData(item); setIndex(index) }}
                                />
                            }
                        </ConsultingGrid>
                    </div>
                </Box>
            </section>
        </main>
    </>
}