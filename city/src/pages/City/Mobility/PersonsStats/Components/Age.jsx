import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

//Components
import { HorizontalBarChart } from '../../../../../../components/Charts/HorizontalBarChart/HorizontalBarChart'
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { Filters } from './Filters/Filters'

//Api
import { URL_RECONOCIMIENTOS_PERSONAS_GROUP } from '../../../../../../api/connections/urls'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Assets
import graphIcon from '@icons/actions/graph.svg?react'

//Icons
import { checkArray } from '../../../../../../utils/functions/functions'



export const Age = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { setIsLoading, requestAPI } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Graph
    const [labels] = useState([t('values.young'), t('values.adult'), t('values.middle'), t('values.senior'), t('values.unknown')])
    const [datos, setDatos] = useState([])
    const [highestData, setHighestData] = useState(undefined)
    const [averageAgeName, setAverageAgeName] = useState(undefined)

    //Filter
    const [payload2, setPayload2] = useState({})
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [isFiltering, setIsFiltering] = useState(false)


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        let success = false
        setLoadingsControl(prev => ({ ...(prev || {}), 'age': true }))
        let ordenDatos = ['young', 'adult', 'middle', 'senior', 'unknown']
        try {

            let data = []
            let datos = [0,0,0,0,0]

            //params
            let params = {
                group: ['edad'],
                modulos: [11],
                cod_dispositivo: device?.cod || undefined,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
                ropa_superior: payload2?.upper_clothing,
                ropa_inferior: payload2?.lower_clothing,
                ...(payload2?.keys?.length
                    ? Object.fromEntries(payload2.keys.map(i => [i, true]))
                    : {})
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //Comprobamos si estamos filtrando o no
            let isFiltering = Object.entries(params).some(([key, value]) => value && key !== 'group' && key !== 'order' && key !== 'modulos' && key !== 'cod_dispositivo' && key !== 'fecha_ini' && key !== 'fecha_fin');
            setIsFiltering(isFiltering)

            //llamar back
            data = await requestAPI(URL_RECONOCIMIENTOS_PERSONAS_GROUP, params)
            
            if (!data.error) {

                //dar formato datos
                data.forEach(item => {
                    if (item.edad) {
                        let index = ordenDatos.indexOf(item.edad)
                        if(index !== -1){
                            datos[index] = item.total
                        }
                    }
                });

                if(checkArray(datos)){
                    //Valor más alto
                    const maxValue = Math.max(...datos)
                    const maxIndex = datos.indexOf(maxValue)
                    const maxEdadNombre = ordenDatos[maxIndex]

                    //asignar datos
                    setDatos(datos)
                    setHighestData({
                        edad: t('values.'+maxEdadNombre),
                        total: maxValue
                    })
                    setAverageAgeName(calcularTramoEdadMedio(datos))
                    success = true
                }

            }
        }finally {
            if(!success){
                setDatos([])
                setHighestData(undefined)
                setAverageAgeName(undefined)
            }
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'age': false }))
            }, 300);
        }
    }

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload, device, payload2])


    //-------------------------FUNCIONES-----------------------------------

    //Filtra datos
    const filterData = (p) => {
        setIsLoading(true) //Para que no se vea un instante sin loading
        setPayload2(p)
    }

    //calucla cual es el tramo de edad medio
    function calcularTramoEdadMedio(datos) {
        const weights = [20, 40, 60, 80];  // edades medias de cada tramo
        let sumWeighted = 0;
        let sumTotals = 0;

        for (let i = 0; i < weights.length; i++) {
            const total = datos[i] || 0;
            sumWeighted += weights[i] * total;
            sumTotals += total;
        }

        if (sumTotals === 0) return null;

        const media = sumWeighted / sumTotals;

        if (media < 35) return t('values.young');       // 0–29
        if (media < 50) return t('values.adult');       // 30–48
        if (media < 70) return t('values.middle');      // 50–69
        return t('values.senior');                       // +70
    }


    return (
        <>
            {/* Modal filtrar */}
            {filterOpen &&
                <Filters
                    setFilterOpen={setFilterOpen}
                    filterData={filterData}
                    filterState={filterState} setFilterState={setFilterState}
                />
            }

            <StatsCard
                title={t('titles.averageAge')}
                description={[highestData?.edad ? `${highestData?.edad} (${highestData?.total || 0} ${t('terms.records')})` : t('messages.resultsNone')]}
                descriptionIcon={[graphIcon]}
                value={averageAgeName || '-'}
                onFilter={() => setFilterOpen(true)}
                activeFilter={isFiltering}
                type="horizontalChart"
            >
                <HorizontalBarChart
                    labels={labels}
                    datos={[datos]}
                    colors={["#AE6BCC"]}

                    categoryPercentage={0.9}
                    barPercentage={0.8}
                    limitScroll={5}
                    labelsFontSize={12}
                />
            </StatsCard>
        </>
    )
}