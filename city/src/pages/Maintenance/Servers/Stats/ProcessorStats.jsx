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

export const ProcessorStats = ({ stats }) => {

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
        const usage_graph = stats?.processor?.find(entry => entry?.MetricType === 'cpuusagepercent')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.Total

            return acc
        }, {}) ?? {}

        //Media de uso
        const usage_average = (() => {

            const elements = stats?.processor?.filter(entry => entry?.MetricType === 'cpuusagepercent')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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

        const temperature_graph = stats?.thermal?.filter(entry => entry?.MetricType === 'cputemp').reduce((acc, entry) => {

            entry?.MetricInfo?.Stats?.forEach(stat => {
                const [date, time] = (stat.FechaHora ?? '').split(' ')
                const formatted_date = `${date}\n${time}`

                Object.entries(stat).forEach(([key, value]) => {
                    if (key === 'FechaHora') return
                    acc[key] ??= {}
                    acc[key][formatted_date] = value
                });
            });

            return acc
        }, {}) ?? {}

        const temperature_average = (() => {

            const elements = stats?.thermal?.filter(entry => entry?.MetricType === 'cputemp')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        const power_graph = stats?.power?.find(entry => entry?.MetricType === 'cpuwatts')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.CPU

            return acc
        }, {}) ?? {}

        const power_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'cpuwatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        setGraphs({ usage: usage_graph ?? [], temperature: temperature_graph ?? [], power: power_graph ?? [] })
        setAverage({ usage: usage_average ?? [], temperature: temperature_average ?? [], power: power_average ?? [] })


        //eslint-disable-next-line
    }, [stats])


    return (

        <div className={styles['wrapper']}>

            <StatsCard
                title={t('params.cpuUsage')}
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
                        colors={generateMatchingColors('#AE6BCC', 1)}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('params.cpuTemperature')}
                value={average?.temperature?.average && `${average?.temperature?.average} ºC`}
                description={[average?.temperature?.max && `${t('titles.higherValue', { value: average?.temperature?.max })} ºC`, average?.temperature?.min && `${t('titles.lowerValue', { value: average?.temperature?.min })} ºC`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.temperature ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.temperature ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.temperature ?? {})}
                        unidades={Object.keys(graphs?.temperature ?? {}).map(() => ' ºC')}
                        colors={generateMatchingColors('#AE6BCC', Object.keys(graphs?.temperature ?? {}).length)}
                        formatDateHour={true}
                        gradient={false}
                        min={null}
                        legend
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
                        colors={generateMatchingColors('#AE6BCC', 1)}
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
