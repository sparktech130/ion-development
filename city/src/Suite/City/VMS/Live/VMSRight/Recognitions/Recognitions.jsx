import styles from './Recognitions.module.css'
import { useState, useEffect, useRef, useContext } from 'react'
import moment from 'moment'
import { TimeRange } from 'pondjs/lib/entry'
import { useTranslation } from 'react-i18next'

//components
import { LazyImage } from '../../../../../../../components/Live/Recognition/LazyImage/LazyImage'
import { FilterSection } from '../../../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../../../components/FilterSection/FilterSectionElement'
import { InputItems } from '../../../../../../../components/Inputs/InputItems/InputItems'
import {ButtonComponent} from '@components/ButtonComponent/ButtonComponent'

//context
import MainDataContext from '../../../../../../../context/MainDataContext'
import { useLoginDataContext } from '../../../../../../../context/LoginDataContext'

//constants
import { tiposVehiculo, autocompleteColors, url_path } from '../../../../../../../constants/common'

//services
import { URL_OBTENER_RECONOCIMIENTOS_PARAM } from '../../../../../../../api/connections/urls'
import { subscribeToEvent, unsubscribeFromEvent, joinRoom, leaveRoom } from '../../../../../../../api/connections/socketHandler'

//utils
import { handleKey } from '../../../../../../../utils/functions/accessibility'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'


