// Librerias
import React, { useState, useEffect, useContext } from 'react';

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement';
import { TextModal } from '../../../components/TextModal/TextModal'
import { Table } from '../../../components/Table/Table';
import { CheckPermission } from '../../../components/CheckPermission/CheckPermission';

//URLS
import { URL_ELIMINAR_LICENCIA, URL_GENERAR_LICENCIAS, URL_MODIFICAR_LICENCIAS, URL_OBTENER_LICENCIAS } from '../../../api/connections/urls';

//Context
import MainDataContext from '../../../context/MainDataContext'

//Constantes
import { smartcity_modules } from '../../../constants/common';

//Utils
import { numberConversion } from '../../../utils/conversions'
import { getAutocompleteClients } from '../../../api/services/autocomplete';

//Styles
import consultingStyles from '../../../styles/sections/Consulting.module.css'




export function LicenseGenerator() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)

    //Información de los dispositivos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState('-')
    const [currentData, setCurrentData] = useState([])

    //Estado de los modales de insertar, filtrar y modificar
    const [insertState, setInsertState] = useState({})
    const [filterState, setFilterState] = useState({})
    const [editState, setEditState] = useState({})

    //Modales
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [periodicidad, setPeriodicidad] = useState(null)

    //Autocompletar
    const [autocompleteClients, setAutocompleteClients] = useState([])

    //inputItems values
    const [inputItemsModulos] = useState(() => {
        return smartcity_modules.filter(item => !item.disabled && !item.noRequiresLicense)
    });

    //Botones para los filterSection
    const buttons = [
        {
            text: 'Eliminar licencia',
            red: true,
            loading: false,
            onClick: () => { setEditOpen(false); setDeleteOpen(true) }
        }
    ]


    //*------------------------------------FUNCIONES GENERADOR-----------------------------------------*//

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
            estado: payload?.estado,
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.values(params).some(param => param !== null && param !== undefined && param !== '' && param.length !== 0)

        setDataFiltered(isFiltering)
        !isFiltering && setFilterState({})

        //Llamada API
        const requestPayload = isFiltering ? params : {}
        data = await requestAPI(URL_OBTENER_LICENCIAS, requestPayload)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle('NO SE HAN ENCONTRADO RESULTADOS')
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        setCurrentData(data[0])
        isFiltering ? setSubtitle(`FILTRADOS ${numberConversion(data.length)} RESULTADOS`) : setSubtitle(`${numberConversion(data.length)} RESULTADOS`)

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Genera una nueva licencia
    const generateLicense = async (payload) => {

        //Ocultamos modal de inserción
        setInsertOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nombre_modulo: payload?.nombre_modulo?.module,
            canales: payload?.canales,
            nombre_cliente: payload?.nombre_cliente?.name,
            duracion_dias: payload?.duracion_dias || -1
        }

        //Llamada para insertar clientes
        let data = await requestAPI(URL_GENERAR_LICENCIAS, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getLicenses()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Licencia generada correctamente')
        }, 500);
    }

    //Modifica la licencia seleccionada
    const editLicense = async (payload) => {

        //Ocultamos modal de edición
        setEditOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            clave_licencia: currentData?.clave_licencia,
            fecha_expiracion: payload?.fecha_expiracion ? `${payload?.fecha_expiracion} ${currentData?.fecha_expiracion?.split(' ')[1] ? currentData?.fecha_expiracion?.split(' ')[1] : '00:00:00'}` : currentData?.fecha_expiracion
        }

        //Llamada para editar clientes
        let data = await requestAPI(URL_MODIFICAR_LICENCIAS, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getLicenses()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Licencia modificada correctamente')
        }, 500);
    }

    //Elimina la licencia seleccionada
    const deleteLicense = async () => {

        //Ocultamos modal de edición
        setDeleteOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            clave_licencia: currentData?.clave_licencia
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_ELIMINAR_LICENCIA, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getLicenses()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Licencia eliminada correctamente')
        }, 500);
    }

    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Obtiene todos los clientes para asignarlos al autocompletar
    async function getAutocompletes() {
        const clients = await getAutocompleteClients()
        setAutocompleteClients(clients)
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener las licencias
    useEffect(() => {
        getLicenses()
        getAutocompletes()
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            setFilterState({})
        }
        //eslint-disable-next-line
    }, [filterOpen, insertOpen, editOpen])

    //Vaciamos el state de modificar al cerrar el modal
    useEffect(() => {
        setEditState({})
        //eslint-disable-next-line
    }, [editOpen])

    //Vaciamos el state de insertar al cerrar el modal
    useEffect(() => {
        setInsertState({})
        //eslint-disable-next-line
    }, [insertOpen])


    return <>

        {/*Filtrar licencias */}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title="Filtrar licencia" onSubmit={getLicenses} onReset={() => { setFilterState({}) }} rows={1} columns={3} onChange={setFilterState} state={filterState} submitText='Filtrar' customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Columna 1*/}
                <FilterSectionElement title="Tipo de licencia" name="nombre_modulo" inputType="ITEMS" items={inputItemsModulos} itemName='module' />

                <FilterSectionElement title="Cliente" name="nombre_cliente" inputType="ITEMS" items={autocompleteClients} itemName='name' />

                <FilterSectionElement title="Estado" name="estado" inputType="ITEMS" items={["En uso", "Valida", "Prorroga", "Expirada", "Eliminada"]} />


            </FilterSection>
        }

        {/*Insertar licencias */}
        {insertOpen &&
            <FilterSection setIsOpen={setInsertOpen} title="Generar licencia" onSubmit={generateLicense} rows={2} columns={3} onChange={setInsertState} state={insertState} submitText='Añadir' customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Columna 1*/}
                <FilterSectionElement title="Tipo de licencia" name="nombre_modulo" inputType="ITEMS" items={inputItemsModulos} itemName='module' strictInput required />
                <FilterSectionElement title="Periodicidad" name="periodicidad" inputType="ITEMS" setInputValueOutside={setPeriodicidad} items={[{ cod: 'prueba', name: 'Prueba' }, { cod: 'indefinida', name: 'Indefinida' }]} itemName='name' strictInput required />

                {/*Columna 2*/}
                <FilterSectionElement title="Cliente" name="nombre_cliente" inputType="ITEMS" items={autocompleteClients} itemName='name' strictInput />

                {periodicidad?.cod === 'prueba' ?
                    <FilterSectionElement title="Duración" name="duracion_dias" inputType="number" placeholder='Días' required />
                    :
                    <span />
                }


                {/*Columna 3*/}
                <FilterSectionElement title="Canales" name="canales" inputType="number" required />

            </FilterSection>
        }

        {/* Editar licencias */}
        {editOpen &&
            <FilterSection setIsOpen={setEditOpen} title="Editar licencia" onSubmit={editLicense} rows={1} columns={1} onChange={setEditState} state={editState} submitText='Modificar' buttons={buttons} customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Columna 1*/}
                <FilterSectionElement title="Fecha expiración" name="fecha_expiracion" inputType="DATE" initialValue={currentData?.fecha_expiracion?.split(' ')[0]} required />

            </FilterSection >
        }

        {/*Eliminar licencias */}
        {deleteOpen &&
            <TextModal setIsOpen={setDeleteOpen} title="Eliminar licencia" aceptar={() => deleteLicense()} cancelar={() => setDeleteOpen(false)}>¿Eliminar la licencia?</TextModal>
        }

        {/*Página de generación de licencias*/}
        <main className={consultingStyles['consulting']}>
            {/*Sección licencias*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: 'Generador claves' }]}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={consultingStyles['button__wrapper']}>
                        <CheckPermission className='button' onClick={() => { setInsertOpen(true) }} permissionType='editar'>Añadir</CheckPermission>
                        {(data?.length > 0 && currentData?.estado !== 'ELIMINADA') && <CheckPermission className='button' onClick={() => { setEditOpen(true) }} permissionType='editar'>Editar</CheckPermission>}
                        <CheckPermission className='button' onClick={() => { setFilterOpen(true) }} permissionType='consultas'>Filtrar</CheckPermission>
                    </div>

                    <Table
                        results={data}
                        rows={50}
                        primary_key={'cod_licencia'}
                        headers={['Módulo', 'Canales', 'Duración', 'Fecha activación', 'Fecha expiración', 'Código de activación', 'Cliente', 'Estado']}
                        columnStyles={['element--medium', 'element--short', 'element--short', 'element--medium', 'element--medium', 'element--long', 'element--medium', 'element--medium']}
                        row_elements={['modulo', 'canales', (item) => item.duracion_dias > 0 ? item.duracion_dias : 'Indefinida', 'fecha_activacion', 'fecha_expiracion', 'clave_licencia', 'nombre_cliente', 'estado']}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={consultingStyles['table__content']}
                    />
                </Box>
            </section>
        </main>
    </>
}