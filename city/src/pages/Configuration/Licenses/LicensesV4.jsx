// Librerias
import React, { useState, useEffect, useContext } from 'react';
import styles from './LicensesV4.module.css'
import moment from 'moment';
import { useTranslation } from 'react-i18next';

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement';
import { LicensesModal } from './LicensesModal/LicensesModal';
import { LicensesCard } from './LicensesCard/LicensesCard';
import { ButtonComponent } from '../../../components/ButtonComponent/ButtonComponent';

//URLS
import { URL_INSERTAR_LICENCIA, URL_OBTENER_LICENCIAS, URL_OBTENER_CANALES } from '../../../api/connections/urls';

//Context
import { useLoginDataContext } from '../../../context/LoginDataContext'
import MainDataContext from '../../../context/MainDataContext'

//Constantes
import { smartcity_modules } from '../../../constants/common';

//Utils
import { numberConversion } from '../../../utils/conversions'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'



export function Licenses() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, hostname, setInfoMessage, codSector } = useContext(MainDataContext)
    const { formatAndSetLicenses } = useLoginDataContext()

    //Translation
    const { t } = useTranslation()

    //Información de los dispositivos
    const [data, setData] = useState([])
    const [channels, setChannels] = useState([])
    const [formattedData, setFormattedData] = useState(null)
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(undefined)

    //Estado de los modales de insertar, filtrar y modificar
    const [insertState, setInsertState] = useState({})
    const [filterState, setFilterState] = useState({})

    //Modales
    const [insertOpen, setInsertOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [licensesOpen, setLicensesOpen] = useState(false)

    //inputItems values
    const [inputItemsModulos] = useState(() => {
        return smartcity_modules.filter(item => !item.disabled && !item.noRequiresLicense)
    });


    //*------------------------------------API-----------------------------------------*//

    //Obtiene las licencias mediante llamada normal o filtro
    const getLicenses = async (payload) => {

        //Clouds que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            modulo: payload?.nombre_modulo?.module,
            nombre_cliente: payload?.nombre_cliente?.name,
            estado: payload?.estado?.cod || ["En uso", "Valida", 'Prorroga', 'Expirada'],  //se usa al filtrar desde el modal
            clave_licencia: payload?.clave_licencia, //se usa al filtrar desde el modal
            servidor: hostname,
            cod_sector: codSector
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'servidor' && key !== 'cod_sector' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                JSON.stringify(value) !== JSON.stringify(["En uso", "Valida", 'Prorroga', 'Expirada'])
            )
        );

        setDataFiltered(isFiltering)
        !isFiltering && setFilterState({})

        //Llamada API
        const requestPayload = isFiltering ? params : { cod_sector: codSector, servidor: hostname, estado: ["En uso", "Valida", 'Prorroga', 'Expirada'] }
        data = await requestAPI(URL_OBTENER_LICENCIAS, requestPayload)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        let datosAgrupados = undefined

        if (Array.isArray(data)) {
            //ordeno las licencia spara que salgan ordenadas las cards
            data = orderLicences(data)

            //Asignación de datos en los respectivos useState.
            setData(data)
            datosAgrupados = formatData(data)
        }

        let numModulos = datosAgrupados ? Object.keys(datosAgrupados)?.length : 0
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: t(numberConversion(numModulos)) })) : setSubtitle(t('messages.results', { value: numberConversion(numModulos) }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //ordenar licencias según modulos const
    const orderLicences = (licencias) => {

        // Crear un mapa de orden para facilitar la comparación
        const ordenMap = inputItemsModulos.reduce((map, modulo, index) => {
            map[modulo.code] = index; // Asociar cada código de módulo con su índice
            return map;
        }, {});

        // Ordenar las licencias
        const licenciasOrdenadas = licencias.sort((a, b) => {
            const indexA = ordenMap[a.cod_modulo] ?? Infinity; // Modulos no encontrados al final
            const indexB = ordenMap[b.cod_modulo] ?? Infinity;
            return indexA - indexB;
        });

        return licenciasOrdenadas
    }

    //Actualiza las licencias del context
    const updateLicensesContext = async () => {
        let data = undefined
        const params = {
            estado: ['EN USO', 'PRORROGA'],
            servidor: hostname,
            cod_sector: codSector
        }
        data = await requestAPI(URL_OBTENER_LICENCIAS, params)
        if (data && Array.isArray(data)) {
            formatAndSetLicenses(data)
        }
    }

    //Genera una nueva licencia
    const insertLicense = async (payload) => {

        //Ocultamos modal de inserción
        setInsertOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            clave_licencia: payload?.clave_licencia?.trim(),
        }

        //Llamada para insertar clientes
        let data = await requestAPI(URL_INSERTAR_LICENCIA, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        callAPI()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementAdded'))
        }, 500);
        updateLicensesContext()
    }


    //obtiene dispositivos
    const getChannels = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_CANALES)
            if (!data.error && Array.isArray(data) && data.length > 0 && data[0].canales_validos) {
                setChannels(data)
            }
        } catch {
            //
        }
    }

    //actualiza los datos
    const callAPI = () => {
        getLicenses()
        getChannels()
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //estructura los datos para lo que necesitamos en las cards
    const formatData = (data) => {
        let datos = {}
        if (Array.isArray(data)) {
            data.forEach((item) => {
                //si es un módulo repetido
                if (datos[item.cod_modulo]) {
                    //dejo la fecha más próxcima a caducar de las 'en uso'
                    let fechaAnterior = datos[item.cod_modulo].fecha_expiracion ? moment(datos[item.cod_modulo].fecha_expiracion, 'DD-MM-YYYY') : null
                    let fechaActual = null
                    if (item.estado === 'EN USO') {
                        fechaActual = item.fecha_expiracion ? moment(item.fecha_expiracion, 'YYYY-MM-DD HH:mm:ss') : null
                    }
                    if (!fechaAnterior || (fechaActual && fechaActual.isBefore(fechaAnterior))) {
                        datos[item.cod_modulo].fecha_expiracion = fechaActual?.format('DD-MM-YYYY') || null
                    }
                    //actualiza si hay alguna en prorroga
                    if (item.estado === 'PRORROGA') {
                        datos[item.cod_modulo].isRed = true
                    }
                    //si es un módulo nuevo lo añado al objeto
                } else {
                    //guardo la fecha si es una licencia que se está usando
                    let fecha = null
                    if (item.estado === 'EN USO') {
                        fecha = item.fecha_expiracion ? moment(item.fecha_expiracion, 'YYYY-MM-DD HH:mm:ss').format('DD-MM-YYYY') : null
                    }
                    datos[item.cod_modulo] = { modulo: item.modulo, fecha_expiracion: fecha, isRed: item.estado === 'PRORROGA' }
                }
            })
        }
        setFormattedData(datos)
        return datos
    }

    //añade la info de canales a formatted data
    useEffect(() => {
        if (channels.length > 0 && formattedData && Object.keys(formattedData).length !== 0) {
            let newFormattedData = { ...formattedData }
            channels.forEach(item => {
                if (newFormattedData[item.cod_modulo]) {
                    //si no se crea un nuevo objeto no se actualizan los datos correctamente en algunos casos
                    newFormattedData[item.cod_modulo] = {
                        ...newFormattedData[item.cod_modulo],
                        canales_validos: item.canales_validos,
                        dispositivos_asignados: item.dispositivos_asignados,
                    };
                }
            })
            // Compara si realmente hay cambios antes de actualizar
            if (JSON.stringify(newFormattedData) !== JSON.stringify(formattedData)) {
                setFormattedData(newFormattedData);
            }
        }
    }, [formattedData, channels])


    //Llamada inicial
    useEffect(() => {
        callAPI()
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            setFilterState({})
        }
        //eslint-disable-next-line
    }, [filterOpen, insertOpen])

    //Vaciamos el state de insertar al cerrar el modal
    useEffect(() => {
        setInsertState({})
        //eslint-disable-next-line
    }, [insertOpen])

    //-------------ONCLICK------------------------

    //click card
    const onClickCard = (item) => {
        setCurrentData(item)
        setLicensesOpen(true)
    }


    return <>

        {/*Filtrar licencia*/}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { 'elements': t('terms.licenses') })} onSubmit={getLicenses} onReset={() => { setFilterState({}) }} rows={1} columns={1} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.module')} name="nombre_modulo" inputType="ITEMS" items={inputItemsModulos} itemName='module' strictInput />

            </FilterSection>
        }

        {/*Insertar licencia*/}
        {insertOpen &&
            <FilterSection setIsOpen={setInsertOpen} title={t('crud.addElement', { 'element': t('terms.license') })} onSubmit={insertLicense} rows={1} columns={1} onChange={setInsertState} state={insertState} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.key')} name="clave_licencia" inputType="text" required />

            </FilterSection>
        }

        {/* Modal licencias */}
        {licensesOpen &&
            <LicensesModal
                closeModal={setLicensesOpen}
                cardInfo={currentData}
                licencias={data}
                callAPI={callAPI}
                updateLicensesContext={updateLicensesContext}
                getLicenses={getLicenses}
            />
        }

        {/*Página de generación de licencias*/}
        <main className={styles['license']}>
            {/*Sección licencias*/}
            <section className={styles['licenses']}>
                <Box routes={[{ name: t('sections.LICENCIAS') }]}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                    </div>
                    <div className={styles['list']}>
                        {formattedData && Object.entries(formattedData).map(([key, value]) => (
                            <LicensesCard key={key} cod_modulo={key} cardInfo={value} onClick={onClickCard} />
                        ))}
                    </div>
                </Box>
            </section>
        </main>
    </>
}