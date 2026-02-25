// Librerias
import React, { useState, useEffect, useContext, useRef } from 'react';
import moment from 'moment'
import { useTranslation } from 'react-i18next';
import { CSVLink } from "react-csv";

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'
import cardStyles from '../../../../../styles/card.module.css'

//Componentes
import { Box } from '../../../../../components/Box/Box';
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement';
import { Campaign } from './Campaign/Campaign';
import { ConsultingGrid } from '../../../../../components/ConsultingGridImage/ConsultingGrid';
import { AccesibleIcon } from '../../../../../components/AccesibleIcon/AccesibleIcon';
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';
import { Table } from '../../../../../components/Table/Table';

//Utils
import { numberConversion } from '../../../../../utils/conversions';
import { validField } from '../../../../../utils/conversions';
import { handleKey } from '../../../../../utils/functions/accessibility';

//URLS
import { URL_OBTENER_CAMPAIGN } from '../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../context/MainDataContext';

//Icons
import iconItv from '../../../../../assets/icons/alerts/itv2.svg?react'
import iconInsurance from '../../../../../assets/icons/alerts/insurance.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'
import updateIcon from '@icons/actions/update.svg?react'
import list from '@icons/navbar/logs.svg?react'
import grid from '@icons/grid/grid.svg?react'
import exportIcon from '@icons/actions/download.svg?react'



export function Campaigns() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const {t} = useTranslation()

    //Opciones menú
    const [listStyle, setListStyle] = useState(false)

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //inputs
    const [customIcons] = useState([{code: 1, icon: iconItv, text: 'ITV'}, {code: 2, icon: iconInsurance, text: t('terms.insurance')}])

    //Export
    const csvRef = useRef();

    //*---------------------------------API--------------------------------------*//

    //Obtiene campañas
    const getCampaigns = async (payload) => {

        setIsLoading(true)

        //Parametros
        const params = {
            cod_campaign: payload?.cod_campaign,
            nombre_campaign: payload?.nombre_campaign,
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            estado_campaign: payload?.estado_campaign,
            cod_tipo_camp: payload?.type?.length>0 ? payload?.type[0] : undefined,
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = params.cod_tipo_camp || Object.entries(params).some(([key, value]) =>
            value !== null &&
            value !== undefined &&
            value !== ''
        );

        setDataFiltered(isFiltering)
        !isFiltering && resetFilter()

        //Llamada para obtener los resultados
        let data = await requestAPI(URL_OBTENER_CAMPAIGN, { ...params, limit: isFiltering ? 1000 : 200 }, 'city')

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos
        if (data.rows) {
            //Traduzco datos
            data.rows = data?.rows?.map(item=>({
                ...item,
                'tipo_traduccion': customIcons?.find(obj => parseInt(obj?.code) === parseInt(item?.cod_tipo_camp))?.text,
                'ratio': ((item?.alertas?.incidencias || 0) / (item?.alertas?.total_reconocimientos || 1) * 100)?.toFixed(2)+' %'
            }))
            setData(data.rows)
            isFiltering ? setSubtitle(t('messages.resultsFiltered', {value:data?.rows?.length})) : setSubtitle( t('messages.resultsTotal', {value:data?.rows?.length, total:(numberConversion(data?.count || '0'))}))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }


    //*------------------------------------------FILTRO------------------------------------------------*//

    //Reseteamos todos los filtros
    const resetFilter = () => {
        setFilterState({})
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getCampaigns()
        //eslint-disable-next-line
    }, [])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            resetFilter()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //*------------------------------------------EXPORTAR----------------------------------------------*//

    //comprobaciones antes de descargar csv
    const handleSaveCSV = () => {
        const registros = data.filter(x => x.checked)
        if (registros.length === 0) {
            if(listStyle){
                setInfoMessage(t('messages.noItemSelected'))
            }else{
                setInfoMessage(t('messages.selectItemsOnList'))
            }
            return false
        }
    }

    //Exportar datos de la tabla a .csv
    const csvExport = {
        data: data.filter(value => value.checked === true),
        headers: [
            { label: t('params.code'), key: "cod_campaign" },
            { label: t('params.name'), key: "nombre_campaign" },
            { label: t('params.status'), key: "estado_campaign" },
            { label: t('params.startDate'), key: "fecha_ini" },
            { label: t('params.endDate'), key: "fecha_fin" },
            { label: t('params.responsible'), key: "nombre_usuario" },
            { label: t('params.type'), key: "tipo_traduccion" },
            { label: t('titles.records'), key: "alertas.total_reconocimientos" },
            { label: t('sections.INFRACCIONES'), key: "alertas.incidencias" },
        ],
        filename: t('sections.CAMPAÑAS') + '.csv'
    };

    //------------------------------ONCLICK-----------------------------------

    //click campaña
    const onClickReport = (item) => {
        setIsLoading(true);
        setCurrentData(item)
    } 



    return (
        <>

            {/*Filtro*/}
            {filterOpen &&
                <FilterSection title={t('crud.filterElements', {elements:t('terms.campaigns')})} submitText={t('buttons.filter')} setIsOpen={setFilterOpen} onReset={resetFilter} onSubmit={getCampaigns} rows={3} columns={3} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '950px' }} submitIcon={filterIcon} unequalRows>

                    <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                    <FilterSectionElement title={t('params.code')} inputType="text" name='cod_campaign' />
                    <FilterSectionElement title={t('params.type')} name="type" width={3} inputType="ICONS" customIcons={customIcons} disableSelectAll selectOne />

                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                    <FilterSectionElement title={t('params.name')} inputType="text" name='nombre_campaign' />

                    <span />
                    <FilterSectionElement title={t('params.status')} name="estado_campaign" inputType="ITEMS" items={[t("values.En curso"), t("values.Finalizada")]} strictInput />

                </FilterSection>
            }


            {/* Página campañas */}
            {!currentData ?
                <main className={consultingStyles['registers']}>
                    <Box routes={[{name:t('sections.CAMPAÑAS')}]}>

                        <h2 className='subtitle'>{subtitle}</h2>

                        {/* Botones */}
                        <div className={consultingStyles['button__wrapper']}>
                            <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={()=>setFilterOpen(true)} permissionType='consultas' selected={dataFiltered} />
                            <ButtonComponent text={t('buttons.update')} icon={updateIcon} onClick={getCampaigns} />
                            <ButtonComponent text={t('buttons.export')} icon={exportIcon} permissionType="compartir" onClick={()=>csvRef.current?.link?.click()} />
                            <CSVLink ref={csvRef} style={{ display: 'none' }} tabIndex={-1} onClick={handleSaveCSV} {...csvExport} />
                            
                            <ButtonComponent icon={grid} accesibleText={t('buttons.grid')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={()=>setListStyle(false)} selected={!listStyle} right />
                            <ButtonComponent icon={list} accesibleText={t('params.list')} accesibleTextPosition={{ transform: 'translate(calc(-100% + 20px))' }} onClick={()=>setListStyle(true)} selected={listStyle} />
                        </div>

                        {/* Datos */}
                        {listStyle ? 
                            <Table
                                results={data}
                                className = {consultingStyles['table__content']}
                                setData={setData}
                                rows={50}
                                primary_key={'cod_campaign'}
                                headers={[
                                    t('params.startDate'),
                                    t('params.endDate'),
                                    t('params.code'),
                                    t('params.name'),
                                    t('params.type'),
                                    t('params.responsible'),
                                    t('titles.records'),
                                    t('sections.INFRACCIONES'),
                                    t('params.ratio'),
                                ]}
                                columnStyles={['element--shortplus','element--shortplus','element--shortplus','element--medium','element--shortplus','element--shortplus','element--shortplus','element--shortplus','element--shortplus',]}
                                row_elements={[
                                    (item => `${moment(item?.fecha_ini).format('L')}`),
                                    (item => `${moment(item?.fecha_fin).format('L')}`),
                                    "cod_campaign",
                                    'nombre_campaign',
                                    'tipo_traduccion',
                                    "nombre_usuario",
                                    item=>item?.alertas?.total_reconocimientos || '0',
                                    item=>item?.alertas?.incidencias || '0',
                                    "ratio"
                                ]}
                                sortElements={[
                                    'fecha_ini',
                                    'fecha_fin',
                                    'cod_campaign',
                                    'nombre_campaign',
                                    'tipo_traduccion',
                                    "nombre_usuario",
                                    "alertas.total_reconocimientos",
                                    "alertas.incidencias",
                                    "ratio"
                                ]}
                                sortAccesors={{
                                    cod_tipo_camp:  (item => customIcons?.find(obj => parseInt(obj?.code) === parseInt(item?.cod_tipo_camp))?.text || '-'),
                                }}
                                hasCheckbox
                                currentData={currentData}
                                setCurrentData={onClickReport}
                                permissionType='consultas'
                            />
                        :
                            <ConsultingGrid data={data} className={consultingStyles['grid__body--card']}>
                                {(item, index) =>
                                    <Card key={index} item={item} onClick={()=>onClickReport(item)} />
                                }
                            </ConsultingGrid>
                        }

                    </Box>
                </main>
                :
                <Campaign campaign={currentData} setCampaign={setCurrentData} />
            }
        </>
    )
}

