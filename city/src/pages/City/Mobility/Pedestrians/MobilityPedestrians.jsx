// Librerias
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { CSVLink } from "react-csv";

//Componentes
import { Box } from '@components/Box/Box'
import { FilterSection } from '@components/FilterSection/FilterSection';
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement';
import { ConsultingGrid } from '@components/ConsultingGridImage/ConsultingGrid';
import { PersonGridReport } from '@components/ConsultingGridImage/PersonGridReport'
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent';
import { Table } from '@components/Table/Table';
import { DetailModalFacial } from '@components/DetailModal/DetailModalFacial';

//URLS
import { URL_RECONOCIMIENTOS_PERSONAS_OBTENER } from '@api/connections/urls';

//Context
import MainDataContext from '@context/MainDataContext';

//Utils
import { numberConversion } from '@utils/conversions'
import { getAutocompleteDevices } from '@api/services/autocomplete'

//Iconos
import filterIcon from '@icons/actions/filter.svg?react'
import updateIcon from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'
import female from '@icons/analysis/fem.svg?react'
import male from '@icons/analysis/masc.svg?react'
import upper_body from '@icons/analysis/upper_body.svg?react'
import lower_body from '@icons/analysis/lower_body.svg?react'
import young from '@icons/analysis/young.svg?react'
import adult from '@icons/analysis/adult.svg?react'
import middle from '@icons/analysis/middle-age.svg?react'
import senior from '@icons/analysis/senior.svg?react'
import watchlist from '@icons/actions/watchlist.svg?react'

//Styles
import consultingStyles from '@styles/sections/Consulting.module.css'

//Constantes
import { autocompleteColors } from '@constants/common'
import { analysis_icons } from '@constants/icons';
import { colorConversion } from '@utils/conversions';
import { URL_MARCAR_RECONOCIMIENTOS_PERSONAS } from '../../../../../api/connections/urls';


