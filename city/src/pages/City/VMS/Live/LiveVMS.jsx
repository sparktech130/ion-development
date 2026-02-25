import styles from './LiveVMS.module.css'
import { useState, useEffect, useContext } from 'react'
import moment from 'moment'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../../context/MainDataContext'

//componentes
import { Box } from '../../../../../components/Box/Box'

//partes VMS
import { Menu } from './Menu/Menu'
import { Grid } from './Grid/Grid'
import { Timeline } from '../../../../../components/VMS/Timeline/Timeline'
import { VMSRight } from './VMSRight/VMSRight'

//services
import { URL_OBTENER_DISPOSITIVOS } from '../../../../../api/connections/urls'

//Constants
import { smartcity_modules } from '../../../../../constants/common'


export const LiveVMS = ({
    modulo, 
    vertical_sector
}) => {

    const {requestAPI} = useContext(MainDataContext)
    const {t} = useTranslation()

    //devices
    const [gridDevices, setGridDevices] = useState([]) //[{},{},...]
    const [devices, setDevices] = useState([])
    const [selectedDevice, setSelectedDevice] = useState(null)

    //reconocimientos/movimientos
    const [reconocimientos, setReconocimientos] = useState([])
    const [movimientos, setMovimientos] = useState([])
    const [isSelectedRecognition, setIsSelectedRecognition] = useState(false) //control para no actualizar reconocimietos si clicamos un reconocimiento desde lista derecha
    const [isMovements, setIsMovements] = useState(false) // si vemos movimientos o reconocimientos en la timeline

    //tiempos stream
    const [videoTime, setVideoTime] = useState(null) //moment: tiempo por el que va el stream actualizado cada segundo más o menos (para hacer comprobaciones. el videoTimeCurrent se actualiza demasiado frrequentemente)
    const [videoTimeCurrent, setVideoTimeCurrent] = useState(null) //moment: tiempo por el que va el stream más preciso
    const [fecha, setFecha] = useState(moment()) //moment
    const [timeIni, setTimeIni] = useState(null) //ms
    const [currentTime, setCurrentTime] = useState(0); //segundos que han pasado de video desde que ha iniciado video
    const [currentTimeSecond, setCurrentTimeSecond] = useState(0) //currentime pero cambiando solo si ha pasado un segundo para no actualizar tan frequentemente ciertas partes
    
    //timeline
    const [forceReset, setforceReset] = useState(0) // +1 resetea zoom timeline
    const [seleccion, setSeleccion] = useState(null) // Timerange de librería pondjs: seleccion.begin() seleccion.end() da un date
    const [seleccionCurrent, setSeleccionCurrent] = useState(null) // lo mismo pero se actualiza mientras se selecciona. seleccion ssolo cuando terminas de seleccionar
    const [horaPuntero, setHoraPuntero] = useState(null); //date
    
    //botones
    const [live, setLive] = useState(true) //true/false
    const [sync, setSync] = useState(false) //true/false
    const [pause, setPause] = useState(null) // null/true
    const [volume, setVolume] = useState(false) // true/false
    const [volumeValue, setVolumeValue] = useState(0.5)
    
    //filtros
    const [areaFilters, setAreaFilters] = useState(null) //filtro area seleccionada {x1:0, x2:1, y1:0, y2:0.5} 1 en x representa el 100% de ancho


    //----------------------control por donde va el video----------------------------

    // actualiza currentTimeSecond si currentTime ha cambiado de segundo
    useEffect(()=>{
        if(currentTime){
            if(Math.trunc(currentTime) !== Math.trunc(currentTimeSecond)){
                setCurrentTimeSecond(currentTime)  
            }
        }else{
            setCurrentTimeSecond(currentTime)
        }
    //eslint-disable-next-line
    },[currentTime])

    // tiempo por el que va el stream actualizado cada segundo (para que no haga las comprobaciones tan frequentemente)
    useEffect(()=>{
        if(timeIni){
            let time = moment(timeIni).add(currentTimeSecond, 'seconds')
            setVideoTime(time)
        }else{
            setVideoTime(null)
        }
    },[currentTimeSecond, timeIni])

    //tiempo por el que va el stream actualizado con currentime del <video>
    useEffect(()=>{
        if(timeIni){
            let time = moment(timeIni).add(currentTime, 'seconds')
            setVideoTimeCurrent(time)
        }else{
            setVideoTimeCurrent(null)
        }
    },[currentTime, timeIni])


    //-------------------------pedir datos-----------------------------------

    //pide dispositivos
    const getDevices = async () => {
        try{
            let modulos = [modulo]
            //Si es de 'Vms city' o 'Vms Ski' los dispositivos que se piden son los asignados a módulos de ese sector (no se asignan al módulo vms al no tener licencia) 
            if(modulo===17){
                modulos = smartcity_modules.filter(item=>!item.disabled && item.code!=='0017').map(item=>item.code)
            }
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS, {modulos:modulos})
            if(!data.error){
                setDevices(data)
            }else{
                setDevices([])
            }
        }catch{
            setDevices([])
        }
    }

    //llamada inicial
    useEffect(()=>{
        getDevices()
    //eslint-disable-next-line
    },[])

    //-------------------------otras funciones-----------------------------

    //resetear timeline
    const resetTimeline = (setTimeini) => {
        setIsSelectedRecognition(false)
        if(setTimeini){//si se pasa true pone el video a las 00:00:00 de la fecha de la timeline (si no es hoy)
            if(moment(fecha).isSame(moment(), 'day')){
                setTimeIni(null)
                setLive(true)
            }else{
                setTimeIni(moment(fecha).startOf('day').valueOf())
                setLive(false)
            }
        }else{
            setTimeIni(null)
            setLive(true)
        }
        setSeleccion(null)
        setSeleccionCurrent(null)
        setPause(null)
        setHoraPuntero(null)
        setforceReset(forceReset+1)
        setVideoTime(null)
        setVideoTimeCurrent(null)
    }

    //fuerza poner en directo
    const ponerEnDirecto = () => {
        if(setIsSelectedRecognition){
            setIsSelectedRecognition(false)
        }
        setLive(true)
        setTimeIni(null)
        setSeleccion(null)
        setSeleccionCurrent(null)
        setHoraPuntero(null)
        setFecha(moment())
    }


    return(
        <main className={styles['vms']}>

            {/* Menú */}
            <Menu 
                gridDevices={gridDevices} setGridDevices={setGridDevices}
                devices={devices}
                resetTimeline={resetTimeline}
                selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice}
                modulo={modulo}
                vertical_sector={vertical_sector}
            />

            {/* Contenedor prinicpal VMS */}
            <section className={styles['sections']}>
                <Box title={t('titles.visualization')} innerClassName={styles['sections__wrapper']}>

                    {/* sección principal (grid y timeline) */}
                    <div className={styles['first__section']}>

                        {/* grid */}
                        <div className={styles['grid__wrapper']}>
                            <Grid 
                                gridDevices={gridDevices}
                                selectedDevice={selectedDevice} setSelectedDevice={setSelectedDevice}
                                currentTime={currentTime} setCurrentTime={setCurrentTime}
                                timeIni={timeIni} setTimeIni={setTimeIni}
                                sync={sync}
                                live={live}
                                pause={pause}
                                volume={volume ? volumeValue : null}
                                isMovements={isMovements}
                                setAreaFilters={setAreaFilters}
                                setIsSelectedRecognition={setIsSelectedRecognition}
                                fecha={fecha}
                                videoTime={videoTime} setVideoTime={setVideoTime} videoTimeCurrent={videoTimeCurrent} setVideoTimeCurrent={setVideoTimeCurrent}
                                ponerEnDirecto={ponerEnDirecto}
                            />
                        </div>

                        {/* Timeline*/}
                        <div className={styles['timeline__wrapper']}>
                            <Timeline
                                selectedDevice={selectedDevice}
                                timeIni={timeIni} setTimeIni={setTimeIni}
                                live={live} setLive={setLive}
                                sync={sync} setSync={setSync}
                                seleccion={seleccion} setSeleccion={setSeleccion}
                                seleccionCurrent={seleccionCurrent} setSeleccionCurrent={setSeleccionCurrent}
                                pause={pause} setPause={setPause}
                                resetTimeline={resetTimeline}
                                fecha={fecha} setFecha={setFecha}
                                setIsSelectedRecognition={setIsSelectedRecognition}
                                horaPuntero={horaPuntero} setHoraPuntero={setHoraPuntero}
                                forceReset={forceReset}
                                currentTime={currentTime} setCurrentTime={setCurrentTime}
                                volume={volume} setVolume={setVolume}
                                volumeValue={volumeValue} setVolumeValue={setVolumeValue}
                                isMovements={isMovements}
                                areaFilters={areaFilters}
                                videoTimeCurrent={videoTimeCurrent}
                                gridDevices={gridDevices}
                                setMovimientosLive={setMovimientos}
                            />
                        </div>
                    </div>

                    {/* sección derecha (reconocimientos, alertas,...) */}
                    <div className={styles['second__section']}>
                        <VMSRight
                            deviceSelected={selectedDevice}
                            timeIni={timeIni} setTimeIni={setTimeIni}
                            fecha={fecha}
                            live={live} setLive={setLive}
                            reconocimientos={reconocimientos} setReconocimientos={setReconocimientos}
                            movimientos={movimientos} setMovimientos={setMovimientos}
                            isSelectedRecognition={isSelectedRecognition} setIsSelectedRecognition={setIsSelectedRecognition}
                            setHoraPuntero={setHoraPuntero}
                            seleccion={seleccion} setSeleccion={setSeleccion}
                            seleccionCurrent={seleccionCurrent} setSeleccionCurrent={setSeleccionCurrent}
                            setIsMovements={setIsMovements}
                            areaFilters={areaFilters}
                            gridDevices={gridDevices}
                            modulo={modulo}
                        />
                    </div>

                </Box>
            </section>
        </main>
    )
}