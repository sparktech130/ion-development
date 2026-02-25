//Librerías
import React, { useEffect, useState, useContext } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Componentes
import { MapV4 } from '../../../../../components/Maps/MapV4/MapV4'
import { RightBar } from '../../../../../components/Maps/RightBar/RightBar'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { CityVisualization } from '../../../../../components/DataVisualization/City/CityVisualization'

//Servicios
import { URL_OBTENER_DISPOSITIVOS, URL_OBTENER_RECONOCIMIENTOS_PARAM, URL_OBTENER_PREVALIDACION_ALERTAS, URL_OBTENER_INFRACCIONES_GESTION, URL_ESTABLECER_VELOCIDAD, URL_OBTENER_VELOCIDAD, URL_OBTENER_RECONOCIMIENTOS_GROUP, URL_OBTENER_ALERTAS_GROUP } from '../../../../../api/connections/urls'
import { subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom } from '../../../../../api/connections/socketHandler'

//Constantes
import { url_path_city } from '../../../../../constants/common'

//Utils
import { getAutocompleteGrids, getAutocompleteInstances } from '../../../../../api/services/autocomplete'

//Context
import { useLoginDataContext } from '../../../../../context/LoginDataContext'
import MainDataContext from '../../../../../context/MainDataContext'

//Iconos
import icon112 from '../../../../../assets/icons/map/112.svg?react'
import iconCam from '../../../../../assets/icons/map/cam.svg?react'
import iconInfo from '../../../../../assets/icons/map/traffic-info.svg?react'
import iconPolice from '../../../../../assets/icons/vehicles/police.svg?react'

//Assets 
import policeMarker from '@icons/markers/police_marker.svg?react'

//CSS
import mapStyles from '../../../../../styles/sections/Map.module.css'



