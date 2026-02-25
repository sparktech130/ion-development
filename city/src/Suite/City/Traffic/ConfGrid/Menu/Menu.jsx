import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import styles from './Menu.module.css'

//context
import MainDataContext from '../../../../../../context/MainDataContext'

//icons
import gridIcon from "../../../../../../assets/icons/grid/grid.svg?react"
import starIcon from '../../../../../../assets/icons/grid/star.svg?react'
import starFilledIcon from '../../../../../../assets/icons/grid/star-filled.svg?react'
import arrow from "@icons/actions/arrow.svg?react"

//services
import { URL_MODIFICAR_GRID } from '../../../../../../api/connections/urls'

//Utils
import { handleKey } from '../../../../../../utils/functions/accessibility'

//Components
import { AccesibleIcon } from '../../../../../../components/AccesibleIcon/AccesibleIcon'



export const Menu = ({
    layouts = [],
    devices = [],
    selectedLayout,
    setSelectedLayout,
    modulo,
    refreshLayouts,
    isLoadingDevices
}) => {

    //context
    const {requestAPI} = useContext(MainDataContext)
    const {t} = useTranslation()

    //----------------------api------------------------------

    //modificar layout
    const updateLayout = async (layout, seleccionar) => {
        try{  
            if(layout?.cod_grid){
                let params = {
                    cod_grid: layout.cod_grid,
                    modulos: [{cod_modulo: modulo, seleccionar: seleccionar}]
                }
                let data = await requestAPI(URL_MODIFICAR_GRID, params)
                if(data===true){
                    refreshLayouts()
                }
            }
        }catch{
            //
        }
    }

    //---------------onclicks-----------------------------

    //click estrella
    const onClickStar = (layout, e) => {
        e.stopPropagation()
        let seleccionar = true
        if(layout.seleccionado === 1){
            seleccionar = false
        }
        updateLayout(layout, seleccionar)
    }

    //click item
    const onClickLayout = (layout) => {
        if(selectedLayout?.cod_grid === layout?.cod_grid){
            setSelectedLayout(null)
        }else{
            setSelectedLayout(layout)
        }
    }


    return(
        <div className={styles['wrapper']}>

            {/* Layouts */}
            {layouts?.map((layout, i)=>(
                <div key={i} className={styles['item']+' '+(selectedLayout?.cod_grid === layout?.cod_grid ? styles['item--opened'] : '')} >
                    
                    {/* Header */}
                    <div className={styles['header']} onClick={()=>onClickLayout(layout)} tabIndex={0} onKeyDown={(e)=>handleKey(e, ()=>onClickLayout(layout))}>
                        <AccesibleIcon src={gridIcon} text='' tabIndex={-1} />
                        <h2>{layout.nombre_grid}</h2>
                        <div className={styles['header__icons']}>
                            <AccesibleIcon onClick={(e)=>onClickStar(layout, e)} src={layout?.seleccionado === 1 ? starFilledIcon : starIcon} text={(layout?.seleccionado === 1) ? t('messages.favoriteRemove') : t('messages.favoriteAdd')} />
                            <div className='separator' />
                            <AccesibleIcon src={arrow} customStyle={selectedLayout?.cod_grid === layout?.cod_grid ? styles['revertIcon']: ''} />
                        </div>
                    </div>

                    {/* Dispositivos */}
                    {(selectedLayout?.cod_grid === (layout?.cod_grid)) &&
                        <div className={styles['devices']}>
                            {isLoadingDevices && <div className='small__spinner'></div>}
                            {layout?.dispositivos?.split(';')?.map((device, i) =>(
                                <React.Fragment key={i}>
                                    { devices?.some(item=>item.cod_dispositivo===device) &&
                                        <div className={styles['device']+' '+styles['device--selected']}>
                                            <h2>{devices?.find(item=>item.cod_dispositivo===device)?.nom_dispositivo}</h2>
                                        </div>
                                    }
                                </React.Fragment>
                            ))}
                        </div>
                    }
                </div>
            ))}      
        </div>
    )
}