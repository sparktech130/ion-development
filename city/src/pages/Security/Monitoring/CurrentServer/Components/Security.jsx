//Lib
import { useTranslation } from 'react-i18next'
import { useContext, useState } from 'react'

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'
import chartsStyles from '@styles/charts.module.css'

//Components
import { ValueCard } from '@components/Stats/ValueCard/ValueCard'
import { StatsCard }from '@components/Stats/StatsCard/StatsCard'
import { Donut } from '@components/Charts/DoughnutChart/Donut'
import { AccesibleIcon } from '@components/AccesibleIcon/AccesibleIcon'

//Icons
import backupIcon from '@icons/stats/backup.svg?react'
import certificationIcon from '@icons/stats/certification.svg?react'
import lupaIcon from '@icons/actions/lupa.svg?react'

//Context
import MainDataContext from '@context/MainDataContext'



export const Security = () => {

    const { t } = useTranslation()
    const {lightMode} = useContext(MainDataContext)

    const [securityModalOpen, setSecurityModalOpen] = useState(false)


    return(
        <div className={styles['graph__column50']}>

            {/* Modal seguridad */}
            {securityModalOpen &&
                <></>
            }

            {/* Vulnerabilidades */}
            <ValueCard
                title={t('titles.lastBackup')}
                icon={backupIcon}
                wrapperStyle={{padding:15}}
            >
                <h4>{t('messages.lastBackupAt', {value:'14:30:25'})}</h4>
            </ValueCard>

            {/* Revisión seguridad */}
            <ValueCard
                title={t('titles.securityCertifications')}
                icon={certificationIcon}
                wrapperStyle={{padding:15}}
            >
                <div className={chartsStyles['state__row']}>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4CD984'}} />
                        <p>TPM</p>
                    </div>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4CD984'}} />
                        <p>HBOM</p>
                    </div>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4c4c4cff'}} />
                        <p>FBOM</p>
                    </div>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4CD984'}} />
                        <p>SBOM</p>
                    </div>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4CD984'}} />
                        <p>CERT</p>
                    </div>
                    <div className={chartsStyles['state__item']}>
                        <div style={{backgroundColor:'#4CD984'}} />
                        <p>CISA</p>
                    </div>
                </div>
            </ValueCard>

            {/* Índice de riesgo*/}
            <StatsCard
                title={t('titles.securityComplianceIndex')}
                type="custom"
            >
                <div className={chartsStyles['graph__donut__wrapper']}>
                        <Donut
                            labels={['empty', 'users']}
                            datos={[95, 5]}
                            colors={['#4CD984', lightMode ? "#16161610" : "#f9f9f910"]}
                            centerText={95+"%"}

                            donutSize={70}
                            centerTextSize={16}
                            borderRadius={10}
                            spacing={2}
                            cutout='84%'
                        />
                        <div className={chartsStyles['graph__donut__info']}>
                            <h3>{t('messages.serverHighCompliance')}</h3>
                            <div className={chartsStyles['graph__donut__link']} onClick={()=>setSecurityModalOpen(true)}>
                                <AccesibleIcon src={lupaIcon} tabIndex={-1} />
                                <p>{t('messages.viewServerSecurityRegulation')}</p>
                            </div>
                        </div>
    
                </div>
            </StatsCard>
        </div>
    )
}