export const AlertsMap = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { token, server } = useLoginDataContext()
    const { section, lastAlert, setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos generales
    const [devices, setDevices] = useState([])
    const [polices, setPolices] = useState([])
    const [alerts, setAlerts] = useState([])
    //eslint-disable-next-line
    const [emergencies, setEmergencies] = useState([])
    const [recons, setRecons] = useState([])

    //Datos dispositivo seleccionado
    const [graphRecons, setGraphRecons] = useState([])
    const [analysisAlerts, setAnalysisAlerts] = useState([])
    const [speedLimit, setSpeedLimit] = useState(null)


    //Cámara seleccionada en el videowall
    const [videoWall, setVideoWall] = useState(null);

    //activar botones
    const [showDevices, setShowDevices] = useState(true)
    const [showPolice, setShowPolice] = useState(false)
    const [showInfo, setShowInfo] = useState(false)
    const [show112, setShow112] = useState(false)

    //Modales
    const [deviceselected, setDeviceSelected] = useState(null)
    const [videowallModal, setVideowallModal] = useState(false)
    const [videowallState, setVideowallState] = useState({})
    const [previewOpened, setPreviewOpened] = useState(false)
    const [speedModal, setSpeedModal] = useState(false)
    const [speedState, setSpeedState] = useState({})

    //Autocompletar
    const [autocompleteGrids, setAutocompleteGrids] = useState([])
    const [autocompleteInfractions, setAutocompleteInfractions] = useState([])
    const [autocompleteInstances, setAutocompleteInstances] = useState([])


    //*---------------------------------------AUTOCOMPLETAR--------------------------------------------*//

    //Funciones para rellenar el autocompletar
    async function getAutocompletes() {

        //Grids
        const grids = await getAutocompleteGrids(15)
        setAutocompleteGrids(grids)

        //Llamada para obtener los resultados
        const infractions = await requestAPI(URL_OBTENER_INFRACCIONES_GESTION, { cod_modulo: 15 }, 'city')
        setAutocompleteInfractions(infractions?.map(obj => {
            return {
                cod: obj?.cod_infraccion,  // Rename cod_infraccion to cod
                desc_infraccion: obj?.desc_infraccion,
                importe_infraccion: obj?.importe_infraccion,
                importe_reducido: obj?.importe_reducido,
                puntos: obj?.puntos,
                cod_modulo: obj?.cod_modulo
            }
        }))

        //Instancias
        const instances = await getAutocompleteInstances()
        setAutocompleteInstances(instances)


    }


    //*------------------------------------FUNCIONALIDADES MAPA----------------------------------------*//

    //obtiene dispositivos
    const getDevices = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS, { modulos: [15], comprobarRadar: true })
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

    //Obtiene los reconocimientos
    const getReconocimientos = async () => {

        try {
            let params = {
                modulos: [15],
                order: ["fecha DESC", "hora DESC"],
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

    //Obtiene los datos de estadística que mostraremos en el gráfico
    const getGraphStats = async () => {

        const params = {
            campos: ["fecha", "hora", "cod_dispositivo"],
            order: ['fecha', 'hora'],
            modulos: [15],
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
        }

        const paramsSpeed = {
            campos: ["fecha", "hora", "cod_dispositivo", "velocidad"],
            order: ['fecha', 'hora'],
            modulos: [15],
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
        }

        //Llamada para obtener los resultados
        const reconsCall = requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, params)
        const speedCall = requestAPI(URL_OBTENER_RECONOCIMIENTOS_GROUP, paramsSpeed)
        const alertsCall = requestAPI(URL_OBTENER_ALERTAS_GROUP, params, 'city')

        const [reconsData, speedData, alertsData] = await Promise.all([reconsCall, speedCall, alertsCall])

        //Control de errores
        setGraphRecons({ recons: !reconsData.error ? reconsData : [], speed: !speedData.error ? speedData : [], alerts: !alertsData.error ? alertsData : [] })

    }

    //Obtiene las alertas del dia
    const getAlerts = async () => {

        const params = {
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
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

    //Obtiene las alertas del dia agrupadas por incidencia y cámara para mostrarlas posteriormente en el apartado de Aálisis IA
    const getAnalysisStats = async () => {

        const params = {
            campos: ["cod_dispositivo", "incidencia", "cod_alertagest"],
            order: ['fecha', 'hora'],
            modulos: [15],
            fecha_ini: moment().format('YYYY-MM-DD'),
            fecha_fin: moment().format('YYYY-MM-DD'),
        }

        try {
            let data = await requestAPI(URL_OBTENER_ALERTAS_GROUP, params, 'city')
            if (!data.error) {

                const reduced_data = data?.reduce((acc, entry) => {
                    acc[entry?.cod_dispositivo] ??= {}
                    acc[entry?.cod_dispositivo][entry?.cod_alertagest] = entry
                    return acc
                }, {}) ?? {}

                setAnalysisAlerts(Object.keys(reduced_data).length > 0 ? reduced_data : [])

            } else {
                setAnalysisAlerts([])
            }
        } catch {
            setAnalysisAlerts([])
        }
    }

    //obtiene policías
    /*
    const getPolice = async () => {
        try {
            let data = [] // await requestAPI(URL_ULTIMAS_POSICIONES_POLICIA, null, url_origin)
            if (!data.error) {
                setPolices(data)
            } else {
                setPolices([])
            }
        } catch {
            setPolices([])
        }
    }
        */

    //obtiene emergencias
    const getEmergencies = async () => {
        try {
            let data = [] // await requestAPI(URL_OBTENER_DENUNCIAS_APPCIUDADANO_24, { cod_tipo_denuncia: "07" }, url_origin)
            if (!data.error) {
                setEmergencies(data)
            } else {
                setEmergencies([])
            }
        } catch {
            setEmergencies([])
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
        if (deviceselected?.cod_dispositivo !== device?.cod_dispositivo) {
            setDeviceSelected(device)
            setPreviewOpened(true)
        } else {
            setDeviceSelected(null)
            setPreviewOpened(false)
        }
    }

    //Obtener límite de velocidad del dispositivo
    const getSpeedLimit = async () => {

        if (deviceselected === null || deviceselected === undefined) { return }

        const params = {
            cod_dispositivo: deviceselected?.cod_dispositivo,
        }

        try {
            let data = await requestAPI(URL_OBTENER_VELOCIDAD, params, 'city')
            if (!data.error) {
                setSpeedLimit(data[0])
            } else {
                setInfoMessage(t('errors.request'))
            }
        } catch {
            setInfoMessage(t('errors.request'))
        }

    }

    //Función para activar el videowall
    const assignSpeedLimit = async (payload) => {

        setIsLoading(true)

        const params = {
            cod_dispositivo: deviceselected?.cod_dispositivo,
            velocidad_max: payload?.speed,
            cod_infraccion: payload?.alert?.cod
        }

        try {
            let data = await requestAPI(URL_ESTABLECER_VELOCIDAD, params, 'city')

            if (data.error) {
                setInfoMessage(t('errors.request'))
            } else {
                setInfoMessage(t('crud.elementEdited'))
                getSpeedLimit()
            }
        } catch {
            setInfoMessage(t('errors.request'))
        } finally {
            setIsLoading(false)
        }

    }


    //*------------------------------FUNCIONALIDADES NAVBAR LATERAL------------------------------------*//

    //onclick opción cámaras
    const handleClickCam = () => {
        setShowDevices(!showDevices)
    }

    //onclick opcción policía
    const handleClickPolice = () => {
        setShowPolice(!showPolice)
    }

    //onclick opcción info
    const handleClickInfo = () => {
        setShowInfo(!showInfo)
    }

    //onclick opcción 112
    const handleClick112 = () => {
        setShow112(!show112)
    }

    //Abrir el modal para la selección de videowall
    const openVideowall = () => {
        setVideowallModal(true)
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada de datos inicial
    useEffect(() => {
        getAutocompletes()
        getDevices()
        getAlerts()
        getAnalysisStats()
        //getPolice()
        getEmergencies()
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
    }, [])

    //Al cerrar la previsualización del dispositivo, reseteamos el dispositivo seleccionado a undefined
    useEffect(() => {
        if (!previewOpened) {
            setDeviceSelected(null)
            localStorage.removeItem('videowall');
            setVideoWall(null)
        }
    }, [previewOpened])

    //Abrimos la pantalla de previsualización si hemos seleccionado un remontador desde el videowall
    useEffect(() => {

        if (videoWall !== null) {

            //Obtenemos el remontador con la cámara
            const device = devices.find(dispositivo => dispositivo?.cod_dispositivo === videoWall);

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

    //Gestión de llamadas al seleccionar un dispositivo
    useEffect(() => {
        if (deviceselected) {
            deviceselected.tiene_radar === 1 && getSpeedLimit()
        }
        // eslint-disable-next-line
    }, [deviceselected]);


    //Vaciar modal de asignación de velocidad
    useEffect(() => {
        setSpeedState({})

        //eslint-disable-next-line
    }, [speedModal])

    //*------------------------------------------SOCKETS----------------------------------------------*//

    //actualiza alertas por socket
    useEffect(() => {
        if (lastAlert && lastAlert.modulo === 'traffic') {

            setAlerts(prevState => {
                const key = lastAlert?.cod_dispositivo
                const newData = { ...lastAlert, recon_type: 'vehicle', marcado: false }

                const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                return {
                    ...prevState,
                    [key]: trimmedList
                }
            })

            setAnalysisAlerts(prev => {
                const device = lastAlert.cod_dispositivo;
                const alertCode = lastAlert.cod_alertagest;

                if (!prev[device] || !prev[device][alertCode]) return prev;

                return {
                    ...prev,
                    [device]: {
                        ...prev[device],
                        [alertCode]: {
                            ...prev[device][alertCode],
                            total: prev[device][alertCode].total + 1
                        }
                    }
                };
            });

        }
        //eslint-disable-next-line
    }, [lastAlert])

    //actualiza posiciones policía por socket
    useEffect(() => {

        if (!server) return

        //Accede a la room
        const roomName = `posiciones_${server}`
        joinRoom(roomName)

        subscribeToEvent('nueva_posicion', (data) => {
            setPolices(prevState => {
                const existingIndex = prevState.findIndex(police => police.cod_vehiculo === data.data.cod_vehiculo);
                if (existingIndex !== -1) {
                    const updatedPolices = [...prevState];
                    updatedPolices[existingIndex] = data.data;
                    return updatedPolices;
                } else {
                    return [...prevState, data.data];
                }
            });
        });
        return () => {
            unsubscribeFromEvent('nueva_posicion');
            leaveRoom(roomName)
        };
        //eslint-disable-next-line
    }, []);

    //actualiza emergencias por socket
    useEffect(() => {

        if (!server) return

        //Accede a la room
        const roomName = `denuncias_${server}`
        joinRoom(roomName)

        subscribeToEvent('nueva_denuncia', (data) => {
            setEmergencies(prevState => {
                return [...prevState, data.data];
            });
        });
        return () => {
            unsubscribeFromEvent('nueva_denuncia');
            leaveRoom(roomName)
        };
        //eslint-disable-next-line
    }, []);

    //pide nuevos reconocimientos por socket
    useEffect(() => {
        if (previewOpened) {

            if (!server) return

            //Accede a la room
            const roomName = `reconocimientos_${server}_modulo_0015`
            joinRoom(roomName)

            subscribeToEvent('reconocimientos_cambio_modulo_0015', (data) => {
                setRecons(prevState => {
                    const key = data?.data?.cod_dispositivo
                    const newData = { ...data?.data, recon_type: 'vehicle', marcado: false }

                    const trimmedList = [newData, ...prevState[key] || []].slice(0, 20)

                    return {
                        ...prevState,
                        [key]: trimmedList
                    }
                })
            });
            return () => {
                unsubscribeFromEvent('reconocimientos_cambio_modulo_0015')
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

            {/* Modal velocidad */}
            {speedModal &&
                <FilterSection setIsOpen={setSpeedModal} title={t('titles.speedConfig')} onSubmit={assignSpeedLimit} rows={3} columns={3} unequalRows onChange={setSpeedState} state={speedState} submitText={t('buttons.accept')} customStyles={{ width: '70dvw', maxWidth: '750px' }}>
                    <FilterSectionElement title={t('params.maxSpeed')} name="speed" inputType="number" width={1} initialValue={speedLimit?.velocidad_max} hint={t('messages.speedAlertThreshold')} required />
                    <FilterSectionElement title={t('params.infraction')} name="alert" inputType="ITEMS" items={autocompleteInfractions} itemName='cod' description='desc_infraccion' defaultItem={speedLimit?.cod_infraccion} width={3} strictInput required />
                </FilterSection>
            }


            <main className={mapStyles['wrapper']}>

                {/* Mapa */}
                <MapV4
                    scannerColor={'red'}
                    enableTrafficLayer={showInfo}
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
                            disabled: !showPolice,
                            markers: polices,
                            paramNameCod: 'cod_policia', paramNameNom: 'nom_policia',
                            icon: policeMarker,
                            title: t('titles.policeVehicles')
                        }
                    ]}
                />

                {/* Navbar derecha o información sobre el dispositivo seleccionado */}
                {!previewOpened
                    ? <RightBar
                        icons={[iconCam, iconPolice, iconInfo, icon112]}
                        texts={[t('titles.cameras'), t('titles.policeVehicles'), t('titles.trafficInfo'), t('titles.notifications') + ' 112']}
                        actions={[handleClickCam, handleClickPolice, handleClickInfo, handleClick112, openVideowall]}
                        selecteds={[showDevices, showPolice, showInfo, show112]}

                        disableStats={false}
                        statsElements={devices}
                    />
                    : <CityVisualization
                        item={deviceselected}
                        setPreviewOpened={setPreviewOpened}
                        recons={recons[deviceselected?.cod_dispositivo] || []}
                        setRecons={setRecons}
                        alerts={alerts[deviceselected?.cod_dispositivo] || []}
                        analysisStats={analysisAlerts[deviceselected?.cod_dispositivo] || {}}
                        graphInfo={graphRecons}
                        openSpeedLimit={setSpeedModal}
                        instances={autocompleteInstances}
                        setInstances={setAutocompleteInstances}
                        cod_module={'0015'}
                        consulting_section={'traffic-consulting-consults'}
                    />
                }

            </main>
        </>

    )
}