export const Card = ({ item, onClick }) => {

    const {t} = useTranslation()

    return (

        <div className={cardStyles['wrapper']} onClick={onClick} tabIndex={0} onKeyDown={(e) => handleKey(e, onClick)}>

            <div className={cardStyles['section--column']}>

                <div className={cardStyles['first__line']}>
                    <h3>{validField(item?.nombre_usuario)}</h3>
                    <h3>{(item?.fecha_ini ? moment(item.fecha_ini).format('DD-MM-YYYY') : '-') + ' / ' + (item?.fecha_fin ? moment(item.fecha_fin).format('DD-MM-YYYY') : '-')}</h3>
                </div>

                <div className={cardStyles['second__line']}>
                    <h2>{validField(item?.nombre_campaign)}</h2>
                    <span className={cardStyles['separator']} />
                    <h3 className={(item?.estado_campaign === 'En curso') ? 'confidence--high' : (item?.estado_campaign === 'Finalizada') ? 'confidence--low' : 'confidence--medium'}>{validField(t('values.'+item?.estado_campaign))}</h3>
                </div>

                <p>{`ID: ${parseInt(item.cod_campaign)}`}</p>

            </div>

            <hr />


            <div className={cardStyles['center__wrapper']}>
                <h2>{item?.alertas?.incidencias || 0}</h2>
                <p>{t('terms.incidences')}</p>
                <span className={cardStyles['separator']} />
                <h2>{item?.alertas?.total_reconocimientos || 0}</h2>
                <p>{t('terms.records')}</p>
            </div>

            <hr />

            <div className={cardStyles['icons__wrapper']}>
                {item?.cod_tipo_camp === '01'
                    ? <AccesibleIcon tabIndex={-1} src={iconItv} text={'ITV'} />
                    : <AccesibleIcon tabIndex={-1} src={iconInsurance} text={t('terms.insurance')} />
                }
            </div>

        </div>
    )
}