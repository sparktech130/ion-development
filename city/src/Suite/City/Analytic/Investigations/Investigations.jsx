// Librerias
import React, { useState, useEffect, useContext } from 'react';
import moment from 'moment';
import { useTranslation } from 'react-i18next'

//Styles
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'
import cardStyles from '../../../../../styles/card.module.css'

//Componentes
import { Box } from '../../../../../components/Box/Box';
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement';
import { Investigation } from './Investigation/Investigation'
import { ConsultingGrid } from '../../../../../components/ConsultingGridImage/ConsultingGrid';
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent';

//Utils
import { numberConversion } from '../../../../../utils/conversions';
import { handleKey } from '../../../../../utils/functions/accessibility';

//URLS
import { URL_OBTENER_INVESTIGACIONES } from '../../../../../api/connections/urls';

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Icons
import vehiclesIcon from '../../../../../assets/icons/navbar/traffic.svg?react'
import facialIcon from '../../../../../assets/icons/navbar/facial-recognition.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'

//Autocomplete
import { getAutocompleteUsers } from '../../../../../api/services/autocomplete';
import { AccesibleIcon } from '../../../../../components/AccesibleIcon/AccesibleIcon';



export function Investigations() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información de los reconocimientos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(null)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})

    //Inputs
    const [estados] = useState([{ cod: 'En curso', name: t('values.En curso') }, { cod: 'Finalizada', name: t('values.Finalizada') }])
    const [customIcons] = useState([{ code: 1, icon: vehiclesIcon, text: t('titles.vehicles') }, { code: 2, icon: facialIcon, text: t('titles.facialRecognition') }])

    //Autocomplete
    const [autocompleteUsers, setAutocompleteUsers] = useState(null)


    //*---------------------------------API--------------------------------------*//

    //Obtiene investigaciones
    const getInvestigations = async (payload) => {

        setIsLoading(true)

        //Parametros
        const params = {
            fecha_ini: payload?.initial_date,
            fecha_fin: payload?.final_date,
            hora_ini: payload?.initial_hour,
            hora_fin: payload?.final_hour,
            estado: payload?.estado?.cod,
            cod_investigacion: payload?.cod_investigacion,
            nombre_investigacion: payload?.nombre_investigacion,
            cod_usuario: payload?.responsable?.cod,
            //tipo_analisis: payload?.type, //peta por no estar implementado en back
        }

        //Comprobamos si estamos filtrando
        let isFiltering = payload?.type?.length > 0 || (payload && Object.entries(payload).some(([key, value]) => (value !== null && value !== undefined && value !== '')))

        setDataFiltered(isFiltering)
        !isFiltering && handleReset()

        //Llamada API
        let data = await requestAPI(URL_OBTENER_INVESTIGACIONES, { ...params, limit: isFiltering ? 1000 : 200 }, 'city')

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos
        if (data?.rows) {
            setData(data.rows)
            isFiltering ? setSubtitle(t('messages.resultsFilteredLast', { value: data?.rows?.length })) : setSubtitle(t('messages.resultsTotal', { value: data?.rows?.length, total: numberConversion(data?.count || 0) }))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 300);
    }


    //*------------------------------------------FILTRO------------------------------------------------*//

    //limpia filtros
    const handleReset = () => {
        setFilterState({})
    }

    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los reconocimientos
    useEffect(() => {
        getInvestigations()
        //eslint-disable-next-line
    }, [])

    //Reseteamos filtro al cerrar modal si no se está filtrando nada
    useEffect(() => {
        if (!dataFiltered) {
            handleReset()
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //----------Autocompletar-------------------------------------------------

    //Obtiene usuarios para autocomplete
    async function getAutocompletes() {
        const users = await getAutocompleteUsers()
        setAutocompleteUsers(users)
    }

    //pide autocompletar si es la primera vez que entras en el modal
    useEffect(() => {
        //si ya los tiene no lo pido
        if (!(Array.isArray(autocompleteUsers) && autocompleteUsers.length > 0)) {
            getAutocompletes()
        }
        //eslint-disable-next-line
    }, [])


    return (
        <>

            {/*Filtro*/}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.investigations') })} onSubmit={getInvestigations} onReset={handleReset} rows={3} unequalRows columns={4} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                    {/*Columna 1*/}
                    <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" />
                    <FilterSectionElement title={t('params.code')} name="cod_investigacion" inputType="number" />
                    <FilterSectionElement title={t('params.type')} name="type" width={4} inputType="ICONS" customIcons={customIcons} disableSelectAll />

                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                    <FilterSectionElement title={t('params.investigation')} name="nombre_investigacion" inputType="text" />

                    <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
                    <FilterSectionElement title={t('params.status')} name="estado" inputType="ITEMS" items={estados} itemName='name' strictInput />

                    <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />
                    <FilterSectionElement title={t('params.responsible')} name="responsable" inputType="ITEMS" items={autocompleteUsers} itemName='name' strictInput />

                </FilterSection>
            }


            {/*Página investigaciones*/}
            {!currentData ?
                <main className={consultingStyles['registers']}>

                    <Box routes={[{ name: t('sections.INVESTIGACIONES') }]}>

                        <h2 className='subtitle'>{subtitle}</h2>

                        {/* Wrapper de botones */}
                        <div className={consultingStyles['button__wrapper']}>
                            <ButtonComponent onClick={() => setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                        </div>

                        <ConsultingGrid data={data} className={consultingStyles['grid__body--card']}>
                            {(item, index) =>
                                <Card key={index} item={item} onClick={() => { setIsLoading(true); setCurrentData(item) }} />
                            }
                        </ConsultingGrid>

                    </Box>
                </main>
                :
                <Investigation investigation={currentData} setInvestigation={setCurrentData} />
            }
        </>
    )
}

export const Card = ({ item, onClick }) => {

    const { t } = useTranslation()

    return (
        <div className={cardStyles['wrapper']} onClick={onClick} tabIndex={0} onKeyDown={(e) => handleKey(e, onClick)}>

            <div className={cardStyles['section--column']}>

                <div className={cardStyles['first__line']}>
                    <h3>{item?.nombre + ' ' + item?.apellidos}</h3>
                    <h3>{moment(item?.fecha_hora_ini)?.format('DD-MM-YYYY HH:mm')}</h3>
                </div>

                <div className={cardStyles['second__line']}>
                    <h2>{item?.nombre_investigacion}</h2>
                    <span className={cardStyles['separator']} />
                    <h3 className={item?.estado === 'En curso' ? 'confidence--high' : 'confidence--low'}>{t('values.' + item?.estado)}</h3>
                </div>

                <p className={cardStyles['description']}>{item?.descripcion}</p>

            </div>

            <hr />


            <div className={cardStyles['center__wrapper']}>
                <h2>7</h2>
                <p>{t('terms.files')}</p>
                <span className={cardStyles['separator']} />
                <h2>229</h2>
                <p>{t('terms.records')}</p>
            </div>

            <hr />

            <div className={cardStyles['icons__wrapper']}>
                {item?.tipo_analisis?.includes('vehiculos') && <AccesibleIcon tabIndex={-1} src={vehiclesIcon} text={t('titles.vehicles')} />}
                {item?.tipo_analisis?.includes('facial') && <AccesibleIcon tabIndex={-1} src={facialIcon} text={t('titles.facialRecognition')} />}
            </div>

        </div>
    )
}