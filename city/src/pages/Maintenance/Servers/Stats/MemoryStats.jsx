//Librerías
import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//CSS
import styles from './Stats.module.css'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { LinearChart } from '@components/Charts/LinearChart/LinearChart'

//Utils
import { generateMatchingColors } from '@utils/conversions'

export const MemoryStats = ({ stats }) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //translation
    const { i18n, t } = useTranslation()

    //Datos que se mostraran en el apartado de estadísticas
    const [graphs, setGraphs] = useState({ usage: 0, temperature: 0, power: 0 })
    const [average, setAverage] = useState({ usage: 0, temperature: 0, power: 0 })


    //*----------------------------------------USE EFFECT---------------------------------------------*//

    //Al cambiar de dispositivo o cuando se actualizan las estadísticas, mostramos las correspondientes
    useEffect(() => {


        //Estadísticas de uso
        const usage_graph = stats?.memory?.find(entry => entry?.MetricType === 'memoryusagepercent')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.Total

            return acc
        }, {}) ?? {}

        //Media de uso
        const usage_average = (() => {

            const elements = stats?.memory?.filter(entry => entry?.MetricType === 'memoryusagepercent')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

            if (elements.length === 0) return {}

            const totals = elements.reduce((acc, elem) => {
                acc.average += elem.AvgValue
                if (acc.max < elem.MaxValue) acc.max = elem.MaxValue
                if (acc.min === null || elem.MinValue < acc.min) acc.min = elem.MinValue
                return acc
            },
                { average: 0, max: -Infinity, min: null }
            )

            return {
                average: Math.round(totals.average / elements.length).toLocaleString(i18n.language),
                max: totals.max?.toLocaleString(i18n.language),
                min: totals.min?.toLocaleString(i18n.language)
            }
        })()

        //Estadísticas de energía
        const power_graph = stats?.power?.find(entry => entry?.MetricType === 'memorywatts')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.Mem

            return acc
        }, {}) ?? {}

        const power_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'memorywatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

            if (elements.length === 0) return {}

            const totals = elements.reduce((acc, elem) => {
                acc.average += elem.AvgValue
                if (acc.max < elem.MaxValue) acc.max = elem.MaxValue
                if (acc.min === null || elem.MinValue < acc.min) acc.min = elem.MinValue
                return acc
            },
                { average: 0, max: -Infinity, min: null }
            )

            return {
                average: Math.round(totals.average / elements.length).toLocaleString(i18n.language),
                max: totals.max?.toLocaleString(i18n.language),
                min: totals.min?.toLocaleString(i18n.language)
            }
        })()

        //Asignamos los datos
        setGraphs({ usage: usage_graph ?? [], power: power_graph ?? [] })
        setAverage({ usage: usage_average ?? [], power: power_average ?? [] })

        //eslint-disable-next-line
    }, [stats])


    return (

        <div className={styles['wrapper']}>

            <StatsCard
                title={t('params.memoryUsage')}
                value={average?.usage?.average && `${average?.usage?.average} %`}
                description={[average?.usage?.max && `${t('titles.higherValue', { value: average?.usage?.max })} %`, average?.usage?.min && `${t('titles.lowerValue', { value: average?.usage?.min })} %`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object?.keys(graphs?.usage ?? {})}
                        datos={[Object?.values(graphs?.usage ?? {})]}
                        etiquetas={[t('params.cpuUsage')]}
                        unidades={[" %"]}
                        colors={generateMatchingColors('#4CD984', 1)}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('titles.energyConsumption')}
                value={average?.power?.average && `${average?.power?.average} W`}
                description={[average?.power?.max && `${t('titles.higherValue', { value: average?.power?.max })} W`, average?.power?.min && `${t('titles.lowerValue', { value: average?.power?.min })} W`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object?.keys(graphs?.power ?? {})}
                        datos={[Object?.values(graphs?.power ?? {})]}
                        colors={generateMatchingColors('#4CD984', 1)}
                        etiquetas={[t('titles.energyConsumption')]}
                        unidades={[" W"]}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

        </div>


    )
}
