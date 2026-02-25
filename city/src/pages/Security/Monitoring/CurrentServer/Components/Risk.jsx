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
import { SecurityModal } from './Modals/SecurityModal'

//Icons
import warningIcon from '@icons/alerts/warning--red.svg?react'
import revisionIcon from '@icons/stats/revision.svg?react'
import lupaIcon from '@icons/actions/lupa.svg?react'

//Context
import MainDataContext from '@context/MainDataContext'



export const Risk = () => {

    const { t } = useTranslation()
    const {lightMode} = useContext(MainDataContext)

    const [securityModalOpen, setSecurityModalOpen] = useState(false)

    return(
        <div className={styles['graph__column50']}>


            {/* Modal seguridad */}
            {securityModalOpen &&
                <SecurityModal setIsOpen={setSecurityModalOpen} />
            }

            {/* Vulnerabilidades */}
            <ValueCard
                title={t('titles.vulnerabilities')}
                icon={warningIcon}
                wrapperStyle={{padding:15}}
            >
                <h4>{t('messages.pendingVulnerabilities', {value:15})}</h4>
            </ValueCard>

            {/* Revisión seguridad */}
            <ValueCard
                title={t('titles.securityReview')}
                icon={revisionIcon}
                wrapperStyle={{padding:15}}
            >
                <h4>{t('messages.lastAnalysisMinutesAgo', {value:25})}</h4>
            </ValueCard>

            {/* Índice de riesgo*/}
            <StatsCard
                title={t('titles.serverRiskIndex')}
                type="custom"
            >
                <div className={chartsStyles['graph__donut__wrapper']}>
                        <Donut
                            labels={['empty', 'data']}
                            datos={[58, 42]}
                            colors={['#EA4949', lightMode ? "#16161610" : "#f9f9f910"]}
                            centerText={58+"%"}

                            donutSize={70}
                            centerTextSize={16}
                            borderRadius={10}
                            spacing={2}
                            cutout='84%'
                        />
                        <div className={chartsStyles['graph__donut__info']}>
                            <h3>{t('messages.serverHighRiskIndex')}</h3>
                            <div className={chartsStyles['graph__donut__link']} onClick={()=>setSecurityModalOpen(true)}>
                                <AccesibleIcon src={lupaIcon} tabIndex={-1} />
                                <p>{t('messages.viewServerSecurityInfo')}</p>
                            </div>
                        </div>
    
                </div>
            </StatsCard>
        </div>
    )
}