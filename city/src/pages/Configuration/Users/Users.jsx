
//styles
import styles from "./Users.module.css"

//lib
import { useContext, useEffect, useMemo, useState, useRef } from "react"
import { numberConversion } from "../../../utils/conversions"
import { useTranslation } from "react-i18next"

//context
import MainDataContext from "../../../context/MainDataContext"

//components
import { Box } from "../../../components/Box/Box"
import { Table } from "../../../components/Table/Table"
import { FilterSection } from "../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../components/FilterSection/FilterSectionElement"
import { TextModal } from "../../../components/TextModal/TextModal"
import { VisualizationElement } from "../../../components/VisualizationElement/VisualizationElement"
import { ButtonComponent } from "../../../components/ButtonComponent/ButtonComponent"
import { AccesibleIcon } from "../../../components/AccesibleIcon/AccesibleIcon"
import { CSVLink } from 'react-csv'

//API
import { URL_OBTENER_PERMISOS_USUARIOS, URL_ELIMINAR_USUARIO, URL_INSERTAR_USUARIO, URL_MODIFICAR_USUARIO, URL_OBTENER_USER_LOGS, URL_OBTENER_USUARIOS } from "../../../api/connections/urls"
import { url_path } from "../../../constants/common"

//Utils
import { checkArray } from "../../../utils/functions/functions"

//icons
import icoLogo from "../../../assets/icons/logo/logo.svg?react"
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import exportIcon from '@icons/actions/download.svg?react'


