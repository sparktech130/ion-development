import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

//Styles
import styles from './ErrorFallback.module.css'

//Constants
import { version } from '../../../constants/common'

//Components
import { MainIcon } from "../Navbar/MainIcon"

//Assets
import warningIcon from '@icons/components/Login/shieldWarning.svg'


export const ErrorFallback = ({error, resetErrorBoundary}) => {

    //Const
    const {t} = useTranslation()
    const year = useMemo(()=> { return new Date().getFullYear()}, [])

    //Lleva al Dashboard
    const handleGoHome = () => {
        window.location.reload()
    };

    return (
        <div className={styles['wrapper']}>

            <div className={styles['logo']}>
                <MainIcon />
            </div>


            <div className={styles['info']}>
                <div className={styles['row']}>
                    <img src={warningIcon} alt='warning' />
                    <h2>{t('messages.serviceUnavailable')}</h2>
                </div>
                <div>
                    <p>{t('messages.technicalDifficulties1')}</p>
                    <p>{t('messages.technicalDifficulties2')}</p>
                </div>
                <div>
                    <p>{t('messages.tryAgain')}</p>
                    <p>{t('messages.contactUs')}</p>
                </div>
                <p>{t('messages.sorryForInconvenience')}</p>
                <button onClick={handleGoHome}>{t('buttons.goHome')}</button>
            </div>

            {/* Footer */}
            <div className={styles['footer']}>
                <p>{version}</p>
                <p>ION SMART {year} ©</p>
            </div>
        </div>
    );
}