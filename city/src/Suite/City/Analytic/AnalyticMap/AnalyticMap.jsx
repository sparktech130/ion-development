import mapStyles from '../../../../../styles/sections/Map.module.css'
import { useTranslation } from 'react-i18next'

//Librerías
import React, { useEffect, useState, useContext } from 'react'

//Componentes
import { MapV4 } from '../../../../../components/Maps/MapV4/MapV4'
import { RightBar } from '../../../../../components/Maps/RightBar/RightBar'
import { FilterModal } from './FilterModal/FilterModal'
import { AddModal } from './AddModal/AddModal'
import { AnalyticVisualization } from '../../../../../components/DataVisualization/City/AnalyticVisualization'
import { RadarModal } from './RadarModal/RadarModal'
import { RadarComponent } from '../../../../../components/Maps/MapV4/Components/externos/RadarComponent/RadarComponent'
import { MarkersRelationPolygon } from '../../../../../components/Maps/MapV4/Components/externos/MarkersRelationPolygon/MarkersRelationPolygon'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//Iconos
import investigationIcon from '../../../../../assets/icons/navbar/investigation.svg?react'
import iconFilter from '../../../../../assets/icons/actions/filter.svg?react'
import iconAdd from '../../../../../assets/icons/actions/add.svg?react'
import radarIcon from '../../../../../assets/icons/actions/radar.svg?react'

//Marcadores
import marker from '../../../../../assets/icons/markers/marker-investigation.svg?react'

//API
import { URL_OBTENER_INVESTIGACIONES } from '../../../../../api/connections/urls'



