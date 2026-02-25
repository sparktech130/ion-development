import React, { useState, useEffect, useContext, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { CSVLink } from 'react-csv';
import moment from 'moment';

//Styles
import consultingStyles from '@styles/sections/Consulting.module.css'

//Componentes
import { Box } from '@components/Box/Box'
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'
import { Table } from '@components/Table/Table'
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'


//Context
import MainDataContext from '@context/MainDataContext'

//Utils
import { numberConversion } from '@utils/conversions'

//Api


//Icons
import filterIcon from '@icons/actions/filter.svg?react'
import exportIcon from '@icons/actions/download.svg?react'


export const SecurityAlerts = () => {

    //Context
    const { setIsLoading, setInfoMessage} = useContext(MainDataContext)

    //Translate
    const { t } = useTranslation()

    //Datos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Estado de los modales
    const [filterState, setFilterState] = useState({})

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)

    //Export
    const csvRef = useRef()

    //*------------------------------------API----------------------------------------*//

    //Obtiene datos
    const getData = async (payload) => {

        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            fecha_ini: payload?.fecha_ini,
            fecha_fin: payload?.fecha_fin,
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
        let data = {rows:[{cod_alerta:'4589', fecha:'25/11/2025', hora:'10:11:26', servidor:'Computer System', ip:'192.168.150', alerta: 'Certificado expirado', estado: 'Pendiente', severidad: '3 (Media)', descripcion: 'Se ha bloqueado el acceso a un usuario desde la IP 198.560.150 por ser insegura. Los datos de acceso son los siguientes: [usuario: johndoe, contraseña: ********]'}]}//await requestAPI(URL_OBTENER_VEHICULOS, params)

        //Control de errores
        if (data?.message) {
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
            { label: t('params.code'), key: "cod_alerta" },
            { label: t('params.date'), key: "fecha" },
            { label: t('params.time'), key: "hora" },
            { label: t('params.server'), key: "servidor" },
            { label: t('params.ipAddress'), key: "ip" },
            { label: t('params.alert'), key: "alerta" },
            { label: t('params.severity'), key: "severidad" },
            { label: t('params.status'), key: "estado" },
        ],
        filename: t('titles.records') + '.csv'
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial
    useEffect(() => {
        getData()
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            setFilterState({})
        }
        //eslint-disable-next-line
    }, [filterOpen])



    return (
        <>
            {/* Modal Filtrar */}
            {filterOpen &&
                <FilterSection zIndex={8} setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.alerts') })} onSubmit={getData} onReset={() => { setFilterState({}) }} rows={1} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                <FilterSectionElement title={t('params.startDate')} name="fecha_ini" inputType="DATE" />
                <FilterSectionElement title={t('params.endDate')} name="fecha_fin" inputType="DATE" />

                </FilterSection>
            }

            {/* Modal visualizar registro */}
            {currentData && 
                <FilterSection setIsOpen={()=>setCurrentData(null)} title={`${t('titles.record')}: ${currentData?.cod_alerta || ''}`} rows={4} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} unequalRows>
    
                    <FilterSectionElement title={t('params.date')}>
                        <p style={{paddingLeft:8}}>{moment(currentData?.fecha+' '+currentData?.hora, 'YYYY-MM-DD HH:mm:ss')?.format('L HH:mm:ss') || '-'}</p>
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.server')}>
                        <p style={{paddingLeft:8}}>{currentData?.servidor || '-'}</p>
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.description')} width={2}>
                        <p style={{paddingLeft:8}}>{currentData.descripcion || '-'}</p>
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.status')}>
                        <p style={{paddingLeft:8}}>{currentData?.estado || '-'}</p>
                    </FilterSectionElement>
    
                    <FilterSectionElement title={t('params.alert')}>
                        <p style={{paddingLeft:8}}>{currentData?.alerta || '-'}</p>
                    </FilterSectionElement>
                    <FilterSectionElement title='IP'>
                        <p style={{paddingLeft:8}}>{currentData?.ip || '-'}</p>
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.severity')}>
                        <p style={{paddingLeft:8}}>{currentData?.severidad || '-'}</p>
                    </FilterSectionElement>
    
                </FilterSection>
            }

            {/* Página de Alertas*/}
            <main className={consultingStyles['consulting']}>
                <section className={consultingStyles['registers']}>
                    <Box routes={[{ name: t('sections.ALERTAS') }]}>

                        <h2 className='subtitle'>{subtitle}</h2>

                        <div className={consultingStyles['button__wrapper']}>
                            <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={() => csvRef.current?.link?.click()} />
                            <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />
                        </div>

                        <Table
                            results={data}
                            setData={setData}
                            rows={50}
                            primary_key={'cod_alerta'}
                            headers={[t('params.date'), t('params.time'), t('params.server'), t('params.ipAddress'), t('params.alert'), t('params.status'), t('params.severity')]}
                            columnStyles={['element--short', 'element--short', 'element--medium', 'element--short', 'element--medium', 'element--short', 'element--short' ]}
                            row_elements={['fecha', 'hora', 'servidor', 'ip', 'alerta', 'estado', 'severidad']}
                            sortElements={['fecha', 'hora', 'servidor', 'ip', 'alerta', 'estado', 'severidad']}
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