// Librerias
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CSVLink } from "react-csv";

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement';
import { TextModal } from '../../../../../components/TextModal/TextModal'
import { Table } from '../../../../../components/Table/Table';
import { InputExcel } from '../../../../../components/Inputs/InputExcel/InputExcel';
import { NewZoneModal } from './NewZoneModal/NewZoneModal'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';

//Constant
import { areas } from '../../../../../constants/common';

//URLS
import { URL_IMPORTAR_AREAS_AUTORIZADOS, URL_ELIMINAR_AUTORIZADOS, URL_INSERTAR_AUTORIZADO, URL_MODIFICAR_AUTORIZADOS, URL_OBTENER_AUTORIZADOS, URL_OBTENER_ZONAS } from '../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Styles
import styles from '@styles/sections/DoubleList.module.css'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import importIcon from '@icons/actions/folder.svg?react'
import exportIcon from '@icons/actions/download.svg?react'



export function MobilityZones() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de las zonas
    const [data, setData] = useState([])
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)
    const [dataFiltered, setDataFiltered] = useState(false)

    //Información de los vehiculos
    const [vehicles, setVehicles] = useState([])
    const [zoneVehicles, setZoneVehicles] = useState([])
    const [vehicleSubtitle, setVehicleSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentVehicle, setCurrentVehicle] = useState(null)
    const [vehicleFiltered, setVehicleFiltered] = useState(false)

    //Infracciones
    const [infractions, setInfractions] = useState([])

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)
    const [insertVehicleOpen, setInsertVehicleOpen] = useState(false)
    const [filterVehicleOpen, setFilterVehicleOpen] = useState(false)
    const [updateVehicleOpen, setUpdateVehicleOpen] = useState(false)
    const [deleteVehicleOpen, setDeleteVehicleOpen] = useState(false)
    const [importExcelOpen, setImportExcelOpen] = useState(false)

    //Errores
    const [excelError, setExcelError] = useState("")
    const [excelRepetidos, setExcelRepetidos] = useState([])

    //State modales
    const [filterState, setFilterState] = useState({})
    const [filterVehicleState, setFilterVehicleState] = useState({})

    //Export
    const csvRef = useRef();
    const csvVehiclesRef = useRef();


    //*-------------------------------------FUNCIONES API ZONAS--------------------------------------------*//

    //Obtiene las zonas
    const getZones = async (payload) => {

        //Datos que obtendremos de las llamadas
        let data = undefined
        let listedVehicles = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nombre_area: payload?.nombre_area,
            tipo_area: payload?.alerts?.map(cod => areas[cod]),
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.values(params).some(param => param !== null && param !== undefined && param !== '' && param.length !== 0);
        setDataFiltered(isFiltering)

        //Función que para obtener las zonas y sus respectivos vehículos.
        data = await requestAPI(URL_OBTENER_ZONAS, params, 'city')
        listedVehicles = await requestAPI(URL_OBTENER_AUTORIZADOS, {}, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de los datos de listas en los respectivos useState.
        setData(data?.rows || [])

        //selecciono la que estaba seleccionada o una por defecto
        if (data?.rows && Array.isArray(data?.rows) && data?.rows?.length > 0) {
            if (currentData?.cod_area) {
                setCurrentData(data?.rows?.find(item => item.cod_area === currentData?.cod_area) || data?.rows?.[0])
            } else {
                setCurrentData(data?.rows?.[0])
            }
        }
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: data?.rows?.length })) : setSubtitle(t('messages.results', { value: data?.rows?.length }))

        setVehicles(listedVehicles?.rows || [])
        setZoneVehicles(listedVehicles?.rows || [])

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }

    //*-------------------------------------FUNCIONES API VEHÍCULOS--------------------------------------------*//

    //Inserta un vehículo a una lista
    const insertVehicle = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_area: currentData.cod_area,
            matricula: payload?.matricula?.toUpperCase(),
            observaciones: payload?.descripcion,
            fecha_alta: payload?.initial_date,
            fecha_baja: payload?.final_date,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_INSERTAR_AUTORIZADO, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getZones()
            setInfoMessage(t('crud.elementAdded', { element: t('terms.vehicle') }))
        }, 300);
    }

    //Filtra los vehiculos de la lista
    const filterVehicle = async (payload) => {

        //Vehiculos que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_area: currentData?.cod_area,
            matricula: payload?.matricula?.toUpperCase(),
            observaciones: payload?.descripcion,
            fecha_alta: payload?.initial_date,
            fecha_baja: payload?.final_date,
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'cod_area' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0
            )
        );
        setVehicleFiltered(isFiltering)

        //Pedir datos
        data = await requestAPI(URL_OBTENER_AUTORIZADOS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Asignación de datos en los respectivos useState
        setZoneVehicles(data)
        isFiltering ? setVehicleSubtitle(t('messages.resultsFiltered', { value: data?.length })) : setVehicleSubtitle(t('messages.results', { value: data?.length }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }

    //Modifica el vehículo de una lista
    const updateVehicle = async (payload) => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_area: currentData?.cod_area,
            cod_autorizado: currentVehicle?.cod_autorizado,
            matricula: payload?.matricula?.toUpperCase(),
            observaciones: payload?.descripcion,
            fecha_alta: payload?.initial_date,
            fecha_baja: payload?.final_date,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_MODIFICAR_AUTORIZADOS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getZones()
            setInfoMessage(t('crud.elementEdited', { element: t('terms.vehicle') }))
        }, 300);
    }

    //Elimina el vehículo de una lista
    const deleteVehicle = async () => {

        //Cerramos modales
        setDeleteVehicleOpen(false)
        setUpdateVehicleOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_autorizado: currentVehicle.cod_autorizado,
        }

        //Función que para filtrar reconocimientos.
        let data = await requestAPI(URL_ELIMINAR_AUTORIZADOS, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            getZones()
            setInfoMessage(t('crud.elementDeleted', { element: t('terms.vehicle') }))
        }, 500);
    }

    //Importa vehículos de csv
    async function handleImportExcel(json, csvStr, csvFile) {
        const formData = new FormData()
        formData.append("archivo_csv", csvFile, "archivo_csv.csv")
        formData.append("cod_area", currentData?.cod_area)
        const response = await requestAPI(URL_IMPORTAR_AREAS_AUTORIZADOS, formData, 'city')

        if (!response.error) {
            setImportExcelOpen(false)
            setInfoMessage(t('messages.fileImported'))
            getZones()
        } else {
            setExcelError(t('errors.request'))
            if (response.matriculas_repetidas && response.matriculas_repetidas.length > 0) {
                setExcelRepetidos(response.matriculas_repetidas)
            }
        }
    }

    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getZones()
        //eslint-disable-next-line
    }, [])

    //Mostrar los vehiculos cada vez que se cambia de lista
    useEffect(() => {
        const filteredArray = vehicles?.filter(vehicle => vehicle.cod_area.includes(currentData?.cod_area));
        setZoneVehicles(filteredArray)
        setVehicleSubtitle(t('messages.results', { value: filteredArray.length }))
        //eslint-disable-next-line
    }, [currentData])

    //------------------------LIMPIAR DATOS----------------------------------------

    //Reseteamos filtro zonas
    useEffect(() => {
        if (!filterOpen && !dataFiltered) { setFilterState({}) }
        //eslint-disable-next-line
    }, [filterOpen])

    //Reseteamos filtro vehículos
    useEffect(() => {
        if (!filterVehicleOpen && !vehicleFiltered) { setFilterVehicleState({}) }
        //eslint-disable-next-line
    }, [filterVehicleOpen])

    //limpia el vehiculo seleccionado si cambiamos de lista
    useEffect(() => {
        setCurrentVehicle(null)
    }, [currentData])

    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = (isVehicles) => {
        const registros = (isVehicles ? vehicles : data)?.filter(x => x.checked) || []
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv (Zonas)
    const csvExport = {
        data: data?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.name'), key: "nombre_area" },
            { label: t('params.type'), key: "tipo_area" },
        ],
        filename: t('sections.ZONAS') + '.csv'
    };

    //Exportar datos de la tabla a .csv (Vehículos)
    const csvVehiclesExport = {
        data: vehicles?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.licensePlate'), key: "matricula" },
            { label: t('params.description'), key: "observaciones" },
        ],
        filename: t('titles.vehicles') + '.csv'
    };


    return <>

        {/* Aviso error importación */}
        {excelError &&
            <TextModal title={t('titles.info')} zIndex={30} aceptar={() => setExcelError("")} setIsOpen={() => setExcelError("")}>
                {excelError}
                {
                    excelRepetidos.length > 0 &&
                    <div>
                        <p>{t('errors.duplicateFields')}</p>
                        <p>{t('errors.duplicatePlates')}:</p>
                        <br />
                        <ul>
                            {excelRepetidos.map(({ matricula }, i) => <li key={i}>{matricula}</li>)}
                        </ul>
                    </div>
                }
            </TextModal>
        }

        {/* Filtrar zona */}
        {filterOpen &&
            <FilterSection zIndex={8} setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.zones') })} submitText={t('buttons.filter')} onReset={() => setFilterState({})} onSubmit={getZones} rows={2} columns={1} customStyles={{ width: '70dvw', maxWidth: '750px' }} unequalRows onChange={setFilterState} state={filterState} submitIcon={filterIcon}>
                <FilterSectionElement maxLength='50' title={t('params.name')} name="nombre_area" inputType="text" />
                <FilterSectionElement title={t('sections.ALERTAS')} name="alerts" inputType="ICONS" width={3} mobility />
            </FilterSection>
        }

        {/* Añadir zona */}
        {addOpen && <NewZoneModal setIsOpen={setAddOpen} updateData={getZones} infractions={infractions} setInfractions={setInfractions} />}

        {/* Editar zona */}
        {editOpen && <NewZoneModal setIsOpen={setEditOpen} updateData={getZones} currentData={currentData} infractions={infractions} setInfractions={setInfractions} />}

        {/* Filtrar vehículo */}
        {filterVehicleOpen &&
            <FilterSection zIndex={8} submitText={t('buttons.filter')} setIsOpen={setFilterVehicleOpen} title={t('crud.filterElements', { elements: t('terms.vehicles') })} onReset={() => setFilterVehicleState({})} onSubmit={filterVehicle} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} onChange={setFilterVehicleState} state={filterVehicleState} submitIcon={filterIcon}>
                <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" />
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" />
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
            </FilterSection>
        }

        {/* Añadir vehículo */}
        {insertVehicleOpen &&
            <FilterSection zIndex={8} submitText={t('buttons.add')} setIsOpen={setInsertVehicleOpen} title={t('crud.addElement', { element: t('terms.vehicle') })} onSubmit={insertVehicle} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>
                <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" />
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" />
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
            </FilterSection>
        }

        {/* Modificar vehículo */}
        {updateVehicleOpen &&
            <FilterSection zIndex={8} submitText={t('buttons.edit')} setIsOpen={setUpdateVehicleOpen} title={t('crud.editElement', { element: t('terms.vehicle') })} onSubmit={updateVehicle} onReset={() => setDeleteVehicleOpen(true)} resetText={t('crud.deleteElement', { element: t('terms.vehicle') })} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon} resetIcon={deleteIcon} >
                <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" initialValue={currentVehicle?.matricula} />
                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" initialValue={currentVehicle?.fecha_alta} />
                <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" initialValue={currentVehicle?.observaciones} />
                <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" initialValue={currentVehicle?.fecha_baja} />
            </FilterSection>
        }

        {/* Eliminar vehículo */}
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
                    { name: t('params.description'), cod: "observaciones", required: true },
                    { name: t('params.startDate'), cod: "fecha_alta", required: true },
                    { name: t('params.endDate'), cod: "fecha_baja", required: true },
                ]}
            />
        }


        {/*Página zonas de Mobility*/}
        <main className={styles['lists']}>
            <Box routes={[{ name: t('sections.ZONAS') }]} innerClassName={styles['box']}>

                {/*Listas*/}
                <section className={styles['left__section']}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setAddOpen(true)} permissionType='editar' />
                        {currentData && <ButtonComponent icon={editIcon} onClick={() => setEditOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered}/>
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV(false)} {...csvExport} />
                    </div>
                    <Table
                        results={data}
                        setData={setData}
                        rows={50}
                        primary_key={'cod_area'}
                        headers={[t('params.name'), t('params.zoneType')]}
                        columnStyles={['element--long', 'element--long']}
                        row_elements={['nombre_area', (i) => t('values.' + i.tipo_area)]}
                        sortElements={['nombre_area', 'type']}
                        sortAccesors={{ type: (i) => t('values.' + i.tipo_area) }}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={styles['table__content']}
                        hasCheckbox
                    />
                </section>

                {/*Vehiculos*/}
                <section className={styles['right__section']}>
                    <h2 className={styles['right__section__title']}>{t('titles.vehicles')}</h2>
                    <h2 className='subtitle'>{vehicleSubtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertVehicleOpen(true)} permissionType='editar' />
                        <ButtonComponent text={t('buttons.import')} icon={importIcon} onClick={() => setImportExcelOpen(true)} permissionType='editar' />
                        {currentVehicle && <ButtonComponent icon={editIcon} onClick={() => setUpdateVehicleOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                        <ButtonComponent onClick={() => setFilterVehicleOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={vehicleFiltered}/>
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvVehiclesRef.current?.link?.click()} />
                        <CSVLink ref={csvVehiclesRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV(true)} {...csvVehiclesExport} />
                    </div>
                    <Table
                        results={zoneVehicles}
                        setData={setZoneVehicles}
                        rows={50}
                        primary_key={'cod_autorizado'}
                        headers={[t('params.licensePlate'), t('params.description')]}
                        columnStyles={['element--long', 'element--long']}
                        row_elements={['matricula', 'observaciones']}
                        sortElements={['matricula', 'observaciones']}
                        currentData={currentVehicle}
                        setCurrentData={setCurrentVehicle}
                        className={styles['table__content']}
                        hasCheckbox
                    />
                </section>

            </Box>
        </main>
    </>
}