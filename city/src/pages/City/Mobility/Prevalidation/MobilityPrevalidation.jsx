// Librerias
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next';
import moment from 'moment';
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
import { URL_OBTENER_PREVALIDACION_ALERTAS, URL_VALIDAR_ALERTA, URL_MODIFICAR_ALERTAS } from '../../../../../api/connections/urls'; //URL_VALIDAR_DGT

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Constantes
import { autocompleteColors, url_path } from '../../../../../constants/common'

//Utils
import { colorConversion, vehicleConversion } from '../../../../../utils/conversions'
import { getAutocompleteDevices, getAutocompleteAreas } from '../../../../../api/services/autocomplete';
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../constants/common'
import { checkArray } from '../../../../../utils/functions/functions';

//Iconos
import update from '../../../../../assets/icons/actions/update.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'


export function MobilityPrevalidation() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { module, url_origin, forceUpdateModule, setInfoMessage, setIsLoading, filterTrafficAlert, setFilterTrafficAlert, filterAlertCode, setFilterAlertCode, requestAPI, autocompleteCountries } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [sortedData, setSortedData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(filterTrafficAlert ? true : false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Reproducción del listado
    const [isPlaying, setIsPlaying] = useState(false)
    const [index, setIndex] = useState(0);
    const intervalRef = useRef(null);

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [correctionOpen, setCorrectionOpen] = useState(false)

    //Elementos filtrar
    const [filterState, setFilterState] = useState(filterTrafficAlert ? { alerts: filterTrafficAlert } : {})
    const [correctionState, setCorrectionState] = useState({})

    //Autocomplete data
    const [autocompleteAreas, setAutocompleteAreas] = useState([])
    const [autocompleteDevices, setAutocompleteDevices] = useState([])

    //Export
    const csvRef = useRef();
    const exportOptions = useMemo(() => ([
        { cod: '1', name: 'PDF', onClick: () => handleSavePDF() },
        { cod: '2', name: 'CSV', onClick: () => csvRef.current?.link?.click() },
        //eslint-disable-next-line
    ]), [data, listStyle])


    //*---------------------------------FUNCIONES PREVALIDACIÓN----------------------------------------*//

    //Filtra los reconocimientos
    const getPrevalidations = async (payload) => {

        //Reconocimientos que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_alerta: filterAlertCode,
            matricula: filterTrafficAlert ?? payload?.license,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_time,
            hora_fin: payload?.final_time,
            cod_dispositivo: payload?.device?.cod,
            alertas: payload === 'reset' ? null : payload?.alerts,
            pais: payload?.nacionality?.cod,
            confidence: payload?.confidence,
            orientacion: payload?.direction?.cod,
            velocidad_vehiculo: payload?.speed,
            tipo_vh: payload?.vehicle?.cod,
            cod_area: payload?.area?.cod,
            modulos: [11]
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' && key !== 'order' && key !== 'modulos' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0
            )
        );

        !isFiltering && resetFilter()
        setDataFiltered(isFiltering)

        //Llamada para obtener los resultados
        data = await requestAPI(URL_OBTENER_PREVALIDACION_ALERTAS, params, 'city')

        if (checkArray(data)) {
            // Añadir traducción para el CSV
            data = data?.map(item => ({
                ...item,
                traduccion__alerta: item?.cod_alertagest
                    ? t('codes.cityAlerts.' + item.cod_alertagest)
                    : '',
            }));
        }

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        setSortedData(data)
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: data?.length })) : setSubtitle(t('messages.resultsLast', { value: data?.length }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Gestiona el estado de la alerta
    const handlePrevalidation = async (id, status, reason) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Ocultamos modal informativo de los reconocimientos
        setCurrentData(undefined)

        //Parametros que pasaremos a la función.
        const params = {
            cod_alerta: id,
            motivo: reason,
            estat: status,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_VALIDAR_ALERTA, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Obtenemos las prevalidaciones de nuevo
        getPrevalidations('reset')

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            status === 'r' ? setInfoMessage(t('messages.rejectedSuccess')) : setInfoMessage(t('messages.validatedSuccess'))
        }, 500);
    }

    //Gestiona el estado de la alerta
    const editPrevalidation = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_alerta: currentData?.cod_alerta,
            matricula: payload?.license ?? currentData.matricula,
            tipo_vh: payload?.vehicle?.cod ?? currentData?.tipo_vh,
            marca: payload?.brand ?? currentData?.marca,
            modelo: payload?.model ?? currentData?.modelo,
            color: payload?.color?.cod ?? currentData?.color,
            pais: payload?.nacionality?.cod ?? currentData?.pais,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_MODIFICAR_ALERTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Obtenemos las prevalidaciones
        getPrevalidations('reset')

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementEdited'))
        }, 500);
    }

    /*
    const checkValidation = async () => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parámetros de la función
        const params = {
            matricula: currentData?.matricula
        }

        //Función para comprobar si la matrícula tiene más infracciones
        let data = await requestAPI(URL_VALIDAR_DGT, params)


        //Si la llamada devuelve true, es que hay nuevas infracciones y se actualiza la lista
        if (data === true) {
            setModalText('Se ha añadido una nueva alerta') //traducir!!!!!!!!!!!!!!!!
            getPrevalidations('reset')
        } else {
            setModalText('No se ha encontrado ninguna infracción adicional') //traducir!!!!!!!!!!!!!!!!
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoModal(true)
        }, 500);

    }
    */

    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Obtener autocompletar
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


    //*--------------------------------------FUNCIONES LISTADO-----------------------------------------*//

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
        setCorrectionState({})
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos

    useEffect(() => {
        getPrevalidations('reset')
        setFilterTrafficAlert(null)
        setFilterAlertCode(null)
        //eslint-disable-next-line
    }, [forceUpdateModule])

    //Obtiene los autocompletar
    useEffect(() => {
        getAutocompletes()
        //eslint-disable-next-line
    }, [])

    //Actualizamos el detailModal si hemos modificado una prevalidación
    useEffect(() => {
        currentData !== undefined && setCurrentData(data.filter(id => id?.cod_alerta === currentData.cod_alerta)[0])
        //eslint-disable-next-line
    }, [data])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            resetFilter()
        }
        //eslint-disable-next-line
    }, [filterOpen, correctionOpen])

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

    //--------------------------------ONCLICK------------------------------------

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
            { label: t('params.alert'), key: "traduccion__alerta" },
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
            <FilterSection title={t('crud.filterElements', { elements: t('terms.alerts') })} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getPrevalidations} rows={6} columns={4} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitText={t('buttons.filter')} unequalRows submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={autocompleteDevices} itemName='name' strictInput />
                <FilterSectionElement title={t('params.zone')} name="area" inputType="ITEMS" items={autocompleteAreas} itemName='name' strictInput />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={4} mobility />


                {/*Columna 2*/}
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                <FilterSectionElement title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" items={autocompleteTiposVehiculo} itemName='name' strictInput />
                <FilterSectionElement title={t('params.model')} name="model" inputType="text" />
                <FilterSectionElement title={t('params.direction')} name="direction" inputType="ITEMS" items={autocompleteDireccion} itemName='name' strictInput />
                <span />


                {/*Columna 3*/}
                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                <FilterSectionElement title={t('params.nationality')} name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
                <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
                <FilterSectionElement title={t('params.speed')} name="speed" inputType="number" hint={t('hints.speed')} />
                <span />


                {/*Columna 4*/}
                {/*Columna 4*/}
                <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />
                <span />
                <span />
                <FilterSectionElement title={t('params.confidence')} name="confidence" inputType="text" hint={t('hints.confidence')} />
                <span />

            </FilterSection>
        }

        {/*Modal corrección*/}
        {correctionOpen &&
            <FilterSection title={t('crud.editElement', { element: t('terms.alert') })} setIsOpen={setCorrectionOpen} onReset={() => resetFilter()} onSubmit={editPrevalidation} rows={3} columns={3} unequalRows onChange={setCorrectionState} state={correctionState} submitText={t('buttons.edit')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" initialValue={currentData?.matricula} required />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" initialValue={currentData?.marca} required />

                <FilterSectionElement title={t('titles.vehicleCapture')} width={3}>
                    <div className={consultingStyles['correction__images']}>
                        <img src={currentData?.foto ? url_origin + url_path + '/fotos/' + currentData?.foto : ''} alt="" />
                        <img className={consultingStyles['correction_plate']} src={currentData?.fotop ? url_origin + url_path + '/fotos/' + currentData?.fotop : ''} alt="" />
                    </div>
                </FilterSectionElement>


                {/*Columna 2*/}
                <FilterSectionElement strictInput title={t('params.nationality')} name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} defaultItem={currentData?.pais} required />
                <FilterSectionElement title={t('params.model')} name='model' inputType="text" initialValue={currentData?.modelo} required />

                {/*Columna 3*/}
                <FilterSectionElement strictInput title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" items={autocompleteTiposVehiculo} itemName='name' defaultItem={currentData?.tipo_vh} required />
                <FilterSectionElement strictInput title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' defaultItem={currentData?.color} required />


            </FilterSection>
        }

        {/* Abrir la previsualización del registro */}
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
                totalData={sortedData.length}
                isPrevalidation
                editPrevalidation={setCorrectionOpen}
                handlePrevalidation={handlePrevalidation}
            />
        }


        {/*Página Prevalidación de Mobility*/}
        <main className={consultingStyles['consulting']}>

            {/*Sección registros*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.PREVALIDACION') }]}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={update} onClick={() => { getPrevalidations('reset') }} />
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
                            primary_key={'cod_alerta'}
                            headers={[
                                t('params.date'),
                                t('params.time'),
                                t('params.licensePlate'),
                                t('params.device'),
                                t('params.alert'),
                                t('params.confidence'),
                            ]}
                            columnStyles={['element--short', 'element--short', 'element--short', 'element--medium', 'element--long', 'element--short']}
                            row_elements={[
                                (item => `${moment(item?.fecha).format('L')}`),
                                'hora',
                                'matricula',
                                'nom_dispositivo',
                                'traduccion__alerta',
                                (item => `${Math.ceil(item?.confidence * 100)} %`)
                            ]}
                            sortElements={[
                                'fecha',
                                'hora',
                                'matricula',
                                'nom_dispositivo',
                                'traduccion__alerta',
                                'confidence'
                            ]}
                            sortAccesors={{
                                confidence: (item => `${Math.ceil(item?.confidence * 100)} %`),
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
                            <ConsultingGrid data={data}>
                                {(item, index) =>
                                    <GridReport
                                        key={`${item?.cod_reconoc}:${index}`}
                                        item={item}
                                        data={{
                                            index: index,
                                            code: item.cod_reconoc,
                                            title: item.matricula,
                                            subtitle: `${t('values.' + vehicleConversion(item))} ${item?.marca || ''} ${item?.modelo || ''} ${t(colorConversion(item?.color))}`,
                                            description: `${t('codes.cityAlerts.' + item.cod_alertagest)}`,
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