export const Recognitions = ({
    deviceSelected,
    timeIni, setTimeIni, //ms inicio
    live, setLive,
    seleccion, setSeleccion,
    setSeleccionCurrent,
    setHoraPuntero,
    reconocimientos, setReconocimientos,
    isSelectedRecognition, setIsSelectedRecognition, //control si hemos clicado un reconocimiento
    licensePlateInput, setLicensePlateInput,
    fecha,
    gridDevices
}) => {

    const {requestAPI, url_origin} = useContext(MainDataContext)
    const { server } = useLoginDataContext()
    const {t} = useTranslation()

    //datos
    const [cantidadReconocimientos, setCantidadReconocimientos] = useState(0) //cantidad reconocimientos ultima llamada
    const [cursor, setCursor] = useState(null) // último cod_reconoc cuando se piden los reconocimientos para que no se descuadre la paginación
    const [pagina, setPagina] = useState(1) //pagina paginación
    const [isLoading, setIsLoading] = useState(false)

    //filtros
    const [filterOpen, setFilterOpen] = useState(false)
    const [filtrando, setFiltrando] = useState(false)
    const [colorInput, setColorInput] = useState(undefined)
    const [vehicleTypeInput, setVehicleTypeInput] = useState(undefined)

    //ref
    const scrollObserver = useRef()


    //-------------------------pedir datos-----------------------------------

    //pide reconocimientos. param paginacion: si la llamada se ha hecho por llegar abajo del scroll
    const getReconocimientos = async (paginacion) => {
        let error = false
        if(!isSelectedRecognition){
            try{
                if(!paginacion){
                    setIsLoading(true) //evita de añadir reconocimientos por socket cuando aun no se han pedido
                    setReconocimientos([]) //evita bug de mantener scroll cuando cambias de cam
                }
                if(deviceSelected?.cod_dispositivo){
                    //params
                    const {fechaIni, fechaFin, horaIni, horaFin} = formatDates()
                    let params = {
                        cod_dispositivo: deviceSelected.cod_dispositivo,
                        order: ["fecha DESC","hora DESC"],
                        limit: 10
                    }
                    if(horaIni && horaFin){ 
                        params.datetime_inicial = fechaIni+" "+horaIni
                        params.datetime_final = fechaFin+" "+horaFin
                    }else{
                        params.fecha_ini = fechaIni
                        params.fecha_fin = fechaFin
                    }
                    //filtros
                    if(licensePlateInput){params.matricula=licensePlateInput}
                    if(colorInput){params.color=colorInput.cod}
                    if(vehicleTypeInput){params.tipo_vh=vehicleTypeInput.cod}
                    //paginación
                    let cursorLlamada = null;
                    let paginaLlamada = null;
                    if(!paginacion){
                            paginaLlamada = 1
                            setPagina(1)
                    }else{
                        cursorLlamada = cursor
                        paginaLlamada = pagina+1
                        setPagina(pagina+1)
                    }
                    if(cursorLlamada){ params.ultimo_cod_reconoc=cursorLlamada}
                    if(paginaLlamada){ params.page=paginaLlamada}
                    //pedir datos
                    let data = await requestAPI(URL_OBTENER_RECONOCIMIENTOS_PARAM, params)
                    if(!data.error){
                            if(paginacion){
                                setReconocimientos(prevReconocimientos =>{
                                    return [...prevReconocimientos, ...(data?.rows || [])]
                                })
                            }else{
                                setReconocimientos(data?.rows || [])
                                //guardo el cod_reconoc más alto como cursor
                                setCursor( data?.rows?.reduce((objetoActual, objetoSiguiente) => objetoActual.cod_reconoc > objetoSiguiente.cod_reconoc ? objetoActual : objetoSiguiente, {}).cod_reconoc)
                            }
                            setCantidadReconocimientos(data?.rows?.length || 0)
                    }else{
                        error = true
                    }
                }else{
                    error = true
                }
            }catch{
                error = true
            }finally{
                setIsLoading(false)
                if(error){
                    setReconocimientos([])
                    setCantidadReconocimientos(0)
                }
            }
        }
    }

    //llamada inicial
    useEffect(()=>{
        getReconocimientos()
    //eslint-disable-next-line
    },[deviceSelected, seleccion, fecha, isSelectedRecognition])

    //control por si se quita la cam del grid mientras se están pidiendo reconocimientos se quiten
    useEffect(()=>{
        if((gridDevices.length === 0) && (reconocimientos.length>0)){
            setReconocimientos([])
        }
    //eslint-disable-next-line
    },[reconocimientos])


    //pide nuevos reconocimientos por socket
    useEffect(()=>{
        let deviceId = deviceSelected?.deviceId
        if(server && deviceId && !seleccion && !filtrando && !isLoading && moment(fecha).isSame(moment(), 'day')){

            //Accede a la room
            const roomName = `reconocimientos_${server}`
            joinRoom(roomName)

            subscribeToEvent('reconocimientos_cambio_'+deviceId, (data) => {
                setReconocimientos(prevReconocimientos => {
                    const existeReconocimiento = prevReconocimientos.some(reconocimiento => reconocimiento.cod_reconoc === data.data.cod_reconoc);
                    if (!existeReconocimiento) {
                        return [data.data, ...prevReconocimientos];
                    }else{
                        return prevReconocimientos;
                    }
                });
            });
            return () => {
                unsubscribeFromEvent('reconocimientos_cambio_'+deviceId)
                leaveRoom(roomName)            
            }
        }
        //eslint-disable-next-line
    },[deviceSelected, seleccion, filtrando, isLoading, fecha])

    //pide más reconocimientos si se llega abajo del scroll (si se ve en pantalla el ref scrollOvserver)
    useEffect(() => {
        let observer;
        const intersectionCallback = (entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if((reconocimientos.length>8) && (cantidadReconocimientos>0)){
                    getReconocimientos(true)
                }else{
                    observer.unobserve(entry.target);
                }
            }
        });
        };
        observer = new IntersectionObserver(intersectionCallback);
        observer.observe(scrollObserver?.current);
        return () => {
            if (observer) observer.disconnect();
        };
        //eslint-disable-next-line
    }, [reconocimientos, cantidadReconocimientos]);


    //--------------------funciones---------------------------

    //gestiona las fechas/horas que hay que pasar como params
    const formatDates = () => {
        let fechaIni;
        let fechaFin;
        let horaIni = null;
        let horaFin = null;
        //si hay selección
        if(seleccion){
            fechaIni = moment(fecha).format('YYYY-MM-DD')
            horaIni = moment(seleccion.begin()).format('HH:mm:ss')
            horaFin = moment(seleccion.end()).format('HH:mm:ss')
            fechaFin = fechaIni
        //sin selección
        }else{
            fechaIni = moment(fecha).format('YYYY-MM-DD')
            fechaFin = fechaIni
        }
        return {fechaIni, fechaFin, horaIni, horaFin}
    }

    //-------------------ONCLICKS-----------------------------

    const onClickRecognition = (recognition) => {
        setIsSelectedRecognition(true)
        let momento =  moment(recognition.fecha+' '+recognition.hora, 'YYYY-MM-DD HH:mm:ss')
        if(momento){
            let positionMs = momento.valueOf();
            let hora_fin = momento.clone().add(5, 'seconds')
            setTimeIni((positionMs !== timeIni) ? positionMs : positionMs-1)
            setSeleccion(new TimeRange(momento, hora_fin))
            setSeleccionCurrent(new TimeRange(momento, hora_fin))
            setHoraPuntero(momento.toDate())
            setLive(false)
        }
    }

    //----------------filtrar-------------------------------

    //Reseteamos todos los filtros
    const resetFilters = () =>{
        setLicensePlateInput('')
        setColorInput(undefined)
        setVehicleTypeInput(undefined)
    }

    //filtrar datos
    const filterData = () => {
        if(licensePlateInput || colorInput || vehicleTypeInput){
            setFiltrando(true)
        }else{
            setFiltrando(false)
        }
        getReconocimientos()
    }



    return(
        <div className={styles['recognitions']}>

            {/* modal filtrar */}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', {elements:t('terms.recognitions')})} submitText={t('buttons.filter')} onReset={resetFilters} onSubmit={filterData} rows={2} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>
                    <FilterSectionElement title={t('params.licensePlate')}>
                        <input className='input' type="text" placeholder={t('params.licensePlate')} value={licensePlateInput} onChange={e => setLicensePlateInput(e.target.value)} />
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.color')}>
                        <InputItems items={autocompleteColors} itemName="name" onSelect={setColorInput} selectedItem={colorInput} placeholder={t('params.color')} />
                    </FilterSectionElement>
                    <FilterSectionElement title={t('params.vehicleType')}>
                        <InputItems items={tiposVehiculo} itemName='name' onSelect={setVehicleTypeInput} selectedItem={vehicleTypeInput} placeholder={t('params.vehicleType')} />
                    </FilterSectionElement>
                </FilterSection>
            }

            <ButtonComponent text={t('buttons.filter')} icon={filterIcon} onClick={()=>setFilterOpen(true)} permissionType='consultas' />

            {/* reconocimientos */}
            <div className={styles['recognitions__wrapper']} >
                {reconocimientos.map((item, i)=>(
                    <div className={styles['recognition']} key={i} onClick={()=>onClickRecognition(item)} tabIndex={0} onKeyDown={e=>handleKey(e, ()=>onClickRecognition(item))}>
                        <LazyImage  src={item?.foto ? url_origin + url_path + '/fotos/' + item?.foto : ''} />
                        <div className={styles['info']}>
                            <p>{item.matricula}</p>
                            <div className={styles['info__times']}>
                                <p>{moment(item.fecha).format('DD-MM-YYYY')}</p>
                                <p>{item.hora}</p>
                            </div>
                        </div>
                    </div>
                ))}
                <div className={styles['scrollObserver']} ref={scrollObserver}>{  }</div>
            </div>
        </div>
    )
}