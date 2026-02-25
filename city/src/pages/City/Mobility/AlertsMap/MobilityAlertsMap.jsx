//Librerías
import { useEffect, useState, useContext, useCallback } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Componentes
import { MapV4 } from '../../../../../components/Maps/MapV4/MapV4'
import { RightBar } from '../../../../../components/Maps/RightBar/RightBar'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { CityVisualization } from '../../../../../components/DataVisualization/City/CityVisualization'
import { BusVisualization } from '../../../../../components/DataVisualization/City/BusVisualization'
import { BusStopVisualization } from '../../../../../components/DataVisualization/City/BusStopVisualization'
import { MarkerComponent } from '../../../../../components/Maps/MapV4/Components/MarkerComponent/MarkerComponent'

//Servicios
import { URL_OBTENER_ZONAS, URL_OBTENER_DISPOSITIVOS, URL_OBTENER_PREVALIDACION_ALERTAS, URL_OBTENER_RECONOCIMIENTOS_GROUP, URL_OBTENER_RECONOCIMIENTOS_PARAM } from '../../../../../api/connections/urls'
import { joinRoom, leaveRoom, subscribeToEvent, unsubscribeFromEvent } from '../../../../../api/connections/socketHandler'

//Icons
import iconCam from '../../../../../assets/icons/map/cam.svg?react'
import iconBus from '../../../../../assets/icons/vehicles/bus.svg?react'
import iconZar from '../../../../../assets/icons/alerts/zar.svg?react'
import iconZbe from '../../../../../assets/icons/alerts/zbe.svg?react'
import iconDum from '../../../../../assets/icons/alerts/dum.svg?react'
import bus_marker from '@icons/markers/bus.svg?react'
import bus_stop_marker from '@icons/markers/bus-stop.svg?react'

//Context
import { useLoginDataContext } from '../../../../../context/LoginDataContext'
import MainDataContext from '../../../../../context/MainDataContext'

//Utils
import { getAutocompleteGrids, getAutocompleteInstances } from '../../../../../api/services/autocomplete'

//Constantes
import { url_path_city } from '../../../../../constants/common'

//CSS
import mapStyles from '../../../../../styles/sections/Map.module.css'


