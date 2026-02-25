import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv';

//Styles
import consultingStyles from '../../../styles/sections/Consulting.module.css'

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement'
import { TextModal } from '../../../components/TextModal/TextModal'
import { Table } from '../../../components/Table/Table'
import { InputExcel } from '../../../components/Inputs/InputExcel/InputExcel'
import { ButtonComponent } from '../../../components/ButtonComponent/ButtonComponent'


//Context
import MainDataContext from '../../../context/MainDataContext'

//Utils
import { numberConversion } from '../../../utils/conversions'

//Api
import { URL_OBTENER_VEHICULOS, URL_INSERTAR_VEHICULO, URL_ELIMINAR_VEHICULO, URL_MODIFICAR_VEHICULO, URL_IMPORTAR_VEHICULOS } from '../../../api/connections/urls'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import importIcon from '@icons/actions/folder.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import exportIcon from '@icons/actions/download.svg?react'


export const Vehicles = () => {

    //Context
    const { setIsLoading, setInfoMessage, requestAPI } = useContext(MainDataContext)

    //Translate
    const { t } = useTranslation()

    //Datos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState([])

    //Estado de los modales
    const [insertState, setInsertState] = useState({})
    const [filterState, setFilterState] = useState({})
    const [editState, setEditState] = useState({})

    //Modales
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [importExcelOpen, setImportExcelOpen] = useState(false)

    //Export
    const csvRef = useRef()

    //*------------------------------------API----------------------------------------*//

    //Obtiene los vehiculos mediante llamada normal o filtro
    const getVehicles = async (payload) => {

        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: payload?.matricula,
            marca: payload?.marca,
            modelo: payload?.modelo,
            color: payload?.color
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== '' &&
            value.length !== 0 &&
            value !== true
        );

        //Comprobar filtros activos / reset de filtros
        setDataFiltered(isFiltering)
        !isFiltering && setFilterState({})

        //Llamada API
        const requestPayload = isFiltering ? params : {}
        let data = await requestAPI(URL_OBTENER_VEHICULOS, requestPayload)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        if (Array.isArray(data?.rows)) {
            setData(data.rows)
            isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: t(numberConversion(data.rows.length)) })) : setSubtitle(t('messages.results', { value: numberConversion(data.rows.length) }))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Modifica vehículo seleccionado
    const editVehicle = async (payload) => {

        if (!currentData?.matricula) { return }

        setEditOpen(false)
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: currentData?.matricula,
            marca: payload?.marca,
            modelo: payload?.modelo,
            color: payload?.color
        }

        //Llamada para editar clientes
        let data = await requestAPI(URL_MODIFICAR_VEHICULO, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getVehicles()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setCurrentData(null)
        }, 500);
    }

    //Elimina vehículo
    const deleteVehicle = async () => {

        if (!currentData?.matricula) { return }

        setDeleteOpen(false)
        setEditOpen(false)
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: currentData?.matricula
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_ELIMINAR_VEHICULO, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Actualizamos datos
        getVehicles()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setCurrentData(null)
        }, 300);
    }

    //Insertar vehículo
    const insertVehicle = async (payload) => {

        setIsLoading(true)
        setInsertOpen(false)

        //Parametros que pasaremos a la función.
        const params = {
            matricula: payload?.matricula,
            marca: payload?.marca,
            modelo: payload?.modelo,
            color: payload?.color,
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_INSERTAR_VEHICULO, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Actualizamos datos
        getVehicles()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }

    //Importar archivo csv
    async function handleImportExcel(json, csvStr, csvFile) {
        const formData = new FormData()
        formData.append("archivo_csv", csvFile, "archivo_csv.csv")
        const response = await requestAPI(URL_IMPORTAR_VEHICULOS, formData, 'city')

        if (!response.error) {
            setImportExcelOpen(false)
            setInfoMessage(t('messages.fileImported'))
            getVehicles()
        } else {
            setInfoMessage(t('errors.importFailed'))
        }
    }


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data?.filter(x => x.checked) || []
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: data?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.licensePlate'), key: "matricula" },
            { label: t('params.brand'), key: "marca" },
            { label: t('params.model'), key: "modelo" },
            { label: t('params.color'), key: "color" },
        ],
        filename: t('sections.PADRON') + '.csv'
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial
    useEffect(() => {
        getVehicles()
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



    return (
        <>
            {/* Modal Filtrar */}
            {filterOpen &&
                <FilterSection zIndex={8} setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.vehicles') })} onSubmit={getVehicles} onReset={() => { setFilterState({}) }} rows={2} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>
                    <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" />
                    <FilterSectionElement title={t('params.brand')} name="marca" inputType="text" />
                    <FilterSectionElement title={t('params.color')} name="color" inputType="text" />
                    <FilterSectionElement title={t('params.model')} name="modelo" inputType="text" />
                </FilterSection>
            }

            {/*Modal Insertar */}
            {insertOpen &&
                <FilterSection zIndex={8} setIsOpen={setInsertOpen} title={t('crud.addElement', { element: t('terms.vehicle') })} onSubmit={insertVehicle} rows={2} columns={2} onChange={setInsertState} state={insertState} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>
                    <FilterSectionElement title={t('params.licensePlate')} name="matricula" inputType="text" required />
                    <FilterSectionElement title={t('params.brand')} name="marca" inputType="text" required />
                    <FilterSectionElement title={t('params.color')} name="color" inputType="text" required />
                    <FilterSectionElement title={t('params.model')} name="modelo" inputType="text" required />
                </FilterSection>
            }

            {/* Modal Editar */}
            {editOpen &&
                <FilterSection zIndex={8} setIsOpen={setEditOpen} title={t('crud.editElement', { element: t('terms.vehicle') })} onSubmit={editVehicle} rows={2} columns={2} onChange={setEditState} state={editState} submitText={t('buttons.edit')} onReset={() => setDeleteOpen(true)} resetText={t('crud.deleteElement', { element: t('terms.vehicle') })} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon} resetIcon={deleteIcon}>
                    <FilterSectionElement title={t('params.brand')} name="marca" inputType="text" required initialValue={currentData.marca} />
                    <FilterSectionElement title={t('params.color')} name="color" inputType="text" required initialValue={currentData.color} />
                    <FilterSectionElement title={t('params.model')} name="modelo" inputType="text" required initialValue={currentData.modelo} />
                </FilterSection >
            }

            {/* Modal Eliminar */}
            {deleteOpen &&
                <TextModal zIndex={10} setIsOpen={setDeleteOpen} title={t('crud.deleteElement', { element: t('terms.vehicle') })} aceptar={deleteVehicle} cancelar={() => setDeleteOpen(false)} cancelarRed>{t('crud.deleteConfirmation', { element: t('terms.vehicle') })}</TextModal>
            }

            {/* Importar excel */}
            {importExcelOpen &&
                <InputExcel
                    onChange={handleImportExcel}
                    setVisible={setImportExcelOpen}
                    campos={[
                        { name: t('params.licensePlate'), cod: "matricula", required: true },
                        { name: t('params.color'), cod: "color", required: true },
                        { name: t('params.brand'), cod: "marca", required: true },
                        { name: t('params.model'), cod: "modelo", required: true },
                    ]}
                />
            }


            {/* Página de Padrón vehículos */}
            <main className={consultingStyles['consulting']}>
                <section className={consultingStyles['registers']}>
                    <Box routes={[{ name: t('sections.PADRON') }]}>
                        <h2 className='subtitle'>{subtitle}</h2>
                        <div className={consultingStyles['button__wrapper']}>
                            <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                            <ButtonComponent text={t('buttons.import')} icon={importIcon} onClick={() => setImportExcelOpen(true)} permissionType='editar' />
                            {currentData?.matricula && <ButtonComponent icon={editIcon} onClick={() => setEditOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                            <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                            <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                        </div>

                        <Table
                            results={data}
                            setData={setData}
                            rows={50}
                            primary_key={'matricula'}
                            headers={[t('params.licensePlate'), t('params.brand'), t('params.model'), t('params.color')]}
                            columnStyles={['element--short', 'element--short', 'element--short', 'element--short']}
                            row_elements={['matricula', 'marca', 'modelo', 'color']}
                            sortElements={['matricula', 'marca', 'modelo', 'color']}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            className={consultingStyles['table__content']}
                            hasCheckbox

                        />
                    </Box>
                </section>
            </main>
        </>
    )
}