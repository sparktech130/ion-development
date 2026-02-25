//styles
import styles from "./Permissions.module.css"
import React, { useContext, useEffect, useState, useRef } from "react"

//context
import MainDataContext from "../../../context/MainDataContext"
import { useLoginDataContext } from "../../../context/LoginDataContext"
import { useTranslation } from "react-i18next"

//components
import { Box } from "../../../components/Box/Box"
import { Table } from "../../../components/Table/Table"
import { FilterSection } from "../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../components/FilterSection/FilterSectionElement"
import { InputToggle } from "../../../components/Inputs/InputToggle/InputToggle"
import { TextModal } from "../../../components/TextModal/TextModal"
import { DragScrollDiv } from "../../../components/DragScrollDiv/DragScrollDiv"
import { AccesibleIcon } from "../../../components/AccesibleIcon/AccesibleIcon"
import { ButtonComponent } from "../../../components/ButtonComponent/ButtonComponent"
import { CSVLink } from 'react-csv';

//API
import { URL_ELIMINAR_PERMISOS, URL_INSERTAR_PERMISOS, URL_MODIFICAR_PERMISOS, URL_OBTENER_PERMISOS_USUARIOS, URL_OBTENER_SECCIONES } from "../../../api/connections/urls"

//ICONS
import logoIco from "../../../assets/icons/logo/logo.svg?react"
import { sectionIcons, modulesIcons } from "../../../constants/icons"
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import saveIcon from '@icons/actions/save2.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Utils
import { numberConversion } from "../../../utils/conversions"

//Constants
import { smartcity_modules, home } from "../../../constants/common"
import { permissionsImplemented } from "./permissionsImplemented"


