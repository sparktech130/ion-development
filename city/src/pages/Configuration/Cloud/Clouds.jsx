// Librerias
import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Componentes
import { Box } from '@components/Box/Box'
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'
import { ConsultingGrid } from '@components/ConsultingGridImage/ConsultingGrid'
import { Table } from '@components/Table/Table'
import { TextModal } from '../../../components/TextModal/TextModal'
import { SyncModal } from './SyncModal/SyncModal'
import { ButtonComponent } from '../../../components/ButtonComponent/ButtonComponent'
import { CSVLink } from 'react-csv'

//API
import { URL_ELIMINAR_CLOUDS, URL_INSERTAR_CLOUDS, URL_MODIFICAR_CLOUDS, URL_OBTENER_CLOUDS, URL_ONTENER_DISPOSITIVOS_SYNC } from '@api/connections/urls';

//Utils
import { numberConversion } from '@utils/conversions';
import { handleKey } from '@utils/functions/accessibility';
import { checkArray } from '../../../utils/functions/functions'

//Context
import MainDataContext from '@context/MainDataContext'

//Icons
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import update from '@icons/actions/update.svg?react'
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import deviceIcon from '@icons/devices/camera.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Styles
import consultingStyles from '@styles/sections/Consulting.module.css'
import cardStyle from '@styles/card.module.css'


