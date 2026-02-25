// Librerias
import React, { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { CSVLink } from "react-csv";

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { TextModal } from '../../../../../components/TextModal/TextModal'
import { Table } from '../../../../../components/Table/Table'
import { InputExcel } from '../../../../../components/Inputs/InputExcel/InputExcel'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent'

//Constant
import { lists } from '../../../../../constants/common'

//URLS
import { URL_OBTENER_LISTAS, URL_INSERTAR_LISTAS, URL_INSERTAR_VEHICULO_LISTAS, URL_EDITAR_LISTAS, URL_ELIMINAR_LISTAS, URL_MODIFICAR_VEHICULO_LISTAS, URL_ELIMINAR_VEHICULO_LISTAS, URL_IMPORTAR_ARCHIVO, URL_OBTENER_DESTINATARIO_LISTAS, URL_INSERTAR_DESTINATARIO_LISTAS, URL_MODIFICAR_DESTINATARIO_LISTAS, URL_IMPORTAR_DESTINATARIOS } from '../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Utils
import { alertConversion } from '../../../../../components/DetailModal/alertConversion'
import { checkArray } from '../../../../../utils/functions/functions';


//Styles
import styles from '@styles/sections/DoubleList.module.css'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import importIcon from '@icons/actions/folder.svg?react'
import exportIcon from '@icons/actions/download.svg?react'
import smsIcon from '@icons/actions/sms.svg?react'
import whatsappIcon from '@icons/actions/whatsapp.svg?react'
import mailIcon from "@icons/navbar/notification-close.svg?react"
import notificationIcon from "@icons/actions/bell.svg?react"


export function Lists() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de las listas
    const [data, setData] = useState([])
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)
    const [dataFiltered, setDataFiltered] = useState(false)

    //Información de los vehiculos
    const [vehicles, setVehicles] = useState([])
    const [vehicleSubtitle, setVehicleSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentVehicle, setCurrentVehicle] = useState(null)
    const [vehicleFiltered, setVehicleFiltered] = useState(false)

    //Información de los destinatarios
    const [receivers, setReceivers] = useState([])
    const [receiverSubtitle, setReceiverSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentReceiver, setCurrentReceiver] = useState(null)
    const [receiverFiltered, setReceiverFiltered] = useState(false)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)

    const [filterVehicleOpen, setFilterVehicleOpen] = useState(false)
    const [insertVehicleOpen, setInsertVehicleOpen] = useState(false)
    const [updateVehicleOpen, setUpdateVehicleOpen] = useState(false)
    const [deleteVehicleOpen, setDeleteVehicleOpen] = useState(false)
    const [importExcelOpen, setImportExcelOpen] = useState(false)

    const [filterReceiverOpen, setFilterReceiverOpen] = useState(false)
    const [insertReceiverOpen, setInsertReceiverOpen] = useState(false)
    const [updateReceiverOpen, setUpdateReceiverOpen] = useState(false)
    const [deleteReceiverOpen, setDeleteReceiverOpen] = useState(false)
    const [importRecipientsExcelOpen, setImportRecipientsExcelOpen] = useState(false)

    //State modales
    const [filterState, setFilterState] = useState({})
    const [insertState, setInsertState] = useState({})
    const [updateState, setUpdateState] = useState({})
    const [filterVehicleState, setFilterVehicleState] = useState({})
    const [filterReceiverState, setFilterReceiverState] = useState({})

    //Export
    const csvRef = useRef()
    const csvVehiclesRef = useRef()
    const csvRecipientsRef = useRef()


    //*------------------------------------FUNCIONES API LISTAS--------------------------------------------*//

    //Inserta listas a la BBDD
    const insertLists = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nombre_lista: payload?.nombre_lista,
            desc_lista: payload?.tipo_lista?.cod,
            tipo_alerta: payload?.alerts?.join(';'),
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_INSERTAR_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementAdded'))
        }, 500);
    }

    //Obtiene las listas
    const getLists = async (payload) => {

        //limpio current data
        setCurrentData(null)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nombre_lista: payload?.nombre_lista,
            desc_lista: payload?.tipo_lista?.cod,
            tipo_alerta: payload?.alerts,
            obtenerVehiculos: true,
        }

        //Comprobamos si estamos filtrando o no
        const isFiltering = Object.values(params).some(param => param !== null && param !== undefined && param !== '' && param.length !== 0 && param !== true);
        setDataFiltered(isFiltering)

        //datos
        let data = await requestAPI(URL_OBTENER_LISTAS, params, 'city')
        let rows = data?.rows || []

        // Añadir traducción tipo alertas para el CSV
        if (checkArray(rows)) {
            rows = rows?.map(item => {
                let nombres_alertas = '';
                if (item?.tipo_alerta) {
                    const alertas = item?.tipo_alerta?.split(';')?.map(a => t('codes.cityAlerts.' + a));
                    nombres_alertas = alertas.join(', ');
                }
                return { ...item, nombres_alertas };
            });
        }

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Asignación de los datos de listas en los respectivos useState.
        setData(rows || [])

        //selecciono la que estaba seleccionada o una por defecto
        if (checkArray(rows)) {
            if (currentData?.cod_lista) {
                let item = rows?.find(item => item.cod_lista === currentData?.cod_lista) || rows?.[0]
                setCurrentData(item)
                //Asignación de los datos de vehiculos en los respectivos useState.
                setVehicles(item?.vehiculos)
                setVehicleSubtitle(t('messages.results', { value: item?.vehiculos?.length }))
            } else {
                setCurrentData(rows?.[0])
                //Asignación de los datos de vehiculos en los respectivos useState.
                setVehicles(rows?.[0]?.vehiculos)
                setVehicleSubtitle(t('messages.results', { value: rows?.[0]?.vehiculos?.length }))
            }
        }

        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: rows?.length })) : setSubtitle(t('messages.results', { value: rows?.length }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Edita una lista
    const editList = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_lista: currentData.cod_lista,
            nombre_lista: payload?.nombre_lista,
            tipo_alerta: payload?.alerts?.join(';'),
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_EDITAR_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementEdited'))
        }, 500);
    }

    //Elimina una lista
    const deleteList = async () => {

        //Cerramos el modal
        setDeleteOpen(false)
        setEditOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_lista: currentData.cod_lista,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_ELIMINAR_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementDeleted'))
        }, 500);
    }


    //*------------------------------------FUNCIONES API VEHÍCULOS--------------------------------------------*//

    //Inserta un vehículo a una lista
    const insertVehicle = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_lista: currentData.cod_lista,
            matricula: payload?.matricula?.toUpperCase(),
            descripcion_vehiculo: payload?.descripcion,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_INSERTAR_VEHICULO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementAdded'))
        }, 500);
    }

    //Filtra los vehiculos de la lista
    const filterVehicle = (payload) => {

        setCurrentVehicle(null)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Comprobamos si estamos filtrando o no
        const isFiltering = payload?.matricula || payload?.descripcion
        setVehicleFiltered(isFiltering)

        //Si estamos filtrando, mostraremos filteredArray, de lo contrario, los vehículos que ya tenemos almacenados.
        if (isFiltering) {
            const filteredArray = currentData.vehiculos.filter(vehicle => vehicle.matricula?.toLowerCase()?.includes(payload?.matricula?.toLowerCase()) && vehicle.descripcion_vehiculo?.toLowerCase()?.includes(payload?.descripcion?.toLowerCase()));
            setVehicles(filteredArray)
            setVehicleSubtitle(t('messages.resultsFiltered', { value: filteredArray.length }))
        } else {
            setVehicles(currentData.vehiculos)
            setVehicleSubtitle(t('messages.results', { value: currentData?.vehiculos.length }))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Modifica el vehículo de una lista
    const updateVehicle = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_vehic_lista: currentVehicle.cod_vehic_lista,
            descripcion_vehiculo: payload?.descripcion,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_MODIFICAR_VEHICULO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementEdited'))
        }, 500);
    }

    //Elimina el vehículo de una lista
    const deleteVehicle = async () => {

        //Cerramos los modales
        setDeleteVehicleOpen(false)
        setUpdateVehicleOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_vehic_lista: currentVehicle.cod_vehic_lista,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_ELIMINAR_VEHICULO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getLists()
            setInfoMessage(t('crud.elementDeleted'))
        }, 500);
    }

    //Importar archivo csv
    async function handleImportExcel(json, csvStr, csvFile) {
        const formData = new FormData()
        formData.append("archivo_csv", csvFile, "archivo_csv.csv")
        formData.append("cod_lista", currentData?.cod_lista)
        const response = await requestAPI(URL_IMPORTAR_ARCHIVO, formData, 'city')

        if (!response.error) {
            setImportExcelOpen(false)
            setInfoMessage(t('messages.fileImported'))
            getLists()
        }
    }


    //*------------------------------------FUNCIONES API DESTINATARIOS--------------------------------------------*//

    //Inserta un vehículo a una lista
    const getReceiver = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Deselecciono el receptor actual
        setCurrentReceiver(null)

        //Parametros que pasaremos a la función.
        const params = {
            canal: Array.isArray(payload?.channel) ? payload?.channel[0] : '',
            destinatario: payload?.receiver,
            soloActivos: payload?.notifications?.[0] === 'enabled' ? true : false,
            nombre: payload?.name,
        }

        //Comprobamos si estamos filtrando o no
        const isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'cod_lista' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value !== false
            )
        )

        //Comprobamos si estamos filtrando o no
        setReceiverFiltered(isFiltering)

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_OBTENER_DESTINATARIO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Asignamos datos
        setReceivers(data)

        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false) }, 300)
    }

    //Inserta un vehículo a una lista
    const insertReceiver = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_lista: currentData?.cod_lista,
            canal: Array.isArray(payload?.channel) ? payload?.channel[0] : '',
            destinatario: payload?.receiver,
            nombre: payload?.name,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_INSERTAR_DESTINATARIO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getReceiver()
            setInfoMessage(t('crud.elementAdded'))
        }, 500);
    }

    //Modifica el vehículo de una lista
    const updateReceiver = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            id: currentReceiver?.id,
            canal: payload?.channel[0],
            destinatario: payload?.receiver,
            nombre: payload?.name,
            activo: payload?.notifications?.[0] === 'enabled' ? true : false,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_MODIFICAR_DESTINATARIO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getReceiver()
            setInfoMessage(t('crud.elementEdited'))
        }, 500);
    }

    //Elimina el vehículo de una lista
    const deleteReceiver = async () => {

        //Cerramos los modales
        setDeleteReceiverOpen(false)
        setUpdateReceiverOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_lista: currentData?.cod_lista,
            id: currentReceiver?.id
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_ELIMINAR_VEHICULO_LISTAS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getReceiver()
            setInfoMessage(t('crud.elementDeleted'))
        }, 500)
    }

    //Importar archivo csv de destinatarios
    async function handleImportReceiverExcel(json, csvStr, csvFile) {

        const formData = new FormData()
        formData.append("archivo_csv", csvFile, "archivo_csv.csv")
        formData.append("cod_lista", currentData?.cod_lista)
        const response = await requestAPI(URL_IMPORTAR_DESTINATARIOS, formData, 'city')

        if (!response.error) {
            setImportRecipientsExcelOpen(false)
            setInfoMessage(t('messages.fileImported'))
            getReceiver()
        }
    }


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = (unit) => {

        const registers = {
            "vehicles": vehicles,
            "data": data,
            "recipients": receivers
        }

        const registros = (registers[unit])?.filter(x => x.checked)
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv (Listas)
    const csvExport = {
        data: data?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.name'), key: "nombre_lista" },
            { label: t('params.type'), key: "desc_lista" },
            { label: t('sections.ALERTAS'), key: "nombres_alertas" },
        ],
        filename: t('sections.LISTAS') + '.csv'
    }

    //Exportar datos de la tabla a .csv (Vehículos)
    const csvVehiclesExport = {
        data: vehicles?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.licensePlate'), key: "matricula" },
            { label: t('params.description'), key: "descripcion_vehiculo" },
        ],
        filename: t('titles.vehicles') + '.csv'
    }

    //Exportar datos de la tabla a .csv (Destinatarios)
    const csvRecipientsExport = {
        data: receivers?.filter(value => value.checked === true && value?.cod_lista === currentData?.cod_lista) || [],
        headers: [
            { label: t('params.name'), key: "nombre" },
            { label: t('params.recipient'), key: "destinatario" },
            { label: t('params.channel'), key: "canal" },
            { label: t('titles.notifications'), key: "activo" },
        ],
        filename: t('params.receivers') + '.csv'
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getLists()
        getReceiver()
        //eslint-disable-next-line
    }, [])

    //Mostrar los vehiculos cada vez que se cambia de lista
    useEffect(() => {
        setCurrentVehicle(null)
        if (currentData?.vehiculos === undefined) {
            setVehicles(undefined)
            setCurrentVehicle(undefined)
            setVehicleSubtitle(t('messages.results', { value: 0 }))
        } else {
            setVehicles(currentData?.vehiculos)
            setVehicleSubtitle(t('messages.results', { value: currentData?.vehiculos.length }))
        }

        //eslint-disable-next-line
    }, [currentData])

    //Asignación de cambios al cambiar de lista o al actualizar los destinatarios
    useEffect(() => {

        //Asignamos el subtitulo de destinatarios
        receiverFiltered
            ? setReceiverSubtitle(t('messages.resultsFiltered', { value: receivers.filter(r => r.cod_lista === currentData?.cod_lista).length }))
            : setReceiverSubtitle(t('messages.results', { value: receivers.filter(r => r.cod_lista === currentData?.cod_lista).length }))

        setCurrentReceiver(undefined)

        //eslint-disable-next-line
    }, [currentData, receivers])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!filterOpen && !dataFiltered) { setFilterState({}) }
        //eslint-disable-next-line
    }, [filterOpen])

    //Limpia state insert al cerrar modal
    useEffect(() => {
        if (!insertOpen) { setInsertState({}) }
    }, [insertOpen])

    //Limpia state edit al cerrar modal
    useEffect(() => {
        if (!editOpen) { setUpdateState({}) }
    }, [editOpen])

    //Limpia state filtro vehículos si no estamos filtrando
    useEffect(() => {
        if (!filterVehicleOpen && !vehicleFiltered) { setFilterVehicleState({}) }
        //eslint-disable-next-line
    }, [filterVehicleOpen])

    //Limpia state filtro vehículos si no estamos filtrando
    useEffect(() => {
        if (!filterReceiverOpen && !receiverFiltered) { setFilterReceiverState({}) }
        //eslint-disable-next-line
    }, [filterReceiverOpen])


    //*-----------------------------------------USE MEMO-----------------------------------------------*//

    //Tipos de canales
    const channelTypes = useMemo(() => {
        const channels = [
            { code: 'email', text: t('params.email'), icon: mailIcon },
            { code: 'sms', text: 'SMS', icon: smsIcon },
            { code: 'whatsapp', text: 'WhatsApp', icon: whatsappIcon },
        ]
        return channels

        //eslint-disable-next-line
    }, [])

    //Tipos de canales
    const notifications = useMemo(() => {
        const notifications_icons = [
            { code: 'enabled', text: t('messages.activateNotificationsText'), icon: notificationIcon }
        ]
        return notifications_icons

        //eslint-disable-next-line
    }, [])


    return <>

        {/* Filtrar listas */}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.lists') })} onReset={() => { setFilterState({}) }} onSubmit={getLists} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '1050px' }} onChange={setFilterState} state={filterState} unequalRows submitText={t('buttons.filter')} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.name')} name="nombre_lista" inputType="text" />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={3} traffic />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.type')} name="tipo_lista" inputType="ITEMS" items={lists} itemName='name' strictInput />

            </FilterSection>
        }

        {/* Añadir lista */}
        {insertOpen &&
            <FilterSection title={t('crud.addElement', { element: t('terms.list') })} submitText={t('buttons.add')} setIsOpen={setInsertOpen} onReset={() => setInsertState({})} onSubmit={insertLists} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '1050px' }} onChange={setInsertState} state={insertState} unequalRows submitIcon={addIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.name')} name="nombre_lista" inputType="text" required />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={2} traffic required />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.type')} name="tipo_lista" inputType="ITEMS" items={lists} itemName='name' strictInput required />

            </FilterSection>
        }

        {/*Editar lista*/}
        {editOpen &&
            <FilterSection zIndex={8} title={t('crud.editElement', { element: t('terms.list') })} submitText={t('buttons.edit')} setIsOpen={setEditOpen} onSubmit={editList} buttons={[{ red: true, onClick: () => setDeleteOpen(true), icon: deleteIcon, text: t('crud.deleteElement', { element: t('terms.list') }) }]} rows={2} columns={1} customStyles={{ width: '70dvw', maxWidth: '1050px' }} onChange={setUpdateState} state={updateState} unequalRows submitIcon={editIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.name')} name="nombre_lista" inputType="text" required initialValue={currentData?.nombre_lista} />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={2} traffic required initialValue={currentData?.tipo_alerta?.split(';')} />

            </FilterSection>
        }

        {/* Eliminar lista */}
        {deleteOpen &&
            <TextModal zIndex={10} title={t('crud.deleteElement', { element: t('terms.list') })} aceptar={deleteList} cancelarRed cancelar={() => setDeleteOpen(false)}>{t('crud.deleteConfirmation', { element: t('terms.list') })}</TextModal>
        }


        {/* Filtrar vehículos */}
        {filterVehicleOpen &&
            <FilterSection setIsOpen={setFilterVehicleOpen} title={t('crud.filterElements', { elements: t('terms.vehicles') })} submitText={t('buttons.filter')} onReset={() => { setFilterVehicleState({}) }} onSubmit={filterVehicle} rows={1} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} onChange={setFilterVehicleState} state={filterVehicleState} submitIcon={filterIcon}>
                <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" />
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" />
            </FilterSection>
        }

        {/* Añadir vehículo */}
        {insertVehicleOpen &&
            <FilterSection setIsOpen={setInsertVehicleOpen} title={t('crud.addElement', { element: t('terms.vehicle') })} submitText={t('buttons.add')} onSubmit={insertVehicle} rows={2} columns={1} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>
                <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" required />
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" required />
            </FilterSection>
        }

        {/* Modificar vehículo */}
        {updateVehicleOpen &&
            <FilterSection zIndex={8} setIsOpen={setUpdateVehicleOpen} title={t('crud.editElement', { element: t('terms.vehicle') })} submitText={t('buttons.edit')} onSubmit={updateVehicle} onReset={() => setDeleteVehicleOpen(true)} resetText={t('crud.deleteElement', { element: t('terms.vehicle') })} rows={1} columns={1} customStyles={{ width: '70dvw', maxWidth: '750px' }} resetIcon={deleteIcon} submitIcon={editIcon}>
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" initialValue={currentVehicle?.descripcion_vehiculo} required />
            </FilterSection>
        }

        {/*Eliminar vehículo*/}
        {deleteVehicleOpen &&
            <TextModal zIndex={10} title={t('crud.deleteElement', { element: t('terms.vehicle') })} aceptar={deleteVehicle} cancelarRed cancelar={() => { setDeleteVehicleOpen(false) }}>{t('crud.deleteConfirmation', { element: t('terms.vehicle') })}</TextModal>
        }

        {/* Importar excel */}
        {importExcelOpen &&
            <InputExcel
                onChange={handleImportExcel}
                setVisible={setImportExcelOpen}
                campos={[
                    { name: t('params.licensePlate'), cod: "matricula", required: true },
                    { name: t('params.description'), cod: "descripcion_vehiculo", required: true },
                ]}
            />
        }


        {/* Filtrar destinatario */}
        {filterReceiverOpen &&
            <FilterSection setIsOpen={setFilterReceiverOpen} title={t('crud.filterElements', { elements: t('params.recipient')?.toLowerCase() })} unequalRows submitText={t('buttons.filter')} onReset={() => { setFilterReceiverState({}) }} onSubmit={getReceiver} rows={3} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} onChange={setFilterReceiverState} state={filterReceiverState} submitIcon={filterIcon}>
                <FilterSectionElement title={t('params.name')} name="name" inputType="text" />
                <FilterSectionElement title={t('params.channel')} name="channel" inputType="ICONS" width={4} customIcons={channelTypes} selectOne />
                <FilterSectionElement title={t('messages.activateNotifications')} name="notifications" inputType="ICONS" width={4} customIcons={notifications} disableSelectAll />
                <FilterSectionElement title={t('params.recipient')} name="receiver" inputType="text" />
            </FilterSection>
        }

        {/* Añadir destinatario */}
        {insertReceiverOpen &&
            <FilterSection setIsOpen={setInsertReceiverOpen} title={t('crud.addElement', { element: t('params.recipient')?.toLowerCase() })} unequalRows submitText={t('buttons.add')} onSubmit={insertReceiver} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>
                <FilterSectionElement title={t('params.name')} name="name" inputType="text" required />
                <FilterSectionElement title={t('params.channel')} name="channel" inputType="ICONS" width={4} customIcons={channelTypes} selectOne required />
                <FilterSectionElement title={t('params.recipient')} name="receiver" inputType="text" required />
            </FilterSection>
        }

        {/* Modificar destinatario */}
        {updateReceiverOpen &&
            <FilterSection setIsOpen={setUpdateReceiverOpen} title={t('crud.editElement', { element: t('params.recipient')?.toLowerCase() })} unequalRows submitText={t('buttons.update')} onSubmit={updateReceiver} onReset={() => setDeleteReceiverOpen(true)} resetText={t('crud.deleteElement', { element: t('params.recipient').toLowerCase() })} rows={3} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon} resetIcon={deleteIcon} zIndex={10}>
                <FilterSectionElement title={t('params.name')} name="name" inputType="text" required initialValue={currentReceiver?.nombre} />
                <FilterSectionElement title={t('params.channel')} name="channel" inputType="ICONS" width={4} customIcons={channelTypes} selectOne initialValue={currentReceiver?.canal} required />
                <FilterSectionElement title={t('messages.activateNotifications')} name="notifications" inputType="ICONS" width={4} customIcons={notifications} initialValue={currentReceiver?.activo ? 'enabled' : 'disabled'} disableSelectAll />
                <FilterSectionElement title={t('params.recipient')} name="receiver" inputType="text" required initialValue={currentReceiver?.destinatario} />
            </FilterSection>
        }

        {/* Eliminar destinatario */}
        {deleteReceiverOpen &&
            <TextModal zIndex={11} title={t('crud.deleteElement', { element: t('params.recipient').toLowerCase() })} aceptar={deleteReceiver} cancelarRed cancelar={() => { setDeleteReceiverOpen(false) }}>{t('crud.deleteConfirmation', { element: t('params.recipient').toLowerCase() })}</TextModal>
        }

        {/* Importar excel destinatarios*/}
        {importRecipientsExcelOpen &&
            <InputExcel
                onChange={handleImportReceiverExcel}
                setVisible={setImportRecipientsExcelOpen}
                campos={[
                    { name: t('params.name'), cod: "nombre", required: true },
                    { name: t('params.recipient'), cod: "destinatario", required: true },
                    { name: t('params.channel'), cod: "canal", required: true },
                ]}
            />
        }



        {/*Página Listas de Traffic*/}
        <main className={styles['lists']}>
            <Box routes={[{ name: t('sections.LISTAS') }]} innerClassName={styles['box']}>

                {/*Listas*/}
                <section className={styles['left__section']}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                        {currentData && <ButtonComponent icon={editIcon} onClick={() => setEditOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV('data')} {...csvExport} />
                    </div>
                    <Table
                        results={data}
                        setData={setData}
                        rows={50}
                        primary_key={'cod_lista'}
                        headers={[t('params.name'), t('params.type'), t('sections.ALERTAS')]}
                        columnStyles={['element--long', 'element--medium', 'element--long']}
                        row_elements={['nombre_lista', (item) => t('values.' + item?.desc_lista), (item) => alertConversion(item.tipo_alerta)]}
                        sortElements={['nombre_lista', 'description', 'alert']}
                        sortAccesors={{
                            description: (item) => t('values.' + item?.desc_lista),
                            alert: (item) => t('cityAlerts.' + item?.tipo_alerta)
                        }}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={styles['table__content']}
                        hasCheckbox
                    />
                </section>


                <section className={styles['right__section']} style={{ gap: '20px' }}>

                    {/* Vehículos */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <h2 className={styles['right__section__title']}>{t('titles.vehicles')}</h2>
                        <h2 className='subtitle'>{vehicleSubtitle}</h2>
                        <div className={styles['button__wrapper']}>
                            <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertVehicleOpen(true)} permissionType='editar' />
                            <ButtonComponent text={t('buttons.import')} icon={importIcon} onClick={() => setImportExcelOpen(true)} permissionType='editar' />
                            {currentVehicle && <ButtonComponent icon={editIcon} onClick={() => setUpdateVehicleOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                            <ButtonComponent onClick={() => setFilterVehicleOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={vehicleFiltered} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvVehiclesRef.current?.link?.click()} />
                            <CSVLink ref={csvVehiclesRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV('vehicles')} {...csvVehiclesExport} />
                        </div>
                        <Table
                            results={vehicles}
                            setData={setVehicles}
                            rows={50}
                            primary_key={'cod_vehic_lista'}
                            headers={[t('params.licensePlate'), t('params.description')]}
                            columnStyles={['element--long', 'element--extralong']}
                            row_elements={['matricula', 'descripcion_vehiculo']}
                            sortElements={['matricula', 'descripcion_vehiculo']}
                            currentData={currentVehicle}
                            setCurrentData={setCurrentVehicle}
                            className={styles['table__content--small']}
                            hasCheckbox
                        />
                    </div>

                    {/* Destinatarios */}
                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        <h2 className={styles['right__section__title']}>{t('params.receivers')}</h2>
                        <h2 className='subtitle'>{receiverSubtitle}</h2>
                        <div className={styles['button__wrapper']}>
                            <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertReceiverOpen(true)} permissionType='editar' />
                            <ButtonComponent text={t('buttons.import')} icon={importIcon} onClick={() => setImportRecipientsExcelOpen(true)} permissionType='editar' />
                            {currentReceiver && <ButtonComponent icon={editIcon} onClick={() => setUpdateReceiverOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                            <ButtonComponent onClick={() => setFilterReceiverOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={receiverFiltered} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRecipientsRef.current?.link?.click()} />
                            <CSVLink ref={csvRecipientsRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV('recipients')} {...csvRecipientsExport} />
                        </div>
                        <Table
                            results={receivers.filter(item => item.cod_lista === currentData?.cod_lista)}
                            setData={setReceivers}
                            rows={50}
                            primary_key={'id'}
                            headers={[t('params.name'), t('params.recipient'), t('params.channel'), t('titles.notifications')]}
                            columnStyles={['element--medium', 'element--long', 'element--medium', 'element--long']}
                            row_elements={[
                                'nombre',
                                'destinatario',
                                (item) => { return channelTypes.find(c => c.code === item?.canal).text },
                                (item) => item.activo ? t('values.on') : t('values.off')
                            ]}
                            sortElements={['nombre', 'destinatario', 'canal', 'activo']}
                            sortAccesors={{
                                canal: (item) => { return channelTypes.find(c => c.code === item?.canal).text },
                                activo: (item) => item.activo ? t('values.on') : t('values.off')
                            }}
                            currentData={currentReceiver}
                            setCurrentData={setCurrentReceiver}
                            className={styles['table__content--small']}
                            hasCheckbox
                        />
                    </div>

                </section>

            </Box>
        </main>
    </>
}