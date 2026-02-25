//Librerías
import React, { Suspense, useState, useEffect, useRef, useMemo, useContext } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import { EffectComposer, Bloom, Noise, Vignette, ChromaticAberration } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '@context/MainDataContext'

//API
import { URL_NODOS_DETALLE } from '@api/connections/urls'


// Assets 3D
import s1288H from '../../../assets/models/1288H_unpacked.glb'
import s2288H from '../../../assets/models/2288H_unpacked.glb'

// Components
import { CPUVisualization } from '@components/DataVisualization/ServerComponents/CPUVisualization'
import { FanVisualization } from '@components/DataVisualization/ServerComponents/FanVisualization'
import { NICVisualization } from '@components/DataVisualization/ServerComponents/NICVisualization'
import { PCIVisualization } from '@components/DataVisualization/ServerComponents/PCIVisualization'
import { PSUVisualization } from '@components/DataVisualization/ServerComponents/PSUVisualization'
import { RAMVisualization } from '@components/DataVisualization/ServerComponents/RAMVisualization'
import { ServerVisualization } from '@components/DataVisualization/ServerComponents/ServerVisualization'
import { StorageVisualization } from '@components/DataVisualization/ServerComponents/StorageVisualization'
import { Route } from '@components/Route/Route'

// CSS
import deviceStyles from '@styles/sections/Device.module.css';
import { URL_NODOS_ESTADISTICAS } from '../../../api/connections/urls'
import { StatsWrapper } from './Stats/StatsWrapper'

// Modelo 3D
const Model = ({ modelPath, onClick }) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Modelo 3D
    const { scene } = useGLTF(modelPath) //Escena 3D
    const [hoveredPart, setHoveredPart] = useState(null) //Objeto resaltado
    const [selectedPart, setSelectedPart] = useState(undefined) //Selección
    const originalColors = useRef(new Map()) //Colores originales del modelo 3D

    //Componentes permitidos para selección
    const serverParts = ["FAN", "CPU", "GPU", "RAM", "PSU", "NIC", "PCI", "HDD"]


    //*-------------------------------------FUNCIONALIDADES-------------------------------------------*//

    //Resaltar objeto 3D
    const handlePointerOver = (e) => {
        e.stopPropagation();
        setHoveredPart(e.object.parent.name.split('_')[0]);
    }

    //Restaurar objeto 3D
    const handlePointerOut = (e) => {
        e.stopPropagation();
        setHoveredPart(null);
    }

    //Hacer click en objeto 3D
    const handleClick = (e) => {
        e.stopPropagation()
        const clickedPart = e.object.parent.name.split('_')[0]
        if (serverParts.includes(clickedPart)) {
            setSelectedPart((prev) => (prev === clickedPart ? undefined : clickedPart))
            if (onClick) {
                selectedPart !== clickedPart ? onClick(clickedPart) : onClick(undefined)
            }
        }

    }


    //*----------------------------------------USE EFFECT---------------------------------------------*//

    //Asignar colores originales del modelo 3D
    useEffect(() => {
        const originalColorsMap = new Map()


        scene.traverse((child) => {
            if (child.isMesh) {
                const material = child.material
                if (!originalColors.current.has(child.name)) {
                    originalColorsMap.set(child.name, material.color.clone())
                }
            }
        })

        originalColors.current = originalColorsMap

        //Restaurar objeto 3D
        return () => {
            scene.traverse((child) => {
                if (child.isMesh && originalColors.current.has(child.name)) {
                    child.material.color.copy(originalColors.current.get(child.name))
                }
            })
        }
    }, [scene])

    useEffect(() => {
        scene.traverse((child) => {
            if (child?.isMesh || child?.isGroup) { // Include groups
                const parentName = child?.parent.name.split('_')[0] //Obtenemos elemento padre (todos se han nombrado de la siguiente manera: XXX_000)

                //Comprobamos si el elemento está seleccionado o con hover
                const isInHoveredCollection = parentName === hoveredPart
                const isInSelectedCollection = parentName === selectedPart

                //Almacenamos material
                if (!originalColors?.current?.has(child?.name)) {
                    originalColors?.current?.set(child?.name, child?.material?.color.clone())
                }

                if ((isInHoveredCollection || isInSelectedCollection) && serverParts.includes(parentName)) {
                    child.material = child?.material?.clone() //Clonamos material
                    child.material?.color?.set('#E93636') //Asignamos un color rojo
                } else {
                    const originalColor = originalColors?.current?.get(child.name)
                    if (originalColor) child?.material?.color?.copy(originalColor)
                }
            }
        })

        //eslint-disable-next-line
    }, [scene, hoveredPart, selectedPart])

    return (
        <primitive
            object={scene}
            scale={1}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
            onClick={handleClick}
        />
    );
}