export function Clouds() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage, codSector } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los clouds
    const [clouds, setClouds] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Dispositivos para sincronizar
    const [devices, setDevices] = useState(undefined)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [syncConfirmationOpen, setSyncConfirmationOpen] = useState(false)
    const [syncOpen, setSyncOpen] = useState(false)
    const [syncMessage, setSyncMessage] = useState('')

    //Export
    const csvRef = useRef()

    //Botones para los filterSection
    const buttons = [
        {
            text: t('crud.deleteElement', { element: 'cloud' }),
            red: true,
            loading: false,
            onClick: () => { setEditOpen(false); setDeleteOpen(true) },
            icon: deleteIcon
        }
    ]

    //*-------------------------------------LLAMADAS API------------------------------------------------*//

    //Obtiene clouds
    const getClouds = async (payload, codCloudToSync) => {
        try {

            //Clouds que mostraremos
            let data = undefined

            //Iniciamos pantalla de carga
            setIsLoading(true)

            //Parametros que pasaremos a la función.
            const params = {
                nombre: payload?.nombre,
                cod_sector: codSector
            }

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) =>
                key !== 'cod_sector' && (
                    value !== null &&
                    value !== undefined &&
                    value !== '' &&
                    value.length !== 0
                )
            );

            setDataFiltered(isFiltering)
            !isFiltering && handleReset({})

            //Llamada a la API
            data = await requestAPI(URL_OBTENER_CLOUDS, params)

            //Control de errores
            if (data.message || !checkArray(data)) {
                setIsLoading(false)
                setInfoMessage(data.message || t('messages.resultsNone'))
                setSubtitle(t('messages.resultsNone'))
                return
            }

            //Asignación de datos en los respectivos useState.
            setClouds(data)

            //Sincronización nuevo cloud si venimos de añadir un cloud
            if (codCloudToSync) {
                //Buscamos el cloud nuevo
                let cloud = data.find(item => parseInt(item.cod_cloud) === parseInt(codCloudToSync))

                //Si lo encontramos lo seleccionamos y lo sincronizamos
                if (cloud?.cod_cloud) {
                    setCurrentData(cloud)
                    handleSync(cloud?.cod_cloud, true)
                } else {
                    setCurrentData(data[0])
                    setTimeout(() => {
                        setIsLoading(false)
                    }, 300);
                }
            } else {
                setCurrentData(data[0])
                setTimeout(() => {
                    setIsLoading(false)
                }, 300);
            }
            isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: t(numberConversion(data.length)) })) : setSubtitle(t('messages.results', { value: numberConversion(data.length) }))


        } catch (error) {

            //Finalizamos pantalla de carga mostrando mensaje de advertencia
            setIsLoading(false)
            setClouds([])
            setInfoMessage(t('errors.request'))
            setSubtitle(t('messages.resultsNone'))
        }

    }

    //Inserta el Cloud
    const insertClouds = async (payload) => {

        try {

            //Ocultamos modal de inserción
            setInsertOpen(false)

            //Iniciamos pantalla de carga
            setIsLoading(true)

            //Parametros que pasaremos a la función.
            const params = {
                nombre: payload?.nombre,
                systemId: payload?.systemId,
                user: payload?.user,
                password: payload?.password,
                cloud_user: payload?.cloud_user,
                cloud_password: payload?.cloud_password,
                cod_sector: codSector
            }

            //Llamada para insertar dispositivo
            let data = await requestAPI(URL_INSERTAR_CLOUDS, params)

            //Control de errores
            if (data.error) {
                setIsLoading(false)
                setInfoMessage(data.message)
                return
            }

            //Volvemos a pedir los clouds para mostrar los actualizados pasándole el código del cloud para que pida sincronizar dispositivos
            getClouds(undefined, data)

        } catch (error) {

            //Finalizamos pantalla de carga mostrando mensaje de advertencia
            setIsLoading(false)
            setInfoMessage(t('errors.request'))

        }

    }

    //Modifica el Cloud
    const editClouds = async (payload) => {

        try {

            //Ocultamos modal de edición
            setEditOpen(false)

            //Iniciamos pantalla de carga
            setIsLoading(true)

            //Parametros que pasaremos a la función.
            const params = {
                cod_cloud: currentData?.cod_cloud,
                nombre: payload?.nombre,
                systemId: payload?.systemId,
                user: payload?.user,
                password: payload?.password ? payload?.password : undefined,
                cloud_user: payload?.cloud_user,
                cloud_password: payload?.cloud_password ? payload?.cloud_password : undefined
            }

            //Llamada para editar dispositivos
            let data = await requestAPI(URL_MODIFICAR_CLOUDS, params)

            //Control de errores
            if (data.error) {
                setIsLoading(false)
                setInfoMessage(data.message)
                return
            }

            //Volvemos a pedir los clouds para mostrar los actualizados
            getClouds() //el loading se quita aquí
            setInfoMessage(t('crud.elementEdited'))

        } catch (error) {

            //Finalizamos pantalla de carga mostrando mensaje de advertencia
            setIsLoading(false)
            setInfoMessage(t('error.request'))
        }

    }

    //Elimina el Cloud
    const deleteClouds = async () => {

        try {

            //Ocultamos modal de edición
            setDeleteOpen(false)

            //Iniciamos pantalla de carga
            setIsLoading(true)

            //Parametros que pasaremos a la función.
            const params = {
                cod_cloud: currentData?.cod_cloud
            }

            //Llamada para eliminar clouds
            let data = await requestAPI(URL_ELIMINAR_CLOUDS, params)

            //Control de errores
            if (data.error) {
                setIsLoading(false)
                setInfoMessage(data.message)
                return
            }

            //Volvemos a pedir los clouds para mostrar los actualizados
            getClouds() //el loading se quita aquí
            setInfoMessage(t('crud.elementDeleted'))

        } catch (error) {

            //Finalizamos pantalla de carga mostrando mensaje de advertencia
            setIsLoading(false)
            setInfoMessage(t('errors.request'))
        }
    }

    //Obtiene los dispositivos detectados de un cloud pendientes de añadir en plataforma
    const handleSync = async (cod, isNewCloud) => {

        //Contrtol si no se pasa cod
        if (!cod) {
            setIsLoading(false)
            //Solo muestro mensajes de error si se le ha dado a botón sync, no cuando se pide automático al añadir
            if (!isNewCloud) {
                setInfoMessage(t('messages.noItemSelected'))
            }

        } else {
            try {
                //Iniciamos pantalla de carga
                setIsLoading(true)

                //Llamada para pedir dispositivos pendientes del cloud
                let data = await requestAPI(URL_ONTENER_DISPOSITIVOS_SYNC, { cod_cloud: cod })

                //Control errores
                if (data.error || !checkArray(data)) {
                    if (!isNewCloud) {
                        setInfoMessage(data.message || t('messages.noNewDevicesFound'))
                        //Si no hay dispositivos sync y es un cloud nuevo mostramos que se ha añadido correctamente
                    } else {
                        setInfoMessage(t('crud.elementAdded'))
                    }
                    setIsLoading(false)
                    return
                }

                //Guardamos datos
                setDevices(data)
                if (isNewCloud) {
                    setSyncMessage(t('messages.cloudHasAssociatedDevices'))
                } else {
                    setSyncMessage(t('messages.newDevicesDetected', { count: data.length }))
                }
                setSyncConfirmationOpen(true)
                setIsLoading(false)

                //Error
            } catch {
                if (!isNewCloud) {
                    setInfoMessage(t('errors.request'))
                    setIsLoading(false)
                }
            }
        }
    }


    //*------------------------------------------FILTRO------------------------------------------------*//

    //limpia filtros
    const handleReset = () => {
        setFilterState({})
    }

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = clouds.filter(x => x.checked)
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
        data: clouds.filter(value => value.checked === true),
        headers: [
            { label: "ID", key: "systemId" },
            { label: t('params.name'), key: "nombre" },
            { label: t('params.verticalMarket'), key: "nombre_sector" },
            { label: t('params.user'), key: "user" },
            { label: t('params.cloudUser'), key: "cloud_user" },
        ],
        filename: t('sections.CLOUD') + '.csv'
    };


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los datos
    useEffect(() => {
        getClouds()
        //eslint-disable-next-line
    }, [])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            handleReset()
        }
        //eslint-disable-next-line
    }, [filterOpen])



    return (
        <>

            {/*Filtrar cloud*/}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: 'clouds' })} onSubmit={(p) => getClouds(p, undefined)} onReset={() => setFilterState({})} rows={1} unequalRows columns={1} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                    <FilterSectionElement title={t('params.name')} name="nombre" inputType="text" />

                </FilterSection>
            }

            {/*Insertar cloud*/}
            {insertOpen &&
                <FilterSection setIsOpen={setInsertOpen} title={t('crud.addElement', { element: 'cloud' })} onSubmit={insertClouds} rows={3} unequalRows columns={2} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

                    {/*Columna 1*/}
                    <FilterSectionElement title={t('params.systemId')} name="systemId" inputType="text" required />
                    <FilterSectionElement title={t('params.user')} name="user" inputType="text" required />
                    <FilterSectionElement title={t('params.cloudUser')} name="cloud_user" inputType="text" required />

                    {/*Columna 2*/}
                    <FilterSectionElement title={t('params.systemName')} name="nombre" inputType="text" required />
                    <FilterSectionElement title={t('params.password')} name="password" inputType="password" required />
                    <FilterSectionElement title={t('params.cloudPassword')} name="cloud_password" inputType="password" required />

                </FilterSection>
            }

            {/* Editar cloud */}
            {editOpen && currentData &&
                <FilterSection setIsOpen={setEditOpen} title={t('crud.editElement', { element: 'cloud' })} onSubmit={editClouds} rows={3} unequalRows columns={2} submitText={t('buttons.edit')} buttons={buttons} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon}>

                    {/*Columna 1*/}
                    <FilterSectionElement title={t('params.systemId')} name="systemId" inputType="text" initialValue={currentData?.systemId} required />
                    <FilterSectionElement title={t('params.user')} name="user" inputType="text" initialValue={currentData?.user} required />
                    <FilterSectionElement title={t('params.cloudUser')} name="cloud_user" inputType="text" initialValue={currentData?.cloud_user} required />

                    {/*Columna 2*/}
                    <FilterSectionElement title={t('params.systemName')} name="nombre" inputType="text" initialValue={currentData?.nombre} required />
                    <FilterSectionElement title={t('params.password')} name="password" inputType="password" />
                    <FilterSectionElement title={t('params.cloudPassword')} name="cloud_password" inputType="password" />

                </FilterSection >
            }

            {/*Eliminar cloud*/}
            {deleteOpen && currentData &&
                <TextModal setIsOpen={setDeleteOpen} title={t('crud.deleteElement', { element: 'cloud' })} aceptar={() => deleteClouds()} cancelarRed cancelar={() => setDeleteOpen(false)}>{t('crud.deleteConfirmationName', { element: 'cloud', name: currentData?.nombre })}</TextModal>
            }

            {/* Sync confirmation */}
            {syncConfirmationOpen && devices &&
                <TextModal setIsOpen={setSyncConfirmationOpen} title={t('titles.info')} aceptar={() => setSyncOpen(true)} cancelarRed cancelar={() => setSyncConfirmationOpen(false)}>{syncMessage}</TextModal>
            }

            {/* Modal sincronizar dispositivos */}
            {syncOpen && devices && currentData &&
                <SyncModal cloud={currentData} setIsOpen={setSyncOpen} devices={devices} setDevices={setDevices} />
            }


            {/* Clouds */}
            <main className={consultingStyles['registers']}>
                <Box routes={[{ name: t('sections.CLOUD') }]}>

                    <h2 className='subtitle'>{subtitle}</h2>

                    {/* Botones */}
                    <div className={consultingStyles['button__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                        {currentData && <ButtonComponent icon={editIcon} onClick={() => setEditOpen(true)} permissionType='editar' text={t('buttons.edit')} />}
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.update')} icon={update} onClick={getClouds} />
                        {currentData && <ButtonComponent onClick={() => handleSync(currentData?.cod_cloud, false)} permissionType='editar' icon={deviceIcon} text={t('buttons.sync')} />}
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />


                        <ButtonComponent icon={grid} accesibleText={t('buttons.grid')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(false)} selected={!listStyle} right />
                        <ButtonComponent icon={list} accesibleText={t('params.list')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(true)} selected={listStyle} />
                    </div>


                    {listStyle

                        ? <Table
                            results={clouds}
                            setData={setClouds}
                            rows={50}
                            primary_key={'cod_cloud'}
                            headers={[
                                t('params.name'),
                                'ID',
                                t('params.verticalMarket'),
                                t('params.user'),
                                t('params.cloudUser')
                            ]}
                            columnStyles={['element--medium', 'element--medium', 'element--medium', 'element--medium', 'element--medium']}
                            row_elements={['nombre', 'systemId', 'nombre_sector', 'user', 'cloud_user']}
                            sortElements={['nombre', 'systemId', 'nombre_sector', 'user', 'cloud_user']}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            className={consultingStyles['table__content']}
                            hasCheckbox
                        />

                        : <div className={consultingStyles['grid']}>
                            <ConsultingGrid data={clouds} className={consultingStyles['grid__body--card']}>
                                {(item, index) =>
                                    <Card key={index} item={item} currentData={currentData} onClick={() => { setCurrentData(item) }} />
                                }
                            </ConsultingGrid>
                        </div>

                    }
                </Box>
            </main>
        </>
    )
}



