// Librerias
import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next';
import moment from 'moment';

//Componentes
import { Box } from '../../../../../components/Box/Box'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement';
import { Table } from '../../../../../components/Table/Table';
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';
import { CSVLink } from 'react-csv';

//Utils
import { numberConversion } from '../../../../../utils/conversions'
import { getAutocompleteUsers } from '../../../../../api/services/autocomplete';

//URLS
import { URL_OBTENER_LOGS_INVESTIGACIONES } from '../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../context/MainDataContext';

//Styles
import styles from './AnalyticAudit.module.css'
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'
import exportIcon from '@icons/actions/download.svg?react'

export function AnalyticAudit() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de los registros
    const [logs, setLogs] = useState([])
    const [isFiltering, setIsFiltering] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Estado de los modales de insertar, filtrar y modificar
    const [filterState, setFilterState] = useState({})

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)

    //Autocompletar
    const [autocompleteUsers, setAutocompleteUsers] = useState([])

    //Export
    const csvRef = useRef()


    //*------------------------------------API--------------------------------------------*//

    //Obtiene logs
    const getLogs = async (payload) => {

        setIsLoading(true)

        //Clouds que mostraremos
        let data = undefined

        //Parametros que pasaremos a la función.
        const params = {
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            cod_usuario: payload?.user?.cod,
            cod_investigacion: payload?.cod_investigacion
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = (payload !== undefined) && Object.values(payload).some(value => value !== undefined && value !== "")
        setIsFiltering(isFiltering)

        data = await requestAPI(URL_OBTENER_LOGS_INVESTIGACIONES, params, 'city')

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle(t('messages.resultsNone'))
            return
        }

        //Asignación de datos en los respectivos useState.
        if (Array.isArray(data?.rows)) {
            setLogs(data.rows)
            isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: data?.rows?.length })) : setSubtitle(t('messages.resultsTotal', { value: data?.rows?.length, total: numberConversion(data.count || 0) }))
        }
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }


    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Obtiene todos los clientes para asignarlos al autocompletar
    async function getAutocompletes() {
        const users = await getAutocompleteUsers()
        setAutocompleteUsers(users)
    }


    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = logs?.filter(x => x.checked) || []
        if (registros.length === 0) {
            setInfoMessage(t('messages.noItemSelected'))
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: logs?.filter(value => value.checked === true) || [],
        headers: [
            { label: t('params.date'), key: "fecha" },
            { label: t('params.time'), key: "hora" },
            { label: t('params.investigation'), key: "cod_investigacion" },
            { label: t('params.user'), key: "nombre_usuario" },
            { label: t('params.action'), key: "accion" },
        ],
        filename: t('sections.AUDITORIA') + '.csv'
    }



    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener las sesiones
    useEffect(() => {
        getAutocompletes()
        //eslint-disable-next-line
    }, [])

    //Llamada inicial para obtener los logs
    useEffect(() => {
        getLogs()
        //eslint-disable-next-line
    }, [])

    //Borrar los filtros si no estamos filtrando
    useEffect(() => {
        if (!isFiltering) {
            setFilterState({})
        }
        //eslint-disable-next-line
    }, [filterOpen, filterOpen])


    return <>

        {/*Filtrar registros*/}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.records') })} onSubmit={getLogs} onReset={() => { setFilterState({}) }} rows={2} columns={4} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                <FilterSectionElement title={'ID ' + t('terms.investigation')} name="cod_investigacion" inputType="number" />

                <FilterSectionElement title={t('params.endTime')} name="final_date" inputType="DATE" />
                <FilterSectionElement title={t('params.user')} name="user" inputType="ITEMS" items={autocompleteUsers} itemName='name' strictInput />

                <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                <span />

                <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />

            </FilterSection>
        }

        {/* Modal detalle registro */}
        {currentData &&
            <FilterSection setIsOpen={() => setCurrentData(null)} title={t('titles.record') + ": " + (currentData?.cod_log || '')} rows={6} columns={4} unequalRows customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.date')} ><p>{currentData.fecha || '-'}</p></FilterSectionElement>
                <FilterSectionElement width={4} hideHeader ><div className={styles['separator']} /></FilterSectionElement>


                <FilterSectionElement title={t('params.user')} ><p>{currentData.nombre_usuario || '-'}</p></FilterSectionElement>
                <FilterSectionElement width={4} hideHeader ><div className={styles['separator']} /></FilterSectionElement>

                <span />
                <FilterSectionElement title={t('params.action')} width={4} ><p>{t('logs.' + currentData.cod_accion)}</p></FilterSectionElement>


                {/*Columna 2*/}
                <FilterSectionElement title={t('params.time')} ><p>{currentData.hora || '-'}</p></FilterSectionElement>
                <span />


                {/*Columna 3*/}
                <span />
                <span />
                <FilterSectionElement title="" name="fixbug" inputType="text" className={{ display: 'none' }} disabled />


            </FilterSection>
        }

        {/*Página Auditoría de Analytic*/}
        <main className={consultingStyles['consulting']}>
            <Box routes={[{ name: t('sections.AUDITORIA') }]} className={consultingStyles['registers']}>
                <h2 className='subtitle'>{subtitle}</h2>
                <div className={consultingStyles['button__wrapper']}>
                    <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={() => setFilterOpen(true)} permissionType='consultas' />
                    <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                    <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />

                </div>

                <Table
                    results={logs}
                    setData={setLogs}
                    rows={50}
                    primary_key={'cod_log'}
                    headers={[t('params.date'), t('params.time'), t('params.investigation'), t('params.user'), t('params.action')]}
                    columnStyles={['element--shortplus', 'element--shortplus', 'element--shortplus', 'element--shortplus', 'element--extralong']}
                    row_elements={[(item) => moment(item.fecha).format('L'), 'hora', 'cod_investigacion', 'nombre_usuario', (item) => t('logs.' + item.cod_accion)]}
                    sortElements={['fecha', 'hora', 'cod_investigacion', 'nombre_usuario', 'accion']}
                    sortAccesors={{ accion: (item) => t('logs.' + item.cod_accion) }}
                    setCurrentData={setCurrentData}
                    className={consultingStyles['table__content']}
                    hasCheckbox
                />

            </Box>
        </main>
    </>
}