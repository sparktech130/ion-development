import styles from './Grid.module.css'
import React, { useEffect, useState } from 'react'

//components
import { GridItemVms } from '../../../../../../components/VMS/GridItemVms/GridItemVms'

//Utils
import { handleKey } from '../../../../../../utils/functions/accessibility'


export const Grid = ({
    gridDevices = [], //dispositivos del grid
    selectedDevice, setSelectedDevice,
    setCurrentTime, currentTime, // control cuanto lleva el video avanzado
    timeIni, setTimeIni, //pos inicial stream
    sync, //boton sync
    pause, //pausar stream
    live,
    volume,
    isMovements, //si se muestran movimientos o reconocimientos en el vms
    setAreaFilters, // filtro por zona en la imagen
    setIsSelectedRecognition, //si hay un reconocimiento clicado
    fecha,
    videoTime, setVideoTime, videoTimeCurrent, setVideoTimeCurrent, //tiempos por los que va el video
    ponerEnDirecto,
}) => {
    const [itemsWidth, setItemsWidth] = useState("100%") //ancho items grid
    const [fullScreen, setFullScreen] = useState(false)
    const [forceResetStream, setforceResetStream] = useState(1) //+1 resetea stream
    const [syncControl, setSyncControl] = useState(false) //se usa una copia para poder cambiarlo junto a timeIni y no se llamen 2 veces los streams


    //----------------useEffects--------------------------------

    //controla el tamaño de las cámaras del grid
    useEffect(()=>{
        if(gridDevices.length>16){
            setItemsWidth('20%')
        }else if(gridDevices.length>9){
            setItemsWidth('25%')
        }else if(gridDevices.length>4){
            setItemsWidth('33.33%')
        }else if(gridDevices.length>1){
            setItemsWidth('50%')
        }else{
            setItemsWidth('100%')
        }
    //eslint-disable-next-line
    },[gridDevices])


    //actualiza el grid si cambia la conf grid
    useEffect(()=>{
        //si solo hay 1 cam pone fullscreen
        if(gridDevices?.length===1){
            if(!fullScreen){
                setFullScreen(true)
                //pide el stream por donde iba esa cámara
                if(timeIni && videoTimeCurrent){
                    setTimeIni(videoTimeCurrent.valueOf())
                }
            }
        }else{
            //si hay más cams quita fullscreen
            if(gridDevices.length>0){
                if(fullScreen){
                    if(timeIni && videoTimeCurrent){
                        setTimeIni(videoTimeCurrent.valueOf())
                    }
                    setFullScreen(false)
                }
            //si no hay cams
            }else{
                setVideoTime(null)
                setVideoTimeCurrent(null)
            }
        }
        //eslint-disable-next-line
    },[gridDevices])

    //gestión sync
    useEffect(()=>{
        if(sync && timeIni && videoTimeCurrent){
            //si está el sync y no está en directo cambia timeIni para que no se descuadren los streams respecto al seleccionado
            setTimeIni(videoTimeCurrent.valueOf())
        }
        setSyncControl(sync)
    //eslint-disable-next-line
    },[sync])


    //------onclicks---------------------------------------------

    //clic en imagen grid
    const handleClickImg = (device) => {
        //la selecciona y pide el stream por donde iba el anterior video
        if(selectedDevice?.cod_dispositivo !== device?.cod_dispositivo){
            setSelectedDevice(device)
            setIsSelectedRecognition(false)
            if(timeIni && videoTimeCurrent){
                setTimeIni(videoTimeCurrent.valueOf())
            }
        }
    }

    //poner/quitar pantalla completa
    const onFullScreen = (e) => {
        e.stopPropagation()
        if(gridDevices.length !==1){
            if(fullScreen){
                setFullScreen(false)
                if(timeIni && videoTimeCurrent){
                    setTimeIni(videoTimeCurrent.valueOf())
                }
            }else{
                if(timeIni && videoTimeCurrent){
                    setTimeIni(videoTimeCurrent.valueOf())
                }else{
                    setforceResetStream(forceResetStream+1)
                }
                setFullScreen(true)
            }
        }
    }


    return(
        <div className={styles['grid']}>

            {/* cámara pantalla completa */}
            {fullScreen && selectedDevice &&
                <div className={styles['fullscreen__wrapper']}>
                    <GridItemVms
                        cod_dispositivo={selectedDevice.cod_dispositivo}
                        nom_dispositivo={selectedDevice.nom_dispositivo}
                        selected={true}
                        currentTime={currentTime} setCurrentTime={setCurrentTime} 
                        timeIni={timeIni} setTimeIni={setTimeIni}
                        pause={pause}
                        volume={volume}
                        live={live}
                        onFullScreen={onFullScreen}
                        device={selectedDevice}
                        showTime
                        videoTime={videoTime} videoTimeCurrent={videoTimeCurrent}
                        high
                        setSelectedDevice={setSelectedDevice}
                        isMovements={isMovements}
                        setAreaFilters={setAreaFilters}
                        selectedDevice={selectedDevice}
                        setIsSelectedRecognition={setIsSelectedRecognition}
                        idStream={'fullscreen'}
                        ponerEnDirecto={ponerEnDirecto}
                    />
                </div>
            }

            {/* cámaras grid */}       
            {gridDevices.map((device)=>(
                <React.Fragment key={device.cod_dispositivo}>
                    { (!fullScreen || (fullScreen && selectedDevice.cod_dispositivo !== device.cod_dispositivo)) &&
                        <div key={device.cod_dispositivo} className={styles['gridItem__wrapper']} style={{ width: itemsWidth}} onClick={()=>handleClickImg(device)} tabIndex={fullScreen ? -1 : 0} onKeyDown={(e)=>handleKey(e, ()=>handleClickImg(device))}>
                            <GridItemVms
                                cod_dispositivo={device.cod_dispositivo}
                                nom_dispositivo={device.nom_dispositivo}
                                selected={(selectedDevice?.cod_dispositivo===device.cod_dispositivo) ? true : false}
                                currentTime={(!fullScreen && (selectedDevice?.cod_dispositivo===device.cod_dispositivo)) ? currentTime : null}
                                setCurrentTime={(!fullScreen && (selectedDevice?.cod_dispositivo===device.cod_dispositivo)) ? setCurrentTime : null}
                                timeIni={((selectedDevice?.cod_dispositivo===device.cod_dispositivo) || syncControl) ? timeIni : null}
                                setTimeIni={setTimeIni}
                                pause={((selectedDevice?.cod_dispositivo===device.cod_dispositivo) || syncControl) ? pause : null}
                                live={live}
                                volume={(!fullScreen && (selectedDevice?.cod_dispositivo===device.cod_dispositivo)) ? volume : null}
                                onFullScreen={onFullScreen}
                                device={device}
                                showTime
                                videoTime={videoTime} videoTimeCurrent={videoTimeCurrent}
                                setSelectedDevice={setSelectedDevice}
                                isMovements={isMovements}
                                setAreaFilters={setAreaFilters}
                                hideAreaSelect={fullScreen}
                                selectedDevice={selectedDevice}
                                setIsSelectedRecognition={setIsSelectedRecognition}
                                fecha={fecha}
                                sync={syncControl}
                                forceResetStream={(fullScreen && (selectedDevice?.cod_dispositivo===device.cod_dispositivo)) ? forceResetStream : null}
                                ponerEnDirecto={ponerEnDirecto}
                            />
                        </div>
                    } 
                </React.Fragment>
            ))}
            
        </div>
    )
}