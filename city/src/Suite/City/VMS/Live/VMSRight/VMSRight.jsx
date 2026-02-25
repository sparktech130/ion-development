import styles from './VMSRight.module.css'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

//components
import { Movements } from './Movements/Movements'
import { Recognitions } from './Recognitions/Recognitions'
import { VmsAlerts } from './VmsAlerts/VmsAlerts'
import { AccesibleIcon } from '../../../../../../components/AccesibleIcon/AccesibleIcon'

//assets
import bellIcon from '../../../../../../assets/icons/actions/bell.svg?react'
import visualizationIcon from '../../../../../../assets/icons/actions/visualization.svg?react'
import personIcon from '../../../../../../assets/icons/actions/person.svg?react'


export const VMSRight = ({
    deviceSelected,
    timeIni, setTimeIni,
    fecha,
    live, setLive,
    seleccion, setSeleccion,
    seleccionCurrent, setSeleccionCurrent,
    setHoraPuntero,
    reconocimientos, setReconocimientos,
    movimientos, setMovimientos,
    isSelectedRecognition, setIsSelectedRecognition,
    setIsMovements,
    areaFilters,
    gridDevices,
    modulo
}) => {

    const {t} = useTranslation()
    const [menuOption, setMenuOption] = useState((modulo===17) ? 4 : 1)
    const [licensePlateInput, setLicensePlateInput] = useState('')


    //actualiza si vemos movimientos o reconocimientos para cambiar datos timeline
    useEffect(()=>{
        setIsSelectedRecognition(false)
        //limpio seleccion para evitar bug. (si seleccionas reconocimiento y cambias a menú movimientos salían filtrados por a selección)
        setSeleccion(null)
        setSeleccionCurrent(null)
        if(menuOption===4){
            setIsMovements(false)
        }else{
            setIsMovements(true)
        }
    //eslint-disable-next-line
    },[menuOption])


    return(
        <div className={styles['wrapper']}>

            {/* botones */}
            <div className={styles['buttons__wrapper']}>
                <button tabIndex={-1} className={styles['button__vms']+' '+((menuOption===0) ? styles['button__vms--selected'] : '')} onClick={()=>setMenuOption(0)} ><AccesibleIcon src={bellIcon} text={t('sections.ALERTAS')} /></button>
                <button tabIndex={-1} className={styles['button__vms']+' '+((menuOption===1) ? styles['button__vms--selected'] : '')} onClick={()=>setMenuOption(1)}><AccesibleIcon src={personIcon} text={t('params.motion')} /></button>
                {(modulo===17) &&
                    <button tabIndex={-1} className={styles['button__vms']+' '+((menuOption===4) ? styles['button__vms--selected'] : '')} onClick={()=>setMenuOption(4)}><AccesibleIcon src={visualizationIcon} text={t('sections.RECONOCIMIENTOS')} /></button>
                }
            </div>

            {/* switch secciones */}
            {{
                0:  <VmsAlerts 
                        device={deviceSelected}
                    />,
                1:  <Movements
                        deviceSelected={deviceSelected}
                        timeIni={timeIni} setTimeIni={setTimeIni}
                        fecha={fecha}
                        live={live} setLive={setLive}
                        seleccion={seleccion} setSeleccion={setSeleccion} setSeleccionCurrent={setSeleccionCurrent}
                        setHoraPuntero={setHoraPuntero}
                        reconocimientos={movimientos} setReconocimientos={setMovimientos}
                        isSelectedRecognition={isSelectedRecognition} setIsSelectedRecognition={setIsSelectedRecognition}
                        areaFilters={areaFilters}
                        licensePlateInput={licensePlateInput} setLicensePlateInput={setLicensePlateInput}
                    />,
                4: 
                    <Recognitions
                        deviceSelected={deviceSelected}
                        timeIni={timeIni} setTimeIni={setTimeIni}
                        fecha={fecha}
                        live={live} setLive={setLive}
                        seleccion={seleccion} setSeleccion={setSeleccion}
                        seleccionCurrent={seleccionCurrent} setSeleccionCurrent={setSeleccionCurrent}
                        setHoraPuntero={setHoraPuntero}
                        reconocimientos={reconocimientos} setReconocimientos={setReconocimientos}
                        isSelectedRecognition={isSelectedRecognition} setIsSelectedRecognition={setIsSelectedRecognition}
                        licensePlateInput={licensePlateInput} setLicensePlateInput={setLicensePlateInput}
                        gridDevices={gridDevices}
                    />
            }[menuOption]}         

            
        </div>
    )
}