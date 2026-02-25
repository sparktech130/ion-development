import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CSVLink } from "react-csv";

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { TextModal } from '../../../../../components/TextModal/TextModal'
import { Table } from '../../../../../components/Table/Table'
import { InputExcel } from '../../../../../components/Inputs/InputExcel/InputExcel'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent'

//API
import { URL_INSERTAR_INFRACCIONES_GESTION, URL_MODIFICAR_INFRACCIONES_GESTION, URL_ELIMINAR_INFRACCIONES_GESTION, URL_OBTENER_INFRACCIONES_GESTION, URL_IMPORTAR_INFRACCIONES_GESTION } from '../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import importIcon from '@icons/actions/folder.svg?react'
import exportIcon from '@icons/actions/download.svg?react'



export const Infringements = ({
    modulo // 15, 11, ...
}) => {

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de las infracciones
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
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
    const [importExcelOpen, setImportExcelOpen] = useState(false)

    //Export
    const csvRef = useRef();


    //*------------------------------------API----------------------------------------*//

    //Obtiene las infracciones mediante llamada normal o filtro
    const getInfringements = async (payload) => {

        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_modulo: modulo,
            cod_infraccion: payload?.cod_infraccion,
            desc_infraccion: payload?.desc_infraccion
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.entries(params).some(([key, value]) =>
            key !== 'cod_modulo' && (
                value !== null &&
                value !== undefined &&
                value !== '' &&
                value.length !== 0 &&
                value !== true
            )
        );
        setDataFiltered(isFiltering)

        if (!isFiltering) {
            data = await requestAPI(URL_OBTENER_INFRACCIONES_GESTION, { cod_modulo: modulo }, 'city')
            isFiltering = false
            setDataFiltered(false)
        } else {
            data = await requestAPI(URL_OBTENER_INFRACCIONES_GESTION, params, 'city')
            setDataFiltered(true)
        }

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        setCurrentData(data[0])
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: data.length })) : setSubtitle(t('messages.results', { value: data.length }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Modifica la infraccion seleccionada
    const editInfringement = async (payload) => {

        //Ocultamos modal de edición
        setEditOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_infraccion: currentData?.cod_infraccion,
            cod_infraccion_nuevo: payload?.cod_infraccion,
            desc_infraccion: payload?.desc_infraccion,
            importe_infraccion: payload?.importe_infraccion,
            importe_reducido: payload?.importe_reducido,
            puntos: payload?.puntos
        }

        //Llamada para editar clientes
        let data = await requestAPI(URL_MODIFICAR_INFRACCIONES_GESTION, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getInfringements()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementEdited'))
        }, 500);
    }

    //Elimina la infracción seleccionada
    const deleteInfringement = async () => {

        setDeleteOpen(false)
        setEditOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_infraccion: currentData?.cod_infraccion
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_ELIMINAR_INFRACCIONES_GESTION, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Actualizamos datos
        getInfringements()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementDeleted'))
        }, 300);
    }

    //Insertala nueva infracción
    const inserInfringement = async (payload) => {

        setInsertOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_infraccion: payload?.cod_infraccion,
            desc_infraccion: payload?.desc_infraccion,
            importe_infraccion: payload?.importe_infraccion,
            importe_reducido: payload?.importe_reducido,
            puntos: payload?.puntos,
            cod_modulo: modulo
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_INSERTAR_INFRACCIONES_GESTION, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Actualizamos datos
        getInfringements()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementAdded'))
        }, 300);
    }

    //Importar archivo csv
    async function handleImportExcel(json, csvStr, csvFile) {
        const formData = new FormData()
        formData.append("archivo_csv", csvFile, "archivo_csv.csv")
        formData.append("cod_modulo", modulo)
        const response = await requestAPI(URL_IMPORTAR_INFRACCIONES_GESTION, formData, 'city')

        if (!response.error) {
            setImportExcelOpen(false)
            setInfoMessage(t('messages.fileImported'))
            getInfringements()
        } else {
            setInfoMessage(t('errors.importFailed'))
        }
    }

    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial
    useEffect(() => {
        getInfringements()
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


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data?.filter(x => x.checked)
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: data?.filter(value => value.checked === true),
        headers: [
            { label: t('params.code'), key: "cod_infraccion" },
            { label: t('params.description'), key: "desc_infraccion" },
            { label: t('params.amount'), key: "importe_infraccion" },
            { label: t('params.reduced'), key: "importe_reducido" },
            { label: t('params.points'), key: "puntos" },
        ],
        filename: t('sections.INFRACCIONES') + '.csv'
    };


    return <>

        {/* Modal Filtrar */}
        {filterOpen &&
            <FilterSection zIndex={8} setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.infractions') })} onSubmit={getInfringements} onReset={() => { setFilterState({}) }} rows={2} columns={1} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>
                <FilterSectionElement title={t('params.code')} name="cod_infraccion" inputType="text" />
                <FilterSectionElement title={t('params.description')} name="desc_infraccion" inputType="text" />
            </FilterSection>
        }

        {/*Modal Insertar */}
        {insertOpen &&
            <FilterSection zIndex={8} setIsOpen={setInsertOpen} title={t('crud.addElement', { element: t('terms.infraction') })} onSubmit={inserInfringement} rows={2} columns={3} onChange={setInsertState} state={insertState} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>
                {/*Columna 1*/}
                <FilterSectionElement title={t('params.code')} name="cod_infraccion" inputType="text" required />
                <FilterSectionElement title={t('params.amount')} name="importe_infraccion" inputType="number" required />
                {/*Columna 2*/}
                <FilterSectionElement title={t('params.description')} name="desc_infraccion" inputType="text" required />
                <FilterSectionElement title={t('params.reduced')} name="importe_reducido" inputType="number" required />
                {/*Columna 3*/}
                <FilterSectionElement title={t('params.points')} name="puntos" inputType="number" required />
            </FilterSection>
        }

        {/* Modal Editar */}
        {editOpen &&
            <FilterSection zIndex={8} setIsOpen={setEditOpen} title={t('crud.editElement', { element: t('terms.infraction') })} onSubmit={editInfringement} rows={2} columns={3} onChange={setEditState} state={editState} submitText={t('buttons.edit')} onReset={() => setDeleteOpen(true)} resetText={t('crud.deleteElement', { element: t('terms.infraction') })} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon} resetIcon={deleteIcon}>
                {/*Columna 1*/}
                <FilterSectionElement initialValue={currentData?.cod_infraccion} title={t('params.code')} name="cod_infraccion" inputType="text" required />
                <FilterSectionElement initialValue={currentData?.importe_infraccion} title={t('params.amount')} name="importe_infraccion" inputType="number" required />
                {/*Columna 2*/}
                <FilterSectionElement initialValue={currentData?.desc_infraccion} title={t('params.description')} name="desc_infraccion" inputType="text" required />
                <FilterSectionElement initialValue={currentData?.importe_reducido} title={t('params.reduced')} name="importe_reducido" inputType="number" required />
                {/*Columna 3*/}
                <FilterSectionElement initialValue={currentData?.puntos} title={t('params.points')} name="puntos" inputType="number" required />
            </FilterSection >
        }

        {/* Modal Eliminar */}
        {deleteOpen &&
            <TextModal zIndex={10} setIsOpen={setDeleteOpen} title={t('crud.deleteElement', { element: t('terms.infraction') })} aceptar={() => deleteInfringement()} cancelarRed cancelar={() => setDeleteOpen(false)}>{t('crud.deleteConfirmation', { element: t('terms.infraction') })}</TextModal>
        }

        {/* Importar excel */}
        {importExcelOpen &&
            <InputExcel
                onChange={handleImportExcel}
                setVisible={setImportExcelOpen}
                campos={[
                    { name: t('params.code'), cod: "cod_infraccion", required: true },
                    { name: t('params.description'), cod: "desc_infraccion", required: true },
                    { name: t('params.amount'), cod: "importe_infraccion", required: true },
                    { name: t('params.reduced'), cod: "importe_reducido", required: true },
                    { name: t('params.points'), cod: "puntos", required: true },
                ]}
            />
        }


        {/*Página de Infracciones*/}
        <main className={consultingStyles['consulting']}>
            {/*Sección licencias*/}
            <section className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.INFRACCIONES') }]}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                        <ButtonComponent text={t('buttons.import')} icon={importIcon} onClick={() => setImportExcelOpen(true)} permissionType='editar' />
                        {currentData?.cod_infraccion && <ButtonComponent icon={editIcon} onClick={() => setEditOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />
                    </div>

                    <Table
                        results={data} 
                        setData={setData}
                        rows={50}
                        primary_key={'cod_infraccion'}
                        headers={[t('params.code'), t('params.description'), t('params.amount'), t('params.reduced'), t('params.points')]}
                        columnStyles={['element--shortplus', 'element--extralongplus', 'element--shortplus', 'element--shortplus', 'element--shortplus']}
                        row_elements={['cod_infraccion', 'desc_infraccion', 'importe_infraccion', 'importe_reducido', 'puntos']}
                        sortElements={['cod_infraccion', 'desc_infraccion', 'importe_infraccion', 'importe_reducido', 'puntos']}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={consultingStyles['table__content']}
                        hasCheckbox
                    />

                </Box>
            </section>
        </main>
    </>
}