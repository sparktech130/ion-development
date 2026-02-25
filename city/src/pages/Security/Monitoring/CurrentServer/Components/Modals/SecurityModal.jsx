import { useMemo } from 'react'

//Lib
import { useTranslation } from 'react-i18next'

//Styles
import styles from './Modals.module.css'

//Components
import { Modal } from '@components/Modal/Modal'


export const SecurityModal = ({
    setIsOpen
}) => {

    const {t} = useTranslation()

    //Pendiente de traducir cuando se sepa cómo vendrá de back-------------------!!!
    const data = useMemo(()=>{
        return [
            {status:false, title:'Sistema operativo', value:'4.2.2.14', description:'La versión del S.O está desactualizada (versión más reciente 4.5.6.21)'},
            {status:false, title:'Contraseñas', value:'Comprometidas', description:'Es necesario que el usuario johndoe modifique la contraseña'},
            {status:false, title:'Estado de los puertos', value:'Abiertos', description:'Los puertos del servidor estan abiertos'},
            {status:true, title:'Último backup', value:'Hoy, 14:30:25', description:'Comprobado hace 10 min'},
            {status:true, title:'Firewall', value:'Activado', description:'Comprobado hace 35 min'},
            {status:true, title:'IDS/IPS', value:'Activado', description:'Comprobado hace 10 min'},
            {status:true, title:'Certificados', value:'Activado', description:'Comprobado hace 35 min'},
            {status:true, title:'GDPR', value:'Activado', description:'Comprobado hace 10 min'},
            {status:true, title:'ISO 27001', value:'Activado', description:'Comprobado hace 35 min'},
            {status:true, title:'PCI DSS', value:'Activado', description:'Comprobado hace 35 min'},
        ]
    },[])

    return(
        <Modal closeModal={setIsOpen} title={t('titles.serverSecurityStatus')}>
            <div className={styles['wrapper']}>

                {data?.map((item, i)=>(
                    <div key={i} className={styles['item']}>
                        <div className={styles['row']}>
                            <div className={styles['round']} style={{backgroundColor: item.status ? '#4CD984' : '#EA4949'}} />
                            <h2>{item.title}</h2>
                            <h2>{item.value}</h2>
                        </div>
                        <h3>{item.description}</h3>
                    </div>
                ))}
                
            </div>
        </Modal>
    )
}