export function MobilityPedestrians() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setInfoMessage, setIsLoading, requestAPI, forceUpdateModule } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [sortedData, setSortedData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Reproducción del grid
    const [isPlaying, setIsPlaying] = useState(false)
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //Autocomplete data
    const [autocompleteDevices, setAutocompleteDevices] = useState([])

    //valores por defecto
    const defaultInitialDate = useMemo(() => moment().subtract(1, 'month').format('YYYY-MM-DD'), [])
    const defaultFinalDate = useMemo(() => moment().format('YYYY-MM-DD'), [])

    //Export
    const csvRef = useRef();
    const exportOptions = useMemo(() => ([
        { cod: '1', name: 'CSV', onClick: () => csvRef.current?.link?.click() },

        //eslint-disable-next-line
    ]), [data, listStyle])


    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes() {

        //Inicialización llamadas
        const devicesCall = getAutocompleteDevices({ modulos: ['0011'] })

        //Realizamos todas las llamadas a la vez
        const [devices] = await Promise.all([devicesCall]);

        //Asignamos los respectivos datos
        setAutocompleteDevices(devices)

    }


    //*---------------------------------FUNCIONES RECONOCIMIENTOS--------------------------------------*//

    //Obtiene los reconocimientos
    const getRecognitions = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            refTrackingId: payload?.id,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_dispositivo: payload?.device?.cod,
            genero: payload?.gender,
            edad: payload?.age,
            ropa_superior: payload?.upper_clothing,
            ropa_inferior: payload?.lower_clothing,
            marcado: payload?.marcado,

            ...(payload?.keys?.length
                ? Object.fromEntries(payload.keys.map(i => [i, true]))
                : {})
        }

        //Comprobamos si estamos filtrando o no y realizamos la llamada
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' &&
            key !== 'order' &&
            key !== 'modulos' &&
            value !== null &&
            value !== undefined &&
            value !== '' &&
            value.length !== 0 &&
            value !== 'Fecha inválida' &&
            !(key === 'fecha_ini' && value === defaultInitialDate) &&
            !(key === 'fecha_fin' && value === defaultFinalDate)
        );

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        const commonParams = { ...params } //Parametros comunes
        const requestParams = isFiltering //Parametros adicionales dependiendo de la llamdaa
            ? { ...commonParams, limit: 1000 }
            : { ...commonParams, fecha_ini: defaultInitialDate, fecha_fin: defaultFinalDate, limit: 200 }

        const data = await requestAPI(URL_RECONOCIMIENTOS_PERSONAS_OBTENER, requestParams);

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data?.rows || [])
        setSortedData(data?.rows || [])

        isFiltering
            ? setSubtitle(t('messages.resultsFilteredLast', { value: data?.rows?.length }))
            : setSubtitle(t('messages.resultsTotal', { value: data?.rows?.length, total: numberConversion(data?.total || '0') }))



        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false) }, 500)
    }

    //Click reconocimiento
    const onClickReport = (item, index) => {
        setCurrentData(item);
        setIndex(index)
    }

    //Función para añadir a lista de interés
    const addToWatchlist = async () => {

        const data = await requestAPI(URL_MARCAR_RECONOCIMIENTOS_PERSONAS, { refTrackingId: currentData.refTrackingId })
        if (data?.error) {
            setInfoMessage(t('errors.request'))
            return
        }

        //Actualizamos datos seleccionados
        setCurrentData(prevData => ({ ...prevData, marcado: !prevData.marcado }))

        //Actualizamos datos globales
        setSortedData(prevList => {
            const updatedList = prevList.map(item =>
                item.refTrackingId === currentData.refTrackingId
                    ? { ...item, marcado: !item.marcado }
                    : item
            )

            return updatedList
        })
    }

    //*--------------------------------------FUNCIONES GRID--------------------------------------------*//

    //Reproducción del grid
    const playGrid = () => {
        if (!isPlaying) {
            setIsPlaying(true)
            intervalRef.current = setInterval(() => {
                setIndex((prevIndex) => {
                    setCurrentData(sortedData[prevIndex + 1])
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
    


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data.filter(x => x.checked)
        if (registros.length === 0) {
            if (listStyle) {
                setInfoMessage(t('messages.noItemSelected'))
            } else {
                setInfoMessage(t('messages.selectItemsOnList'))
            }
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: data.filter(value => value.checked === true),
        headers: [
            { label: "ID", key: "refTrackingId" },
            { label: t('params.date'), key: "fecha_hora" },
            { label: t('params.device'), key: "nom_dispositivo" },
            { label: t('params.gender'), key: "genero" },
            { label: t('params.age'), key: "edad" },
            { label: t('params.upper_clothing'), key: "ropa_superior" },
            { label: t('params.lower_clothing'), key: "ropa_inferior" },
            { label: t('params.telefono'), key: "telefono" },
            { label: t('params.gafas'), key: "gafas" },
            { label: t('params.carga_bolsa'), key: "carga_bolsa" },
            { label: t('params.asistido'), key: "asistido" },
            { label: t('params.fumando'), key: "fumando" },
            { label: t('params.tatuado'), key: "tatuado" },
            { label: t('params.cara_tapada'), key: "cara_tapada" },
        ],
        filename: t('sections.REGISTRO_PERSONAS') + '.csv'
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getRecognitions()

        //eslint-disable-next-line
    }, [forceUpdateModule])

    //Llamada inicial para obtener los autocompletar
    useEffect(() => {
        getAutocompletes()

        //eslint-disable-next-line
    }, [])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            resetFilter()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //Gestión del index de posición
    useEffect(() => {

        //Si el index es igual o superior al número total de registros, pararemos el isPlaying
        if (index >= sortedData.length - 1) {
            setIsPlaying(false)
            clearInterval(intervalRef.current)
        }

        //Si el index cambia mientras no se está reproduciendo el listado, asignaremos el nuevo currentData
        !isPlaying && setCurrentData(sortedData[index])

        //eslint-disable-next-line
    }, [index])

    //Características de conducta de los peatones
    const pedestrian_keys = useMemo(() => {
        return Object.entries(analysis_icons).map(([key, value]) => (
            { code: key, text: t(`params.${key}`), icon: value }
        ))
        //eslint-disable-next-line
    }, [])

    //Género de los peatones
    const pedestrian_gender = useMemo(() => {
        return ([
            { code: 'male', text: t(`values.male`), icon: male },
            { code: 'female', text: t(`values.female`), icon: female }
        ])
        //eslint-disable-next-line
    }, [])

    //Género de los peatones
    const pedestrian_age = useMemo(() => {
        return ([
            { code: 'young', text: t(`values.young`), icon: young },
            { code: 'adult', text: t(`values.adult`), icon: adult },
            { code: 'middle', text: t(`values.middle`), icon: middle },
            { code: 'senior', text: t(`values.senior`), icon: senior },
        ])
        //eslint-disable-next-line
    }, [])

    //Colores ropa superior peatones
    const pedestrian_upper_colors = useMemo(() => {
        return autocompleteColors.map((e) => ({ code: e.cod, text: t(e.nameCode), icon: upper_body, customColor: e?.hex }))
        //eslint-disable-next-line
    }, [])

    //Colores ropa inferior peatones
    const pedestrian_lower_colors = useMemo(() => {
        return autocompleteColors.map((e) => ({ code: e.cod, text: t(e.nameCode), icon: lower_body, customColor: e?.hex }))
        //eslint-disable-next-line
    }, [])


    return <>


        {/*Filtro*/}
        {filterOpen &&
            <FilterSection title={t('crud.filterElements', { elements: t('terms.recognitions') })} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getRecognitions} rows={8} columns={4} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitText={t('buttons.filter')} unequalRows submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={'ID'} name="id" inputType="text" width={4} />
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" initialValue={defaultInitialDate} />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={autocompleteDevices} itemName='name' width={4} strictInput />
                <FilterSectionElement title={t('params.gender')} name="gender" inputType="ICONS" width={4} customIcons={pedestrian_gender} disableSelectAll />
                <FilterSectionElement title={t('params.age')} name="age" inputType="ICONS" width={4} customIcons={pedestrian_age} disableSelectAll />
                <FilterSectionElement title={t('params.upper_clothing')} name="upper_clothing" inputType="ICONS" width={4} customIcons={pedestrian_upper_colors} disableSelectAll />
                <FilterSectionElement title={t('params.lower_clothing')} name="lower_clothing" inputType="ICONS" width={4} customIcons={pedestrian_lower_colors} disableSelectAll />
                <FilterSectionElement title={t('params.pedestrian_keys')} name="keys" inputType="ICONS" width={4} customIcons={pedestrian_keys} disableSelectAll />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" initialValue={defaultFinalDate} />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />

                {/*Columna 4*/}
                <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />

            </FilterSection>
        }

        {/* Modal de información y reproducción del registro */}
        {currentData &&
            <DetailModalFacial
                currentData={currentData}
                addToWatchlist={addToWatchlist}
                setIsOpen={() => { exitPlayer() }}
                isPlayable
                playGrid={playGrid}
                isPlaying={isPlaying}
                index={index}
                setIndex={setIndex}
                totalData={sortedData.length}
            />
        }

        {/*Página consultas de Mobility*/}
        <main className={consultingStyles['consulting']}>

            {/*Sección registros*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.REGISTRO_PERSONAS') }]}>

                    <h2 className='subtitle'>{subtitle}</h2>

                    {/* Botones */}
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={() => setFilterOpen(true)} permissionType='consultas' selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={updateIcon} onClick={getRecognitions} />
                        <ButtonComponent text={t('buttons.watchlist')} icon={watchlist} onClick={() => { getRecognitions({ marcado: true }) }} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" options={exportOptions} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                        <ButtonComponent icon={grid} accesibleText={t('buttons.grid')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(false)} selected={!listStyle} right />
                        <ButtonComponent icon={list} accesibleText={t('params.list')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(true)} selected={listStyle} />
                    </div>

                    {/* Datos */}
                    {listStyle ?
                        <Table
                            results={data}
                            className={consultingStyles['table__content']}
                            setData={setData}
                            rows={50}
                            primary_key={'refTrackingId'}
                            headers={[
                                t('params.date'),
                                t('params.time'),
                                t('params.device'),
                                t('params.gender'),
                                t('params.age'),
                                t('params.upper_clothing'),
                                t('params.lower_clothing'),
                                t('params.telefono'),
                                t('params.gafas'),
                                t('params.carga_bolsa'),
                                t('params.asistido'),
                                t('params.fumando'),
                                t('params.tatuado'),
                                t('params.cara_tapada'),
                            ]}
                            columnStyles={['element--shortplus', 'element--shortplus', 'element--medium', 'element--shortplus', 'element--shortplus', 'element--short', 'element--short', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus']}
                            row_elements={[
                                (item => `${moment(item?.fecha_hora).format('L')}`),
                                (item => `${moment(item?.fecha_hora).format('HH:mm:ss')}`),
                                'nom_dispositivo',
                                (item => t(`values.${item?.genero}`)),
                                (item => t(`values.${item?.edad}`)),
                                (item => item?.ropa_superior?.map(color => t(colorConversion(color))).join('-') || '-'),
                                (item => item?.ropa_inferior?.map(color => t(colorConversion(color))).join('-') || '-'),
                                (item => item?.telefono ? '✓' : 'X'),
                                (item => item?.gafas ? '✓' : 'X'),
                                (item => item?.carga_bolsa ? '✓' : 'X'),
                                (item => item?.asistido ? '✓' : 'X'),
                                (item => item?.fumando ? '✓' : 'X'),
                                (item => item?.tatuado ? '✓' : 'X'),
                                (item => item?.cara_tapada ? '✓' : 'X'),
                            ]}
                            sortElements={[
                                'fecha',
                                'hora',
                                'nom_dispositivo',
                                'gender',
                                'age',
                                'upper_clothing',
                                'lower_clothing',
                                'telefono',
                                'gafas',
                                'carga_bolsa',
                                'asistido',
                                'fumando',
                                'tatuado',
                                'cara_tapada',
                            ]}
                            sortAccesors={{
                                fecha: item => `${moment(item?.fecha_hora).format('L')}`,
                                hora: item => `${moment(item?.fecha_hora).format('HH:mm:ss')}`,
                                gender: item => t(`values.${item?.genero}`),
                                age: item => t(`values.${item?.edad}`),
                                upper_clothing: item => item?.ropa_superior?.map(color => t(colorConversion(color))).join('-') || [],
                                lower_clothing: item => item?.ropa_inferior?.map(color => t(colorConversion(color))).join('-') || [],
                            }}
                            setSortData={setSortedData}
                            hasCheckbox
                            isReport
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            setOpenReport={(item, index) => onClickReport(item, index)}
                            permissionType='consultas'
                        />
                        :
                        <div className={consultingStyles['grid']}>
                            <ConsultingGrid data={sortedData}>
                                {(item, index) =>
                                    <PersonGridReport
                                        key={`${item?.refTrackingId}:${index}`}
                                        item={item}
                                        data={{
                                            index: index,
                                            code: item?.refTrackingId,
                                            title: `${t(`values.${item?.genero}`)}`,
                                            subtitle: `${t(`values.${item?.edad}`)}`,
                                            description: `${item?.nom_dispositivo}`,

                                        }}
                                        onClick={() => onClickReport(item, index)}
                                    />
                                }
                            </ConsultingGrid>
                        </div>
                    }

                </Box>
            </section>
        </main>
    </>
}