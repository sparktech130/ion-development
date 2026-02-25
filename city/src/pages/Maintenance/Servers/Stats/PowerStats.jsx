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

export const PowerStats = ({ stats }) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //translation
    const { i18n, t } = useTranslation()

    //Datos que se mostraran en el apartado de estadísticas
    const [graphs, setGraphs] = useState({ usage: 0, temperature: 0, power: 0 })
    const [average, setAverage] = useState({ usage: 0, temperature: 0, power: 0 })


    //*----------------------------------------USE EFFECT---------------------------------------------*//

    //Al cambiar de dispositivo o cuando se actualizan las estadísticas, mostramos las correspondientes
    useEffect(() => {


        //Estadísticas de input power
        const input_graph = stats?.power?.filter(entry => entry?.MetricType === 'powerinputwatts').reduce((acc, entry) => {

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

        const input_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'powerinputwatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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

        //Estadísticas de output power
        const output_graph = stats?.power?.filter(entry => entry?.MetricType === 'poweroutputwatts').reduce((acc, entry) => {

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

        const output_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'poweroutputwatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        const power_graph = stats?.power?.find(entry => entry?.MetricType === 'powerconsumedwatts')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.ServerPowerWatts

            return acc
        }, {}) ?? {}

        const power_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'powerconsumedwatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        setGraphs({ input: input_graph ?? [], output: output_graph ?? [], power: power_graph ?? [] })
        setAverage({ input: input_average ?? [], output: output_average ?? [], power: power_average ?? [] })


        //eslint-disable-next-line
    }, [stats])


    return (

        <div className={styles['wrapper']}>

            <StatsCard
                title={t('params.inputWatts')}
                value={average?.input?.average && `${average?.input?.average} W`}
                description={[average?.input?.max && `${t('titles.higherValue', { value: average?.input?.max })} W`, average?.input?.min && `${t('titles.lowerValue', { value: average?.input?.min })} W`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.input ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.input ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.input ?? {})}
                        unidades={Object.keys(graphs?.input ?? {}).map(() => ' ºW')}
                        colors={generateMatchingColors('#FFAB49', Object.keys(graphs?.input ?? {}).length)}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('params.outputWatts')}
                value={average?.output?.average && `${average?.output?.average} W`}
                description={[average?.output?.max && `${t('titles.higherValue', { value: average?.output?.max })} W`, average?.output?.min && `${t('titles.lowerValue', { value: average?.output?.min })} W`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.output ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.output ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.output ?? {})}
                        unidades={Object.keys(graphs?.output ?? {}).map(() => ' ºW')}
                        colors={generateMatchingColors('#FFAB49', Object.keys(graphs?.output ?? {}).length)}
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
                        colors={generateMatchingColors('#FFAB49', 1)}
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
