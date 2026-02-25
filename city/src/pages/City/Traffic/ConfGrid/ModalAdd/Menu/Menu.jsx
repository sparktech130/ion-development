import React, { useState } from 'react'

//Styles
import styles from '../../Menu/Menu.module.css'

//icons
import serverIcon from '../../../../../../..//assets/icons/grid/server.svg?react'
import arrow from "@icons/actions/arrow.svg?react"

//components
import { TextModal } from '../../../../../../../components/TextModal/TextModal'
import { AccesibleIcon } from '../../../../../../../components/AccesibleIcon/AccesibleIcon'

//Utils
import { handleKey } from '../../../../../../../utils/functions/accessibility'


export const Menu = ({
    items = [],
    devices = [],
    gridDevices = [],
    setGridDevices,
    isLoadingDevices
}) => {
    const [ selectedItem, setSelectedItem ] = useState()
    //modal
    const [infoModal, setInfoModal] = useState(false)
    const [ modalText, setModalText] = useState('')


    //click item
    const onClickLayout = (id) => {
        if(selectedItem === id){
            setSelectedItem(null)
        }else{
            setSelectedItem(id)
        }
    }

    //click device
    const onClickDevice = (device) => {
        if (gridDevices.some(item => item.cod_dispositivo === device.cod_dispositivo)) {
            const updatedDevices = gridDevices.filter(item => item.cod_dispositivo !== device.cod_dispositivo);
            setGridDevices(updatedDevices);
        } else {
            if(gridDevices.length<30){
                setGridDevices([...gridDevices, device]);
            }else{
                setModalText('Superado el máximo de cámaras. (30)')
                setInfoModal(true)
            }
        }
    }

    return(
        <>

            {/*Modal informativo*/}
            {infoModal &&
                <TextModal setIsOpen={setInfoModal} title="Aviso" aceptar={()=>setInfoModal(false)}>{modalText}</TextModal>
            }

            <div className={styles['wrapper']}>

                {isLoadingDevices && <div className={'small__spinner '}></div>}

                {items?.map((item, i)=>(

                    <div key={i} className={styles['item']+' '+(selectedItem === (item?.cod_cloud) ? styles['item--opened'] : '')} >
                        
                         <div className={styles['header']} onClick={()=>onClickLayout(item.cod_cloud)} tabIndex={0} onKeyDown={(e)=>handleKey(e, ()=>onClickLayout(item.cod_cloud))}>
                            <AccesibleIcon src={serverIcon} />
                            <p>{item.nombre}</p>
                            <div className={styles['header__icons']}>
                                <AccesibleIcon src={arrow} customStyle={selectedItem === (item?.cod_cloud) ? styles['revertIcon']: ''} />
                            </div>
                        </div>

                        {(selectedItem === (item.cod_cloud)) &&
                            <div className={styles['devices']}>
                                {devices.map((device, i) =>(
                                    <React.Fragment key={i}>
                                        {(device.cod_cloud === item.cod_cloud) && 
                                            <div style={{cursor:'pointer'}} className={styles['device']+' '+((gridDevices.some(item => item.cod_dispositivo === device.cod_dispositivo)) ? styles['device--selected'] : '')} onClick={()=>onClickDevice(device)} tabIndex={0} onKeyDown={(e)=>handleKey(e, ()=>onClickDevice(device))}>
                                                <p>{device.nom_dispositivo}</p>
                                            </div>
                                        }
                                    </React.Fragment>
                                ))}
                            </div>
                        }
                    </div>

                ))}
                
            </div>        
        </>
    )
}