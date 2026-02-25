//Librerías
import { useState, useContext, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

//Componentes
import { MapV4 } from '@components/Maps/MapV4/MapV4'
import { SecurityVisualization } from '@components/DataVisualization/City/SecurityVisualization'
import { ConnectionVisualization } from '../../../components/DataVisualization/City/ConnectionVisualization'
import { RightBar } from '@components/Maps/RightBar/RightBar'
import { ArcStats } from '@components/Maps/MapV4/Components/DeckGL/HexagonStats/ArcStats'
import { HexagonStats } from '@components/Maps/MapV4/Components/DeckGL/HexagonStats/HexagonStats'

//CSS
import mapStyles from '@styles/sections/Map.module.css'

//Context
import MainDataContext from '../../../context/MainDataContext'

//Icons
import serverIcon from '@icons/navbar/servers.svg?react'
import markerIcon from '@icons/markers/ellipse.svg?react'
import { checkArray } from '../../../utils/functions/functions'



export const SecurityMap = () => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { setIsLoading } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos
    const [serverSelected, setServerSelected] = useState(null)
    const [connectionSelected, setConnectionSelected] = useState(null)
    const [menuOption, setMenuOption] = useState(null) //Menú seleccionado en el securityVisualization. valores: 'conexions', 'data'

    //Placeholder
    const servers = useMemo(()=>{
        return [
            {
                "cod_dispositivo": "000001",
                "nom_dispositivo": "Computer System",
                "coordenadas": "39.72207843795749,2.9127622865032663",
                "marker__color":"#6692DB",
            },
            {
                "cod_dispositivo": "000097",
                "nom_dispositivo": "Computer System",
                "coordenadas": "39.71522355052139,2.905434772225628",
                "marker__color":"#6692DB"
            },
        ]
    },[])
        const connections = useMemo(()=>{
        return [
            {
                "cod_dispositivo": "000036",
                "nom_dispositivo": "PLAZA PARADA BUS",
                "ip":"192.150.152",
                "coordenadas": "39.718552910560284,2.905075046541436",
                "marker__color":"#FFAB49",
                "request": true,
                "total": 20
            },
            {
                "cod_dispositivo": "000142",
                "nom_dispositivo": "PLAZA MERCAT",
                "ip":"192.150.154",
                "coordenadas": "39.720848563427325,2.910937904770776",
                "marker__color":"#EA4949",
                "total": 50
            },
            {
                "cod_dispositivo": "000502",
                "nom_dispositivo": "LPR AVDA. COLOM",
                "ip":"192.150.155",
                "coordenadas": "39.71749376544628,2.9121448377284764",
                "marker__color":"#FFAB49",
                "request": true,
                "total": 10
            },
            {
                "cod_dispositivo": "000503",
                "nom_dispositivo": "LPR AVDA. COLOM 2",
                "ip":"192.150.156",
                "coordenadas": "39.71768822990225,2.9123143804422114",
                "marker__color":"#EA4949"
                ,
                "total": 5
            },
            {
                "cod_dispositivo": "000505",
                "nom_dispositivo": "LPR PALAU",
                "ip":"192.150.157",
                "coordenadas": "39.71267731602131,2.9030786678685274",
                "marker__color":"#FFAB49"
                ,
                "total": 30
            },
            {
                "cod_dispositivo": "000512",
                "nom_dispositivo": "COCHERAS TANATORI",
                "ip":"192.150.158",
                "coordenadas": "39.711742490325946,2.9092095369005335",
                "marker__color":"#6692DB",
                "request": true,
                "total": 60
            },
            {
                "cod_dispositivo": "000513",
                "nom_dispositivo": "PK EXTERIOR PLA\u00c7A MERCAT",
                "ip":"192.150.159",
                "coordenadas": "39.72076067652927,2.9110449278759347",
                "marker__color":"#EA4949",
                "request": true,
                "total": 20
            },
            {
                "cod_dispositivo": "000515",
                "nom_dispositivo": "PK MERCAT EXTERIOR ASCENSOR",
                "ip":"192.150.178",
                "coordenadas": "39.72075032078487,2.9110591108483277",
                "marker__color":"#FFAB49",
                "total": 35
            }
        ]
    },[])


    //------------------------------USE EFFECT---------------------------------------------

    //Quitar cuando se implemente back-----------------!!!!!
    useEffect(() => {
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    //eslint-disable-next-line
    }, [])


    //-----------------------------EVENTS-----------------------------------

    //Click Servidor
    const onClickMarker = (item) => {
        if (serverSelected?.cod_dispositivo !== item?.cod_dispositivo) {
            setServerSelected(item)
        } else {
            setServerSelected(null)
        }
    }

    //Click Conexión
    const onClickConnection= (item) => {
        if (connectionSelected?.cod_dispositivo !== item?.cod_dispositivo) {
            setConnectionSelected(item)
        } else {
            setConnectionSelected(null)
        }
    }
    

    return (

        <>
            <main className={mapStyles['wrapper']}>

                {/* Mapa */}
                <MapV4
                    scannerColor={'red'}
                    centerItems={servers}
                    disableBuildings
                    antialias
                    markersArray={[
                        {
                            markers: servers,
                            selectedMarker: serverSelected,
                            onClickMarker: onClickMarker,
                            icon: markerIcon,
                            markerSize: 20,
                        },
                        {
                            disabled: !serverSelected || menuOption !== 'conexions',
                            markers: connections,
                            selectedMarker: connectionSelected,
                            onClickMarker: onClickConnection,
                            icon: markerIcon,
                            markerSize: 13,
                            markerSizeOnSelect: 20,
                            paramNameNom: 'ip'
                        }
                    ]}
                >
                    {serverSelected && (menuOption === 'conexions') &&
                        <ArcStats
                            markers={connections}
                            markerSelected={serverSelected}
                            centerPadding={{ top: 100, right: 600, bottom: 100, left: 100 }}
                        />
                    }
                    {serverSelected && checkArray(connections) && (menuOption === 'data') &&
                        <HexagonStats
                            data={connections}
                            centerItems={[...connections, serverSelected]}
                            centerPadding={{ top: 100, right: 600, bottom: 100, left: 100 }}
                        /> 
                    }  
                </MapV4>

                {/* Navbar derecha o información sobre el dispositivo seleccionado */}
                {!serverSelected
                    ? <RightBar
                        icons={[serverIcon]}
                        texts={[t('sections.SERVIDORES')]}
                        actions={[()=>{}]}
                        selecteds={[true]}
                        disableVideowall
                    />
                    : !connectionSelected ?
                        <SecurityVisualization
                            item={serverSelected}
                            setPreviewOpened={()=>setServerSelected(null)}
                            setMenuOption={setMenuOption}
                        />
                    : <ConnectionVisualization
                        item={connectionSelected}
                        setPreviewOpened={()=>setConnectionSelected(null)}
                    />
                }

            </main>
        </>

    )
}