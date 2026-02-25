import styles from './LicensesCard.module.css'
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

//icons
import { modulesIcons } from '../../../../constants/icons'

//Utils
import { handleKey } from '../../../../utils/functions/accessibility';

export const LicensesCard = ({
    cod_modulo, //cod_modulo
    cardInfo, //parámetros
    onClick
}) => {

    const { t } = useTranslation()
    const ImageComponent = useMemo(()=>{
        return modulesIcons[cod_modulo]
    },[cod_modulo]) 

    //valores num dispositivos
    const { asignados, total, isRedCard } = useMemo(() => {
        const asignados = cardInfo?.dispositivos_asignados ? cardInfo?.dispositivos_asignados : 0;
        const total = cardInfo?.canales_validos ? cardInfo?.canales_validos : 0;
        const isRedCard = asignados>total || cardInfo?.isRed //se pone rojo si hay más dispositivos asignados de los disponibles o si hay licencia en prórroga
        return { asignados: asignados, total: total, isRedCard: isRedCard };
    }, [cardInfo]);



    return(
        <div key={cod_modulo} className={styles['wrapper']+' '+(isRedCard ? styles['wrapper__red'] : '')} onClick={()=>onClick(cardInfo)} tabIndex={0} onKeyDown={(e)=>handleKey(e, ()=>onClick(cardInfo))} >
            <h3>{cardInfo?.modulo || '-'}</h3>
            <h4>{asignados+'/'+total} <span className={styles['text']}>{t('messages.assignedChannels')}</span></h4>
            <ImageComponent alt='Icono'/>
            <p className={styles['date']}>{t('messages.nextExpiration')+': '+(cardInfo?.fecha_expiracion ? cardInfo?.fecha_expiracion : '-')}</p>
        </div>
    )
}