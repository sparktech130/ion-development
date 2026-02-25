//dejado a medias: probando con otra funciona que no acaba de ir. no traducido----------------------------------! 
//cuando se arregle miraré de implementarlo con este componente

import styles from './Recognitions.module.css'
import { useState, useEffect, useContext } from 'react'
import moment from 'moment'
//import { TimeRange } from 'pondjs/lib/entry'

//components
import { LazyImage } from '../../../../../../../components/Live/Recognition/LazyImage/LazyImage'
import { FilterSection } from '../../../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../../../components/FilterSection/FilterSectionElement'

//context
import MainDataContext from '../../../../../../../context/MainDataContext'

//services
import { URL_OBTENER_RECONOCIMIENTOS_ZONA } from '../../../../../../../api/connections/urls'


export const Recognitions = ({
    deviceSelected,
    fecha,
    timeIni, setTimeIni,
    setLive,
    seleccion, setSeleccion,
    setHoraPuntero,
    reconocimientos, setReconocimientos,
    isSelectedRecognition, setIsSelectedRecognition,
    areaFilters,
    licensePlateInput, setLicensePlateInput
}) => {
    const {requestAPI} = useContext(MainDataContext)
    //filtros
    const [filterOpen, setFilterOpen] = useState(false)
    const [loadingData, setLoadingData] = useState(true)


    //-------------------------pedir datos-----------------------------------

    //pide reconocimientos. param paginacion: si la llamada se ha hecho por llegar abajo del scroll
    const getReconocimientos = async (paginacion) => {
        setLoadingData(true)
        let error = false
        if(!isSelectedRecognition){
            try{
                if(!paginacion){
                    setReconocimientos([]) //evita bug de mantener scroll cuando cambias de cam
                }
                if(deviceSelected?.cod_dispositivo){
                    //params
                    const {fechaIni, fechaFin, horaIni, horaFin} = formatDates()
                    let params = {
                        cod_dispositivo: deviceSelected.cod_dispositivo,
                        limit: 20
                    }
                    if(horaIni && horaFin){ 
                        params.startTime = fechaIni+" "+horaIni
                        params.endTime = fechaFin+" "+horaFin
                    }else{
                        params.startTime = fechaIni+" 00:00:00"
                        params.endTime = fechaFin+" 23:59:59"
                    }
                    if(areaFilters){
                        params.x1 = areaFilters.x1
                        params.x2 = areaFilters.x2
                        params.y1 = areaFilters.y1
                        params.y2 = areaFilters.y2
                    }
                    //filtros
                    if(licensePlateInput){params.freeText=licensePlateInput}
                    //pedir datos
                    let data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_ZONA, params)
                    if(!data.error){
                        setReconocimientos(data)
                    }else{
                        error = true
                    }
                }else{
                    error = true
                }
            }catch{
                error = true
            }finally{
                if(error){ setReconocimientos([])}
                setLoadingData(false)
            }
        }
    }

    //llamada inicial
    useEffect(()=>{
        getReconocimientos()
    //eslint-disable-next-line
    },[deviceSelected, fecha, isSelectedRecognition, areaFilters, seleccion])


    //--------------------funciones---------------------------

    //gestiona las fechas/horas que hay que pasar como params
    const formatDates = () => {
        let fechaIni;
        let fechaFin;
        let horaIni = null;
        let horaFin = null;
        //si hay posicion inicial
        if(timeIni){
            fechaIni = moment(timeIni).format('YYYY-MM-DD')
            fechaFin = fechaIni
            //si hay seleccion
            if(seleccion){
                horaIni = moment(seleccion.begin()).format('HH:mm:ss') 
                horaFin = moment(seleccion.end()).format('HH:mm:ss') 
            }
        //live
        }else{
            fechaIni = moment().format('YYYY-MM-DD')
            fechaFin = fechaIni
        }
        return {fechaIni, fechaFin, horaIni, horaFin}
    }

    //-------------------ONCLICKS-----------------------------

    const onClickRecognition = (recognition) => {
        /* adaptarlo. no me viene el timestamp correcto de back
        setIsSelectedRecognition(true)
        let momento =  moment(recognition.fecha+' '+recognition.hora, 'YYYY-MM-DD HH:mm:ss')
        if(momento){
            let positionMs = momento.valueOf();
            if((positionMs !== timeIni)){
                let hora_fin = momento.clone().add(5, 'seconds')
                setDuration(5000)
                setTimeIni(positionMs)
                setSeleccion(new TimeRange(momento, hora_fin))
                setHoraPuntero(momento.toDate())
                setLive(false)
            }
        }
        */
    }

    //----------------filtrar-------------------------------

    //Reseteamos todos los filtros
    const resetFilters = () =>{
        setLicensePlateInput('')
    }

    //filtrar datos
    const filterData = () => {
        getReconocimientos()
    }


    return(
        <div className={styles['recognitions']}>

            {/* filtrar */}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title="Filtrar" onReset={resetFilters} onSubmit={filterData} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '450px' }}>
                    <FilterSectionElement title="Matrícula">
                        <input className='input' type="text" placeholder='Matrícula' value={licensePlateInput} onChange={e => setLicensePlateInput(e.target.value)} />
                    </FilterSectionElement>
                </FilterSection>
            }

            <button className='button' onClick={()=>setFilterOpen(true)}>Filtrar</button>

            <div className={styles['recognitions__wrapper']} >
                {!loadingData && reconocimientos && reconocimientos.map((item, i)=>(
                    <div className={styles['recognition']} key={i} onClick={()=>onClickRecognition(item)}>
                        <LazyImage  src={item?.foto ? "data:image/jpeg;base64,"+item?.foto : ''} />
                        <div className={styles['info']}>
                            <p>{item.matricula}</p>
                            <div className={styles['info__times']}>                                
                                <p>{item.timestampUs ? moment(parseInt(item.timestampUs/1000)).format('DD-MM-YYYY') : ''}</p>
                                <p>{item.timestampUs ? moment(parseInt(item.timestampUs/1000)).format('HH:mm:ss') : ''}</p>                                
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}