/* Card */
export const Card = ({ item, onClick, currentData }) => {

    const { t } = useTranslation()
    const statusConversion = { 0: { text: 'off', color: '#E93636' }, 1: { text: 'on', color: '#4CD984' } };

    return (
        <div className={cardStyle['wrapper'] + ' ' + (currentData?.cod_cloud === item?.cod_cloud ? cardStyle['wrapper--selected'] : '')} onClick={onClick} tabIndex={0} onKeyDown={(e) => handleKey(e, onClick)}>


            <div className={cardStyle['section--column']}>
                <h3>Cloud</h3>
                <div className={cardStyle['second__line']}>
                    <h2>{`${item?.nombre}`}</h2>
                    <span className={cardStyle['separator']} />
                    <p>{item?.nombre_sector}</p>
                </div>
                <p>{`ID: ${item?.systemId}`}</p>
            </div>

            <hr />

            <div className={cardStyle['section--column']}>
                <div className={cardStyle['section--row']}>
                    <h2>{t('params.user')}:</h2>
                    <p>{item?.user}</p>
                </div>

                <div className={cardStyle['section--row']}>
                    <h2>{t('params.cloudUser')}:</h2>
                    <p>{item?.cloud_user}</p>
                </div>
            </div>

            <hr />

            <div className={cardStyle['section--row']}>
                <div className={cardStyle['info']}>
                    <span style={{ backgroundColor: statusConversion[1]?.color }} />
                    <p>{t('values.' + statusConversion[1]?.text)}</p>
                </div>
            </div>

        </div>
    )
}