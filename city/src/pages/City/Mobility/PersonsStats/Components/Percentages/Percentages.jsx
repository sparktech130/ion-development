import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import moment from 'moment'

//Context
import MainDataContext from '../../../../../../../context/MainDataContext'

//Api
import { URL_RECONOCIMIENTOS_PERSONAS_GROUP } from '../../../../../../../api/connections/urls'

//Styles
import styles from './Percentages.module.css'

//Utils
import { checkArray } from '../../../../../../../utils/functions/functions'

//Const
const PERSON_PARAMS = ['telefono', 'gafas', 'carga_bolsa', 'asistido', 'fumando', 'tatuado', 'cara_tapada']



export const Percentages = ({
    payload, //payload general de todas las gráficas
    preset, // 24, 7, 30, custom
    device, //Dispositivo
    setLoadingsControl //objeto para controlar los loadings de cada card {'vehicleType':true, ...}
}) => {

    //Context
    const { requestAPI } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Graph
    const [datos, setDatos] = useState([])


    //-----------------------------------API------------------------------------

    //obtiene pedidos
    const getData = async () => {
        setLoadingsControl(prev => ({ ...(prev || {}), 'percentages': true }))
        try {

            let data = []

            //params
            let params = {
                multipleGroup: {
                    'genero': [
                        'genero',
                    ],
                    'telefono': [
                        'telefono',
                        'genero'
                    ],
                    'gafas':[
                        'gafas',
                        'genero'
                    ],
                    'carga_bolsa':[
                        'carga_bolsa',
                        'genero'
                    ],
                    'asistido':[
                        'asistido',
                        'genero'
                    ], 'fumando':[
                        'fumando',
                        'genero'
                    ],
                    'tatuado':[
                        'tatuado',
                        'genero'
                    ],
                    'cara_tapada':[
                        'cara_tapada',
                        'genero'
                    ]
                },
                modulos: [11],
                cod_dispositivo: device?.cod || undefined,
                fecha_ini: moment().format('YYYY-MM-DD'),
                fecha_fin: moment().format('YYYY-MM-DD'),
            }
            if (preset !== 24) {
                params.fecha_ini = payload?.initial_date
                params.fecha_fin = payload?.final_date
            }

            //llamar back
            data = await requestAPI(URL_RECONOCIMIENTOS_PERSONAS_GROUP, params)

            if (!data.error) {

                //asignar datos
                setDatos(formatData(data))

            } else {
                setDatos([])
            }
        } catch {
            setDatos([])
        } finally {
            setTimeout(() => {
                setLoadingsControl(prev => ({ ...(prev || {}), 'percentages': false }))
            }, 300);
        }
    }

    //actualiza datos
    useEffect(() => {

        //Evita doble llamada al inicio
        if (!payload) return

        getData()

        // eslint-disable-next-line
    }, [payload, device])

    //--------------------------------UTILS----------------------------------------

    //Calcula porcentaje
    const getPercentage = (value, total) => {
        if(value && total){
            return (value / total * 100).toFixed() + '%'
        }else{
            return '0%'
        }
    }

    //Pone en formato los datos
    const formatData = (data) => {

        const formattedData = {};

        const genders = ['male', 'female'];

        //Obtiene el total por género y parámetro que estamos buscando
        const getCount = (arr, gender, filter=()=>true) => (
            arr?.find(item => item.genero === gender && filter(item))?.total || 0
        )

        // Género
        if (checkArray(data?.genero)) {
            //Obtiene datos {female:12, male:123}
            const totals = Object.fromEntries(
                genders.map(g => [g, getCount(data.genero, g)])
            );
            //Guarda los datos en formattedData en porcentaje {gender:{male:40%, female:60%}}
            const total = totals.male + totals.female;
            formattedData.genero = Object.fromEntries(
                genders.map(g => [g, getPercentage(totals[g], total)])
            );
        } else {
            formattedData.genero = { male: '0%', female: '0%' };
        }

        // Resto de parámetros
        PERSON_PARAMS?.forEach(param => {

            //Si no es un array
            if (!checkArray(data?.[param])) {
                formattedData[param] = { male: '0%', female: '0%' };
                return;
            }

            //Guarda valor de cada parámetro en formattedData {NombreParam:{male:1%, female:5%}, ...}
            const valores = Object.fromEntries(
                genders.map(g => {
                    const withParam = getCount(data[param], g, item => item[param] === 1);
                    const withoutParam = getCount(data[param], g, item => item[param] === 0);
                    const total = withParam + withoutParam;
                    return [g, getPercentage(withParam, total)];
                })
            );
            //Guarda cual es más alto maleIsHigh (true/false o null si empatan)
            formattedData[param] = {
                ...valores,
                maleIsHigh: parseFloat(valores.male) > parseFloat(valores.female) ? true
                    : parseFloat(valores.male) < parseFloat(valores.female) ? false
                    : null
            };
        });

        return formattedData;
    };



    return (
        <div className={styles['wrapper']}>

            <h2>{t('params.gender')}</h2>

            {/* Gender chart */}
            <div className={styles['chart__wrapper']}>
                <div className={styles['bar']} style={{width:datos?.genero?.male, backgroundColor:'#6692DB', 'justifyContent':'flex-start'}}>
                    <h2 className={styles['percentage__gender']}>{datos?.genero?.male}</h2>
                </div>
                <div className={styles['bar']} style={{width:datos?.genero?.female, backgroundColor:'#E72584', 'justifyContent':'flex-end'}}>
                    <h2 className={styles['percentage__gender']}>{datos?.genero?.female}</h2>
                </div>
            </div>

            {/* Params Charts */}
            {PERSON_PARAMS?.map(item=>(
                <div key={item} className={styles['item']}>
                    <div className={styles['bar']} style={{backgroundColor:datos?.[item]?.maleIsHigh === true ? '#6692DB' : 'transparent'}}>
                        <h2>{datos?.[item]?.male}</h2>
                    </div>
                    <h2>{t('params.'+item)}</h2>
                    <div className={styles['bar']} style={{backgroundColor:datos?.[item]?.maleIsHigh === false ? '#E72584' : 'transparent'}}>
                        <h2>{datos?.[item]?.female}</h2>
                    </div>
                </div>
            ))}

        </div>
    )
}