export function Permissions() {

    const { setIsLoading, requestAPI, hostname, setInfoMessage, codSector } = useContext(MainDataContext)
    const { checkLicenses } = useLoginDataContext()
    const { t } = useTranslation()

    //modales
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [permisoToDelete, setPermisoToDelete] = useState(undefined)
    const [filterModalState, setFilterModalState] = useState({})

    //tabla permisos
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(undefined)
    //valores
    const [permisos, setPermisos] = useState([])
    const [sections, setsections] = useState([])
    const [modulos, setModulos] = useState([])

    //checkbox
    const [checkboxs] = useState([
        { cod: "acceso", text: t('descriptions.access') },
        { cod: "consultas", text: t('descriptions.queries') },
        { cod: "editar", text: t('descriptions.edit') },
        { cod: "compartir", text: t('descriptions.share') },
    ])
    const [checkboxsState, setCheckboxsState] = useState(undefined) //estado de los checkbox del permiso seleccionado

    //selecciones
    const [suiteSelected, setSuiteSelected] = useState(undefined)
    const [moduloSelected, setModuloSelected] = useState(undefined)
    const [sectionSelected, setSectionSelected] = useState(undefined)

    //Export
    const csvRef = useRef()



    //---------------------USEEFFECTS----------------------------------

    //pide los datos iniciales
    useEffect(() => {
        pedirSecciones()
        pedirPermisos()
        //eslint-disable-next-line
    }, [])

    //cuando ya tiene las secciones selecciona una por defecto
    useEffect(() => {
        if (sections.length > 0) {
            handleSelectSuite(home?.[0])
        }
        //eslint-disable-next-line
    }, [sections])

    //-----------------------------API----------------------------------------------

    //pide secciones
    async function pedirSecciones() {
        let error = true
        try {
            //pide secciones
            let data = await requestAPI(URL_OBTENER_SECCIONES, { cod_sector_unico: codSector })
            if (data && Array.isArray(data)) {
                //quito secciones nuestras
                if ((hostname !== 'ionsmart.eu' && hostname !== 'ionsmart.cat')) {
                    data = data.filter(item => item.cod_seccion !== '0088' && item.cod_seccion !== '0089')
                }
                setsections(data)
                error = false
            }
        } finally {
            if (error) {
                setsections([])
            }
        }
    }

    //pide permisos
    async function pedirPermisos(payload, modificados) {
        setIsLoading(true)
        let error = true
        try {
            const response = await requestAPI(URL_OBTENER_PERMISOS_USUARIOS, payload)
            if (response && Array.isArray(response)) {
                setPermisos(response)
                setSubtitle(payload ? t('messages.resultsFiltered', { value: t(numberConversion(response.length)) }) : t('messages.results', { value: numberConversion(response.length) }))
                //selecciono uno
                if (response.length > 0) {
                    if (currentData?.cod_permiso) {
                        let updatedCurrentData = response.find(item => item.cod_permiso === currentData.cod_permiso)
                        if (updatedCurrentData) {
                            setCurrentData(updatedCurrentData)
                        } else {
                            setCurrentData(response[0])
                        }
                    } else {
                        setCurrentData(response[0])
                    }
                }
                error = false
            }
        } finally {
            setTimeout(() => {
                if (error) {
                    setSubtitle(t('messages.resultsNone'))
                    setPermisos([])
                }
                setIsLoading(false)
                if (modificados) {
                    setInfoMessage(t('crud.elementEdited'))
                }
            }, 300);
        }
    }

    //----------------------------- SELECT ------------------------------

    //selecciona suite
    function handleSelectSuite(suite) {
        setSuiteSelected(suite)
        //Smartcity
        if(suite.code === home[0].code) {
            let items = smartcity_modules?.filter(item => checkLicenses(item.code))
            setModulos(items)
            handleSelectModulo(items?.find(item => !item.disabled))
        //Demás módulos
        }else{
            handleSelectModulo(suite)
        }
    }

    //seleccionar módulo
    function handleSelectModulo(modulo) {
        if (modulo) {
            setModuloSelected(modulo)
            setSectionSelected(undefined)
            const section = sections.find(x => x.cod_modulo === modulo.code)
            if (section) {
                handleSelectSection(section)
            }
        } else {
            setModuloSelected(undefined)
        }
    }

    //seleccionar sección
    function handleSelectSection(section) {
        setSectionSelected(section)
    }


    // -------------------------------------- ADD / UPDATE ------------------------------------------------

    //abre modal editar
    function handleOpenEdit() {
        if (!currentData || !currentData?.cod_permiso) {
            return
        } else {
            setEditOpen(true)
        }
    }

    //cierra modales insert y edit
    function handleExitCreateUpdate() {
        setInsertOpen(false)
        setEditOpen(false)
    }

    //inserta/modifica un permiso
    async function handleInsertUpdate(payload) {
        setIsLoading(true)
        try {
            if (insertOpen) {
                await requestAPI(URL_INSERTAR_PERMISOS, payload)
            } else {
                const { cod_permiso } = currentData
                if (cod_permiso) {
                    await requestAPI(URL_MODIFICAR_PERMISOS, { ...payload, cod_permiso })
                }
            }
            pedirPermisos()
        } catch {
            setIsLoading(false)
        }
    }


    // --------------------------- DELETE --------------------------------

    //guarda el permiso que queremos borrar y con ello se abre el modal
    function handleDeletePermiso() {
        setPermisoToDelete(currentData)
    }

    //eliminar permiso
    async function confirmDelete() {
        try {
            setIsLoading(true)
            await requestAPI(URL_ELIMINAR_PERMISOS, { cod_permiso: permisoToDelete.cod_permiso })
            setPermisoToDelete(undefined)
            handleExitCreateUpdate()
            pedirPermisos()
        } catch {
            setIsLoading(false)
        }
    }

    // ------------------------ FILTER-------------------------------

    //filtra datos
    function handleFilter(payload) {
        pedirPermisos(payload)
    }

    //resetea filtros
    function resetFilter() {
        setFilterModalState({})
    }


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = permisos?.filter(x => x.checked) || []
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv (Zonas)
    const csvExport = {
        data: permisos?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.name'), key: "nombre_permiso" },
            { label: t('params.description'), key: "descripcion" },
        ],
        filename: t('sections.PERMISOS') + '.csv'
    };



    //------------------CHECKBOX---------------------------------------

    //click checkboc
    const onClickCheckbox = (cod) => {
        if (currentData?.cod_permiso !== '000001') {
            changeCheckbox(cod)
        } else {
            setInfoMessage(t('messages.cannotModifyAdmin'))
        }
    }

    //guarda el estado inicial del permiso seleccionado (para ir modificándolo)
    useEffect(() => {
        if (currentData) {
            let estados = currentData?.secciones
            if (Array.isArray(estados) && estados.length > 0) {
                setCheckboxsState(estados)
            } else {
                setCheckboxsState([])
            }
        } else {
            setCheckboxsState(undefined)
        }
    }, [currentData])

    //retorna el valor del checkbox actual para el tipo de accion (cod)
    const getCheckboxValue = (cod) => {
        let retorno = false
        if (checkboxsState && Array.isArray(checkboxsState) && cod) {
            let estado = checkboxsState.find(item => item.cod_seccion === sectionSelected.cod_seccion)
            if (estado) {
                retorno = estado[cod] > 0 ? true : false
            }
        }
        return retorno
    }

    //cambiar valor checkbox en el estado que tenemos guardado
    const changeCheckbox = (cod) => {
        if (checkboxsState && Array.isArray(checkboxsState) && cod) {
            let estado = checkboxsState.find(item => item.cod_seccion === sectionSelected.cod_seccion)
            //si ya existía un estado para esa sección la modifico
            if (estado) {
                setCheckboxsState(prevValue =>
                    prevValue.map(item => {
                        if (item.cod_seccion === sectionSelected.cod_seccion) {
                            return {
                                ...item,
                                [cod]: item[cod] === 0 ? 1 : 0,
                                modified: true
                            };
                        }
                        return item;
                    })
                )
                //si no existe la añadimos
            } else {
                setCheckboxsState(prevValue => [
                    ...prevValue,
                    {
                        cod_seccion: sectionSelected.cod_seccion,
                        acceso: 0,
                        consultas: 0,
                        editar: 0,
                        compartir: 0,
                        [cod]: 1,
                        modified: true
                    }
                ]);
            }
        }
    }

    //click guardar
    const onClickSave = () => {
        if (currentData.cod_permiso !== '000001') {
            guardarEstado()
        } else {
            setInfoMessage(t('messages.cannotModifyAdmin'))
        }
    }

    //guarda modificaciones checkbox en BD
    const guardarEstado = async () => {
        setIsLoading(true)
        let error = true
        try {
            if (Array.isArray(checkboxsState) && checkboxsState.length > 0 && currentData?.cod_permiso && currentData?.cod_permiso !== '000001') {
                //doy formato a secciones
                let secciones = []
                checkboxsState.forEach((item) => {
                    if (item.modified) {
                        secciones.push({
                            seccion: item.cod_seccion || 0,
                            acceso: item.acceso || 0,
                            consultas: item.consultas || 0,
                            editar: item.editar || 0,
                            compartir: item.compartir || 0
                        })
                    }
                })
                //api
                if (secciones.length > 0) {
                    let params = {
                        cod_permiso: currentData?.cod_permiso,
                        secciones: secciones
                    }
                    let data = await requestAPI(URL_MODIFICAR_PERMISOS, params)

                    if (data?.error) {
                        if (data.message) {
                            setInfoMessage(data.message)
                        } else {
                            setInfoMessage(t('errors.request'))
                        }
                    } else {
                        await pedirPermisos(null, true)
                        error = false
                    }
                }
            }
        } finally {
            if (error) {
                setIsLoading(false)
            }
        }
    }


    return (
        <>

            {/* modal eliminar */}
            {permisoToDelete &&
                <TextModal aceptar={confirmDelete} cancelarRed cancelar={() => setPermisoToDelete(undefined)} title={t('crud.deleteElement', { element: t('terms.permission') })} setIsOpen={() => setPermisoToDelete(undefined)}>
                    <p>{t('crud.deleteConfirmation', { element: t('terms.permission') })}</p>
                </TextModal>
            }

            {/* Modal insertar/Editar */}
            {((insertOpen || editOpen) && !permisoToDelete) &&
                <FilterSection
                    title={insertOpen ? t('crud.addElement', { element: t('terms.permission') }) : t('crud.editElement', { element: t('terms.permission') })}
                    columns={3}
                    submitText={insertOpen ? t('buttons.add') : t('buttons.edit')}
                    setIsOpen={handleExitCreateUpdate}
                    onSubmit={handleInsertUpdate}
                    submitIcon={insertOpen ? addIcon : editIcon}
                    buttons={[
                        editOpen && (currentData?.cod_permiso !== '000001') && {
                            onClick: handleDeletePermiso,
                            red: true,
                            text: t('buttons.delete'),
                            right: true,
                            icon: deleteIcon
                        }
                    ]}
                    customStyles={{ width: '70dvw', maxWidth: '750px' }}
                >
                    <FilterSectionElement inputType="text" name="nombre_permiso" required title={t('params.name')} initialValue={(editOpen && currentData) ? currentData?.nombre_permiso : undefined} />
                    <FilterSectionElement inputType="text" name="descripcion" required title={t('params.description')} w={2} x={2} initialValue={(editOpen && currentData) ? currentData?.descripcion : undefined} />
                </FilterSection>
            }

            {/* Modal filtrar */}
            {filterOpen &&
                <FilterSection title="Filtrar permisos" setIsOpen={setFilterOpen} onSubmit={handleFilter} columns={3} onReset={resetFilter} state={filterModalState} onChange={setFilterModalState} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitText={t('buttons.filter')} submitIcon={filterIcon}>
                    <FilterSectionElement inputType="text" name="nombre_permiso" title={t('params.name')} />
                    <FilterSectionElement inputType="text" name="descripcion" title={t('params.description')} w={2} x={2} />
                </FilterSection>
            }


            {/* Componente principal */}
            <Box routes={[{ name: t('sections.PERMISOS') }]} innerClassName={styles.layout}>

                {/* Sección tabla */}
                <div className={styles['permisos__wrapper']}>
                    <Box title={t('sections.PERMISOS')}>
                        <h2 className='subtitle'>{subtitle}</h2>
                        <div className={styles.button__wrapper}>
                            <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                            <ButtonComponent icon={editIcon} onClick={handleOpenEdit} permissionType='editar' text={t('buttons.edit')} />
                            <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                            <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV(false)} {...csvExport} />

                        </div>
                        <div>
                            <Table
                                results={permisos}
                                setData={setPermisos}
                                rows={50}
                                primary_key={'cod_permiso'}
                                headers={[t('params.name'), t('params.description')]}
                                columnStyles={['element--long', 'element--extralongplus']}
                                row_elements={['nombre_permiso', 'descripcion']}
                                sortElements={['nombre_permiso', 'descripcion']}
                                currentData={currentData}
                                setCurrentData={setCurrentData}
                                className={styles['table__content']}
                                hasCheckbox
                            />
                        </div>
                    </Box>
                </div>

                {/* Sección asignaciones */}
                <div className={styles['asignaciones__wrapper']}>

                    <div className={styles.asignaciones}>

                        {/* home */}
                        <Box title="suite" />
                        <DragScrollDiv>
                            <ul className={styles.scrollList}>
                                {home.filter(item => !item.disabled).map(x => (
                                    <li key={x.code} className={`${styles.listItem} ${x.code === suiteSelected?.code ? styles.active : ""}`}>
                                        <AccesibleIcon text={x?.name_code ? t(x?.name_code) : x?.name} src={modulesIcons[x?.code]} alt={x?.name_simplified} onClick={() => handleSelectSuite(x)} />
                                    </li>
                                ))}
                            </ul>
                        </DragScrollDiv>

                        {suiteSelected?.code === '0000' &&
                            <>

                                {/* Módulos */}
                                <Box title={t('params.modules')} />
                                <DragScrollDiv>
                                    <ul className={styles.scrollList}>
                                        {modulos.filter(item => !item.disabled).map(x => (
                                            <li key={x.code} className={`${styles.listItem} ${x.code === moduloSelected?.code ? styles.active : ""}`}>
                                                <AccesibleIcon text={x?.name_simplified} src={modulesIcons[x?.code]} alt={x?.name_simplified} onClick={() => handleSelectModulo(x)} />
                                            </li>
                                        ))}
                                    </ul>
                                </DragScrollDiv>
                            </>
                        }

                        {/* Secciones */}
                        <Box title={t('titles.sections')} />
                        <DragScrollDiv>
                            <ul className={styles.scrollList}>
                                {moduloSelected && sections.filter(x => x.cod_modulo === moduloSelected.code).map((x, i) => (
                                    <li key={i} className={`${styles.listItem} ${x.cod_seccion === sectionSelected?.cod_seccion ? styles.active : ""}`}>
                                        <AccesibleIcon text={t('sections.' + x?.nombre_seccion)} src={sectionIcons[x.nombre_seccion] || logoIco} alt={x?.nombre_seccion} onClick={() => handleSelectSection(x)} />
                                    </li>
                                ))
                                }
                            </ul>
                        </DragScrollDiv>

                        {/* Características */}
                        <Box title={t('titles.features')} />
                        <div className={styles['caracteristicas']}>
                            <ButtonComponent onClick={onClickSave} permissionType='editar' text={t('buttons.save')} icon={saveIcon} />
                            {
                                (currentData && moduloSelected && sectionSelected) &&
                                <ul className={styles.toggles}>
                                    {checkboxs.map(flag => (
                                        <React.Fragment key={flag.cod}>
                                            {(flag.cod === 'acceso' || (permissionsImplemented[sectionSelected.cod_seccion]?.includes(flag.cod))) &&
                                                <li onClick={() => { onClickCheckbox(flag.cod) }}>
                                                    <InputToggle disabled={currentData.cod_permiso === '000001'} value={currentData.cod_permiso === '000001' ? true : getCheckboxValue(flag.cod)} />
                                                    <span>{flag.text}</span>
                                                </li>
                                            }
                                        </React.Fragment>
                                    )
                                    )}
                                </ul>
                            }
                        </div>

                    </div>

                </div>
            </Box>
        </>
    )
}