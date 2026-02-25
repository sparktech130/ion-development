// Librerias
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement';
import { ConsultingGrid } from '../../../components/ConsultingGridImage/ConsultingGrid';
import { AccesibleIcon } from '../../../components/AccesibleIcon/AccesibleIcon';
import { TextModal } from '../../../components/TextModal/TextModal';
import { PinbalModal, RedsysModal } from './IntegrationModal';
import { ButtonComponent } from '../../../components/ButtonComponent/ButtonComponent';

//Context
import MainDataContext from '../../../context/MainDataContext'

//API
import { URL_INTEGRACIONES_OBTENER } from '@api/connections/urls'

//Common
import { url_path } from '../../../constants/common';

//Utils
import { numberConversion } from '../../../utils/conversions'

//Icons
import unlinkedIcon from '@icons/actions/unlinked.svg?react'
import linkedIcon from '@icons/actions/linked.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'

//CSS
import consultingStyles from '../../../styles/sections/Consulting.module.css'
import styles from './Integrations.module.css'



export function Integrations() {

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //Información de los dispositivos
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))
    const [currentData, setCurrentData] = useState(undefined)

    //Estado de los modales de insertar, filtrar y modificar
    const [insertState, setInsertState] = useState({})
    const [filterState, setFilterState] = useState({})

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)

    //InputItems
    const itemstypes = useMemo(() => {
        return [
            { cod: "organization", name: t('integrations.types.organization') },
            { cod: "paymentGateway", name: t('integrations.types.paymentGateway') },
            { cod: 'software', name: t('integrations.types.software') }
        ]
        //eslint-disable-next-line
    }, [])


    //*------------------------------------API-----------------------------------------*//

    //Obtiene las integraciones
    const getIntegrations = async (payload) => {

        //Parametros
        const params = {
            nombre: payload?.name
        }

        //Comprobamos si estamos filtrando
        let isFiltering = Object.entries(params).some(([key, value]) => (value !== null && value !== undefined && value !== ''))
        setDataFiltered(isFiltering)
        !isFiltering && setFilterState({})

        const data = await requestAPI(URL_INTEGRACIONES_OBTENER, params)

        //Control de errores
        if (data?.message) {
            setIsLoading(false)
            setInfoMessage(data?.message)
            return
        }

        //Asignación de datos
        if (data) {
            setData(data)
            isFiltering ? setSubtitle(t('messages.resultsFiltered', { value: numberConversion(data.length) })) : setSubtitle(t('messages.results', { value: numberConversion(data.length) }))
        }

        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false)}, 300)
    }

    //Renderizar modal de integraciones
    const openIntegrationModal = () => {

        const modals = {
            'pinbal': <PinbalModal closeModal={() => { setCurrentData(undefined) }} action={getIntegrations} onChange={setInsertState} state={insertState} />,
            'redsys': <RedsysModal closeModal={() => { setCurrentData(undefined) }} action={getIntegrations} onChange={setInsertState} state={insertState} />,
        }

        return modals[currentData?.code]
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial
    useEffect(() => {
        getIntegrations()
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if (!dataFiltered) {
            setFilterState({})
        }
        //eslint-disable-next-line
    }, [filterOpen])

    //Vaciamos estado de vincular integración al cerrar modal
    useEffect(() => {
        if (!currentData) {
            setInsertState({})
        }
        //eslint-disable-next-line
    }, [currentData])


    return <>

        {/* Filtrar integraciones */}
        {filterOpen &&
            <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.integrations') })} onSubmit={getIntegrations} onReset={() => { setFilterState({}) }} rows={1} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                {/*Columna 1*/}
                <FilterSectionElement title={t('params.name')} name="name" inputType="text" />

                {/*Columna 2*/}
                <FilterSectionElement title={t('params.type')} name="type" inputType="ITEMS" items={itemstypes} itemName='name' strictInput />

            </FilterSection>
        }

        {/* Desvincular integración */}
        {(currentData && (currentData.estado === 'linked' || currentData.estado === undefined)) &&
            <TextModal title={t('integrations.unlinkIntegration')} setIsOpen={() => { setCurrentData(undefined) }} aceptar={() => { setCurrentData(undefined) }}>{t('integrations.unlinkIntegrationConfirm', { integration: currentData.nombre })}</TextModal>
        }

        {/* Vincular integración */}
        {(currentData && currentData.estado === 'unlinked') && openIntegrationModal()}


        {/*Página de integraciones*/}
        <main className={consultingStyles['registers']}>
            <Box routes={[{ name: t('sections.INTEGRACIONES') }]}>
                <h2 className='subtitle'>{subtitle}</h2>
                <div className={consultingStyles['button__wrapper']}>
                    <ButtonComponent onClick={()=>setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} selected={dataFiltered} />
                </div>
                <div className={consultingStyles['grid']}>
                    <ConsultingGrid data={data} className={consultingStyles['grid__body--card']}>
                        {(item) =>
                            <Card key={item?.code} item={item} onClick={() => { setCurrentData(item) }} />
                        }
                    </ConsultingGrid>
                </div>
            </Box>
        </main>
    </>
}

export const Card = ({ item, onClick }) => {

    //Context
    const { url_origin } = useContext(MainDataContext)

    //Traducción
    const { t } = useTranslation()

    //Utils
    const statusConversion = () => {

        const object = {
            'linked': {
                text: t('integrations.status.linked'),
                img: unlinkedIcon,
                action: t('integrations.unlinkIntegration'),
                style: { color: '#4CD984' }
            },
            'unlinked': {
                text: t('integrations.status.unlinked'),
                img: linkedIcon,
                action: t('integrations.linkIntegration'),
                style: { color: 'var(--color-secondary)', opacity: 0.75 }
            },
            'pending': {
                text: t('integrations.status.pending'),
                img: unlinkedIcon,
                action: t('integrations.unlinkIntegration'),
                style: { color: '#FFAB49' }
            },
        }

        return object[item.estado]
    }

    return (

        <div className={styles['wrapper']}>

            <div className={styles['header']}>
                <p>{t('integrations.types.' + item.nombre_tipo)}</p>
                <p>{item.nombre}</p>
            </div>

            <img src={`${url_origin + url_path}/integraciones/iconos/${item?.icono}`} alt={item.nombre} />
            <p style={statusConversion().style}>{statusConversion().text}</p>
            <hr className='separator' />
            <AccesibleIcon src={statusConversion().img} alt={statusConversion().text} text={statusConversion().action} className={styles['link']} onClick={onClick} />
        </div>
    )
}