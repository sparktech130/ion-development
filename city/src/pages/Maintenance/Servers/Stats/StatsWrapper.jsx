//Librerías
import React, { useState, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '@context/MainDataContext'

//Components
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'

//Gráficas
import { ProcessorStats } from './ProcessorStats'
import { ThermalStats } from './ThermalStats'
import { MemoryStats } from './MemoryStats'
import { PowerStats } from './PowerStats'

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'

//Icons
import calendarIcon from "@icons/actions/calendar.svg?react"
import componentsIcon from "@icons/navbar/logs.svg?react"



export const StatsWrapper = ({stats}) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Dropdown date
    const dates = [
        { cod: 24, name: t('buttons.today') },
        { cod: 7, name: t('buttons.week') },
        { cod: 30, name: t('buttons.month') },
        { cod: 'custom', name: t('messages.customDate'), onClick: () => setFilterOpen(true) },
    ]
    const [date, setDate] = useState(dates[0])

    //Dropdown components
    const components = [
        { cod: 'processor', name: t('titles.processors') },
        { cod: 'thermal', name: t('titles.fans') },
        { cod: 'memory', name: t('params.memory') },
        { cod: 'power', name: t('titles.powerSource') },
    ]
    const [component, setComponent] = useState(components[0])

    //Modals
    const [filterOpen, setFilterOpen] = useState(false)

    //Estadísticas a mostrar
    const componentVisualizer = useMemo(() => {
        const parts = {
            'processor': <ProcessorStats stats={stats} />,
            'thermal': <ThermalStats stats={stats} />,
            'power': <PowerStats stats={stats} />,
            'memory': <MemoryStats stats={stats} />,
            undefined: undefined
        }
        return parts[component?.cod] || undefined

        //eslint-disable-next-line
    }, [component])


    return (
        <div style={{ marginTop: '50px' }}>

            {/* Buttons */}
            <div className={styles['button__wrapper']}>
                <ButtonComponent icon={calendarIcon} options={dates} selectedOption={date} setSelectedOption={setDate} />
                <ButtonComponent icon={componentsIcon} options={components} selectedOption={component} setSelectedOption={setComponent} />
            </div>

            <div>
                {componentVisualizer}
            </div>

        </div>
    )
}

