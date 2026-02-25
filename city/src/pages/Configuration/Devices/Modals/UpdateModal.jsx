import { useEffect, useState, useMemo, useContext } from "react"
import { useTranslation } from "react-i18next"

//Components
import { AccesibleIcon } from "../../../../components/AccesibleIcon/AccesibleIcon"
import { FilterSection } from "../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from "../../../../components/Maps/MapV4/MapV4"
import { TextModal } from "../../../../components/TextModal/TextModal"

//Constants
import { smartcity_modules, streamDevices, sensorDevices, engineDevices } from "../../../../constants/common"

//Utils
import { handleKey } from "../../../../utils/functions/accessibility"
import { coordsToString, stringToCoords } from "../../../../components/Maps/MapV4/mapUtils"

//API
import { URL_OBTENER_CANALES, URL_MODIFICAR_DISPOSITIVOS, URL_ELIMINAR_DISPOSITIVOS } from "../../../../api/connections/urls"

//Context
import MainDataContext from "../../../../context/MainDataContext"

//Assets
import { markerIcons, modulesIcons } from "../../../../constants/icons"

//Styles
import styles from '../Devices.module.css'

//Icons
import nextIcon from '@icons/actions/next.svg?react'
import prevIcon from '@icons/actions/prev.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'
import updateIcon from '@icons/actions/edit.svg?react'
import { ButtonComponent } from "../../../../components/ButtonComponent/ButtonComponent"


