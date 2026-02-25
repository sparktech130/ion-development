//Librerías
import { useEffect, useState, useContext, useCallback } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Componentes
import { MapV4 } from '../../../../../components/Maps/MapV4/MapV4'
import { RightBar } from '../../../../../components/Maps/RightBar/RightBar'
import { CityVisualization } from '../../../../../components/DataVisualization/City/CityVisualization'
import { InfringementVisualization } from '../../../../../components/DataVisualization/City/InfringementVisualization'
import { AddModal } from './AddModal/AddModal'

//Servicios
import { URL_OBTENER_DISPOSITIVOS, URL_OBTENER_PREVALIDACION_ALERTAS, URL_OBTENER_CAMPAIGN } from '../../../../../api/connections/urls'

//Icons
import iconCam from '../../../../../assets/icons/map/cam.svg?react'
import iconItv from '../../../../../assets/icons/alerts/itv2.svg?react'
import iconInsurance from '../../../../../assets/icons/alerts/insurance.svg?react'
import iconAdd from '../../../../../assets/icons/actions/add.svg?react'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//CSS
import mapStyles from '../../../../../styles/sections/Map.module.css'


export const InfringementAlertsMap = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { lastAlert, setIsLoading, requestAPI } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos generales
    const [devices, setDevices] = useState([])
    const [alerts, setAlerts] = useState([])
    const [zones, setZones] = useState([])
    const [selectedZone, setSelectedZone] = useState(null)

    //activar botones
    const [showDevices, setShowDevices] = useState(true)
    const [showItv, setShowItv] = useState(false)
    const [showInsurance, setShowInsurance] = useState(false)

    //modales
    const [deviceselected, setDeviceSelected] = useState(null)
    const [previewOpened, setPreviewOpened] = useState(false)
    const [addOpen, setAddOpen] = useState(false)


    //*------------------------------------FUNCIONALIDADES MAPA----------------------------------------*//

    //obtiene dispositivos
    const getDevices = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS, { modulos: [8] })
            if (!data.error) {
                setDevices(data)
            } else {
                setDevices([])
            }
        } catch {
            setDevices([])
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //obtiene alertas
    const getAlerts = async () => {

        const params = {
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
            alertas: ["0006", "0004"],
            modulos: [15]
        }

        try {
            let data = await requestAPI(URL_OBTENER_PREVALIDACION_ALERTAS, params, 'city')
            if (!data.error) {

                //Alertas por dispositivo
                const reduced_data = data?.reduce((acc, entry) => {
                    acc[entry?.cod_dispositivo] ??= []
                    acc[entry?.cod_dispositivo].push({ recon_type: 'vehicle', ...entry })
                    return acc
                }, {}) ?? {}

                setAlerts(Object.keys(reduced_data).length > 0 ? reduced_data : [])

            } else {
                setAlerts([])
            }
        } catch {
            setAlerts([])
        }
    }

    //obtiene campañas
    const getZonas = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_CAMPAIGN, { estado_campaign: 'En curso' }, 'city')
            if (!data.error && data?.rows && Array.isArray(data.rows)) {
                setZones(data.rows)
                //actualizo datos de zona seleccionada (para cuando la editas desde infringementVisualization)
                if (selectedZone?.cod_campaign) {
                    let zonaActualizada = data.rows.find(item => item.cod_campaign === selectedZone.cod_campaign)
                    if (zonaActualizada?.cod_campaign) {
                        setSelectedZone(zonaActualizada)
                    }
                }
            } else {
                setZones([])
            }
        } catch {
            setZones([])
        } finally {
            //para cuando añadimos campaña
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //Realizar la selección sobre una cámara
    const onClickMarker = (device) => {
        if (deviceselected?.cod_dispositivo !== device?.cod_dispositivo) {
            setDeviceSelected(device)
            setPreviewOpened(true)
        } else {
            setDeviceSelected(undefined)
            setPreviewOpened(false)
        }
    }

    //click zona
    const onClickZone = useCallback((zone) => {
        if (zone.cod_campaign === selectedZone?.cod_campaign) {
            setSelectedZone(null)
        } else {
            setSelectedZone(zone)
        }
    }, [selectedZone])


    //*------------------------------FUNCIONALIDADES NAVBAR LATERAL------------------------------------*//

    //onclick opción cámaras
    const handleClickCam = () => {
        setShowDevices(!showDevices)
    }

    //onclick opción zar
    const handleClickItv = () => {
        setShowItv(!showItv)
    }

    //onclick opción zbe
    const handleClickInsurance = () => {
        setShowInsurance(!showInsurance)
    }

    //onclick opción añadir campaña
    const handleClickAdd = () => {
        setAddOpen(true)
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //pide datos iniciales
    useEffect(() => {
        getDevices()
        getAlerts()
        getZonas()
        // eslint-disable-next-line
    }, [])

    //Al cerrar la previsualización del dispositivo, reseteamos el dispositivo seleccionado a undefined
    useEffect(() => {
        if (!previewOpened) {
            setDeviceSelected(null)
        }
    }, [previewOpened])




    //*------------------------------------------SOCKETS----------------------------------------------*//

    //actualiza alertas por socket
    useEffect(() => {
        if (lastAlert && lastAlert.modulo === 'traffic' && ((lastAlert.cod_alertagest === '0004') || (lastAlert.cod_alertagest === '0006'))) {

            setAlerts(prevState => {
                const key = lastAlert?.cod_dispositivo
                const newData = { ...lastAlert, recon_type: 'vehicle' }

                const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                return {
                    ...prevState,
                    [key]: trimmedList
                }
            })
        }
        //eslint-disable-next-line
    }, [lastAlert])



    return (
        <>

            {/* Modal añadir campaña */}
            {addOpen &&
                <AddModal
                    setIsOpen={setAddOpen}
                    devices={devices}
                    updateData={getZonas}
                />
            }


            <main className={mapStyles['wrapper']}>

                <MapV4
                    scannerColor={'red'}
                    centerItems={showDevices ? devices : undefined}
                    enableSearchMarkers

                    markersArray={[
                        {
                            disabled: !showDevices,
                            markers: devices,
                            selectedMarker: deviceselected,
                            onClickMarker: onClickMarker,
                            alerts: Object.values(alerts).flat(),
                            title: t('titles.cameras')
                        }
                    ]}

                    zones={zones}
                    selectedZone={selectedZone}
                    onClickZone={onClickZone}
                    zoneParamNameCod='cod_campaign' zoneParamNameType='nombre_alerta'
                    zoneTypes={['Vehículo sin ITV', 'Vehículo sin seguro']}
                    showZoneType1={showItv} showZoneType2={showInsurance}
                />


                {/* Navbar derecha o información sobre el dispositivo seleccionado */}
                {selectedZone
                    ? <InfringementVisualization
                        campaign={selectedZone}
                        setPreviewOpened={() => setSelectedZone(null)}
                        devices={devices}
                        updateData={getZonas}
                    />

                    : !previewOpened

                        ? <RightBar
                            icons={[iconCam, iconItv, iconInsurance, iconAdd]}
                            texts={[t('titles.cameras'), t('titles.itvCampaigns'), t('titles.insuranceCampaigns'), t('crud.addElement', { element: t('terms.campaign') })]}
                            actions={[handleClickCam, handleClickItv, handleClickInsurance, handleClickAdd]}
                            selecteds={[showDevices, showItv, showInsurance, false]}
                            disableVideowall
                            separatorPositions={[3]}

                            disableStats={false}
                            statsElements={devices}
                        />

                        : <CityVisualization
                            item={deviceselected}
                            setPreviewOpened={setPreviewOpened}
                            alerts={alerts[deviceselected?.cod_dispositivo] || []}

                            disableRegisters
                            disableAnalysis
                            disableStats
                            defaultMenu='alerts'

                            cod_module={'0008'}
                            consulting_section={'infringement-consulting-consults'}

                        />}
            </main>

        </>
    )
}