export const MobilityAlertsMap = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { token, server } = useLoginDataContext()
    const { section, lastAlert, setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos generales
    const [devices, setDevices] = useState([])
    const [buses] = useState([{ cod_bus: 1, nombre_bus: 'Bus Test', coordenadas: '39.722804324088564, 2.9123575682348553', dispositivos: [{ cod_dispositivo: "999999", nom_dispositivo: "Cam 1" }, { cod_dispositivo: "000002", nom_dispositivo: "Cam 2" }], paradas: [{ cod_parada: 1, nombre_parada: 'Parada 1', coordenadas: '39.72293946614962, 2.912323213282389' }, { cod_parada: 2, nombre_parada: 'Parada 2', coordenadas: '39.724672501909666, 2.911889521367848' }], ruta: '39.72213,2.91274;39.72216,2.91272;39.72258,2.91247;39.72262,2.91244;39.72293,2.91225;39.723,2.9122;39.72334,2.91209;39.72352,2.91204;39.72359,2.91202;39.72416,2.91192;39.72431,2.9119;39.72442,2.91188;39.725,2.91181;39.72589,2.91168;39.72597,2.91166;39.72639,2.91159;39.72647,2.91157;39.72699,2.91149;39.7271,2.91148;39.72733,2.91144;39.7277,2.91139;39.72802,2.91135' }]) //test: no implementado en back
    const [alerts, setAlerts] = useState([])
    const [zones, setZones] = useState([])
    const [recons, setRecons] = useState([])

    //Datos dispositivo seleccionado
    const [graphRecons, setGraphRecons] = useState([])

    //Cámara seleccionada en el videowall
    const [videoWall, setVideoWall] = useState(null);

    //activar botones
    const [showDevices, setShowDevices] = useState(true)
    const [showBuses, setShowBuses] = useState(false)
    const [showZar, setShowZar] = useState(false)
    const [showZbe, setShowZbe] = useState(false)
    const [showDum, setShowDum] = useState(false)

    //elementos seleccionados
    const [deviceselected, setDeviceSelected] = useState(null)
    const [busSelected, setBusSelected] = useState(null)
    const [paradaSelected, setParadaSelected] = useState(null)

    //modales
    const [videowallModal, setVideowallModal] = useState(false)
    const [videowallState, setVideowallState] = useState({})
    const [previewOpened, setPreviewOpened] = useState(false)

    //Autocompletar
    const [autocompleteGrids, setAutocompleteGrids] = useState([])
    const [autocompleteInstances, setAutocompleteInstances] = useState([])


    //*---------------------------------------AUTOCOMPLETAR--------------------------------------------*//

    //Funciones para rellenar el autocompletar
    async function getAutocompletes() {

        //Grids
        const grids = await getAutocompleteGrids(11)
        setAutocompleteGrids(grids)

        //Instancias
        const instances = await getAutocompleteInstances()
        setAutocompleteInstances(instances)

    }


    //*------------------------------------FUNCIONALIDADES MAPA----------------------------------------*//

    //obtiene dispositivos
    const getDevices = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS, { modulos: [11] })
            if (!data.error && Array.isArray(data)) {
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

    //Obtiene los reconocimientos
    const getReconocimientos = async () => {

        try {
            let params = {
                modulos: [11],
                order: ['fecha DESC', 'hora DESC'],
                limit: 20,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            let data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_PARAM, params)
            if (!data.error) {

                //Reconocimientos por dispositivo
                const reduced_data = data?.rows?.reduce((acc, entry) => {
                    acc[entry?.cod_dispositivo] ??= []
                    acc[entry?.cod_dispositivo].push({ recon_type: 'vehicle', ...entry })
                    return acc
                }, {}) ?? {}

                setRecons(Object.keys(reduced_data).length > 0 ? reduced_data : [])

            } else {
                setRecons([])
            }
        } catch (error) {
            setRecons([])
        }
    }

    //Obtiene los reconocimientos agrupados por dispositivo para mostrarse en las estadísticas del dispositivo seleccinado
    //Obtiene los datos de estadística que mostraremos en el gráfico
    const getGraphStats = async () => {

        const params = {
            campos: ['fecha', 'hora', 'cod_dispositivo'],
            order: ['fecha', 'hora'],
            modulos: [11],
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
        }

        const params2 = {
            campos: ['fecha', 'hora', 'cod_dispositivo', 'velocidad'],
            order: ['fecha', 'hora'],
            modulos: [11],
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
        }

        //Llamada para obtener los resultados
        const reconsCall = requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)
        const speedCall = requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params2);

        const [reconsData, speedData] = await Promise.all([reconsCall, speedCall])

        //Control de errores
        setGraphRecons({ recons: !reconsData.error ? reconsData : [], speed: !speedData.error ? speedData : [] })

    }

    //obtiene alertas
    const getAlerts = async () => {

        const params = {
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
            modulos: [11]
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

    //obtiene zonas
    const getZonas = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_ZONAS, null, 'city')
            if (!data.error && Array.isArray(data?.rows)) {
                setZones(data?.rows)
            } else {
                setZones([])
            }
        } catch {
            setZones([])
        }
    }

    //Función para activar el videowall
    const showVideowall = (payload) => {

        //Guardamos token en session storage para no hacer login en el videowall...
        localStorage.setItem('temp_data', token);

        //...obtenemos el grid del videowall...
        let grid = { ...autocompleteGrids.filter((grid => grid.name === payload?.videowall?.name))[0] }

        //..para abrirlo en una nueva ventana...
        window.open(url_path_city + '/videowall/' + (grid?.devices ? ("?lyt=" + btoa(grid?.devices)) : '') + "&sct=" + btoa(section))

        //... y finalmente resetear el estado del payload o autocompletar.
        setVideowallState({})

    }

    //Realizar la selección sobre una cámara
    const onClickMarker = (device) => {

        //desseleccino si hay un bus seleccionado
        if (busSelected) {
            setBusSelected(undefined)
            setParadaSelected(undefined)
        }

        //Selección cámara
        if (deviceselected?.cod_dispositivo !== device?.cod_dispositivo) {
            setDeviceSelected(device)
            setPreviewOpened(true)
        } else {
            setDeviceSelected(undefined)
            setPreviewOpened(false)
        }
    }

    //Realizar la selección sobre un bus
    const onClickBus = (bus) => {

        //Desselecciono si había una cámara seleccionada
        if (deviceselected) setDeviceSelected(undefined)

        if (busSelected?.cod_bus !== bus?.cod_bus) {
            setBusSelected(bus)
            setPreviewOpened(true)
        } else {
            setBusSelected(undefined)
            setPreviewOpened(false)
        }
    }

    //Realizar la selección sobre un parada
    const onClickParada = (parada) => {

        if (paradaSelected?.cod_parada !== parada?.cod_parada) {
            setParadaSelected(parada)
        } else {
            setParadaSelected(undefined)
        }
    }

    //Click zona
    const onClickZone = useCallback((zone) => {
        setInfoMessage(zone.nombre_area);
        //eslint-disable-next-line
    }, [])


    //*------------------------------FUNCIONALIDADES NAVBAR LATERAL------------------------------------*//

    //onclick opción cámaras
    const handleClickCam = () => {
        setShowDevices(!showDevices)
    }

    //onclick opción buses
    const handleClickBus = () => {
        setShowBuses(!showBuses)
    }

    //onclick opcción zar
    const handleClickZar = () => {
        setShowZar(!showZar)
    }

    //onclick opcción zbe
    const handleClickZbe = () => {
        setShowZbe(!showZbe)
    }

    //onclick opcción dum
    const handleClickDum = () => {
        setShowDum(!showDum)
    }

    //Abrir el modal para la selección de videowall
    const openVideowall = () => {
        setVideowallModal(true)
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //pide datos iniciales
    useEffect(() => {
        getDevices()
        getAlerts()
        getZonas()
        getAutocompletes()
        getReconocimientos()
        getGraphStats()
        // eslint-disable-next-line
    }, [])

    //Llamaremos a la función de obtener los reconocimientos agrupados por cámara cada minuto
    useEffect(() => {

        const interval = setInterval(getGraphStats, 60000)

        return () => {
            clearInterval(interval)
        }
        //eslint-disable-next-line
    }, [])


    //Obtenemos videowall del localstorage y lo eliminamos cuando salimos del componente para evitar mala gestión
    useEffect(() => {

        localStorage.removeItem('videowall');

        const handleStorageChange = () => {
            setVideoWall(localStorage.getItem('videowall'));
        };

        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            localStorage.removeItem('videowall');
        };
    }, []);

    //Al cerrar la previsualización, reseteamos states
    useEffect(() => {
        if (!previewOpened) {
            setDeviceSelected(null)
            setBusSelected(null)
            setParadaSelected(null)
            localStorage.removeItem('videowall');
            setVideoWall(null)
        }
    }, [previewOpened])

    //Abrimos la pantalla de previsualización si hemos seleccionado un dispositivo desde el videowall
    useEffect(() => {

        if (videoWall !== null) {

            //Obtenemos el remontador con la cámara
            const device = devices.find(dispositivo => dispositivo.cod_dispositivo === videoWall);

            //Control de error por si la cámara seleccionada no está asignada
            if (device === undefined) {
                setPreviewOpened(false)
                setInfoMessage(t('errors.notAssigned'))
                return
            }

            //Almacenamos el remontador para poder tratarlo
            setDeviceSelected(device)

            //Abrimos la previsualización
            setPreviewOpened(true)

        }

        //eslint-disable-next-line
    }, [videoWall])


    //*------------------------------------------SOCKETS----------------------------------------------*//

    //actualiza alertas por socket
    useEffect(() => {
        if (lastAlert && lastAlert.modulo === 'mobility') {

            setAlerts(prevState => {
                const key = lastAlert?.cod_dispositivo
                const newData = { ...lastAlert, recon_type: 'vehicle', marcado: false }

                const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                return {
                    ...prevState,
                    [key]: trimmedList
                }
            })
        }
        //eslint-disable-next-line
    }, [lastAlert])

    //pide nuevos reconocimientos por socket
    useEffect(() => {
        if (previewOpened && server && deviceselected) {

            //Accede a la room
            const roomName = `reconocimientos_${server}_modulo_0011`
            joinRoom(roomName)

            subscribeToEvent('reconocimientos_cambio_modulo_0011', (data) => {
                setRecons(prevState => {
                    const key = data?.data?.cod_dispositivo
                    const newData = { ...data?.data, recon_type: 'vehicle', marcado: false }

                    const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                    return {
                        ...prevState,
                        [key]: trimmedList
                    }
                })
            })
            return () => {
                unsubscribeFromEvent('reconocimientos_cambio_modulo_0011')
                leaveRoom(roomName)
            }
        }
        //eslint-disable-next-line
    }, [previewOpened])

    //pide nuevos reconocimientos de persona por socket
    useEffect(() => {
        if (previewOpened && server && deviceselected) {

            //Accede a la room
            const roomName = `reconocimientos_personas_${server}_mobility`
            joinRoom(roomName)

            subscribeToEvent(`reconocimientos_personas_cambio_modulo_mobility`, (data) => {
                setRecons(prevState => {

                    const key = data?.data?.cod_dispositivo
                    const newData = { ...data?.data, recon_type: 'person', marcado: false }

                    const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                    return {
                        ...prevState,
                        [key]: trimmedList
                    }
                })
            });

            return () => {
                unsubscribeFromEvent(`reconocimientos_personas_cambio_modulo_mobility`)
                leaveRoom(roomName)
            }
        }
        //eslint-disable-next-line
    }, [previewOpened])


    return (
        <>

            {/* Modal para abrir el videowall */}
            {videowallModal &&
                <FilterSection setIsOpen={setVideowallModal} title={t('titles.videowallOpen')} onSubmit={showVideowall} rows={1} columns={1} unequalRows onChange={setVideowallState} state={videowallState} submitText={t('buttons.accept')} customStyles={{ width: '70dvw', maxWidth: '450px' }}>

                    <FilterSectionElement title="Videowall" name="videowall" inputType="ITEMS" items={autocompleteGrids} itemName='name' required strictInput />

                </FilterSection>
            }

            <main className={mapStyles['wrapper']}>

                {/* Mapa */}
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
                        },
                        {
                            disabled: !showBuses,
                            markers: buses,
                            selectedMarker: busSelected,
                            onClickMarker: onClickBus,
                            paramNameCod: 'cod_bus', paramNameNom: 'nombre_bus',
                            icon: bus_marker,
                            title: t('titles.transport')
                        }
                    ]}

                    zones={zones}
                    showZoneType1={showZar}
                    showZoneType2={showZbe}
                    showZoneType3={showDum}
                    onClickZone={onClickZone}

                    routeCoords={busSelected?.ruta}
                    routeColor={'#6692DB'}
                    routeWidth={3}
                    centerPadding={busSelected ? { top: 100, right: 600, bottom: 100, left: 100 } : undefined}
                >

                    {/* Marcadores paradas ruta  */}
                    {Array.isArray(busSelected?.paradas) && busSelected?.paradas?.map((parada) => (
                        <MarkerComponent
                            key={'p' + parada.cod_parada}
                            selectedMarker={paradaSelected}
                            item={parada}
                            icon={bus_stop_marker}
                            paramNameCod={'cod_parada'} paramNameNom={'nombre_parada'}
                            onClickMarker={() => onClickParada(parada)}
                        />
                    ))}

                </MapV4>

                {/* Navbar derecha o información sobre el dispositivo seleccionado */}
                {!previewOpened || (!deviceselected && !busSelected)
                    ? <RightBar
                        icons={[iconCam, iconBus, iconZar, iconZbe, iconDum]}
                        texts={[t('titles.cameras'), t('titles.transport'), t('values.ZAR'), t('values.ZBE'), t('values.DUM')]}
                        actions={[handleClickCam, handleClickBus, handleClickZar, handleClickZbe, handleClickDum, openVideowall]}
                        selecteds={[showDevices, showBuses, showZar, showZbe, showDum]}

                        disableStats={false}
                        statsElements={devices}
                    />
                    : deviceselected ?
                        <CityVisualization
                            item={deviceselected}
                            setPreviewOpened={setPreviewOpened}
                            recons={recons[deviceselected?.cod_dispositivo] || []}
                            setRecons={setRecons}
                            alerts={alerts[deviceselected?.cod_dispositivo] || []}
                            graphInfo={graphRecons}
                            instances={autocompleteInstances}
                            setInstances={setAutocompleteInstances}
                            cod_module={'0011'}
                            consulting_section={'mobility-consulting-consults'}
                        />
                        : busSelected ?
                            paradaSelected ?
                                <BusStopVisualization
                                    item={busSelected}
                                    setPreviewOpened={setParadaSelected}
                                />
                                :
                                <BusVisualization
                                    item={busSelected}
                                    setPreviewOpened={setPreviewOpened}
                                />
                            : null
                }
            </main>

        </>
    )
}