//Modal insertar dispositivo
export const UpdateModal = ({

    setIsOpen, //cerrar modal
    device, setDevice, //Dispositivo a modificar
    getDevices, //Actualizar datos

    //Datos
    clouds,
}) => {

    //----------------------------VARIABLES------------------------------------------

    //Context
    const { requestAPI, setInfoMessage, setIsLoading } = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //Page
    const [currentPage, setCurrentPage] = useState(1)

    //Datos
    const [channels, setChannels] = useState([])

    //Inputs
    const [updateState, setUpdateState] = useState(undefined) //undefined para que no ponga el FilterSection hasta que tenga los valores
    const [coordinates, setCoordinates] = useState('')
    const [selectedModules, setSelectedModules] = useState([])

    //Modales
    const [deleteOpen, setDeleteOpen] = useState(false)

    //Rows FilterSection variable
    const filterSectionRows = useMemo(() => {
        if (currentPage === 1) {
            let tipo = device?.cod_categoria

            if (streamDevices.includes(tipo)) {
                return 3
            }
            if (sensorDevices.includes(tipo)) {
                return 5
            }
            if (engineDevices.includes(tipo)) {
                return 2
            }
        } else {
            return 4
        }
    }, [currentPage, device])


    //---------------------------USE EFFECT----------------------------

    //Pone valores iniciales
    useEffect(() => {

        let state = {}

        //Parámetros generales
        if (device?.nom_dispositivo) state.nom_dispositivo = device?.nom_dispositivo
        if (device?.serial_number) state.serial_number = device?.serial_number
        if (device?.ip_dispositivo) state.ip_dispositivo = device?.ip_dispositivo
        if (device?.direccion_mac) state.direccion_mac = device?.direccion_mac

        //Parámetros dispositivos sin grabación (sensores, etc)
        if (sensorDevices.includes(device?.cod_categoria)) {
            if (device?.deveui) state.deveui = device?.deveui
            if (device?.appeui) state.appeui = device?.appeui
            if (device?.joineui) state.joineui = device?.joineui
            if (device?.appkey) state.appkey = device?.appkey
            if (device?.username) state.username = device?.username
            if (device?.password) state.password = device?.password
            if (device?.mascara_red) state.mascara_red = device?.mascara_red
            if (device?.servidor_dhcp) state.servidor_dhcp = device?.servidor_dhcp
            if (device?.protocolo_ip) state.protocolo_ip = device?.protocolo_ip
            if (device?.puerta_enlace) state.puerta_enlace = device?.puerta_enlace
        }

        if (streamDevices.includes(device?.cod_categoria)) {
            if (device?.cod_cloud) state.cloud = { cod: device?.cod_cloud }
            if (device?.deviceId) state.deviceId = device?.deviceId
        }

        if (engineDevices.includes(device?.cod_categoria)) {
            if (device?.deviceId) state.deviceId = device?.deviceId
        }

        //Valor states
        setUpdateState(state)
        setCoordinates(stringToCoords(device?.coordenadas))
        setSelectedModules(device?.modulos?.map(item => item?.cod_modulo))

        //eslint-disable-next-line
    }, [])


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

    //Edita el dispositivo
    const editDevices = async () => {

        //Iniciamos pantalla de carga
        setIsLoading(true)

        const modulesArray = smartcity_modules.map(element => ({
            cod_modulo: element.code,
            eliminar: selectedModules.includes(element?.code) ? false : true
        }));

        //Parametros que pasaremos a la función.
        const params = {
            cod_dispositivo: device?.cod_dispositivo,
            nom_dispositivo: updateState?.nom_dispositivo,
            serial_number: updateState?.serial_number,
            ip_dispositivo: updateState?.ip_dispositivo,
            direccion_mac: updateState?.direccion_mac,
            coordenadas: coordsToString(coordinates),
            modulos: modulesArray,

            puerta_enlace: updateState?.puerta_enlace,
            servidor_dhcp: updateState?.servidor_dhcp,
            mascara_red: updateState?.mascara_red,
            protocolo_ip: updateState?.protocolo_ip,
            deveui: updateState?.deveui,
            appeui: updateState?.appeui,
            appkey: updateState?.appkey,
            joineui: updateState?.joineui,
            username: updateState?.username,
            password: updateState?.password !== '*****' ? updateState?.password : undefined,
            cod_cloud: updateState?.cloud?.cod,

            deviceIdUpdate: updateState?.deviceId,

            maquinaId: updateState?.engineId
        }

        //Llamada para modificar dispositivo
        let call = await requestAPI(URL_MODIFICAR_DISPOSITIVOS, params)

        //Control de errores
        if (call.Update === false) {
            setIsLoading(false)
            setInfoMessage(t('errors.request'))
            return
        }

        //Ocultamos modal de edición
        setIsOpen(false)

        getDevices(true)
        //se avisa si no se ha podido asignar a módulos (aunque es muy improbable ya que si no hay canales no hago la llamada)
        let infoText = ''
        if (call?.modulos?.modulosIncorrectos && Array.isArray(call?.modulos?.modulosIncorrectos) && call?.modulos?.modulosIncorrectos.length > 0) {
            infoText = '. '+t('errors.noChannelsModules') + call?.modulos?.modulosIncorrectos.join(', ')
        }
        setInfoMessage(t('crud.elementEdited') + infoText)
    }

    //Inserta el dispositivo
    const deleteDevices = async () => {

        //Ocultamos modal de edición
        setDeleteOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_dispositivo: device?.cod_dispositivo
        }

        //Llamada para insertar dispositivo
        let data = await requestAPI(URL_ELIMINAR_DISPOSITIVOS, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Cerramos modal editar
        setIsOpen(false)

        //Actualizamos datos
        getDevices(true)
        setInfoMessage(t('crud.elementDeleted'))
        setDevice(undefined)
    }


    //-------------------------ONCLICK--------------------------------

    //click next insert modal
    const onClickInsertNext = () => {
        //Control campos obligatorios
        let error = true
        let tipo = device?.cod_categoria

        // Dispositivos de tipo sensor
        if (sensorDevices.includes(tipo)) {
            if (updateState?.nom_dispositivo && updateState?.serial_number && updateState?.deveui) {
                error = false
            }
        }

        // Dispositivos de tipo stream
        if (streamDevices.includes(tipo)) {
            if (updateState?.nom_dispositivo && updateState?.cloud?.cod && updateState?.deviceId) {
                error = false
            }
        }

        // Dispositivos de tipo máquina
        if (engineDevices.includes(tipo)) {
            if (updateState?.nom_dispositivo && updateState?.deviceId) {
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
        
        //Comprobación para finalizar modificación del dispositivo
        coordinates ? editDevices() : setInfoMessage(t('errors.fillRequiredFields'))
    }

    //Seleccionar módulos de los distintos mercados verticales comprobando si hay canales disponibles
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
        <>
            {/*Modal eliminar dispositivo*/}
            {deleteOpen &&
                <TextModal zIndex={8} setIsOpen={setDeleteOpen} title={t('crud.deleteElement', { element: t('terms.device') })} aceptar={deleteDevices} cancelar={() => setDeleteOpen(false)}>{t('crud.deleteConfirmation', { element: t('terms.device') })}</TextModal>
            }

            {/* Modal editar dispositivo */}
            {updateState &&
                <FilterSection zIndex={6} setIsOpen={setIsOpen} title={t('crud.editElement', { element: t('terms.device') })} unequalRows rows={filterSectionRows} columns={4} customStyles={{ width: '70dvw', maxWidth: '1050px' }} onChange={setUpdateState} state={updateState}>

                    {/*Página 1 del formulario*/}

                    {/* Inputs dispositivos sin stream */}
                    {currentPage === 1 && sensorDevices.includes(device?.cod_categoria) &&
                        [
                            <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={updateState?.nom_dispositivo} />,
                            <FilterSectionElement key={1} title="DEV EUI" name="deveui" inputType="text" required initialValue={updateState?.deveui} />,
                            <FilterSectionElement key={2} title={t('params.macAddress')} name="direccion_mac" inputType="text" initialValue={updateState?.direccion_mac} />,
                            <FilterSectionElement key={3} title={t('params.user')} name="username" inputType="text" initialValue={updateState?.username} />,

                            <FilterSectionElement key={4} title={t('params.serialNumber')} name="serial_number" inputType="text" required initialValue={updateState?.serial_number} />,
                            <FilterSectionElement key={5} title="APP EUI" name="appeui" inputType="text" initialValue={updateState?.appeui} />,
                            <FilterSectionElement key={6} title={t('params.macAddress')} name="mascara_red" inputType="text" initialValue={updateState?.mascara_red} />,
                            <FilterSectionElement key={7} title={t('params.password')} name="password" inputType="text" initialValue={updateState?.password} />,

                            <FilterSectionElement key={8} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={updateState?.ip_dispositivo} />,
                            <FilterSectionElement key={9} title="JOIN EUI" name="joineui" inputType="text" initialValue={updateState?.joineui} />,
                            <FilterSectionElement key={10} title={t('params.dhcpServer')} name="servidor_dhcp" inputType="text" initialValue={updateState?.servidor_dhcp} />,
                            <span key={11} />,

                            <FilterSectionElement key={12} title={t('params.ipProtocol')} name="protocolo_ip" inputType="text" initialValue={updateState?.protocolo_ip} />,
                            <FilterSectionElement key={13} title="APP KEY" name="appkey" inputType="text" initialValue={updateState?.appkey} />,
                            <FilterSectionElement key={14} title={t('params.gateway')} name="puerta_enlace" inputType="text" initialValue={updateState?.puerta_enlace} />,
                        ]
                    }

                    {/* Inputs dispositivos con stream */}
                    {currentPage === 1 && streamDevices.includes(device?.cod_categoria) &&
                        [
                            <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={updateState?.nom_dispositivo} />,
                            <FilterSectionElement key={1} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={updateState?.ip_dispositivo} />,

                            <FilterSectionElement key={2} title={t('params.deviceId')} name="deviceId" inputType="text" required initialValue={updateState?.deviceId} />,
                            <FilterSectionElement key={3} title={t('params.macAddress')} name="direccion_mac" inputType="text" initialValue={updateState?.direccion_mac} />,

                            <FilterSectionElement key={4} title="Cloud" name="cloud" inputType="ITEMS" items={clouds} itemName='name' strictInput required defaultItem={updateState?.cloud?.cod} />,
                            <span key={5} />,

                            <FilterSectionElement key={6} title={t('params.serialNumber')} name="serial_number" inputType="text" initialValue={updateState?.serial_number} />,

                        ]
                    }

                    {/* Inputs dispositivos tipo Máquina */}
                    {currentPage === 1 && engineDevices.includes(device?.cod_categoria) &&
                        [
                            <FilterSectionElement key={0} title={t('params.name')} name="nom_dispositivo" inputType="text" required initialValue={updateState?.nom_dispositivo} />,
                            <FilterSectionElement key={1} title={t('params.deviceId')} name="deviceId" inputType="text" required initialValue={updateState?.deviceId} />,
                            <FilterSectionElement key={2} title={t('params.ipAddress')} name="ip_dispositivo" inputType="text" initialValue={updateState?.ip_dispositivo} />,

                        ]
                    }

                    {/* Botónes */}
                    {currentPage === 1 &&
                        [
                            <FilterSectionElement key={0} footer>
                                <div className={styles['button__footer']}>
                                    <ButtonComponent isRed onClick={() => setDeleteOpen(true)} text={t('crud.deleteElement', { element: t('terms.device') })} icon={deleteIcon} />
                                    <ButtonComponent right onClick={onClickInsertNext} text={t('buttons.next')} icon={nextIcon} />
                                </div>
                            </FilterSectionElement>
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
                                        coordinatesIcon={markerIcons[device?.cod_categoria]}
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
                                    <ButtonComponent onClick={onClickSubmit} text={t('buttons.edit')} icon={updateIcon} />
                                </div>
                            </FilterSectionElement>
                        ]
                    }

                </FilterSection>
            }

        </>

    )
}