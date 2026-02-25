// Librerias
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment';
import { CSVLink } from "react-csv";
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { DetailModal } from '../../../../../components/DetailModal/DetailModal'
import { ConsultingGrid } from '../../../../../components/ConsultingGridImage/ConsultingGrid'
import { GridReport } from '../../../../../components/ConsultingGridImage/GridReport'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';
import { Table } from '../../../../../components/Table/Table';
import { PdfDocumentTraffic } from '../../../../../components/Exports/PdfDocuments/PdfDocumentTraffic';

//URLS
import { URL_OBTENER_INFRACCIONES } from '../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Utils
import { numberConversion, colorConversion, vehicleConversion, statusConversion } from '../../../../../utils/conversions'
import { getAutocompleteDevices, getAutocompleteListas, getAutocompleteAreas } from '../../../../../api/services/autocomplete';
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../constants/common'

//Iconos
import filterIcon from '@icons/actions/filter.svg?react'
import updateIcon from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'

//constants
import { autocompleteColors } from '../../../../../constants/common'




export function InfringementConsulting() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { module, setInfoMessage, setIsLoading, filterTrafficAlert, setFilterTrafficAlert, requestAPI, autocompleteCountries, forceUpdateModule, selectedElement, setSelectedElement, url_origin } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [sortedData, setSortedData] = useState([])
    const [dataFiltered, setDataFiltered] = useState((filterTrafficAlert || selectedElement?.matricula) ? true : false)
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

    //Elementos filtrar
    const [filterState, setFilterState] = useState({})

    //Autocomplete data
    const [autocompleteLists, setAutocompleteLists] = useState([])
    const [autocompleteDevices, setAutocompleteDevices] = useState([])
    const [autocompleteAreas, setAutocompleteAreas] = useState([])

    //Export
    const csvRef = useRef();
    const exportOptions = useMemo(() => ([
        { cod: '1', name: 'PDF', onClick: () => handleSavePDF() },
        { cod: '2', name: 'CSV', onClick: () => csvRef.current?.link?.click() },
        //eslint-disable-next-line
    ]), [data, listStyle])


    //*---------------------------------FUNCIONES PREVALIDACIÓN----------------------------------------*//

    //Obtiene las alertas
    const getAlerts = async (payload) => {

        //Infracciones que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: selectedElement?.matricula ?? filterTrafficAlert ?? payload?.license,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            envio: payload?.state?.cod,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_dispositivo: payload?.device?.cod,
            tipos: payload?.alerts,
            pais: payload?.nacionality?.cod,
            fiabilidad: payload?.confidence,
            orientacion: payload?.direction?.cod,
            tipo_vh: payload?.vehicle?.cod,
            nombre_lista: payload?.list?.name,
            cod_area: payload?.area?.cod,
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' && key !== 'order' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                value !== true
            )
        )

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        //Llamada para obtener los resultados
        data = await requestAPI(URL_OBTENER_INFRACCIONES, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        setSortedData(data)
        isFiltering
            ? setSubtitle(t('messages.resultsFiltered', { value: data?.length }))
            : setSubtitle(t('messages.results', { value: data?.length, total: numberConversion(data.length) }))

        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false) }, 500)
    }

    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes() {

        //Inicialización llamadas
        const listsCall = getAutocompleteListas()
        const devicesCall = getAutocompleteDevices({ modulos: ['0008'] })
        const areasCall = getAutocompleteAreas()

        //Realizamos todas las llamadas a la vez
        const [lists, devices, areas] = await Promise.all([listsCall, devicesCall, areasCall]);

        //Asignamos los respectivos datos
        setAutocompleteLists(lists)
        setAutocompleteDevices(devices)
        setAutocompleteAreas(areas)

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

    //Llamada inicial para obtener las alertas
    useEffect(() => {

        getAlerts()
        setHistoric({ vehicle: selectedElement?.matricula })
        historic?.vehicle ?? setFilterState({})
        setSelectedElement(undefined)
        setFilterTrafficAlert(null)

        //eslint-disable-next-line
    }, [forceUpdateModule])

    //Llamada inicial para obtener los autocompletar
    useEffect(() => {
        getAutocompletes()

        return () => {
            setFilterTrafficAlert(null)
            setSelectedElement(undefined)
        }

        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
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
            { label: t('params.code'), key: "cod_sancion" },
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
            { label: t('params.infraction'), key: "cod_infraccion" },
            { label: t('params.description'), key: "desc_infraccion" },
            { label: t('params.status'), key: "estat" },
            { label: t('params.user'), key: "usuario" },
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
            <FilterSection title={t('crud.filterElements', { elements: t('terms.infractions') })} submitText={t('buttons.filter')} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getAlerts} rows={6} columns={4} unequalRows onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" initialValue={historic?.vehicle} />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={autocompleteDevices} itemName='name' strictInput />
                <FilterSectionElement title={t('params.list')} name="list" inputType="ITEMS" items={autocompleteLists} itemName='name' strictInput />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={4} traffic mobility />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                <FilterSectionElement title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" items={autocompleteTiposVehiculo} itemName='name' strictInput />
                <FilterSectionElement title={t('params.model')} name="model" inputType="text" />
                <FilterSectionElement title={t('params.direction')} name="direction" inputType="ITEMS" items={autocompleteDireccion} itemName='name' strictInput />
                <FilterSectionElement title={t('params.area')} name="area" inputType="ITEMS" items={autocompleteAreas} itemName='name' strictInput />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                <FilterSectionElement title={t('params.nationality')} name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
                <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
                <FilterSectionElement title={t('params.status')} name="state" inputType="ITEMS" items={[{ cod: 'p', name: t('values.Pendiente') }, { cod: 's', name: t('values.Enviada') }]} itemName='name' strictInput />
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
                consultingSection={'infringement-consulting-consults'}
                licensePlate={currentData?.matricula}
                isPlayable
                playGrid={playGrid}
                isPlaying={isPlaying}
                index={index}
                setIndex={setIndex}
                totalData={sortedData.length}
            />
        }


        {/*Página consultas de Infringement*/}

        <main className={consultingStyles['consulting']}>
            {/*Sección consultas*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.CONSULTAS') }]}>

                    <h2 className='subtitle'>{subtitle}</h2>

                    {/* Botones */}
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={() => setFilterOpen(true)} permissionType='consultas' selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={updateIcon} onClick={getAlerts} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" options={exportOptions} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                        <ButtonComponent icon={grid} accesibleText={t('buttons.grid')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(false)} selected={!listStyle} right />
                        <ButtonComponent icon={list} accesibleText={t('params.list')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(true)} selected={listStyle} />
                    </div>

                    {/* Datos */}
                    {listStyle ?
                        <Table
                            results={data}
                            setData={setData}
                            className={consultingStyles['table__content']}
                            rows={50}
                            primary_key={'cod_sancion'}
                            headers={[t('params.date'), t('params.time'), t('params.licensePlate'), t('params.code'), t('params.description'), t('params.status')]}
                            columnStyles={['element--short', 'element--short', 'element--short', 'element--short', 'element--long', 'element--short']}
                            row_elements={[(item) => moment(item.fecha).format('L'), 'hora', (item) => item?.matricula?.toUpperCase(), 'cod_infraccion', (item) => `${item.desc_infraccion}${item?.tipo && ': ' + item?.tipo}`, (item) => t('values.' + statusConversion(item?.envio))]}
                            sortElements={['fecha', 'hora', 'matricula', 'cod_infraccion', 'description', 'envio']}
                            sortAccesors={{
                                fecha: (item) => moment(item.fecha).format('L'),
                                description: (item) => item.desc_infraccion,
                                envio: (item) => t('values.' + statusConversion(item?.envio))
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
                                            title: item.matricula ?? t('values.Sin identificar'),
                                            subtitle: `${t('values.' + vehicleConversion(item))} ${item?.marca || ''} ${item?.modelo || ''} ${t(colorConversion(item?.color))}`,
                                            description: `${item?.cod_infraccion === '' ? t('values.Sin identificar') : item?.cod_infraccion} - ${t('values.' + statusConversion(item?.estat))}`,
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