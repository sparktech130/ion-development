import { useEffect, useState, useMemo, useContext } from "react"
import { useTranslation } from "react-i18next"

//Components
import { AccesibleIcon } from "../../../../components/AccesibleIcon/AccesibleIcon"
import { FilterSection } from "../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from "../../../../components/Maps/MapV4/MapV4"
import { DragScrollDiv } from "../../../../components/DragScrollDiv/DragScrollDiv"

//Constants
import { smartcity_modules, url_path, streamDevices, sensorDevices, engineDevices } from "../../../../constants/common"

//Utils
import { handleKey } from "../../../../utils/functions/accessibility"
import { coordsToString } from "../../../../components/Maps/MapV4/mapUtils"
import { checkArray } from '../../../../utils/functions/functions'

//API
import { URL_OBTENER_CANALES, URL_INSERTAR_DISPOSITIVOS } from "../../../../api/connections/urls"

//Context
import MainDataContext from "../../../../context/MainDataContext"

//Assets
import { markerIcons, deviceIcons, modulesIcons } from "../../../../constants/icons"

//Styles
import styles from '../Devices.module.css'
import { ButtonComponent } from "../../../../components/ButtonComponent/ButtonComponent"

//Icons
import nextIcon from '@icons/actions/next.svg?react'
import prevIcon from '@icons/actions/prev.svg?react'
import insertIcon from '@icons/actions/add.svg?react'


