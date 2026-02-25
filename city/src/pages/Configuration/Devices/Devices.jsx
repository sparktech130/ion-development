// Librerias
import React, { useState, useEffect, useContext, useMemo, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement'
import { CurrentDevice } from './CurrentDevice'
import { ConsultingGrid } from '../../../components/ConsultingGridImage/ConsultingGrid'
import { DeviceCard } from './DeviceCard'
import { InsertModal } from './Modals/InsertModal'
import { UpdateModal } from './Modals/UpdateModal'
import { Table } from '@components/Table/Table'
import { ButtonComponent } from '../../../components/ButtonComponent/ButtonComponent'
import { CSVLink } from 'react-csv'

//URLS
import { URL_OBTENER_DISPOSITIVOS, URL_OBTENER_MODELOS, URL_OBTENER_CATEGORIAS } from '../../../api/connections/urls'

//Context
import MainDataContext from '../../../context/MainDataContext'

//Icons
import update from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import addIcon from '@icons/actions/add.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

//Constantes
import { smartcity_modules } from '../../../constants/common'
import { modulesIcons } from '../../../constants/icons'

//Utils
import { numberConversion } from '../../../utils/conversions'
import { getAutocompleteClouds } from '../../../api/services/autocomplete'
import { checkArray } from '../../../utils/functions/functions'

//Styles
import consultingStyles from '../../../styles/sections/Consulting.module.css'



export function Devices() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)

    //Translate
    const { t } = useTranslation()

    //Información de los dispositivos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(undefined)

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Categrias, marcas y modelos
    const [categorias, setCategorias] = useState([])
    const [models, setModels] = useState([])

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)

    //Autocompletar
    const [autocompleteClouds, setAutocompleteClouds] = useState([])
    const [autocompleteCategories, setAutocompleteCategories] = useState([])

    //Filtrar
    const [filterState, setFilterState] = useState({})

    //Export
    const csvRef = useRef()

    const customIconsModules = useMemo(() => {
        return smartcity_modules.filter(elemento => !elemento.disabled && !elemento.noRequiresLicense).map((item) => ({ code: item.code, text: item.name_simplified, icon: modulesIcons[item.code] }))
    }, [])



    //*----------------------------------FUNCIONES DISPOSITIVOS----------------------------------------*//

    //Obtiene los dispositivos mediante llamada normal o filtro
    //@params si payload es true, significa que hacemos un reset de la llamada
    const getDevices = async (payload) => {

        //Reconocimientos que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nom_dispositivo: payload?.nom_dispositivo,
            cod_categoria: payload?.cod_categoria?.cod,
            cod_nodo: payload?.cod_nodo,
            cod_cloud: payload?.cod_cloud?.cod,
            modulos: payload?.modules,
            comprobarCanalActivo: false
        }

        //Si payload es true, reseteamos los filtros
        if (payload === true) { resetInputs() }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.values(params).some(param => param !== null && param !== undefined && param !== '' && param.length !== 0 && param !== false)

        setDataFiltered(isFiltering)
        !isFiltering && resetInputs({})

        //Petición datos
        data = await requestAPI(URL_OBTENER_DISPOSITIVOS, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: numberConversion(data.length) })) : setSubtitle(t('messages.results', { value: numberConversion(data.length) }))

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }


    //*------------------------------------FUNCIONES CATEGORÍAS Y MODELOS---------------------------------------*//

    //Obtiene las categorías
    const getCategorias = async () => {
        let data = await requestAPI(URL_OBTENER_CATEGORIAS, { cod_sector: '001' })
        setCategorias(data)
        if (checkArray(data)) {
            setAutocompleteCategories(data?.map(item => ({ cod: item?.cod_categoria, name: item?.nombre_categoria })))
        }
    }

    //Obtiene los modelos
    const getModels = async () => {
        let data = await requestAPI(URL_OBTENER_MODELOS)
        setModels(data)
    }


    //*------------------------------------------FILTRO------------------------------------------------*//


    //Reseteamos todos los inputs
    const resetInputs = () => {
        setFilterState({})
    }


    //*-----------------------------------------AUTOCOMPLETES------------------------------------------*//

    //Autocompletar
    const getAutocompletes = async () => {
        const cloudsCall = getAutocompleteClouds()
        const [clouds] = await Promise.all([cloudsCall]);
        setAutocompleteClouds(clouds)
    }


    //*------------------------------------------EXPORTAR-----------------------------------------------*//


    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data.filter(x => x.checked)
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
        data: data.filter(value => value.checked === true),
        headers: [
            { label: t('params.name'), key: "nom_dispositivo" },
            { label: t('params.category'), key: "tipo" },
            { label: t('params.brand'), key: "nombre_fabricante" },
            { label: t('params.model'), key: "nombre_modelo" },
        ],
        filename: t('sections.DISPOSITIVOS') + '.csv'
    };


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial
    useEffect(() => {
        getDevices(false)
        getCategorias()
        getModels()
        getAutocompletes()
        //eslint-disable-next-line
    }, [])

    //Gestión modal filtrar
    useEffect(() => {
        //Si se cierra
        if (!filterOpen) {
            //Si no estamos filtrando limpiamos inputs
            if (!dataFiltered) {
                resetInputs()
            }
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //Actualizar dispositivo seleccionado si cambian los datos
    useEffect(() => {
        currentData && setCurrentData(data.filter(device => device.cod_dispositivo === currentData?.cod_dispositivo)[0])
        //eslint-disable-next-line
    }, [data])


    return <>

        {/*Filtrar dispositivo*/}
        {filterOpen &&
            <FilterSection zIndex={6} setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t("terms.devices") })} onSubmit={getDevices} onReset={resetInputs} rows={3} columns={4} unequalRows onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} resetText={t('buttons.reset')} customStyles={{ width: '70dvw', maxWidth: '1050px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.name')} name='nom_dispositivo' inputType='text' />
                <hr style={{ gridColumnStart: 'span 4', height: '1px', background: 'var(--color-border)' }} />
                <FilterSectionElement title={t('params.modules')} name="modules" width={4} inputType="ICONS" customIcons={customIconsModules} disableSelectAll />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.category')} name='cod_categoria' inputType='ITEMS' items={autocompleteCategories} itemName='name' strictInput />

                {/*Columna 3*/}
                <FilterSectionElement title={t('params.node')} name='cod_nodo' inputType='text' />

                {/*Columna 4*/}
                <FilterSectionElement title="Cloud" name='cod_cloud' inputType='ITEMS' items={autocompleteClouds} itemName='name' strictInput />

            </FilterSection>
        }

        {/* Insertar nuevo dispositivo */}
        {insertOpen &&
            <InsertModal
                setIsOpen={setInsertOpen}
                getDevices={getDevices}

                clouds={autocompleteClouds}
                categorias={categorias}
                models={models}
            />
        }

        {/* Editar dispositivo */}
        {editOpen &&
            <UpdateModal
                setIsOpen={setEditOpen}
                device={currentData} setDevice={setCurrentData}
                getDevices={getDevices}

                clouds={autocompleteClouds}
            />
        }

        {/* Página de dispositivos */}
        <main>

            {!currentData
                ? <section className={consultingStyles['registers']}>
                    <Box routes={[{ name: t('sections.DISPOSITIVOS') }]}>

                        <h2 className='subtitle'>{subtitle}</h2>

                        {/* Botones */}
                        <div className={consultingStyles['button__wrapper']}>
                            <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={() => setInsertOpen(true)} permissionType='editar' />
                            <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                            <ButtonComponent text={t('buttons.update')} icon={update} onClick={getDevices} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                            <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                            <ButtonComponent icon={grid} accesibleText={t('buttons.grid')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(false)} selected={!listStyle} right />
                            <ButtonComponent icon={list} accesibleText={t('params.list')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={() => setListStyle(true)} selected={listStyle} />
                        </div>



                        {listStyle
                            ? <Table
                                results={data}
                                setData={setData}
                                rows={50}
                                className={consultingStyles['table__content']}
                                primary_key={'cod_dispositivo'}
                                headers={[t('params.name'), t('params.category'), t('params.brand'), t('params.model')]}
                                columnStyles={['element--medium', 'element--short', 'element--short', 'element--short']}
                                row_elements={[
                                    (item => `${item?.nom_dispositivo}`),
                                    (item => `${t('codes.deviceCategories.' + item?.cod_categoria)}`),
                                    (item => `${item?.nombre_fabricante ?? '-'}`),
                                    (item => `${item?.nombre_modelo ?? '-'}`),
                                ]}
                                sortElements={['nom_dispositivo', 'tipo', 'nombre_fabricante', 'nombre_modelo']}
                                sortAccesors={{
                                    tipo: item => `${t('codes.deviceCategories.' + item?.cod_categoria)}`,
                                }}
                                permissionType='consultas'
                                currentData={currentData}
                                setCurrentData={setCurrentData}
                                hasCheckbox
                            />

                            : <div className={consultingStyles['grid']}>
                                <ConsultingGrid data={data} className={consultingStyles['grid__body--card']}>
                                    {(item, index) =>
                                        <DeviceCard key={index} item={item} onClick={() => setCurrentData(item)} models={models} />
                                    }
                                </ConsultingGrid>
                            </div>
                        }

                    </Box>
                </section>

                : <CurrentDevice currentData={currentData} setCurrentData={setCurrentData} models={models} setEditOpen={setEditOpen} />
            }

        </main>
    </>
}