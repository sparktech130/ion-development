// Librerias
import { useState, useEffect, useContext, useMemo, useRef } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv'

//Componentes
import { Box } from '@components/Box/Box'
import { FilterSection } from '@components/FilterSection/FilterSection';
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement';
import { Table } from '@components/Table/Table';
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent';


//Utils
import { numberConversion } from '@utils/conversions'
import { getAutocompleteUsers } from '@api/services/autocomplete';

//URLS
import { URL_OBTENER_USER_LOGS, URL_OBTENER_USER_SESSIONS } from '@api/connections/urls';

//Context
import MainDataContext from '@context/MainDataContext';

//Styles
import styles from '@styles/sections/DoubleList.module.css'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'
import exportIcon from '@icons/actions/download.svg?react'


export function Audit() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)

    //Translate
    const { t } = useTranslation()

    //Información de las sesiones
    const [data, setData] = useState([])
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [dataFiltered, setDataFiltered] = useState(false)
    const [currentData, setCurrentData] = useState([])

    //Información de los registros
    const [logs, setLogs] = useState([])
    const [logsFiltered, setLogsFiltered] = useState(false)
    const [logsSubtitle, setLogsSubtitle] = useState(t('messages.results', { value: 0 }))

    //Estado de los modales de insertar, filtrar y modificar
    const [filterState, setFilterState] = useState({})
    const [filterStateLogs, setFilterStateLogs] = useState({})

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterOpenLogs, setFilterOpenLogs] = useState(false)
    const [currentLog, setCurrentLog] = useState(null)

    //Autocompletar
    const [autocompleteUsers, setAutocompleteUsers] = useState([])

    //Export
    const csvRef = useRef()
    const csvLogsRef = useRef()

    //valores por defecto
    const defaultInitialDate = useMemo(() => moment().subtract(1, 'day').format('YYYY-MM-DD'), [])
    const defaultFinalDate = useMemo(() => moment().format('YYYY-MM-DD'), [])


    //*------------------------------------ API --------------------------------------------*//

    //Obtiene Sesiones
    const getSessions = async (payload) => {

        let today = moment();
        let yesterday = moment().add(-1, 'days');

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nombre_usuario: payload?.nombre_usuario?.name,
            ip: payload?.ip,
            fecha_ini: payload?.fecha_ini !== undefined ? payload?.fecha_ini : yesterday.format('YYYY-MM-DD'),
            fecha_fin: payload?.fecha_fin !== undefined ? payload?.fecha_fin : today.format('YYYY-MM-DD'),
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = (payload !== undefined) && Object.entries(params).some(([key, value]) =>
            value !== undefined &&
            value !== "" &&
            !(key === 'fecha_ini' && value === defaultInitialDate) &&
            !(key === 'fecha_fin' && value === defaultFinalDate)
        )

        setDataFiltered(isFiltering)
        !isFiltering && setFilterState({})

        //Llamada API
        const requestPayload = isFiltering ? params : { ...params, fecha_ini: defaultInitialDate, fecha_fin: defaultFinalDate }
        let data = await requestAPI(URL_OBTENER_USER_SESSIONS, requestPayload)


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
        isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: t(numberConversion(data.length)) })) : setSubtitle(t('messages.results', { value: numberConversion(data.length) }))

        //El loading se quita al actualizar los logs. Si no hay ningúna sesión lo quito aquí
        setTimeout(() => {
            if (!data[0]?.cod_sesion) setIsLoading(false)
        }, 500);
    }

    //Obtiene logs
    const getLogs = async (payload) => {

        setIsLoading(true)

        //Clouds que mostraremos
        let data = undefined

        //Parametros que pasaremos a la función.
        const params = {
            cod_usuario: currentData?.cod_usuario,
            cod_sesion: currentData?.cod_sesion,
            fecha_ini: payload?.fecha_ini,
            fecha_fin: payload?.fecha_fin
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = (payload !== undefined) && Object.values(payload).some(value =>
            value !== undefined &&
            value !== ""
        )
        setLogsFiltered(isFiltering)
        !isFiltering && setFilterStateLogs({})

        //Pedir datos
        data = await requestAPI(URL_OBTENER_USER_LOGS, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setLogsSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        setLogs(data)
        isFiltering ? setLogsSubtitle(t('messages.resultsFiltered', { value: t(numberConversion(data.length)) })) : setLogsSubtitle(t('messages.results', { value: numberConversion(data.length) }))

        setTimeout(() => {
            setIsLoading(false)
        }, 300);

    }


    //*--------------------------------- AUTOCOMPLETE --------------------------------------*//

    //Obtiene todos los clientes para asignarlos al autocompletar
    async function getAutocompletes() {
        const users = await getAutocompleteUsers()
        setAutocompleteUsers(users)
    }


    //*---------------------------------- USE EFFECT ---------------------------------------*//

    //Llamada inicial para obtener datos
    useEffect(() => {
        getSessions()
        getAutocompletes()
        //eslint-disable-next-line
    }, [])

    //Actualiza logs
    useEffect(() => {
        if (currentData?.cod_sesion) {
            setFilterStateLogs({})
            getLogs()
        } else {
            setLogs([])
            setLogsSubtitle(t('messages.resultsNone'))
        }
        //eslint-disable-next-line
    }, [currentData])

    //Borrar los filtros si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            setFilterState({})
        }

        if (!logsFiltered) {
            setFilterStateLogs({})
        }
        //eslint-disable-next-line
    }, [filterOpen, filterOpenLogs])


    //--------------------------FUNCIONES------------------------------

    //Pone la fecha en formato para mostrar a usuario
    const dateConverter = (item) => {
        if(!item) return '-'
        return moment(item, 'YYYY-MM-DD HH:mm:ss')?.format('L HH:mm:ss') || '-'
    }

    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = (isLogs) => {
        const registros = (isLogs ? logs : data)?.filter(x => x.checked) || []
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv (Sesiones)
    const csvExport = {
        data: data?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.sessionStart'), key: "entrada" },
            { label: t('params.sessionEnd'), key: "salida" },
            { label: t('params.duration'), key: "duracion" },
            { label: t('params.user'), key: "nombre_usuario" },
            { label: t('params.ipAddress'), key: "ip" },
        ],
        filename: t('terms.sessions') + '.csv'
    };

    //Exportar datos de la tabla a .csv (Registros)
    const csvLogsExport = {
        data: logs?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.date'), key: "fecha" },
            { label: t('params.time'), key: "hora" },
            { label: t('params.module'), key: "modulo" },
            { label: t('params.section'), key: "nombre_seccion" },
            { label: t('params.action'), key: "accion" },
        ],
        filename: t('terms.records') + '.csv'
    };


    return <>

        {/*Filtrar sesiones*/}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.sessions') })} onSubmit={getSessions} onReset={() => { setFilterState({}) }} rows={2} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.user')} name="nombre_usuario" inputType="ITEMS" items={autocompleteUsers} itemName='name' strictInput />
                <FilterSectionElement title={t('params.startDate')} name="fecha_ini" inputType="DATE" initialValue={defaultInitialDate} />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.ipAddress')} name="ip" inputType="text" />
                <FilterSectionElement title={t('params.endDate')} name="fecha_fin" inputType="DATE" initialValue={defaultFinalDate} />

            </FilterSection>
        }

        {/*Filtrar registros*/}
        {filterOpenLogs &&
            <FilterSection setIsOpen={setFilterOpenLogs} title={t('crud.filterElements', { elements: t('terms.records') })} onSubmit={getLogs} onReset={() => { setFilterStateLogs({}) }} rows={1} columns={2} onChange={setFilterStateLogs} state={filterStateLogs} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                <FilterSectionElement title={t('params.startDate')} name="fecha_ini" inputType="DATE" />
                <FilterSectionElement title={t('params.endDate')} name="fecha_fin" inputType="DATE" />

            </FilterSection>
        }

        {/* Modal visualizar registro */}
        {currentLog && currentData && 
            <FilterSection setIsOpen={()=>setCurrentLog(null)} title={`${t('titles.record')}: ${currentLog?.cod_log || ''}`} rows={5} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} unequalRows>

                <FilterSectionElement title={t('params.date')}>
                    <p style={{paddingLeft:8}}>{moment(currentLog?.fecha+' '+currentLog?.hora, 'YYYY-MM-DD HH:mm:ss')?.format('L HH:mm:ss') || '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.user')}>
                    <p style={{paddingLeft:8}}>{currentData?.nombre_usuario || '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.module')}>
                    <p style={{paddingLeft:8}}>{currentLog?.modulo || '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.description')} width={2}>
                    <p style={{paddingLeft:8}}>{currentLog?.accion ? t('logs.'+currentLog?.accion) : '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.impact')} width={2}>
                    <p style={{paddingLeft:8}}>{currentLog?.impact || '-'}</p>
                </FilterSectionElement>

                <FilterSectionElement title={t('params.action')}>
                    <p style={{paddingLeft:8}}>{currentLog?.accion|| '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title='IP'>
                    <p style={{paddingLeft:8}}>{currentData?.ip || '-'}</p>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.section')}>
                    <p style={{paddingLeft:8}}>{currentData?.nombre_seccion || '-'}</p>
                </FilterSectionElement>

            </FilterSection>
        }


        {/*Página Auditoría de Configuración*/}
        <main className={styles['lists']}>
            <Box routes={[{ name: t('sections.AUDITORIA') }, {name: t('sections.SESIONES')}]} innerClassName={styles['box']}>

                {/*Sesiones*/}
                <section className={styles['left__section']}>
                    <h2 className='subtitle'>{subtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                        <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV(false)} {...csvExport} />
                    </div>
                    <Table
                        results={data}
                        setData={setData}
                        rows={50}
                        primary_key={'cod_sesion'}
                        headers={[t('params.sessionStart'), t('params.sessionEnd'), t('params.duration'), t('params.user'), t('params.ipAddress')]}
                        columnStyles={['element--medium', 'element--medium', 'element--short', 'element--short', 'element--short']}
                        row_elements={[(item) => dateConverter(item?.entrada), (item) => dateConverter(item?.salida), 'duracion', 'nombre_usuario', 'ip']}
                        sortElements={['entrada', 'salida', 'duracion', 'nombre_usuario', 'ip']}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={styles['table__content']}
                        hasCheckbox
                    />
                </section>

                {/*Registros*/}
                <section className={styles['right__section']} style={{width:'790px'}}>
                    <h2 className={styles['right__section__title']}>{t('titles.records')}</h2>
                    <h2 className='subtitle'>{logsSubtitle}</h2>
                    <div className={styles['button__wrapper']}>
                        <ButtonComponent onClick={() => setFilterOpenLogs(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={logsFiltered}/>
                        <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvLogsRef.current?.link?.click()} />
                        <CSVLink ref={csvLogsRef} style={{ display: 'none' }} tabIndex={-1} onClick={() => handleSaveCSV(true)} {...csvLogsExport} />

                    </div>
                    <Table
                        results={logs}
                        setData={setLogs}
                        setCurrentData={setCurrentLog}
                        rows={50}
                        primary_key={'cod_log'}
                        headers={[t('params.date'), t('params.time'), t('params.module'), t('params.section'), t('params.action'), t('params.impact')]}
                        columnStyles={['element--short', 'element--short', 'element--short', 'element--short', 'element--short', 'element--short']}
                        row_elements={[(item) => moment(item.fecha).format('L'), 'hora', 'modulo', 'nombre_seccion', 'accion', 'impact']}
                        sortElements={['fecha', 'hora', 'modulo', 'nombre_seccion', 'accion', 'impact']}
                        className={styles['table__content']}
                        hasCheckbox
                    />
                </section>

            </Box>
        </main>
    </>
}