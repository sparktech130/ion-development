import styles from './Downloads.module.css'
import { useContext, useEffect, useState } from "react"
import { useTranslation } from 'react-i18next'

//context
import MainDatacontext from '../../../context/MainDataContext'

//component
import { Download } from './Download/Download'

//icons
import downloadIcon from '../../../assets/icons/actions/downloaded.svg?react'
import openIcon from '../../../assets/icons/actions/dropdown2.svg?react'
import { AccesibleIcon } from '../../../components/AccesibleIcon/AccesibleIcon'

//popups descargas
export const Downloads = () => {

    const {t} = useTranslation()
    const { downloads, setDownloads } = useContext(MainDatacontext)
    const [opened, setOpened] = useState(false)


    //si todas las descargas están cerradas las limpia (si hay alguna no cerrada no limpia las otras para no alterar el orden)
    useEffect(()=>{
        if( downloads.length>0 && downloads.every(download => download.state === 'closed')){
            setDownloads([])
        }
    //eslint-disable-next-line
    },[downloads])


    return(
        <>
            {Array.isArray(downloads) && downloads.length>0 &&
                <div className={styles['downloads__wrapper']+' '+(opened ? styles['opened'] : '')}>
                    <div className={styles['title']}>
                        <AccesibleIcon src={downloadIcon} className={styles['downloadIcon']} />
                        <p>{t('messages.downloadingFiles', {count: downloads.filter(item=>!item.state).length}) }</p>
                        <AccesibleIcon customStyle={styles['dropdownIcon']} src={openIcon} onClick={()=>setOpened(!opened)} />
                    </div>
                    <div className={styles['list']}>
                        {downloads?.map((item, i)=>(
                            <div key={i}>
                                <Download item={item} />
                            </div>
                        ))}
                    </div>
                </div>
            }
        </>
    )
}