//Modal insertar dispositivo
export const InsertModal = ({

    setIsOpen, //cerrar modal
    getDevices, //Actualizar datos

    //Datos
    categorias,
    models,
    clouds,
}) => {

    //----------------------------VARIABLES------------------------------------------

    //Context
    const { requestAPI, setInfoMessage, setIsLoading, url_origin } = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //Page
    const [currentPage, setCurrentPage] = useState(1)

    //Datos
    const [channels, setChannels] = useState([])

    //State
    const [insertState, setInsertState] = useState({})

    //Inputs
    const [coordinates, setCoordinates] = useState('')
    const [selectedType, setSelectedType] = useState('0001')
    const [selectedManufacturer, setSelectedManufacturer] = useState('')
    const [selectedModel, setSelectedModel] = useState('')
    const [selectedModules, setSelectedModules] = useState([])


    //----------------------------USE MEMO------------------------------------------

    //Fabricantes filtrados
    const filteredManufacturers = useMemo(() => {
        //Buscamos la categoría con ese código
        if (selectedType && checkArray(categorias)) {
            let categoria = categorias.find(item => item.cod_categoria === selectedType)
            //Cogemos sus fabricantes
            if (categoria && checkArray(categoria.fabricantes)) {
                return categoria.fabricantes
            }
        }
        return undefined
    }, [categorias, selectedType])

    //Modelos filtrados
    const filteredModels = useMemo(() => {
        //Filtramos modelos de la categoría y fabricante seleccionados
        if (selectedManufacturer && checkArray(models)) {
            let modelos = models.filter(item => item.cod_categoria === selectedType && item.cod_fabricante === selectedManufacturer)
            if (modelos.length > 0) {
                return modelos
            }
        }
        return undefined
    }, [models, selectedType, selectedManufacturer])

    //Rows FilterSection variable
    const filterSectionRows = useMemo(() => {
        if (currentPage === 1) {

            if (streamDevices.includes(selectedType)) {
                return 7
            }
            if (sensorDevices.includes(selectedType)) {
                return 9
            }
            if (engineDevices.includes(selectedType)) {
                return 6
            }

        } else {
            return 3
        }
    }, [currentPage, selectedType])


    //--------------------------API CANALES-----------------------------

    //obtiene canales licencias
    const getChannels = async () => {
        try {
            let data = await requestAPI(URL_OBTENER_CANALES)
            if (!data.error && Array.isArray(data) && data.length > 0 && data[0].canales_validos) {
                let formatData = {}
                //pongo formato facil de consultar sin funciones
                data.forEach((item) => (
                    formatData[item.cod_modulo] = { dispositivos_asignados: item.dispositivos_asignados || 0, canales_validos: item.canales_validos || 0 }
                ))
                setChannels(formatData)
            }
        } catch {
            //
        }
    }

    //actualiza los canales
    useEffect(() => {
        if (currentPage === 2) {
            //pido canales
            getChannels()

            //actualizo cada minuto los canales
            const interval = setInterval(getChannels, 60000)
            return () => { clearInterval(interval) }
        }
        //eslint-disable-next-line
    }, [currentPage])


    //-------------------------API DISPOSITIVOS----------------------

    //Inserta el dispositivo
    const insertDevices = async () => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_modelo: selectedModel,
            nom_dispositivo: insertState?.nom_dispositivo,
            serial_number: insertState?.serial_number,
            ip_dispositivo: insertState?.ip_dispositivo,
            direccion_mac: insertState?.direccion_mac,
            coordenadas: coordsToString(coordinates),
            modulos: selectedModules,
        }

        //Añado params según tipo dispositivo por seguridad. Si se escribe en los inputs y luego se cambia de tipo quedan en el insertstate inputs que puede no tener ese tipo
        if (sensorDevices.includes(selectedType)) {
            params.protocolo_ip = insertState?.protocolo_ip
            params.deveui = insertState?.deveui
            params.appeui = insertState?.appeui
            params.appkey = insertState?.appkey
            params.joineui = insertState?.joineui
            params.mascara_red = insertState?.mascara_red
            params.puerta_enlace = insertState?.puerta_enlace
            params.servidor_dhcp = insertState?.servidor_dhcp
            params.username = insertState?.username
            params.password = insertState?.password
        }
        
        if (streamDevices.includes(selectedType)) {
            params.cod_cloud = insertState?.cloud?.cod
            params.deviceId = insertState?.deviceId
        }
        
        if (engineDevices.includes(selectedType)) {
            params.deviceId = insertState?.deviceId
        }

        //Llamada para insertar dispositivo
        let data = await requestAPI(URL_INSERTAR_DISPOSITIVOS, params)

        //Control de errores
        if (data.insert === false || data.error === true) {
            setIsLoading(false)
            setInfoMessage(data.message || t('errors.request'))
            return
        }

        //Ocultamos modal de inserción
        setIsOpen(false)

        //Actualizar datos
        getDevices(true)

        //mensaje informativo final. Se avisa si no se ha podido asignar a módulos
        let infoText = ''
        if (data?.modulos?.modulosIncorrectos && Array.isArray(data?.modulos?.modulosIncorrectos) && data?.modulos?.modulosIncorrectos.length > 0) {
            infoText = '. '+t('errors.noChannelsModules') + data?.modulos?.modulosIncorrectos.join(', ')
        }
        setInfoMessage(t('crud.elementAdded') + infoText)
    }

    //-----------------------USE EFFECT------------------------------

    //Selecciona categoría, fabricante y modelo por defecto
    useEffect(() => {

        //Selecciona primera categoría
        let cod_categoria = Array.isArray(categorias) ? categorias[0]?.cod_categoria : undefined
        setSelectedType(cod_categoria)

        //Selecciono primer fabricante de primera categoría
        let cod_fabricante = undefined
        if (cod_categoria) {
            cod_fabricante = Array.isArray(categorias[0]?.fabricantes) ? categorias[0]?.fabricantes[0]?.cod_fabricante : undefined
            setSelectedManufacturer(cod_fabricante)
        } else {
            setSelectedManufacturer(undefined)
        }

        //Selecciono un modelo de ese fabricante y categoría
        if (cod_categoria && cod_fabricante) {
            setSelectedModel(models?.find(item => (item.cod_fabricante === cod_fabricante) && (item.cod_categoria === cod_categoria))?.cod_modelo)
        } else {
            setSelectedModel(undefined)
        }
        //eslint-disable-next-line
    }, [])


    //-------------------------ONCLICK--------------------------------

    //click next insert modal
    const onClickInsertNext = () => {
        //Control campos obligatorios
        let error = true

        // Dispositivos de tipo sensor
        if (sensorDevices.includes(selectedType)) {
            if (selectedModel && insertState?.nom_dispositivo && insertState?.serial_number && insertState?.deveui) {
                error = false
            }
        }

        // Dispositivos de tipo stream
        if (streamDevices.includes(selectedType)) {
            if (selectedModel && insertState?.nom_dispositivo && insertState?.cloud?.cod && insertState?.deviceId) {
                error = false
            }
        }

        // Dispositivos de tipo máquina
        if (engineDevices.includes(selectedType)) {
            if (selectedModel && insertState?.nom_dispositivo && insertState?.deviceId) {
                error = false
            }
        }

        if (error) {
            setInfoMessage(t('errors.fillRequiredFields'))
        } else {
            setCurrentPage(2)
        }
    }

    //Click finalizar
    const onClickSubmit = () => {

        //Comprobación para finalizar inserción del dispositivo
        coordinates ? insertDevices() : setInfoMessage(t('errors.fillRequiredFields'))
    }

    //Click tipo
    const handleType = (cod_categoria) => {

        if (selectedType === cod_categoria) return

        //Selecciona tipo
        setSelectedType(cod_categoria)

        //Selecciono el primer fabricante de la categoría
        let categoria = categorias.find(element => element.cod_categoria === cod_categoria)
        let cod_fabricante = undefined
        if (checkArray(categoria.fabricantes)) {
            cod_fabricante = categoria?.fabricantes[0]?.cod_fabricante
        }
        setSelectedManufacturer(cod_fabricante)

        //Selecciono un modelo de ese fabricante y categoría
        if (cod_categoria && cod_fabricante) {
            setSelectedModel(models?.find(item => (item.cod_fabricante === cod_fabricante) && (item.cod_categoria === cod_categoria))?.cod_modelo)
        } else {
            setSelectedModel(undefined)
        }
    }

    //Click fabricante
    const handleManufacturer = (cod) => {
        if (selectedManufacturer === cod) return
        //selecciona fabricante y modelo por defecto
        setSelectedManufacturer(cod)
        setSelectedModel(models?.find(item => (item.cod_fabricante === cod) && (item.cod_categoria === selectedType))?.cod_modelo)
    }

    //Click módulo
    const handleModule = (id, controlChannels) => {
        //si ya está asignado lo quita
        if (selectedModules.includes(id)) {
            setSelectedModules(selectedModules.filter(element => element !== id))

            //Si no está asignado
        } else {
            //compruebo si hay canales disponibles
            if (controlChannels && (!channels[id] || (channels[id]?.canales_validos - channels[id]?.dispositivos_asignados <= 0))) {
                setInfoMessage(t('errors.noChannels'))
                //si hay canales lo añado
            } else {
                setSelectedModules([...selectedModules, id])
            }
        }
    }


    return (
        <FilterSection zIndex={6} setIsOpen={setIsOpen} title={t('crud.addElement', { element: t('terms.device') })} unequalRows rows={filterSectionRows} columns={4} customStyles={{ width: '70dvw', maxWidth: '1050px' }} onChange={setInsertState} state={insertState}>

            {/*Página 1 del formulario*/}

            {/* Categorías */}
            {currentPage === 1 &&
                [
                    <FilterSectionElement key={0} title={t('params.category')} required width={4}>
                        <DragScrollDiv>
                            <div className={styles['category__wrapper']}>
                                {checkArray(categorias) ? (
                                    categorias?.map((categoria, i) => (
                                        <div key={i} onClick={() => handleType(categoria.cod_categoria)} className={`${styles['category__icon']} ${selectedType === categoria.cod_categoria ? styles['category__icon--selected'] : ''}`} tabIndex={-1} onKeyDown={(e) => handleKey(e, () => handleType(categoria.cod_categoria))} >
                                            <AccesibleIcon text={t('codes.deviceCategories.' + categoria.cod_categoria)} src={deviceIcons[categoria.cod_categoria]} alt="Sensor" />
                                        </div>
                                    ))
                                ) : (
                                    <p className={styles['manufacturer--error']}>{t('messages.resultsNone')}</p>
                                )}
                            </div>
                        </DragScrollDiv>
                    </FilterSectionElement>,

                    <FilterSectionElement key={1} title={t('params.brand')} required width={4}>
                        <DragScrollDiv>
                            <div className={styles['category__wrapper']}>
                                {filteredManufacturers ?
                                    (filteredManufacturers.map(item => (
                                        <div key={item?.cod_fabricante} onClick={() => handleManufacturer(item?.cod_fabricante)} className={`${styles['category__icon']} ${styles['category__icon--image']} ${selectedManufacturer === item?.cod_fabricante ? styles['category__icon--selected'] : ''}`} tabIndex={-1} onKeyDown={(e) => handleKey(e, () => handleManufacturer(item?.cod_fabricante))} >
                                            <AccesibleIcon text={item?.nombre_fabricante} src={`${url_origin + url_path}/${item?.logo_fabricante}`} alt={item?.nombre_fabricante} />
                                        </div>
                                    ))
                                    ) : (
                                        <p className={styles['manufacturer--error']}>{t('messages.resultsNone')}</p>
                                    )
                                }
                            </div>
                        </DragScrollDiv>
                    </FilterSectionElement>,

                    <FilterSectionElement key={2} title={t('params.model')} required width={4}>
                        <DragScrollDiv>
                            <div className={styles['category__wrapper']}>
                                {filteredModels ?
                                    (filteredModels.map(item => (
                                        <div key={item?.cod_modelo} onClick={() => setSelectedModel(item?.cod_modelo)} className={`${styles['category__icon']} ${styles['category__icon--big']} ${selectedModel === item?.cod_modelo ? styles['category__icon--selected'] : ''}`} tabIndex={-1} onKeyDown={(e) => handleKey(e, () => setSelectedModel(item?.cod_modelo))} >
                                            <AccesibleIcon text={item?.nombre_modelo} src={`${url_origin + url_path}/${item?.foto_modelo}`} alt={item?.nombre_modelo} />
                                        </div>
                                    ))
                                    ) : (
                                        <p style={{ height: '66px' }} className={styles['manufacturer--error'] + ' ' + styles['category__icon--image']}>{t('messages.resultsNone')}</p>
                                    )
                                }
                            </div>
                        </DragScrollDiv>
                    </FilterSectionElement>,

                    <hr key={100} style={{ gridColumnStart: 'span 4', height: '1px', background: 'var(--color-border)' }} />,

                    <FilterSectionElement key={3} footer>
                        <div className={styles['button__footer']}>
                            <ButtonComponent onClick={onClickInsertNext} text={t('buttons.next')} icon={nextIcon} />
                        </div>
                    </FilterSectionElement>
                ]
            }

            {/* Inputs dispositivos sin stream */}
            {currentPage === 1 && sensorDevices.includes(selectedType) &&
                [
                    <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={insertState?.nom_dispositivo} />,
                    <FilterSectionElement key={1} title="DEV EUI" name="deveui" inputType="text" required initialValue={insertState?.deveui} />,
                    <FilterSectionElement key={2} title={t('params.macAddress')} name="direccion_mac" inputType="text" initialValue={insertState?.direccion_mac} />,
                    <FilterSectionElement key={3} title={(t('params.user'))} name="username" inputType="text" initialValue={insertState?.username} />,

                    <FilterSectionElement key={4} title={t('params.serialNumber')} name="serial_number" inputType="text" required initialValue={insertState?.serial_number} />,
                    <FilterSectionElement key={5} title="APP EUI" name="appeui" inputType="text" initialValue={insertState?.appeui} />,
                    <FilterSectionElement key={6} title={t('params.networkMask')} name="mascara_red" inputType="text" initialValue={insertState?.mascara_red} />,
                    <FilterSectionElement key={7} title={t('params.password')} name="password" inputType="text" initialValue={insertState?.password} />,

                    <FilterSectionElement key={8} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={insertState?.ip_dispositivo} />,
                    <FilterSectionElement key={9} title="JOIN EUI" name="joineui" inputType="text" initialValue={insertState?.joineui} />,
                    <FilterSectionElement key={10} title={t('params.dhcpServer')} name="servidor_dhcp" inputType="text" initialValue={insertState?.servidor_dhcp} />,
                    <span key={11} />,

                    <FilterSectionElement key={12} title={t('params.ipProtocol')} name="protocolo_ip" inputType="text" initialValue={insertState?.protocolo_ip} />,
                    <FilterSectionElement key={13} title="APP KEY" name="appkey" inputType="text" initialValue={insertState?.appkey} />,
                    <FilterSectionElement key={14} title={t('params.gateway')} name="puerta_enlace" inputType="text" initialValue={insertState?.puerta_enlace} />,
                ]
            }

            {/* Inputs dispositivos tipo 2 y 4 */}
            {currentPage === 1 && streamDevices.includes(selectedType) &&
                [
                    <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={insertState?.nom_dispositivo} />,
                    <FilterSectionElement key={1} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={insertState?.ip_dispositivo} />,

                    <FilterSectionElement key={2} title={t('params.deviceId')} name="deviceId" inputType="text" required initialValue={insertState?.deviceId} />,
                    <FilterSectionElement key={3} title={t('params.macAddress')} name="direccion_mac" inputType="text" initialValue={insertState?.direccion_mac} />,

                    <FilterSectionElement key={4} title="Cloud" name="cloud" inputType="ITEMS" items={clouds} itemName='name' strictInput required defaultItem={insertState?.cloud?.cod} />,
                    <span key={5} />,

                    <FilterSectionElement key={6} title={t('params.serialNumber')} name="serial_number" inputType="text" initialValue={insertState?.serial_number} />,
                ]
            }

            {/* Inputs dispositivos tipo Máquina */}
            {currentPage === 1 && engineDevices.includes(selectedType) &&
                [
                    <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={insertState?.nom_dispositivo} />,
                    <FilterSectionElement key={1} title={t('params.deviceId')} name="deviceId" inputType="text" required initialValue={insertState?.deviceId} />,
                    <FilterSectionElement key={2} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={insertState?.ip_dispositivo} />,

                ]
            }


            {/*Página 2 del formulario*/}
            {currentPage === 2 &&
                [
                    <FilterSectionElement key={0} title={t('params.location')} width={4} required>
                        <div className={styles['map__container']}>
                            <MapV4
                                coordinates={coordinates}
                                setCoordinates={setCoordinates}
                                coordinatesIcon={markerIcons[selectedType]}
                            />
                        </div>
                    </FilterSectionElement>,

                    <FilterSectionElement key={2} title={t('params.modules')} width={4}>
                        <div className={styles['category__wrapper']}>
                            {smartcity_modules.filter(elemento => !elemento.disabled && !elemento.noRequiresLicense).map((item) => (
                                <div key={item?.code} onClick={() => handleModule(item?.code, true)} className={`${styles['category__icon']} ${selectedModules?.includes(item?.code) ? styles['category__icon--selected'] : ''}`} tabIndex={-1} onKeyDown={(e) => handleKey(e, () => handleModule(item?.code, true))} >
                                    <AccesibleIcon text={item?.name_simplified} src={modulesIcons[item?.code]} alt={item?.name} />
                                    <p>{(channels[item?.code]?.dispositivos_asignados || 0) + '/' + (channels[item?.code]?.canales_validos || 0)}</p>
                                </div>
                            ))}
                        </div>
                    </FilterSectionElement>,

                    <FilterSectionElement key={3} footer width={4}>
                        <div className={styles['button__footer']}>
                            <ButtonComponent onClick={()=>setCurrentPage(1)} text={t('buttons.back')} icon={prevIcon} />
                            <ButtonComponent onClick={onClickSubmit} text={t('buttons.add')} icon={insertIcon} />
                        </div>
                    </FilterSectionElement>
                ]
            }

        </FilterSection>
    )
}