//Librerías
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next';

//Componentes
import { Route } from '../../../components/Route/Route'
import { DeviceVisualization } from '../../../components/DataVisualization/Devices/DeviceVisualization';

//Constants
import { url_path } from '../../../constants/common';

//CSS
import deviceStyle from '@styles/sections/Device.module.css';

//Context
import MainDataContext from '../../../context/MainDataContext';


export function CurrentDevice({
    currentData,
    setCurrentData,
    models,
    setEditOpen
}) {

    //Context
    const {url_origin} = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //Imagen
    const [imageError, setImageError] = useState(false)
    const [imageUrl, setImageUrl] = useState(false)


    //-----------------------IMAGEN-------------------------------

    //Actualiza url y error imagen
    useEffect(()=>{
        let error = true
        if(currentData && models && Array.isArray(models)){
            //busca imagen del modelo
            let model = models.find(m=>m.cod_modelo===currentData.cod_modelo)
            if(model?.foto_modelo){
                setImageUrl(`${url_origin}${url_path}/${model?.foto_modelo}`)
                setImageError(false)
                error = false
            }
        }
        if(error){
            setImageUrl(undefined)
            setImageError(true)
        }
    //eslint-disable-next-line
    },[currentData, models])
  
  
    return (

        <>

            {/* Fondo */}
            <div className={deviceStyle['background']}>
                <div className={deviceStyle['dots']} />
                <div className={deviceStyle['circle']} />
            </div>

            {/* Ruta */}
            <Route routes={[{name:t('sections.DISPOSITIVOS'), action:()=> setCurrentData(undefined)}, {name:currentData?.nom_dispositivo}]} wrapper />

            {/* Imagen */}
            {imageUrl && !imageError &&
                <div className={deviceStyle['image__wrapper']}>
                    <img src={imageUrl} alt='Imagen' onError={()=>{setImageError(true)}}  />
                </div>
            }

            {/* Navbar derecha info */}
            <DeviceVisualization item={currentData} setEditOpen={setEditOpen} />
        
        </>

    )
}
