import styles from './Movements.module.css'
import moment from 'moment'
import { TimeRange } from 'pondjs/lib/entry'
import { useEffect, useState, useRef } from 'react'
import { useTranslation } from 'react-i18next'

//Utils
import { handleKey } from '../../../../../../../utils/functions/accessibility'


export const Movements = ({
    timeIni, setTimeIni, //tiempo inicial stream
    setLive,
    seleccion, setSeleccion, setSeleccionCurrent, //seleccion timeline
    setHoraPuntero,
    reconocimientos, //movimientos
    isSelectedRecognition,  setIsSelectedRecognition //para que no se filtren los resultados con la seleccion si has clicado un movimiento desde aquí
}) => {

    const {t} = useTranslation()
    const [ movimientosFiltrados, setMovimientosFiltrados] = useState([])
    const wrapperRef = useRef()

    //-----------------USEEFFECT--------------------------------

    //actualiza movimientos cuando cambian
    useEffect(()=>{
            formatData()
    //eslint-disable-next-line
    },[reconocimientos, seleccion])

    //-------------------ONCLICK-----------------------------

    //Click en movimiento
    const onClickRecognition = (recognition) => {
        setIsSelectedRecognition(true)
        let momentIni =  moment(parseInt(recognition.startTimeMs))
        let momentFin =  moment(parseInt(recognition.startTimeMs)+(parseInt(recognition.durationMs)))
        if(momentIni && momentFin){
            let positionMs = momentIni.valueOf();
            setTimeIni((positionMs !== timeIni) ? positionMs : positionMs-1)
            setSeleccion(new TimeRange(momentIni, momentFin))
            setSeleccionCurrent(new TimeRange(momentIni, momentFin))
            setHoraPuntero(momentIni.toDate())
            setLive(false)
        }
    }

    //----------------FUNCIONES--------------------

    //ordena y filtra los movimientos
    const formatData = () => {
        if(!isSelectedRecognition){
            if(reconocimientos && (reconocimientos.length>0) && reconocimientos[0]?.movimiento){
                //ordeno: primero los más nuevos
                let items = [...reconocimientos].reverse()
                //filtro por seleccion timeline
                if(seleccion){
                    items = items.filter((item)=>{
                        const itemStart = parseInt(item.startTimeMs);
                        const itemEnd = parseInt(item.startTimeMs) + parseInt(item.durationMs);
                        const rangeStart = seleccion.begin().getTime();
                        const rangeEnd = seleccion.end().getTime();
                        return (itemStart >= rangeStart && itemStart <= rangeEnd) || (itemEnd >= rangeStart && itemEnd <= rangeEnd) || (itemStart <= rangeStart && itemEnd >= rangeEnd);
                    })
                }
                setMovimientosFiltrados(items)
            }else{
                setMovimientosFiltrados([])
            }
        }
    }


    return(
        <div className={styles['recognitions']}>

            <div className={styles['recognitions__wrapper']} ref={wrapperRef}>
                {movimientosFiltrados && movimientosFiltrados.map((item, i)=>(
                    <div className={styles['recognition']} key={i} onClick={()=>onClickRecognition(item)} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>onClickRecognition(item))}>
                        <h2>{t('titles.motionDetection')}</h2>
                        <div className={styles['info__times']}>                             
                            <p>{item.startTimeMs ? moment(parseInt(item.startTimeMs)).format('DD-MM-YYYY') : ''}</p>
                            <p>{item.startTimeMs ? moment(parseInt(item.startTimeMs)).format('HH:mm:ss') : ''}</p>                                
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}