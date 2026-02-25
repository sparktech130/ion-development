import consultingStyles from '../../../../../../styles/sections/Consulting.module.css'

// Librerias
import React, { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CSVLink } from "react-csv";
import { saveAs } from 'file-saver';
import { pdf } from '@react-pdf/renderer';
import moment from 'moment';

//Componentes
import { Box } from '../../../../../../components/Box/Box';
import { FilterSection } from '../../../../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../../../../components/FilterSection/FilterSectionElement';
import { DetailModal } from '../../../../../../components/DetailModal/DetailModal';
import { ConsultingGrid } from '../../../../../../components/ConsultingGridImage/ConsultingGrid';
import { GridReport } from '../../../../../../components/ConsultingGridImage/GridReport';
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent';
import { Table } from '../../../../../../components/Table/Table';
import { PdfDocumentTraffic } from '../../../../../../components/Exports/PdfDocuments/PdfDocumentTraffic';

//URLS
import { URL_OBTENER_RECONOCIMIENTOS_CAMPAIGN } from '../../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../../context/MainDataContext';

//Icons
import iconItv from '../../../../../../assets/icons/alerts/itv2.svg?react'
import iconInsurance from '../../../../../../assets/icons/alerts/insurance.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import updateIcon from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Utils
import { numberConversion, colorConversion, vehicleConversion, orientationConversion } from '../../../../../../utils/conversions'
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../../constants/common'

//constants
import { autocompleteColors } from '../../../../../../constants/common';


export function Campaign({
    campaign,
    setCampaign
}) {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { module, setIsLoading, filterTrafficAlert, setFilterTrafficAlert, requestAPI, setInfoMessage, autocompleteCountries, url_origin } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

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
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //alertas filtro
    const [customIcons] = useState([
        campaign?.cod_tipo_camp === '01' ? { code: 4, icon: iconItv, text: 'ITV' } : { code: 6, icon: iconInsurance, text: t('terms.insurance') }
    ])

    //Export
    const csvRef = useRef();
    const exportOptions = useMemo(() => ([
        { cod: '1', name: 'PDF', onClick: () => handleSavePDF() },
        { cod: '2', name: 'CSV', onClick: () => csvRef.current?.link?.click() },
        //eslint-disable-next-line
    ]), [data, listStyle])


    //*---------------------------------FUNCIONES RECONOCIMIENTOS--------------------------------------*//

    //Obtiene los reconocimientos
    const getRecognitions = async (payload) => {

        if (!campaign.cod_campaign) { return }

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_campaign: campaign.cod_campaign,
            cod_alerta_gest: payload?.alerts,
            matricula: filterTrafficAlert ?? payload?.license,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_dispositivo: payload?.device?.cod_dispositivo,
            pais: payload?.nacionality?.cod,
            confidence: payload?.confidence,
            orientacion: payload?.direction?.cod,
            velocidad_vehiculo: payload?.speed,
            tipo_vh: payload?.vehicle?.cod,
            order: ["fecha DESC", "hora DESC"],
            modulos: [8]
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'limit' && key !== 'order' && key !== 'modulos' && key !== 'cod_campaign' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                value !== true &&
                value !== 'Fecha inválida'
            )
        );

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        //Llamada para obtener los resultados
        let data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_CAMPAIGN, { ...params, limit: isFiltering ? 1000 : 200 }, 'city')

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos en los respectivos useState.
        if (data.rows && !data.rows?.error) {
            setData(data.rows)
            isFiltering ? setSubtitle(t('messages.resultsFilteredLast', { value: data?.rows?.length })) : setSubtitle(t('messages.resultsTotal', { value: data?.rows?.length, total: (numberConversion(data?.count || '0')) }))
        }

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
        getRecognitions('reset')
        setFilterTrafficAlert(null)
        //eslint-disable-next-line
    }, [])

    //Si hacemos click en el Histórico del modal de Consultas, que nos recargue la página
    useEffect(() => {
        if (filterTrafficAlert !== null) {
            setCurrentData(false)
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
            { label: t('sections.INFRACCIONES'), key: "cod_alertagest" },
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
            <FilterSection title={t('crud.filterElements', { elements: t('terms.recognitions') })} submitText={t('buttons.filter')} setIsOpen={setFilterOpen} onReset={() => resetFilter()} onSubmit={getRecognitions} rows={5} columns={4} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '950px' }} submitIcon={filterIcon} unequalRows>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" />
                <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                <FilterSectionElement title={t('params.device')} name="device" inputType="ITEMS" items={campaign?.dispositivos || []} itemName='nom_dispositivo' strictInput />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" width={4} inputType="ICONS" customIcons={customIcons} disableSelectAll />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                <FilterSectionElement title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" items={autocompleteTiposVehiculo} itemName='name' strictInput />
                <FilterSectionElement title={t('params.model')} name="model" inputType="text" />
                <FilterSectionElement title={t('params.direction')} name="direction" inputType="ITEMS" items={autocompleteDireccion} itemName='name' strictInput />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                <FilterSectionElement title={t('params.nationality')} name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
                <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
                <FilterSectionElement title={t('params.speed')} name="speed" inputType="text" hint={t('hints.speed')} />

                {/*Columna 4*/}
                <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />
                <span />
                <span />
                <FilterSectionElement title={t('params.confidence')} name="confidence" inputType="text" hint={t('hints.confidence')} />

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

        {/* Página principal campaña */}
        <main className={consultingStyles['consulting']}>

            {/*Sección registros*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.CAMPAÑAS'), action: () => setCampaign(null) }, { name: campaign?.nombre_campaign }]}>

                    <h2 className='subtitle'>{subtitle}</h2>

                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={updateIcon} onClick={getRecognitions} />
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
                                (item => `${Math.ceil(item?.confidence * 100)} %`)
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
                                'confidence'
                            ]}
                            sortAccesors={{
                                direction: (item => `${t('values.' + orientationConversion(item))}`),
                                color: (item => t(colorConversion(item?.color))),
                                confidence: (item => `${Math.ceil(item?.confidence * 100)} %`),
                            }}
                            hasCheckbox
                            isReport
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            setOpenReport={(item, index) => onClickReport(item, index)}
                            permissionType='consultas'
                            checkRedRowFunction={(item) => {
                                if (!item?.cod_alertagest) return false
                                let alerts = item?.cod_alertagest?.split(';') || []
                                const hasAlert = alerts?.some(alert => ['0004', '0006'].includes(alert));
                                return hasAlert;
                            }}
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
                                            subtitle: `${t('values.' + vehicleConversion(item))} ${item?.marca} ${item?.modelo} ${t(colorConversion(item?.color))}`,
                                            description: `${item?.nom_dispositivo} - ${t('values.' + orientationConversion(item))}`,
                                            alert: item?.cod_alertagest
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