export const AnalyticMap = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI } = useContext(MainDataContext)
    const {t} = useTranslation()

    //Datos generales
    const [investigations, setInvestigations] = useState([])
    const [currentInvestigation, setCurrentInvestigation] = useState(null)

    //activar botones
    const [showInvestigations, setShowInvestigations] = useState(true)
    const [showRadar, setShowRadar] = useState(false)

    //Radar
    const [radarDevices, setRadarDevices] = useState(null)
    const [radarCoordinates, setRadarCoordinates] = useState(null)

    //Modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [investigationOpen, setInvestigationOpen] = useState(false)
    const [radarModalOpen, setRadarModalOpen] = useState(false)
    const [previewOpened, setPreviewOpened] = useState(false)

    //Registro ruta
    const [registroRutaReconoc] = useState(null) //Para cuando se implemente rgistroRutaV4

    //filtrar
    const [filterState, setFilterState] = useState({})
    const [isFiltering, setIsFiltering] = useState(false)

    //Autocompletar
    const [autocompleteUsers, setAutocompleteUsers] = useState([])



    //*------------------------------------FUNCIONALIDADES MAPA----------------------------------------*//

    //obtiene análisis
    const getInvestigations = async (payload) => {
        let error = true
        try {
            setIsLoading(true)

            //params
            const params = {
                fecha_ini: payload?.initial_date,
                fecha_fin: payload?.final_date,
                hora_ini: payload?.initial_hour,
                hora_fin: payload?.final_hour,
                estado: payload?.estado?.cod,
                cod_investigacion: payload?.cod_investigacion,
                nombre_investigacion: payload?.nombre_investigacion,
                cod_usuario: payload?.responsable?.cod,
                tipo_analisis: undefined, //payload?.type no implementado en back y peta
            }

            //Comprobamos si estamos filtrando
            let isFiltering = payload?.type?.length>0 || (payload && Object.entries(payload).some(([key, value]) => (value !== null && value !== undefined && value !== '')))
            setIsFiltering(isFiltering)

            //pedir datos
            let data = await requestAPI(URL_OBTENER_INVESTIGACIONES, params, 'city')
            if (!data.error && Array.isArray(data?.rows)) {
                setInvestigations(data.rows)
                error = false
                //actualiza la seleccionada
                if(currentInvestigation?.cod_investigacion){
                    let investigacion = data.rows.find(item=>item.cod_investigacion===currentInvestigation?.cod_investigacion)
                    if(investigacion?.cod_investigacion){
                        setCurrentInvestigation(investigacion)
                    }
                }
            }

        } finally {
            setTimeout(() => {
                setIsLoading(false)
                if(error){
                    //setInfoMessage(t('errors.request'))
                }
            }, 300);
        }
    }


    //Click en análisis mapa
    const onClickMarker = (item) => {
        if (currentInvestigation?.cod_investigacion !== item?.cod_investigacion) {
            setCurrentInvestigation(item)
            setPreviewOpened(true)
        } else {
            setCurrentInvestigation(undefined)
            setPreviewOpened(false)
        }
    }


    //*------------------------------FUNCIONALIDADES NAVBAR LATERAL------------------------------------*//

    //onclick análisis
    const handleClickAnalysis = () => {
        setShowInvestigations(!showInvestigations)
    }

    //onclick filtrar
    const handleClickFilter = () => {
        setFilterOpen(true)
    }

    //onclick nuevo análisis
    const handleClickNewInvestigation = () => {
        setInvestigationOpen(true)
    }

    //onclick radár
    const handleClickRadar = () => {
        setShowRadar(!showRadar)
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada de datos inicial
    useEffect(() => {
        getInvestigations()
        // eslint-disable-next-line
    }, [])

    //Al cerrar la previsualización del dispositivo, reseteamos el dispositivo seleccionado a undefined
    useEffect(() => {
        if(!previewOpened){
            setCurrentInvestigation(null)
        }
    }, [previewOpened])



    return (

        <>
            {/* Modal filtrar */}
            {filterOpen &&
                <FilterModal
                    setIsOpen={setFilterOpen}
                    getData={getInvestigations}
                    filterState={filterState} setFilterState={setFilterState}
                    autocompleteUsers={autocompleteUsers} setAutocompleteUsers={setAutocompleteUsers}
                />
            }

            {/* Modal nueva investigación */}
            {investigationOpen &&
                <AddModal 
                    setIsOpen={setInvestigationOpen}
                    updateData={()=>getInvestigations(filterState)}
                />
            }

            {/* Modal radar */}
            {radarModalOpen &&
                <RadarModal 
                    setIsOpen={setRadarModalOpen} devices={radarDevices}
                />
            }

            <main className={mapStyles['wrapper']}>

                <MapV4
                    scannerColor={'red'}
                    centerItems={showInvestigations ? investigations : undefined}
                    enableSearchMarkers

                    markersArray={[
                        {
                            disabled: !showInvestigations,
                            markers: investigations,
                            selectedMarker: currentInvestigation,
                            onClickMarker: onClickMarker,
                            customAlertCondition:(item)=>item.estado==='En curso',
                            paramNameCod:'cod_investigacion', paramNameNom:'nombre_investigacion',
                            icon: marker,
                            title: t('titles.investigations')
                        }
                    ]} 
                >
                    {showRadar &&
                        <RadarComponent coordinates={radarCoordinates} setCoordinates={setRadarCoordinates}setRadarDevices={setRadarDevices} />
                    }
                    {currentInvestigation &&
                        <MarkersRelationPolygon marker={currentInvestigation} markers={currentInvestigation.dispositivos} />
                    }

                </MapV4>


                {/* botón radar */}
                {showRadar && radarDevices &&
                    <button onClick={()=>setRadarModalOpen(true)} className={mapStyles['center__button']}>{t('titles.fileShareRequest')}</button>
                }

                {/* Navbar derecha */}
                {!registroRutaReconoc &&
                    <>
                        {!previewOpened
                            ? <RightBar
                                icons={[investigationIcon, iconFilter, iconAdd, radarIcon]}
                                texts={[t('titles.investigations'), t('buttons.filter'), t('crud.addElement', {element:t('terms.investigation')}), t('titles.radar')]}
                                actions={[handleClickAnalysis, handleClickFilter, handleClickNewInvestigation, handleClickRadar]}
                                selecteds={[showInvestigations, isFiltering, false, showRadar]}
                                disableVideowall
                            />
                            : <AnalyticVisualization
                                investigation={currentInvestigation}
                                setPreviewOpened={setPreviewOpened}
                                updateInvestigations={()=>getInvestigations(filterState)}
                            />
                        }
                    </>
                }

            </main>
        </>

    )
}