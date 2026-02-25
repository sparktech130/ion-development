// Librerias
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { CSVLink } from "react-csv";
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement';
import { DetailModal } from '../../../../../components/DetailModal/DetailModal';
import { ConsultingGrid } from '../../../../../components/ConsultingGridImage/ConsultingGrid';
import { GridReport } from '../../../../../components/ConsultingGridImage/GridReport';
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';
import { Table } from '../../../../../components/Table/Table';
import { PdfDocumentTraffic } from '../../../../../components/Exports/PdfDocuments/PdfDocumentTraffic';

//URLS
import { URL_MARCAR_RECONOCIMIENTOS, URL_OBTENER_RECONOCIMIENTOS_PARAM } from '../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../context/MainDataContext';

//Utils
import { numberConversion, orientationConversion, colorConversion, vehicleConversion } from '../../../../../utils/conversions'
import { getAutocompleteDevices, getAutocompleteAreas } from '../../../../../api/services/autocomplete';
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../constants/common'

//Iconos
import filterIcon from '@icons/actions/filter.svg?react'
import updateIcon from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'
import watchlist from '@icons/actions/watchlist.svg?react'

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'

//Constantes
import { autocompleteColors, alerta_codes_mob } from '../../../../../constants/common'





export function MobilityConsulting() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { module, setInfoMessage, setIsLoading, requestAPI, autocompleteCountries, forceUpdateModule, selectedElement, setSelectedElement, url_origin } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [sortedData, setSortedData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(selectedElement ? true : false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Histórico
    const [historic, setHistoric] = useState({})

    //Reproducción del grid
    const [isPlaying, setIsPlaying] = useState(false)
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //Autocomplete data
    const [autocompleteAreas, setAutocompleteAreas] = useState([])
    const [autocompleteDevices, setAutocompleteDevices] = useState([])

    //valores por defecto
    const defaultInitialDate = useMemo(() => moment().subtract(1, 'month').format('YYYY-MM-DD'), [])
    const defaultFinalDate = useMemo(() => moment().format('YYYY-MM-DD'), [])

    //Export
    const csvRef = useRef();
    const exportOptions = useMemo(() => ([
        { cod: '1', name: 'PDF', onClick: () => handleSavePDF() },
        { cod: '2', name: 'CSV', onClick: () => csvRef.current?.link?.click() },
        //eslint-disable-next-line
    ]), [data, listStyle])


    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes() {

        //Inicialización llamadas
        const areasCall = getAutocompleteAreas()
        const devicesCall = getAutocompleteDevices({ modulos: ['0011'] })

        //Realizamos todas las llamadas a la vez
        const [areas, devices] = await Promise.all([areasCall, devicesCall]);

        //Asignamos los respectivos datos
        setAutocompleteAreas(areas)
        setAutocompleteDevices(devices)

    }


    //*---------------------------------FUNCIONES RECONOCIMIENTOS--------------------------------------*//

    //Obtiene los reconocimientos
    const getRecognitions = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: selectedElement?.matricula ?? payload?.license,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_dispositivo: payload?.device?.cod,
            cod_alerta_gest: payload?.alerts,
            pais: payload?.nacionality?.cod,
            confidence: payload?.confidence,
            orientacion: payload?.direction?.cod,
            velocidad_vehiculo: payload?.speed,
            tipo_vh: payload?.vehicle?.cod,
            cod_area: payload?.area?.cod,
            order: ["fecha DESC", "hora DESC"],
            modulos: [11],
            marcado: payload?.marcado
        }

        //Comprobamos si estamos filtrando o no y realizamos la llamada
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' && key !== 'order' && key !== 'modulos' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                value !== 'Fecha inválida' &&
                !(key === 'fecha_ini' && value === defaultInitialDate) &&
                !(key === 'fecha_fin' && value === defaultFinalDate)
            )
        )

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        const commonParams = { ...params } //Parametros comunes
        const requestParams = isFiltering //Parametros adicionales dependiendo de la llamdaa
            ? { ...commonParams, limit: 1000 }
            : { ...commonParams, fecha_ini: defaultInitialDate, fecha_fin: defaultFinalDate, limit: 200 }

        const data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_PARAM, requestParams);

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

    //Función para añadir a lista de interés
    const addToWatchlist = async () => {

        const data = await requestAPI(URL_MARCAR_RECONOCIMIENTOS, { cod_reconoc: currentData.cod_reconoc })
        if (data?.error) {
            setInfoMessage(t('errors.request'))
            return
        }

        //Actualizamos datos seleccionados
        setCurrentData(prevData => ({ ...prevData, marcado: !prevData.marcado }))

        //Actualizamos datos globales
        setSortedData(prevList => {
            const updatedList = prevList.map(item =>
                item.cod_reconoc === currentData.cod_reconoc
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
        setHistoric({})
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getRecognitions()
        setHistoric({ vehicle: selectedElement?.matricula })
        historic?.vehicle ?? setFilterState({})
        setSelectedElement(undefined)

        //eslint-disable-next-line
    }, [forceUpdateModule])

    //Llamada inicial para obtener los autocompletar
    useEffect(() => {
        getAutocompletes()

        return () => {
            setSelectedElement(undefined)
        }

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

    //--------------ONCLICK--------------------------------------------

    //Click reconocimiento
    const onClickReport = (item, index) => {
        setCurrentData(item);
        setIndex(index)
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
            { label: "ID", key: "cod_reconoc" },
            { label: t('params.date'), key: "fecha" },
            { label: t('params.time'), key: "hora" },
            { label: t('params.licensePlate'), key: "matricula" },
            { label: t('params.brand'), key: "marca" },
            { label: t('params.model'), key: "modelo" },
            { label: t('params.color'), key: "color" },
            { label: t('params.device'), key: "cod_dispositivo" },
            { label: t('params.nationality'), key: "pais" },
            { label: t('params.direction'), key: "orientacion" },
            { label: t('params.confidence'), key: "confidence" },
        ],
        filename: t('sections.INFORMES') + '.csv'
    };

    //descarga el pdf
    const handleSavePDF = async () => {
        try {
            const registros = data?.filter(x => x.checked)
            if (registros.length === 0) {
                if (listStyle) {
                    setInfoMessage(t('messages.noItemSelected'))
                } else {
                    setInfoMessage(t('messages.selectItemsOnList'))
                }
                return
            } else if (registros.length > 1000) {
                setInfoMessage(t('messages.limitExceeded'))
                return
            }
            setIsLoading(true)
            const blob = await pdf((<PdfDocumentTraffic data={registros} module={module} url_origin={url_origin} />)).toBlob();
            saveAs(blob, t('sections.INFORMES') + '.pdf');
            setIsLoading(false)
        } catch (e) {
            setIsLoading(false)
        }
    }


    return <>


        {/*Filtro*/}
        {filterOpen &&
            <FilterSection title={t('crud.filterElements', { elements: t('terms.recognitions') })} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getRecognitions} rows={6} columns={4} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitText={t('buttons.filter')} unequalRows submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" initialValue={defaultInitialDate} />
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" initialValue={historic?.vehicle} />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={autocompleteDevices} itemName='name' strictInput />
                <FilterSectionElement title={t('params.zone')} name="area" inputType="ITEMS" items={autocompleteAreas} itemName='name' strictInput />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={4} mobility />


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
                addToWatchlist={addToWatchlist}
                setIsOpen={() => { exitPlayer() }}
                consultingSection={'mobility-consulting-consults'}
                licensePlate={currentData?.matricula}
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
                <Box routes={[{ name: t('sections.REGISTRO_VEHICULOS') }]}>

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
                            primary_key={'cod_reconoc'}
                            headers={[
                                t('params.date'),
                                t('params.time'),
                                t('params.licensePlate'),
                                t('params.type'),
                                t('params.nationality'),
                                t('params.brand'),
                                t('params.model'),
                                t('params.color'),
                                t('params.device'),
                                t('params.direction'),
                                t('params.speed'),
                                t('params.confidence'),
                            ]}
                            columnStyles={['element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--medium', 'element--shortplus', 'element--shortplus', 'element--shortplus']}
                            row_elements={[
                                (item => `${moment(item?.fecha).format('L')}`),
                                'hora',
                                'matricula',
                                (item => `${t('values.' + vehicleConversion(item))}`),
                                (item => item?.pais.toUpperCase()),
                                'marca',
                                'modelo',
                                (item => t(colorConversion(item?.color))),
                                'nom_dispositivo',
                                (item => `${t('values.' + orientationConversion(item))}`),
                                'velocidad_vehiculo',
                                (item => `${Math.ceil(item?.confidence * 100)}%`)
                            ]}
                            sortElements={[
                                'fecha',
                                'hora',
                                'matricula',
                                'tipo_vh',
                                'pais',
                                'marca',
                                'modelo',
                                'color',
                                'nom_dispositivo',
                                'direction',
                                'velocidad_vehiculo',
                                'confidence'
                            ]}
                            sortAccesors={{
                                direction: (item => `${t('values.' + orientationConversion(item))}`),
                                color: (item => t(colorConversion(item?.color))),
                                confidence: (item => `${Math.ceil(item?.confidence * 100)}%`),
                            }}
                            setSortData={setSortedData}
                            hasCheckbox
                            isReport
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            setOpenReport={(item, index) => onClickReport(item, index)}
                            permissionType='consultas'
                            checkRedRowFunction={(item) => {
                                if (!item?.cod_alertagest) return false
                                let alerts = item?.cod_alertagest?.split(';') || []
                                const hasMobilityAlert = alerts?.some(alert => alerta_codes_mob?.includes(alert));
                                return hasMobilityAlert;
                            }}
                        />
                        :
                        <div className={consultingStyles['grid']}>
                            <ConsultingGrid data={sortedData}>
                                {(item, index) =>
                                    <GridReport
                                        key={`${item?.cod_reconoc}:${index}`}
                                        item={item}
                                        data={{
                                            index: index,
                                            code: item?.cod_reconoc,
                                            title: item?.matricula,
                                            subtitle: `${t('values.' + vehicleConversion(item))} ${item?.marca} ${item?.modelo} ${t(colorConversion(item?.color))}`,
                                            description: `${item?.nom_dispositivo} - ${t('values.' + orientationConversion(item))}`,
                                            alert: item?.cod_alertagest,
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