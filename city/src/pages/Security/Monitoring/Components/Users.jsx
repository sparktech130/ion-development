//Lib
import { useTranslation } from 'react-i18next'
import { useContext } from 'react'

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'
import chartsStyles from '@styles/charts.module.css'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { ValueCard } from '@components/Stats/ValueCard/ValueCard'
import { LinearChart } from '@components/Charts/LinearChart/LinearChart'
import { Donut } from '@components/Charts/DoughnutChart/Donut'
import { AccesibleIcon } from '@components/AccesibleIcon/AccesibleIcon'

//Icons
import userOnlineIcon from '@icons/stats/user-online.svg?react'
import userOfflineIcon from '@icons/stats/user-offline.svg?react'
import lupaIcon from '@icons/actions/lupa.svg?react'

//Context
import MainDataContext from '@context/MainDataContext'



export const Users = () => {

    const {lightMode} = useContext(MainDataContext)
    const { t } = useTranslation()

    return(
        <div className={styles['graph__column50']}>

            {/* Usuarios activos */}
            <StatsCard
                title={t('titles.activeUsers')}
                type="custom"
            >
                <div className={chartsStyles['graph__donut__wrapper']}>
                        <Donut
                            labels={['empty', 'users']}
                            datos={[58, 42]}
                            colors={['#FFAB49', lightMode ? "#16161610" : "#f9f9f910"]}
                            centerText={58+"%"}

                            donutSize={70}
                            centerTextSize={16}
                            borderRadius={10}
                            spacing={2}
                            cutout='84%'
                        />
                        <div className={chartsStyles['graph__donut__info']}>
                            <h3>{t('messages.systemHasModerateUserFlow')}</h3>
                            <div className={chartsStyles['graph__donut__link']}>
                                <AccesibleIcon src={lupaIcon} tabIndex={-1} />
                                <p>{t('messages.viewUserInformation')}</p>
                            </div>
                        </div>
    
                </div>
            </StatsCard>

            {/* Value Cards */}
            <div className={styles['row']}>
                <ValueCard
                    title={t('titles.onlineUsers')}
                    value={245}
                    icon={userOnlineIcon}
                    wrapperStyle={{width:'calc(50% - 5px)'}}
                />
                <ValueCard
                    title={t('titles.offlineUsers')}
                    value={57}
                    icon={userOfflineIcon}
                    wrapperStyle={{width:'calc(50% - 5px)'}}
                />
            </div>

            {/* Usuarios del sistema */}
            <StatsCard
                title={t('titles.systemUsers')}
                type="custom"
            >
                <div style={{height:200, marginTop:-20}}>
                    <LinearChart
                        labels={["00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23"]}
                        datos={[[53, 25, 58, 47, 60, 35, 55, 57, 41, 48, 59, 44, 51, 43, 26, 49, 54, 46, 52, 60, 40, 58, 47, 25]]}
                        etiquetas={[t('sections.USUARIOS')]}
                        colors={['#CF9EE6']}
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