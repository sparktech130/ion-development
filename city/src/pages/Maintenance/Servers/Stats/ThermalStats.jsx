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


export const ThermalStats = ({ stats }) => {

    //*----------------------------------------VARIABLES----------------------------------------------*//

    //translation
    const { i18n, t } = useTranslation()

    //Datos que se mostraran en el apartado de estadísticas
    const [graphs, setGraphs] = useState({ reading: 0, speed: 0, component_temp: 0, temperature: 0, power: 0 })
    const [average, setAverage] = useState({ reading: 0, speed: 0, component_temp: 0, temperature: 0, power: 0 })


    //*----------------------------------------USE EFFECT---------------------------------------------*//

    //Al cambiar de dispositivo o cuando se actualizan las estadísticas, mostramos las correspondientes
    useEffect(() => {

        //Estadísticas de lectura
        const reading_graph = stats?.thermal?.filter(entry => entry?.MetricType === 'fanreading').reduce((acc, entry) => {

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

        //Media de lectura
        const reading_average = (() => {

            const elements = stats?.thermal?.filter(entry => entry?.MetricType === 'fanreading')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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

        //Estadísticas de velocidad de los ventiladores
        const speed_graph = stats?.thermal?.filter(entry => entry?.MetricType === 'fanspeedlevelpercents').reduce((acc, entry) => {

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

        //Media de velocidad
        const speed_average = (() => {

            const elements = stats?.thermal?.filter(entry => entry?.MetricType === 'fanspeedlevelpercents')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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

        //Estadísticas de temperatura de los componentes
        const component_temp_graph = stats?.thermal?.filter(entry => entry?.MetricType === 'temperaturereadingcelsius').reduce((acc, entry) => {

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

        //Media de temperatura de los componentes
        const component_temp_average = (() => {

            const elements = stats?.thermal?.filter(entry => entry?.MetricType === 'temperaturereadingcelsius')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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

        //Estadísticas de temperatura
        const temperature_graph = stats?.thermal?.find(entry => entry?.MetricType === 'inlettemp')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.Total

            return acc
        }, {}) ?? {}

        //Media de temperatura
        const temperature_average = (() => {

            const elements = stats?.thermal?.filter(entry => entry?.MetricType === 'inlettemp')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        const power_graph = stats?.power?.find(entry => entry?.MetricType === 'fanwatts')?.MetricInfo?.Stats?.reduce((acc, entry) => {

            const [date, time] = entry?.FechaHora?.split(' ') ?? []
            const formatted_date = `${date}\n${time}`

            acc[formatted_date] ??= {}
            acc[formatted_date] = entry?.Fan

            return acc
        }, {}) ?? {}

        //Media de consumo energético
        const power_average = (() => {

            const elements = stats?.power?.filter(entry => entry?.MetricType === 'fanwatts')?.flatMap(entry => Object.values(entry.CalMeasurement)) ?? []

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
        setGraphs({ reading: reading_graph ?? [], speed: speed_graph ?? [], component_temp: component_temp_graph ?? [], temperature: temperature_graph ?? [], power: power_graph ?? [] })
        setAverage({ reading: reading_average ?? [], speed: speed_average ?? [], component_temp: component_temp_average ?? [], temperature: temperature_average ?? [], power: power_average ?? [] })


        //eslint-disable-next-line
    }, [stats])


    return (

        <div className={styles['wrapper']}>

            <StatsCard
                title={t('values.reading')}
                value={average?.reading?.average && `${average?.reading?.average} RPM`}
                description={[average?.reading?.max && `${t('titles.higherValue', { value: average?.reading?.max })} RPM`, average?.reading?.min && `${t('titles.lowerValue', { value: average?.reading?.min })} RPM`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.reading ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.reading ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.reading ?? {})}
                        unidades={Object.keys(graphs?.reading ?? {}).map(() => ' RPM')}
                        colors={generateMatchingColors('#E72584', Object.keys(graphs?.reading ?? {}).length)}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('values.speedRatio')}
                value={average?.speed?.average && `${average?.speed?.average} %`}
                description={[average?.speed?.max && `${t('titles.higherValue', { value: average?.speed?.max })} %`, average?.speed?.min && `${t('titles.lowerValue', { value: average?.speed?.min })} %`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.speed ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.speed ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.speed ?? {})}
                        unidades={Object.keys(graphs?.speed ?? {}).map(() => ' %')}
                        colors={generateMatchingColors('#E72584', Object.keys(graphs?.speed ?? {}).length)}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('params.temperature')}
                value={average?.temperature?.average && `${average?.temperature?.average} ºC`}
                description={[average?.temperature?.max && `${t('titles.higherValue', { value: average?.temperature?.max })} ºC`, average?.temperature?.min && `${t('titles.lowerValue', { value: average?.temperature?.min })} ºC`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object?.keys(graphs?.temperature ?? {})}
                        datos={[Object?.values(graphs?.temperature ?? {})]}
                        colors={generateMatchingColors('#E72584', 1)}
                        etiquetas={[t('params.temperature')]}
                        unidades={[" ºC"]}
                        formatDateHour={true}
                        gradient={false}
                        legend
                        min={null}
                    />
                </div>
            </StatsCard>

            <StatsCard
                title={t('titles.componentsTemperature')}
                value={average?.component_temp?.average && `${average?.component_temp?.average} ºC`}
                description={[average?.component_temp?.max && `${t('titles.higherValue', { value: average?.component_temp?.max })} ºC`, average?.component_temp?.min && `${t('titles.lowerValue', { value: average?.component_temp?.min })} ºC`]}
                type="custom"
            >
                <div style={{ height: "250px" }}>
                    <LinearChart
                        labels={Object.keys(Object.values(graphs?.component_temp ?? {})[0] ?? {})}
                        datos={Object.values(graphs?.component_temp ?? {}).map(t => Object.values(t ?? {}))}
                        etiquetas={Object.keys(graphs?.component_temp ?? {})}
                        unidades={Object.keys(graphs?.component_temp ?? {}).map(() => ' ºC')}
                        colors={generateMatchingColors('#E72584', Object.keys(graphs?.component_temp ?? {}).length)}
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
                        colors={generateMatchingColors('#E72584', 1)}
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
