//Librerías
import { useEffect, useState, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

//Componentes
import { MapV4 } from '@components/Maps/MapV4/MapV4'
import { RightBar } from '@components/Maps/RightBar/RightBar'
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'
import { WasteVisualization } from '@components/DataVisualization/City/WasteVisualization'
import { VehicleVisualization } from '../../../../../components/DataVisualization/City/VehicleVisualization'

//Icons
import wastes from '@icons/map/waste.svg?react'
import waste_vehicle from '@icons/map/waste_vehicle.svg?react'

import waste_marker from '@icons/markers/waste.svg?react'
import vehicle_marker from '@icons/markers/waste_vehicle.svg?react'

//Context
import { useLoginDataContext } from '@context/LoginDataContext'
import MainDataContext from '@context/MainDataContext'

//Utils
import { getAutocompleteGrids, getAutocompleteInstances } from '@api/services/autocomplete'

//Constantes
import { url_path_city } from '@constants/common'

//CSS
import mapStyles from '@styles/sections/Map.module.css'


export const RecyclingLive = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { token } = useLoginDataContext()
    const { section, lastAlert, setIsLoading, setInfoMessage } = useContext(MainDataContext)
    const {t} = useTranslation()

    //Datos generales
    const [devices, setDevices] = useState([])
    const [vehicles, setVehicles] = useState([])
    const [alerts, setAlerts] = useState([])
    const [markerType, setMarkerType] = useState(undefined)

    //Cámara seleccionada en el videowall
    const [videoWall, setVideoWall] = useState(null);

    //Activar botones barra de navegación izquierda
    const [selectedOptions, setSelectedOptions] = useState({ wastes: true })

    //modales
    const [deviceselected, setDeviceSelected] = useState(null)
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
            setDevices([{
                "cod_dispositivo": "000081",
                "deviceId": "31ff4253-a04f-3768-19ac-9adadccaf421",
                "nom_dispositivo": "Fanal Lizarran 1",
                "direccion": "Carrer Bearn, 1, AD200 Pas de la Casa, Andorra",
                "cp": null,
                "coordenadas": "42.54148874101597,1.7329075864999481",
                "cod_provincia": null,
                "cod_poblacion": null,
                "serial_number": "",
                "cod_nodo": null,
                "puerta_enlace": "",
                "servidor_dhcp": "",
                "mascara_red": "",
                "protocolo_ip": "",
                "ip_dispositivo": "",
                "direccion_mac": "1C-C3-16-2C-EE-0F",
                "deveui": "",
                "appeui": "",
                "appkey": "",
                "username": "",
                "password": "*****",
                "systemId": "93286833-e813-42f8-aa53-5c45dc1f4fa1",
                "cod_cloud": "00010",
                "nombre_fabricante": "Milesight",
                "nombre_modelo": "TS2961-X12TPE",
                "nombre_categoria": "Cámara",
                "cod_fabricante": "0001",
                "cod_modelo": "0002",
                "cod_categoria": "0002",
                "modulos": [
                    {
                        "cod_modulo": "0011",
                        "abreviacion": "MOB",
                        "nombre_modulo": "mobility",
                        "cod_sector": "000001",
                        "estado_canal": "activo",
                        "fecha_fin_prorroga": null
                    },
                    {
                        "cod_modulo": "0001",
                        "abreviacion": "ATC",
                        "nombre_modulo": "analytic",
                        "cod_sector": "000001",
                        "estado_canal": "activo",
                        "fecha_fin_prorroga": null
                    },
                    {
                        "cod_modulo": "0014",
                        "abreviacion": "RCL",
                        "nombre_modulo": "recycling",
                        "cod_sector": "000001",
                        "estado_canal": "activo",
                        "fecha_fin_prorroga": null
                    }
                ]
            }])
            setVehicles([{
                cod: 1,
                name: 'Vehiculo recogida',
                coordenadas: '42.542342, 1.732725',
                dispositivos: [
                    {
                        cod_dispositivo: "000081",
                        nom_dispositivo: "Interior cabina",
                    }
                ]
            }])
        } catch {
            setDevices([])
        } finally {
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
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
    const onClickMarker = (device, code, type) => {
        const isSame = deviceselected?.[code] !== device?.[code]
        setDeviceSelected(isSame ? device : undefined)
        setPreviewOpened(isSame)
        setMarkerType(type)
    }

    //Para visualizar el componente del marcador seleccionado
    const componentVisualizer = useMemo(() => {

        const visualization = {
            'wastes':
                <WasteVisualization
                    item={deviceselected}
                    setPreviewOpened={setPreviewOpened}
                    alerts={[]}
                    graphInfo={[]}
                    instances={autocompleteInstances}
                    setInstances={setAutocompleteInstances}
                />,
            'vehicles':
                <VehicleVisualization
                    item={deviceselected}
                    setPreviewOpened={setPreviewOpened}
                />,
            undefined: undefined
        }
        return visualization[markerType] || undefined

    }, [markerType, deviceselected, autocompleteInstances]);


    //*------------------------------FUNCIONALIDADES NAVBAR LATERAL------------------------------------*//

    //Opciones de la barra lateral
    const navbarOptions = (option) => {

        const functions = {
            'wastes': () => setSelectedOptions(prevState => ({ ...prevState, 'wastes': !prevState.wastes })),
            'vehicles': () => setSelectedOptions(prevState => ({ ...prevState, 'vehicles': !prevState.vehicles })),
            'videowall': () => setSelectedOptions(prevState => ({ ...prevState, 'videowall': !prevState.videowall }))
        }
        return functions[option] || (() => { })
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //pide datos iniciales
    useEffect(() => {
        getDevices()
        getAutocompletes()

        // eslint-disable-next-line
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
            setAlerts([lastAlert, ...alerts])
        }
        //eslint-disable-next-line
    }, [lastAlert])



    return (
        <>

            {/* Modal para abrir el videowall */}
            {selectedOptions?.videowall &&
                <FilterSection
                    setIsOpen={() => setSelectedOptions(prevState => ({ ...prevState, 'videowall': false }))}
                    title={t('titles.videowallOpen')}
                    onSubmit={showVideowall}
                    rows={1}
                    columns={1}
                    unequalRows
                    onChange={setVideowallState}
                    state={videowallState}
                    submitText={t('buttons.accept')}
                    customStyles={{ width: '70dvw', maxWidth: '450px' }}
                >

                    <FilterSectionElement title="Videowall" name="videowall" inputType="ITEMS" items={autocompleteGrids} required itemName='name' strictInput />

                </FilterSection>
            }

            <main className={mapStyles['wrapper']}>

                    {/* Mapa */}
                    <MapV4
                        scannerColor={'red'}
                        centerItems={selectedOptions?.wastes ? devices : null}
                        enableSearchMarkers

                        markersArray={[
                            {
                                disabled: !selectedOptions?.wastes,
                                markers: devices,
                                selectedMarker: deviceselected,
                                onClickMarker: (e) => onClickMarker(e, 'cod_dispositivo', 'wastes'),
                                alerts: alerts,
                                icon:waste_marker,
                                title: t('titles.collectionPoints')
                            },
                            {
                                disabled: !selectedOptions?.vehicles,
                                markers: vehicles,
                                selectedMarker: deviceselected,
                                onClickMarker: (e) => onClickMarker(e, 'cod', 'vehicles'),
                                alerts: alerts,
                                paramNameCod:'cod', paramNameNom:'name',
                                icon:vehicle_marker,
                                title: t('titles.collectionVehicles')
                            }
                        ]}
                    />


                {/* Navbar derecha o información sobre el dispositivo seleccionado */}
                {!previewOpened
                    ? <RightBar
                        icons={[wastes, waste_vehicle]}
                        texts={[t('titles.collectionPoints'), t('titles.collectionVehicles')]}
                        actions={[() => navbarOptions('wastes')(), () => navbarOptions('vehicles')(), () => navbarOptions('videowall')()]}
                        selecteds={[selectedOptions?.wastes, selectedOptions?.vehicles]}
                        disableConf={true}
                    />
                    : componentVisualizer
                }
            </main>

        </>
    )
}