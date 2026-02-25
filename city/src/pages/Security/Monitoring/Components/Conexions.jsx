//Lib
import { useTranslation } from 'react-i18next'

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'
import chartsStyles from '@styles/charts.module.css'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { ValueCard } from '@components/Stats/ValueCard/ValueCard'
import { LinearChart } from '@components/Charts/LinearChart/LinearChart'
import { Donut } from '@components/Charts/DoughnutChart/Donut'

//Icons
import latencyIcon from '@icons/stats/latency.svg?react'
import dataIcon from '@icons/stats/data.svg?react'



export const Conexions = () => {

    const { t } = useTranslation()

    return(
        <div className={styles['graph__column50']}>

            {/* Usuarios activos */}
            <StatsCard
                title={t('titles.systemConnections')}
                type="custom"
            >
                <div className={chartsStyles['graph__donut__wrapper']}>
                        <Donut
                            labels={['requestsExtl', 'submissionsExtl', 'requestsIntl']}
                            datos={[20789, 24526, 55352]}
                            colors={['#6692DB', '#FFAB49', '#6EEAD8']}

                            donutSize={70}
                            centerTextSize={16}
                            borderRadius={10}
                            spacing={2}
                            cutout='84%'
                        />
                        <div className={chartsStyles['graph__donut__info']}>
                            <div className={chartsStyles['graph__donut__stats__row']}>
                                <div className={chartsStyles['square']} style={{backgroundColor: '#6692DB', borderColor:'var(--color-secondary)'}} />
                                <p>20789 <span style={{fontWeight: 'var(--light)'}}>{t('params.externalRequests')}</span></p>
                            </div>
                            <div className={chartsStyles['graph__donut__stats__row']}>
                                <div className={chartsStyles['square']} style={{backgroundColor: '#FFAB49', borderColor:'var(--color-secondary)'}} />
                                <p>24526 <span style={{fontWeight: 'var(--light)'}}>{t('params.externalSubmissions')}</span></p>
                            </div>
                            <div className={chartsStyles['graph__donut__stats__row']}>
                                <div className={chartsStyles['square']} style={{backgroundColor: '#6EEAD8', borderColor:'var(--color-secondary)'}} />
                                <p>55352 <span style={{fontWeight: 'var(--light)'}}>{t('params.internalRequests')}</span></p>
                            </div>
                        </div>
    
                </div>
            </StatsCard>

            {/* Value Cards */}
            <div className={styles['row']}>
                <ValueCard
                    title={t('titles.latency')}
                    value={'55 ms'}
                    icon={latencyIcon}
                    wrapperStyle={{width:'calc(50% - 5px)'}}
                />
                <ValueCard
                    title={t('titles.dataUsage')}
                    value={'58 TB'}
                    icon={dataIcon}
                    wrapperStyle={{width:'calc(50% - 5px)'}}
                />
            </div>

            {/* Usuarios del sistema */}
            <StatsCard
                title={t('titles.systemConnections')}
                type="custom"
            >
                <div style={{height:200, marginTop:-20}}>
                    <LinearChart
                        labels={["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]}
                        datos={[[53, 25, 58, 47, 60, 35, 55, 57, 41, 48, 59, 44, 51, 43, 26, 49, 54, 46, 52, 60, 40, 58, 47, 25],[41, 33, 16, 39, 44, 36, 42, 50, 30, 48, 37, 15, 43, 15, 48, 37, 50, 25, 45, 47, 31, 38, 49, 34],[69, 54, 63, 35, 68, 57, 70, 45, 65, 61, 53, 36, 59, 64, 56, 62, 70, 50, 68, 57, 35, 67, 51, 58]]}
                        etiquetas={[t('params.externalRequests'), t('params.externalSubmissions'), t('params.internalRequests')]}
                        colors={['#6692DB', '#FFAB49', '#6EEAD8']}
                        legend={true}

                        gradient={false}
                        tension={0}
                        pointRadius={1}
                        borderWidth={1}
                    />
                </div>
            </StatsCard>
        </div>
    )
}