export const CurrentServer = ({ item, close }) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Información del nodo
    const [data, setData] = useState([])
    const [stats, setStats] = useState([])

    //Selecciones
    const [selectedPart, setSelectedPart] = useState(undefined) //Componente del servidor seleccionado
    const [statsEnabled, setStatsEnabled] = useState(false)

    //Modelos 3D de los servidores
    const serverModel = { 'ION-SI-1108HG1R': s1288H, 'ION-SI-2108HG1R': s1288H }


    //*-------------------------------------LLAMADAS API------------------------------------------------*//

    //Obtiene los servidores
    const getServerDetail = async () => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Petición API
        const api_details = await requestAPI(URL_NODOS_DETALLE, { id: item?.id })
        const api_stats = await requestAPI(URL_NODOS_ESTADISTICAS, { id: item?.id })

        //Control de errores
        const error = api_details?.message || api_stats?.message
        if (error) {
            setInfoMessage(error)
            setIsLoading(false)
            return
        }

        //Formateamos datos de las estadísticas
        const reduced_stats = api_stats?.reduce((acc, entry) => {
            acc[entry?.Category] = entry?.Metrics
            return acc
        }, {})

        //Asignación de datos
        api_details?.node && setData(api_details?.node)
        api_stats && setStats(reduced_stats)

        //Finalizamos pantalla de carga
        setTimeout(() => { setIsLoading(false) }, 300)

    }


    //*-------------------------------------FUNCIONALIDADES-------------------------------------------*//

    //Renderiza el visualizador de la parte del componente del servidor seleccionado
    const componentVisualizer = useMemo(() => {
        const parts = {
            'CPU': <CPUVisualization item={data?.Components?.Processor} stats={{ usage: stats['processor'], temperature: stats['thermal'], power: stats['power'] }} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'FAN': <FanVisualization item={data?.Components?.Thermal} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'NIC': <NICVisualization item={data?.Components?.Network} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'PCI': <PCIVisualization item={data?.Components?.PCIe} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'PSU': <PSUVisualization item={data?.Components?.Power} stats={{ power: stats['power'] }} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'RAM': <RAMVisualization item={data?.Components?.Memory} stats={{ usage: stats['memory'], power: stats['power'] }} setPreviewOpened={() => setSelectedPart(undefined)} />,
            'HDD': <StorageVisualization item={data?.Components?.Storage} stats={stats['drive']} setPreviewOpened={() => setSelectedPart(undefined)} />,
            undefined: undefined
        }
        return parts[selectedPart] || undefined

        //eslint-disable-next-line
    }, [item, selectedPart])


    //*----------------------------------------USE EFFECT---------------------------------------------*//

    //Obtener detalles del servidor
    useEffect(() => {
        getServerDetail()

        //eslint-disable-next-line
    }, [])



    return (
        <>

            {/* Visualizador de información */}
            {!selectedPart && !statsEnabled
                ? <ServerVisualization item={item} users={data?.Components?.Accounts} storageUnits={data?.Components?.Storage} statsEnabled={statsEnabled} setStatsEnabled={setStatsEnabled} />
                : componentVisualizer
            }

            <Route
                routes={[
                    { name: t('sections.SERVIDORES'), action: close },
                    { name: item?.Name, action: () => { setStatsEnabled(false) } },
                    ...(statsEnabled ? [{ name: t('sections.ESTADISTICAS') }] : []) // conditionally add object
                ]}
                wrapper
            />

            {/* Fondo */}
            <div className={deviceStyles['background']}>
                <div className={deviceStyles['dots']} />
                <div className={deviceStyles['circle']} />
            </div>

            {!statsEnabled
                ? <ModelViz item={item} serverModel={serverModel} setSelectedPart={setSelectedPart} />
                : <StatsWrapper stats={stats} />
            }


        </>
    )
}

const ModelViz = ({ item, serverModel, setSelectedPart }) => {
    return (
        <div className={deviceStyles['visualizer']}>
            <Canvas camera={{ position: [-0.5, 0.5, 0.5], fov: 60 }}>

                {/* Iluminación */}
                <ambientLight intensity={1} />
                <directionalLight position={[5, 5, 5]} intensity={1.5} /> {/*eslint-disable-line*/}
                <pointLight position={[1, 1, 1]} intensity={2} /> {/*eslint-disable-line*/}

                {/* Modelo 3D */}
                <Suspense fallback={null}>
                    <Model modelPath={serverModel[item?.Model]} onClick={(part) => setSelectedPart(part)} />
                </Suspense>

                {/* Efectos */}
                <EffectComposer>
                    <Bloom intensity={0.75} width={512} height={512} kernelSize={3} luminanceThreshold={0.3} luminanceSmoothing={0.9} />
                    <Noise opacity={0.02} />
                    <Vignette eskil={false} offset={0.1} darkness={0.8} />
                    <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={[0.0002, 0.0002]} />
                </EffectComposer>

                {/* Controles de cámara */}
                <OrbitControls minDistance={0.1} maxDistance={2} />

            </Canvas>
        </div>
    )
}
