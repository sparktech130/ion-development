import { useEffect, useState, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Styles
import cardStyles from '../../../styles/card.module.css'

//Icons
import { modulesIcons} from '../../../constants/icons'

//Constants
import { url_path, smartcity_modules, streamDevices, sensorDevices, engineDevices } from '../../../constants/common'

//Utils
import { handleKey } from '../../../utils/functions/accessibility'

//Components
import { AccesibleIcon } from '../../../components/AccesibleIcon/AccesibleIcon'

//Context
import MainDataContext from '../../../context/MainDataContext'


export const DeviceCard = ({ item, onClick, models }) => {

    //Context
    const { url_origin } = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //Imagen
    const [imageError, setImageError] = useState(false)
    const [imageUrl, setImageUrl] = useState(false)

    //Todos los módulos
    const [modulesConst] = useState(() => {
        return smartcity_modules.filter(item => !item.disabled && !item.noRequiresLicense)
    });

    //Estado
    const statusModuleConversion = { 'prorroga': 'icon__orange', 'caducado': 'icon__red' };


    //-----------------------IMAGEN-------------------------------

    //Actualiza url y error imagen
    useEffect(()=>{
        let error = true
        if(item && models && Array.isArray(models)){
            //busca imagen del modelo
            let model = models.find(m=>m.cod_modelo===item.cod_modelo)
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
    },[item, models])

    //--------------------------MÓDULOS----------------------------

    //ordenar módulos según orden en const const
    const orderModules = (modules) => {
        // Crear un mapa de orden para facilitar la comparación
        const orderMap = modulesConst.reduce((map, modulo, index) => {
            map[modulo.code] = index; // Asociar cada código de módulo con su índice
            return map;
        }, {});

        // Filtrar los módulos que no existen en modulesConst
        const filteredModules = Array.isArray(modules) ? modules?.filter(m => orderMap[m.cod_modulo] !== undefined) : [];

        // Ordenar los módulos válidos
        const orderedModules = filteredModules?.sort((a, b) => {
            return orderMap[a.cod_modulo] - orderMap[b.cod_modulo];
        });

        return orderedModules;
    };

    //módulos
    const modules = useMemo(()=>{
        if(item.modulos && Array.isArray(item.modulos) && item.modulos.length>0){
            return orderModules(item.modulos)
        }
        return null
    //eslint-disable-next-line
    },[item])

    //------------------------USE MEMO----------------------------------------

    //Texto 'Fabricante Modelo'
    const deviceSlot = useMemo(() => {
        let text = ''
        if(item?.nombre_fabricante){
            text += item?.nombre_fabricante + ' '
        }
        if(item?.nombre_modelo){
            text += item?.nombre_modelo
        }
        return text || '-'
        // eslint-disable-next-line
    }, [item])

    //Texto ID
    const idSlot = useMemo(() => {

        const tipo = item?.cod_categoria

        if (streamDevices.includes(tipo) || engineDevices.includes(tipo)) {
            return `${t('params.deviceId')}: ${item?.deviceId || '-'}`
        }
        
        if (sensorDevices.includes(tipo)) {
            return `EUI: ${item?.deveui || '-'}`
        }

        return '-'

        // eslint-disable-next-line
    }, [item])


    return (

        <div className={cardStyles['wrapper']} onClick={onClick} tabIndex={0} onKeyDown={(e) => handleKey(e, onClick)}>

            <div className={cardStyles['image__wrapper']} style={{height:'110px'}}>
                {imageUrl && !imageError &&
                    <img src={imageUrl} alt='Imagen' onError={()=>{setImageError(true)}} style={{height:'90px', objectFit: 'contain'}}/>
                }
            </div>
            
            <div className={cardStyles['section--column']}>
                <h3>{t('codes.deviceCategories.'+item?.cod_categoria)}</h3>
                <h2>{`${item?.nom_dispositivo}`}</h2>
                <p>{deviceSlot}</p>
            </div>

            <hr />

            <div className={cardStyles['section--row']}>
                <p>{idSlot}</p> 
            </div>

            <hr />

            <div className={cardStyles['icons__wrapper']}>
                {modules?.map(element => {
                    if (element.cod_modulo && modulesIcons[element.cod_modulo]) {
                        return <AccesibleIcon tabIndex={-1} customStyle={statusModuleConversion[element?.estado_canal]} key={element?.cod_modulo} src={modulesIcons[element.cod_modulo]} text={element.nombre_modulo} loading='lazy' />
                    }else{
                        return null
                    }
                })}
            </div>

        </div>
    )
}