export function ConfigurationUsers() {

    //Context
    const { setIsLoading, requestAPI, url_origin, setInfoMessage } = useContext(MainDataContext)

    //Tranlsate
    const { t } = useTranslation()

    //Modals
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)

    //State modals
    const [filterModalState, setFilterModalState] = useState({})
    const [userInfoModalState, setUserInfoModalState] = useState({})

    //Errores
    const [insertUpdateFieldsErrors, setInsertUpdateFieldsErrors] = useState({})

    //Usuarios
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [usuarios, setUsuarios] = useState([])
    const [userToDelete, setUserToDelete] = useState(undefined)
    const [currentData, setCurrentData] = useState(undefined)
    const [previousData, setPreviousData] = useState(undefined) //Guarda el currentData mientras abres modal insert

    //Logs
    const [userLogs, setUserLogs] = useState([])
    const [pageLogs, setPageLogs] = useState(1)

    //Permisos
    const [permisos, setPermisos] = useState([])

    //Export
    const csvRef = useRef()

    //Foto
    const urlFoto = useMemo(() => {
        if (currentData?.foto_perfil) {
            return `url(${url_origin + url_path}/${currentData?.foto_perfil})`
        }
        return ""
        //eslint-disable-next-line
    }, [currentData])


    //---------------------- API OBTENER DATOS ----------------------------------

    //Obtiene usuarios
    async function getData(payload = undefined) {

        try {
            setIsLoading(true)
            const prev = currentData

            //Limpia useStates
            setCurrentData(undefined)
            setPreviousData(undefined)
            setUserLogs([])

            //Pide usuarios
            const data = await requestAPI(URL_OBTENER_USUARIOS, payload)

            //Pide permisos si no se han pedido
            if (permisos?.length === 0) {
                const per = await requestAPI(URL_OBTENER_PERMISOS_USUARIOS)
                setPermisos(per)
            }

            //Actualiza currentData
            const coincidence = prev ? data.find(x => x.cod_usuario === prev?.cod_usuario) : undefined
            if (coincidence) {
                setCurrentData(coincidence)
            } else {
                setCurrentData(checkArray(data) ? data[0] : undefined)
            }

            //Subtitle
            if (data.message) {
                setSubtitle(t('messages.resultsNone'))
                return
            }

            setSubtitle(
                payload
                    ? t('messages.resultsFiltered', { value: t(numberConversion(data.length)) })
                    : t('messages.results', { value: numberConversion(data.length) })
            )

            //Guarda usuarios
            setUsuarios(data)
            setTimeout(() => {
                setIsLoading(false)
            }, 400);
        } catch {
            setIsLoading(false)
            setInfoMessage('errors.request')
        }

    }

    //Obtiene logs de un usuario
    async function getUserLogs(cod_usuario) {
        const data = await requestAPI(URL_OBTENER_USER_LOGS, { cod_usuario, limit: 100 })
        setTimeout(() => {
            setIsLoading(false)
        }, 200);
        if (data.message) {
            setUserLogs([])
        }
        setUserLogs(data)
    }

    //-------------------- USE EFFECT ---------------------------------

    //Pide datos iniciales
    useEffect(() => {
        getData()
        //eslint-disable-next-line
    }, [])

    //Pide logs al cambiar usuario
    useEffect(() => {
        setUserLogs([])
        if (currentData?.cod_usuario) {
            getUserLogs(currentData?.cod_usuario)
        }
        //eslint-disable-next-line
    }, [currentData])


    // ----------------------------- INSERT / UPDATE USER --------------------------

    //Inserta/Modifica usuario
    async function handleInsertUpdate(payload) {

        setIsLoading(true)
        const formData = new FormData()
        setInsertUpdateFieldsErrors({})

        //Editar usuario
        if (editOpen && currentData?.cod_usuario) {

            //se añaden los params al formData
            formData.append("cod_usuario", currentData?.cod_usuario)
            if (payload.apellidos !== currentData?.apellidos) formData.append("apellidos", payload.apellidos)
            if (payload.email !== currentData?.email) formData.append("email", payload.email)
            if (payload.nombre !== currentData?.nombre) formData.append("nombre", payload.nombre)
            if (payload.nombre_usuario !== currentData?.nombre_usuario) {
                formData.append("nombre_usuario", payload.nombre_usuario)
                formData.append("login", payload.nombre_usuario)
            }
            if (payload.telefono !== currentData?.telefono) formData.append("telefono", payload.telefono)
            if (payload.password) formData.append("password", payload.password)
            if (payload.permisos?.cod_permiso) formData.append("permisos", payload.permisos.cod_permiso)
            if (payload.image) formData.append("foto_perfil", payload.image)

            //Se modifica usuario
            const response = await requestAPI(URL_MODIFICAR_USUARIO, formData)

            if (response.error) {
                setIsLoading(false)
                setEditOpen(false)
                setInfoMessage(response.message)
                return
            }

            handleExitCreateUpdate()

            //Insert usuario
        } else if (insertOpen) {
            formData.append("apellidos", payload.apellidos)
            formData.append("email", payload.email)
            formData.append("nombre", payload.nombre)
            formData.append("nombre_usuario", payload.nombre_usuario)
            formData.append("login", payload.nombre_usuario)
            formData.append("permisos", payload.permisos.cod_permiso)
            formData.append("password", payload.password)
            if (payload.telefono) formData.append("telefono", payload.telefono)
            if (payload.image) formData.append("foto_perfil", payload.image)

            //INserta el usuario
            const response = await requestAPI(URL_INSERTAR_USUARIO, formData)

            if (response.campos_repetidos) {
                const errors = {}
                response.campos_repetidos.forEach(x => {
                    errors[x] = "Campo repetido"
                })
                setInsertUpdateFieldsErrors(errors)
                setIsLoading(false)
                return
            }

            if (response.error) {
                setIsLoading(false)
                setInsertOpen(false)
                setInfoMessage(response.message)
                return
            }

            handleExitCreateUpdate()

        }

        //Actualiza datos
        await getData()
    }

    //Gestiona cierre modal insert/update
    function handleExitCreateUpdate() {
        //pone prev en currentData
        if (previousData) {
            setPreviousData(prev => {
                setCurrentData(prev)
                return undefined
            })
        }
        //Cierra modales y limpia errores
        setInsertOpen(false)
        setEditOpen(false)
        setInsertUpdateFieldsErrors({})
    }

    //Abrir modal insert
    function handleOpenAdd() {
        setInsertOpen(true)
        setUserInfoModalState({})
        //Guarda currentData en prev y lo pone undefined
        setCurrentData(prev => {
            setPreviousData(prev)
            return undefined
        })
    }

    //Abrir modal editar
    function handleOpenEdit() {
        if (!currentData?.cod_usuario) {
            return
        }
        setEditOpen(true)
        //Pone valores por defecto
        setUserInfoModalState({
            nombre_usuario: currentData?.nombre_usuario || "",
            nombre: currentData?.nombre || "",
            email: currentData?.email || "",
            permisos: currentData?.nombre_permiso ? permisos.find(x => x.nombre_permiso === currentData?.nombre_permiso) : undefined,
            apellidos: currentData?.apellidos || "",
            telefono: currentData?.telefono || "",
        })

    }

    //---------------------ELIMINAR USUARIO---------------------------------

    //Asigna el usuario a eliminar
    function handleDeleteUser() {
        setUserToDelete(currentData)
    }

    //Elimina usuario
    async function confirmDelete() {

        setEditOpen(false)
        setIsLoading(true)

        let response = await requestAPI(URL_ELIMINAR_USUARIO, { cod_usuario: currentData?.cod_usuario })

        if (response.error) {
            setIsLoading(false)
            setInfoMessage(response.message)
            return
        }

        setCurrentData(undefined)
        setPreviousData(undefined)
        getData()
    }


    // -------------------------------- FILTER -------------------------------------

    //Gestiona filtrar
    function handleFilter(payload) {
        const data = { ...payload }
        //deja el nombre_permiso para pasar el payload directo a la api
        if (data.permisos) data.permisos = data.permisos.nombre_permiso
        getData(data)
    }

    //*------------------------------------------EXPORTAR-----------------------------------------------*//


    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = usuarios.filter(x => x.checked)
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: usuarios.filter(value => value.checked === true),
        headers: [
            { label: 'ID', key: "cod_usuario" },
            { label: t('params.user'), key: "login" },
            { label: t('params.name'), key: "nombre" },
            { label: t('params.lastName'), key: "apellidos" },
            { label: t('params.permissions'), key: "nombre_permiso" },
            { label: t('params.email'), key: "email" },

        ],
        filename: t('sections.USUARIOS') + '.csv'
    };


    return (<>

        {/* Modal eliminar usuario */}
        {userToDelete &&
            <TextModal aceptar={confirmDelete} cancelarRed cancelar={() => setUserToDelete(undefined)} title={t('crud.deleteElement', { element: t('terms.user') })} setIsOpen={() => setUserToDelete(undefined)}>
                {t('crud.deleteConfirmation', { element: t('terms.user') })}
            </TextModal>
        }

        {/* Modal insertas/editar usuario */}
        {((insertOpen || editOpen) && !userToDelete) &&
            <FilterSection
                title={insertOpen ? t('crud.addElement', { element: t('terms.user') }) : t('crud.editElement', { element: t('terms.user') })}
                columns={3}
                rows={4}
                unequalRows
                state={userInfoModalState}
                onChange={setUserInfoModalState}
                errors={insertUpdateFieldsErrors}
                submitText={insertOpen ? t('buttons.add') : t('buttons.edit')}
                setIsOpen={handleExitCreateUpdate}
                onSubmit={handleInsertUpdate}
                submitIcon={editOpen ? editIcon : addIcon}
                buttons={[
                    editOpen && {
                        onClick: handleDeleteUser,
                        red: true,
                        text: t('buttons.delete'),
                        right: true,
                        icon: deleteIcon
                    }
                ]}
                noCloseOnSubmit
                customStyles={{ width: '70dvw', maxWidth: '750px' }}
            >

                {/* columna 1 */}
                <FilterSectionElement inputType="FILE" name="image" x={1} y={1} w={1} h={4} acceptImage hideHeader hideList>
                    {(urlFoto && !userInfoModalState?.image) &&
                        <div className={styles.buttonImageInput} style={{ background: urlFoto }}></div>
                    }
                </FilterSectionElement>

                {/* columna 2 */}
                <FilterSectionElement inputType="text" name="nombre_usuario" required title={t('params.user')} />
                <FilterSectionElement inputType="text" name="nombre" required title={t('params.name')} />
                <FilterSectionElement inputType="text" name="email" required title={t('params.email')} />
                <FilterSectionElement inputType="ITEMS" name="permisos" required title={t('params.permissions')} items={permisos} itemName="nombre_permiso" />

                {/* columna 3 */}
                <FilterSectionElement inputType="password" name="password" required={Boolean(insertOpen)} title={t('params.password')} />
                <FilterSectionElement inputType="text" name="apellidos" required title={t('params.lastName')} />
                <FilterSectionElement inputType="text" name="telefono" title={t('params.telefono')} />

            </FilterSection>
        }

        {/* Modal filtrar */}
        {filterOpen &&
            <FilterSection title={t('crud.filterElements', { elements: t('terms.users') })} setIsOpen={setFilterOpen} onSubmit={handleFilter} columns={3} rows={2} onReset={() => setFilterModalState({})} state={filterModalState} onChange={setFilterModalState} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitText={t('buttons.filter')} submitIcon={filterIcon}>

                {/* columna 1 */}
                <FilterSectionElement inputType="text" name="nombre_usuario" title={t('params.user')} />
                <FilterSectionElement inputType="text" name="email" title={t('params.email')} />

                {/* columna 2 */}
                <FilterSectionElement inputType="text" name="nombre" title={t('params.name')} />
                <FilterSectionElement inputType="text" name="telefono" title={t('params.telefono')} />

                {/* columna 3 */}
                <FilterSectionElement inputType="ITEMS" name="permisos" title={t('params.permissions')} items={permisos} itemName="nombre_permiso" />
                <FilterSectionElement inputType="text" name="apellidos" title={t('params.lastName')} />

            </FilterSection>
        }

        {/* Usuarios */}
        <Box routes={[{ name: t('sections.USUARIOS') }]} innerClassName={styles.layout}>

            {/* Lista usuarios */}
            <section className={styles.usuarios}>
                <Box title={t('sections.USUARIOS')}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={handleOpenAdd} permissionType='editar' />
                        <ButtonComponent icon={editIcon} onClick={handleOpenEdit} permissionType='editar' text={t('buttons.edit')} />
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                    </div>
                    <div className={styles['list']}>
                        <Table
                            results={usuarios}
                            setData={setUsuarios}
                            rows={50}
                            primary_key={'cod_usuario'}
                            headers={['ID', t('params.user'), t('params.name'), t('params.lastName'), t('params.permissions'), t('params.email')]}
                            columnStyles={['element--short', 'element--short', 'element--short', 'element--short', 'element--short', 'element--medium']}
                            row_elements={['cod_usuario', 'login', 'nombre', 'apellidos', 'nombre_permiso', 'email']}
                            sortElements={['cod_usuario', 'login', 'nombre', 'apellidos', 'nombre_permiso', 'email']}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            className={styles['table__content']}
                            hasCheckbox
                        />
                    </div>
                </Box>
            </section>

            {/* Información */}
            <section className={styles.informacion}>
                <Box title={t('buttons.info')}>
                    <div className={styles.userInfo}>

                        <div className={styles.userDetails}>
                            {
                                urlFoto ?
                                    <div className={styles.imageWrapper} style={{ background: urlFoto }} />
                                    :
                                    <div className={styles.imagePlaceholder}>
                                        <AccesibleIcon src={urlFoto || icoLogo} alt="" />
                                    </div>
                            }
                            <ul>
                                <VisualizationElement title='ID' text={currentData?.cod_usuario} />
                                <VisualizationElement title={t('params.user')} text={currentData?.login} />
                                <VisualizationElement title={t('params.name')} text={currentData?.nombre} />
                                <VisualizationElement title={t('params.lastName')} text={currentData?.apellidos} />
                                <VisualizationElement title={t('params.email')} text={currentData?.email} />
                                <VisualizationElement title={t('params.telefono')} text={currentData?.telefono} />
                                <VisualizationElement title={t('params.permissions')} text={currentData?.nombre_permiso} />
                            </ul>
                        </div>

                        {/* Logs */}
                        <div className={styles['element__header']}>
                            <h3 className='bold'>{t('titles.records')}</h3>
                            <hr />
                        </div>

                        <div className={styles['list']}>
                            <Table
                                results={userLogs}
                                rows={50}
                                primary_key={"cod_log"}
                                headers={[t('params.date'), t('params.time'), t('params.module'), t('params.section'), t('params.action')]}
                                columnStyles={["element--short", "element--short", "element--short", "element--short", "element--medium"]}
                                row_elements={["fecha", "hora", "modulo", "nombre_seccion", (item) => t('logs.' + item.accion)]}
                                sortElements={["fecha", "hora", "modulo", "nombre_seccion", 'accion']}
                                sortAccesors={{
                                    accion: item => t('logs.' + item.accion)
                                }}
                                currentPage={pageLogs}
                                setCurrentPage={setPageLogs}
                                className={styles['table__content__logs']}
                                hideCount
                            />
                        </div>

                    </div>
                </Box>
            </section>
        </Box>
    </>)
}