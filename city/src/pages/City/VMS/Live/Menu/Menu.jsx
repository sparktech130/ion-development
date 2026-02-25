import styles from './Menu.module.css'
import React, { useEffect, useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//services
import { URL_OBTENER_CLOUDS, URL_OBTENER_GRIDS } from '../../../../../../api/connections/urls'

//assets
import serverIcon from '../../../../../../assets/icons/grid/server.svg?react'
import serversIcon from '../../../../../../assets/icons/grid/servers.svg?react'
import openIcon from '../../../../../../assets/icons/actions/dropdown.svg?react'
import camIcon from '../../../../../../assets/icons/map/cam.svg?react'
import layoutIcon from "../../../../../../assets/icons/navbar/live-vms.svg?react"

//Utils
import { handleKey } from '../../../../../../utils/functions/accessibility'

//Components
import {AccesibleIcon} from '../../../../../../components/AccesibleIcon/AccesibleIcon'


//menú lateral
export const Menu = ({
    devices = [], //todos
    gridDevices = [], setGridDevices, //dispositivos que hay en el grid en orden
    selectedDevice, setSelectedDevice,
    resetTimeline,
    modulo, 
}) => {

    const { setIsLoading, requestAPI, codSector, setInfoMessage } = useContext(MainDataContext)
    const {t} = useTranslation()

    //datos
    const [clouds, setClouds] = useState([])
    const [filteredClouds, setFilteredClouds] = useState([])
    const [layouts, setLayouts] = useState([])

    //menus
    const [showClouds, setShowClouds] = useState(false)
    const [openedClouds, setOpenedClouds] = useState([])
    const [showLayouts, setShowLayouts] = useState(false)
    const [selectedLayout, setSelectedLayout] = useState(null)
    const [dispositivosLayout, setDispositivosLayout] = useState([])


    //-------------------USEEFFECT---------------------

    //selecciona el layout
    useEffect(()=>{
        if(selectedLayout && devices){
            let dispositivos = []
            selectedLayout.dispositivos?.split(";").forEach(element => {
                let dispositivo = devices.find(item=>item.cod_dispositivo===element)
                if(dispositivo){
                    dispositivos.push(dispositivo)
                }
            });
            setDispositivosLayout(dispositivos)
            setGridDevices(dispositivos)
            setSelectedDevice(dispositivos[0])
        }
    //eslint-disable-next-line
    },[selectedLayout, devices])

    //quita los clouds que no tienen dispositivos asignados al módulo
    useEffect(()=>{
        if(devices.length>0 && clouds.length>0){
            let cloudsFiltrados = clouds.filter(item=>devices.some(device=>device.cod_cloud===item.cod_cloud))
            setFilteredClouds(cloudsFiltrados)
        }
    },[devices, clouds])

    //------------------FUNCIONES BACK----------------------

    //pide clouds
    const getClouds = async () => {
        try{
            let data = await requestAPI(URL_OBTENER_CLOUDS, {cod_sector: codSector})
            if(!data.error){
                setClouds(data)
            }else{
                setClouds([])
            }
        }catch{
            setClouds([])
        }finally{
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //pide layouts
    const getLayouts = async () => {
        try{
            let params = {
                cod_modulo: modulo,
                cod_sector: codSector
            }
            let data = await requestAPI(URL_OBTENER_GRIDS, params)
            if(!data.error && Array.isArray(data) && data.length>0){
                setLayouts(data)
                let favorito = data.find(item=>item.seleccionado===1)
                if(favorito){
                    setSelectedLayout(favorito)
                    setShowLayouts(true)
                }
            }else{
                setLayouts([])
            }
        }catch{
            setLayouts([])
        }
    }

    //llamada inicial
    useEffect(()=>{
        getClouds()
        getLayouts()
    //eslint-disable-next-line
    },[])

    //---------------DEMÁS FUCIONES--------------

    // Abre/cierra el cloud clicado
    const toggleOpenServer = (number) => {
        const index = openedClouds.indexOf(number);
        if (index === -1) {
            setOpenedClouds([...openedClouds, number]);
        } else {
            const newClouds = [...openedClouds];
            newClouds.splice(index, 1);
            setOpenedClouds(newClouds);
        }
    };

    
    //click device (lo añade o lo quita según si estaba ya en el grid)
    const onClickDevice = (device) => {
        //si ya está en el grid lo quitamos
        if (gridDevices.some(item => item.cod_dispositivo === device.cod_dispositivo)) {
            //si es el seleccionado
            if(selectedDevice?.cod_dispositivo === device?.cod_dispositivo){
                //si hay otros selecciona otro
                if(gridDevices.length>1){
                    resetTimeline(true)
                    setSelectedDevice(gridDevices.filter(item=>item.cod_dispositivo!==device.cod_dispositivo)[0])
                }else{
                    resetTimeline()
                    setSelectedDevice(null)
                }
            }
            const updatedDevices = gridDevices.filter(item => item.cod_dispositivo !== device.cod_dispositivo);
            setGridDevices(updatedDevices);
        //si no está en el grid lo añadimos
        } else {
            //control máx dispositivos
            if(gridDevices.length<30){
                if(!selectedDevice){
                    setSelectedDevice(device)
                    resetTimeline(true)
                }
                setGridDevices([...gridDevices, device]);
            }else{
                setInfoMessage(t('messages.maxCamerasReached', {count:30}))
            }
        }
    }

    //click en layout
    const onClickLayout = (item) =>{
        if(selectedLayout){
            if(selectedLayout.cod_grid===item.cod_grid){
                setSelectedLayout(null)
                setDispositivosLayout([])
                setGridDevices([])
                setSelectedDevice(null)
                resetTimeline()
            }else{
                setSelectedLayout(item)
            }
        }else{
            setSelectedLayout(item)
        }
    }



    return(
        <main className={styles['menu']}>

            {/* Abrir menú clouds */}
            <div className={styles['item']} onClick={()=>setShowClouds(!showClouds)} tabIndex={0} onKeyDown={e=>{handleKey(e, ()=>setShowClouds(!showClouds))}}>
                <AccesibleIcon src={serversIcon} />
                <p>{t('sections.CLOUD')}</p>
                <AccesibleIcon customStyle={styles['open__icon']+' '+(showClouds ? styles['open__icon--opened'] : '')} src={openIcon} alt='open' />
            </div>

            {/* Clouds */}
            {showClouds &&
                <div className={styles['items__wrapper']}>
                    {filteredClouds.map((item, i)=>(
                        <React.Fragment key={i}>
                            <div className={styles['item']} onClick={()=>toggleOpenServer(i)} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>toggleOpenServer(i))}>
                                <AccesibleIcon src={serverIcon} />
                                <p>{item.nombre}</p>
                            </div>
                            {openedClouds.includes(i) &&
                                <div className={styles['devices__wrapper']} key={i}>
                                    {devices.map((device, i) =>(
                                        <React.Fragment key={i}>
                                            {(device.cod_cloud === item.cod_cloud) && 
                                                <div onClick={()=>onClickDevice(device)} title={device.nom_dispositivo} className={styles['device']+' '+((gridDevices.some(item => item.cod_dispositivo === device.cod_dispositivo)) ? styles['device--selected'] : '')} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>onClickDevice(device))}>
                                                    {/*<div className={device.online ? styles['ball--green'] : styles['ball--red']}></div>*/}
                                                    <AccesibleIcon src={camIcon} />
                                                    <p>{device.nom_dispositivo}</p>
                                                </div>
                                            }
                                        </React.Fragment>
                                    ))}
                                </div>
                            }   
                        </React.Fragment>
                    ))}
                </div>
            }

            { /* abrir menú layouts */ }
            <div className={styles['item']} onClick={()=>setShowLayouts(!showLayouts)} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>setShowLayouts(!showLayouts))}>
                <AccesibleIcon src={layoutIcon} />
                <p>{t('sections.LAYOUTS')}</p>
                <AccesibleIcon customStyle={styles['open__icon']+' '+(showLayouts ? styles['open__icon--opened'] : '')} src={openIcon} alt='open' />
            </div>

            {/* Layouts */}
            {showLayouts &&
            <div className={styles['items__wrapper']}>
                {layouts.map((item, i)=>(
                    <React.Fragment key={i}>
                        <div className={styles['item']} onClick={()=>onClickLayout(item)} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>onClickLayout(item))}>
                            <AccesibleIcon src={layoutIcon} />
                            <p>{item.nombre_grid}</p>
                        </div>

                        {selectedLayout && (selectedLayout.cod_grid === item.cod_grid) &&
                            <div className={styles['devices__wrapper']}>
                                {dispositivosLayout && dispositivosLayout.map((device, i) =>(
                                    <React.Fragment key={i}>
                                        <div onClick={()=>onClickDevice(device)} title={device.nom_dispositivo} className={styles['device']+' '+((gridDevices.some(item => item.cod_dispositivo === device.cod_dispositivo)) ? styles['device--selected'] : '')} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>onClickDevice(device))}>
                                            <AccesibleIcon src={camIcon} />
                                            <p>{device.nom_dispositivo}</p>
                                        </div>
                                    </React.Fragment>
                                ))}
                            </div>
                        } 

                    </React.Fragment>
                ))}
            </div>
            }
        </main>
    )
}