//Librerias
import React, { useEffect, useContext, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment';
import { CSVLink } from "react-csv";

//Components
import { Table } from '../../../../../components/Table/Table';
import { Box } from '../../../../../components/Box/Box';
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';

//Context
import MainDataContext from '../../../../../context/MainDataContext';

//URLS
import { URL_OBTENER_INFRACCIONES, URL_ENVIAR_INFRACCIONES } from '../../../../../api/connections/urls';

//Utils
import { getAutocompleteDevices, getAutocompleteListas } from '../../../../../api/services/autocomplete';
import { direccionCamara as autocompleteDireccion, tiposVehiculo as autocompleteTiposVehiculo } from '../../../../../constants/common'
import { numberConversion } from '../../../../../utils/conversions';

//Iconos
import updateIcon from '../../../../../assets/icons/actions/update.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import sendIcon from '@icons/navbar/sending.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'

//constants
import { autocompleteColors } from '../../../../../constants/common';


export function InfringementSending() {


    //*-----------------------------------------VARIABLES----------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage, autocompleteCountries } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de las alertas
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)

    //Estado del modal de filtrar
    const [filterState, setFilterState] = useState({})

    //Autocomplete data
    const [autocompleteLists, setAutocompleteLists] = useState([])
    const [autocompleteDevices, setAutocompleteDevices] = useState([])

    const csvRef = useRef();


    //*---------------------------------FUNCIONES ENVÍO--------------------------------------*//

    //Obtiene las infracciones pendientes de envío
    const getAlerts = async (payload) => {

        //Infracciones que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función que nos retorna los alertas.
        const params = {
            matricula: payload?.license_plate,
            color: payload?.color?.cod,
            marca: payload?.brand,
            modelo: payload?.model,
            envio: 'p',
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_time,
            hora_fin: payload?.final_time,
            cod_dispositivo: payload?.devices?.cod,
            tipos: payload?.alerts,
            pais: payload?.nacionality?.cod,
            fiabilidad: payload?.fiability,
            orientacion: payload?.direction?.cod,
            tipo_vh: payload?.vehicle?.cod,
            cod_lista: payload?.lists?.cod,
        }


        //Comprobamos si estamos filtrando o no
        let isFiltering = ((payload !== undefined) && Object.values(payload).some(value => value !== undefined && value !== ""))
        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        //Llamada API
        data = await requestAPI(URL_OBTENER_INFRACCIONES, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: data?.length })) : setSubtitle(t('messages.results', { value: data?.length, total: numberConversion(data.length) }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);

    }

    //Envío de infracciones
    const sendAlert = async (id) => {
        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Array de alertas a enviar
        let alerts = []

        //Realizar la comprobación para el envio de una alerta de forma individual o múltiples
        if (id !== undefined) {
            alerts.push({ cod_sancion: id })
        } else {

            //Filtramos los elementos que esten seleccionados
            data.filter(item => item.checked === true).forEach((item) => {
                if (item.cod_sancion !== undefined) {
                    alerts.push({ cod_sancion: item.cod_sancion })
                }
            });
        }

        if (alerts.length < 1) {
            setInfoMessage(t('messages.noItemSelected'))
            setIsLoading(false)
            return
        }

        //Parametros que pasaremos a la función para enviar la infracción
        const params = {
            infracciones: alerts,
        }

        //Función que envia las infraqcciones
        let response = await requestAPI(URL_ENVIAR_INFRACCIONES, params, 'city')

        //Control de errores
        if (response.message) {
            setIsLoading(false)
            setInfoMessage(response.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getAlerts(true)
            setInfoMessage(t('messages.requestSuccess'))
        }, 500);
    }

    //*--------------------------------------FILTRO------------------------------------------*//

    //Reseteamos todos los filtros
    const resetFilter = () => {
        setFilterState({})
    }

    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes() {
        const lists = await getAutocompleteListas()
        setAutocompleteLists(lists)
        const devices = await getAutocompleteDevices({ modulos: ['0008'] })
        setAutocompleteDevices(devices)
    }


    //*------------------------------------USE EFFECT----------------------------------------*//

    //Activamos pantalla de carga
    useEffect(() => {
        getAutocompletes()
        getAlerts(true)
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            resetFilter()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data?.filter(x => x.checked) || []
        if (registros?.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: data?.filter(value => value.checked === true) || [],
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


    return (
        <>

            {/*Filtro*/}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.infractions') })} onSubmit={getAlerts} onReset={() => resetFilter()} rows={6} columns={4} unequalRows onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitIcon={filterIcon}>

                    {/*Columna 1*/}
                    <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                    <FilterSectionElement title={t('params.licensePlate')} name="license_plate" inputType="text" />
                    <FilterSectionElement title={t('params.brand')} name="brand" inputType="text" />
                    <FilterSectionElement strictInput title={t('params.device')} name="devices" inputType="ITEMS" itemName='name' items={autocompleteDevices} />
                    <FilterSectionElement strictInput title={t('params.list')} name="lists" inputType="ITEMS" itemName='name' items={autocompleteLists} />
                    <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={4} traffic mobility />

                    {/*Columna 2*/}
                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                    <FilterSectionElement strictInput title={t('params.vehicleType')} name="vehicle" inputType="ITEMS" itemName='name' items={autocompleteTiposVehiculo} />
                    <FilterSectionElement title={t('params.model')} name="model" inputType="text" />
                    <FilterSectionElement strictInput title={t('params.direction')} name="direction" inputType="ITEMS" itemName='name' items={autocompleteDireccion} />
                    <span></span>

                    {/*Columna 3*/}
                    <FilterSectionElement title={t('params.startTime')} name="initial_time" inputType="time" />
                    <FilterSectionElement strictInput title={t('params.nationality')} name="nacionality" inputType="ITEMS" itemName='name' items={autocompleteCountries} />
                    <FilterSectionElement strictInput title={t('params.color')} name="color" inputType="ITEMS" itemName='name' items={autocompleteColors} />
                    <FilterSectionElement title={t('params.confidence')} name="fiability" inputType="text" hint={t('hints.confidence')} />
                    <span></span>

                    {/*Columna 4*/}
                    <FilterSectionElement title={t('params.endTime')} name="final_time" inputType="time" />
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>


                </FilterSection>
            }

            {/*Página envío de sanciones de Infringement*/}
            <main className={consultingStyles['consulting']}>
                {/*Sección registros*/}

                <Box routes={[{ name: t('sections.ENVIO') }]} className={consultingStyles['registers']}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.send')} icon={sendIcon} onClick={sendAlert} permissionType='editar' />
                        <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={() => setFilterOpen(true)} permissionType='consultas' selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={updateIcon} onClick={() => getAlerts(true)} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />
                    </div>

                    <Table
                        results={data}
                        setData={setData}
                        rows={50}
                        primary_key={'cod_sancion'}
                        headers={[t('params.date'), t('params.time'), t('params.licensePlate'), t('params.code'), t('params.description'), t('params.user')]}
                        columnStyles={['element--short', 'element--short', 'element--short', 'element--short', 'element--extralong', 'element--short']}
                        row_elements={[(item) => moment(item.fecha).format('L'), 'hora', 'matricula', 'cod_infraccion', (item) => `${item.desc_infraccion || ''}${item?.tipo && (item.desc_infraccion ? ': ' : '') + item?.tipo}`, 'usuario']}
                        sortElements={['fecha', 'hora', 'matricula', 'cod_infraccion', 'description', 'usuario']}
                        sortAccesors={{
                            fecha: (item) => moment(item.fecha).format('L'),
                            description: (item) => item.desc_infraccion
                            }}
                        hasCheckbox
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={consultingStyles['table__content']}
                    />

                </Box>
            </main>
        </>
    )
}
