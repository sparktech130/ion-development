
import { useEffect, useState, useContext } from "react"
import { useTranslation } from "react-i18next"

//Components
import { FilterSection } from "@components/FilterSection/FilterSection"
import { FilterSectionElement } from "@components/FilterSection/FilterSectionElement"
import { Table } from "@components/Table/Table"
import { LocationModal } from "./LocationModal"
import { ModelModal } from "./ModelModal"
import { ModuleModal } from "./ModuleModal"

//Utils
import { checkArray } from "../../../../utils/functions/functions"

//Urls
import { URL_OBTENER_CATEGORIAS, URL_INSERTAR_DISPOSITIVOS_SYNC } from '../../../../api/connections/urls'

//Context
import MainDataContext from "../../../../context/MainDataContext"

//Constants
import { smartcity_modules } from '@constants/common'

//Styles
import tableStyles from '@components/Table/Table.module.css'
import styles from './SyncModal.module.css'

//Icons
import addIcon from '@icons/actions/add.svg?react'



export const SyncModal = ({
    setIsOpen,
    devices, setDevices,
    cloud
}) => {

    //Context
    const { requestAPI, setInfoMessage, setIsLoading, codSector } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Datos
    const [currentData, setCurrentData] = useState(undefined)
    const [categories, setCategories] = useState(undefined)

    //Modals
    const [locationOpen, setLocationOpen] = useState(false)
    const [modelOpen, setModelOpen] = useState(false)
    const [moduleOpen, setModuleOpen] = useState(false)


    //----------------------------API----------------------------------

    //Obtiene las categorías
    const getCategorias = async () => {
        let data = await requestAPI(URL_OBTENER_CATEGORIAS, { cod_sector: codSector })
        setCategories(data)
    }

    //Pide datos al inicio
    useEffect(() => {
        getCategorias()
        //eslint-disable-next-line
    }, [])

    //Inserta dispositivos sync
    const insertDevicesSync = async () => {

        try {
            //Dispositivos seleccionados
            const d = devices?.filter(x => x.checked)

            //Control si no se ha seleccionado ningún dispositivo
            if (!checkArray(d)) {
                setInfoMessage(t('messages.noItemSelected'))
                return

            } else {
                //Control de que estén todos los campos llenos
                let emptyField = false
                d?.forEach(item => {
                    const isValid = item?.name && item?.coordenadas && item?.modelo?.cod_modelo;
                    if (!isValid) {
                        emptyField = true
                        return
                    }
                })
                if (emptyField) {
                    setInfoMessage(t('errors.fillRequiredFields'))
                    return

                    //Todo correcto. Se insertan los dispositivos
                } else {

                    setIsLoading(true)

                    //Params
                    let formatDispositivos = []
                    d.forEach((item) => {
                        formatDispositivos.push({
                            "deviceId": item.deviceId,
                            "nom_dispositivo": item.name,
                            "cod_modelo": item.modelo?.cod_modelo,
                            "coordenadas": item.coordenadas,
                            "modulos": item.modulos
                        })
                    })
                    let params = {
                        "cod_cloud": cloud?.cod_cloud,
                        "dispositivos": formatDispositivos
                    }

                    //Llamada para insertar dispositivos
                    let data = await requestAPI(URL_INSERTAR_DISPOSITIVOS_SYNC, params)

                    //Control de errores
                    if (data.error) {
                        setIsLoading(false)
                        setInfoMessage(data.message || t('errors.request'))
                        return
                    }

                    //Control retorno elementos añadidos/Asignación Módulos
                    let elementosNoAñadidos = []
                    let modulosNoAsignados = []
                    if (checkArray(data)) {
                        data.forEach((item) => {
                            //Compruebo si hay dispositivos que no se han añadido
                            if (!item.insert?.insert && item.deviceId) {
                                elementosNoAñadidos.push(item.deviceId)
                                //Compruebo si hay módulos a los que no se ha añadido
                            } else if (checkArray(item.insert?.modulos?.modulosIncorrectos)) {
                                item.insert?.modulos?.modulosIncorrectos.forEach((modulo) => {
                                    if (!modulosNoAsignados.includes(modulo)) {
                                        modulosNoAsignados.push(modulo)
                                    }
                                })
                            }
                        })
                    }

                    //mensaje
                    if (checkArray(elementosNoAñadidos)) {
                        setInfoMessage(t('errors.noDevicesInserted') + elementosNoAñadidos.join(', '))
                    } else if (checkArray(modulosNoAsignados)) {
                        setInfoMessage(t('errors.noChannelsModules') + modulosNoAsignados.join(', '))
                    } else {
                        setInfoMessage(t('crud.elementAdded'))
                    }

                    setIsLoading(false)
                    setIsOpen(false)

                }
            }
        } catch {
            setIsLoading(false)
            setInfoMessage(t('errors.request'))
        }


    }

    //--------------------------FUNCIONES-------------------------------

    //Actualiza devices cuando se modifica un valor
    const onChangeInput = (device, paramName, value) => {
        if (device?.deviceId && paramName && checkArray(devices)) {

            const updatedDevices = devices?.map(item => {
                if (item?.deviceId === device?.deviceId) {
                    return {
                        ...item,
                        [paramName]: value || ''
                    };
                }
                return item;
            });
            setDevices(updatedDevices);

        }
    }

    //Gestiona abrir modal para modificar un registro (currentData)
    const handleOpenModal = (item, paramName) => {
        setCurrentData(item)
        if (paramName === 'coordenadas') {
            setLocationOpen(true)
        }
        if (paramName === 'modelo') {
            setModelOpen(true)
        }
        if (paramName === 'modulos') {
            setModuleOpen(true)
        }
    }

    //---------------------FORMAT TEXT--------------------------

    //Pone los módulos en formato texto ['00015', '00011'] => 'Traffic, Mobility'
    const formatModulesText = (modules) => {

        //Busca el nombre de cada módulo y lo devuelve en un string
        if (checkArray(modules)) {
            const names = modules
                .map(code => {
                    const match = smartcity_modules.find(mod => mod.code === code);
                    return match?.name_simplified;
                })
                .filter(Boolean);

            return names.join(', ');
        }

        return '';
    }



    return (
        <>

            {/* Modal ubicación */}
            {locationOpen &&
                <LocationModal zIndex={8} setIsOpen={setLocationOpen} handleSubmit={(coords) => onChangeInput(currentData, 'coordenadas', coords)} initialValue={currentData?.coordenadas} />
            }

            {/* Modal modelo */}
            {modelOpen &&
                <ModelModal zIndex={8} setIsOpen={setModelOpen} handleSubmit={(model) => onChangeInput(currentData, 'modelo', model)} categories={categories} />
            }

            {/* Modal módulo */}
            {moduleOpen &&
                <ModuleModal zIndex={8} setIsOpen={setModuleOpen} handleSubmit={(modules) => onChangeInput(currentData, 'modulos', modules)} initialValue={currentData?.modulos} />
            }

            {/* Modal sync dispositivos */}
            <FilterSection zIndex={6} buttonsRight noCloseOnSubmit setIsOpen={setIsOpen} title={t('crud.addElement', { element: t('terms.devices') })} onSubmit={insertDevicesSync} rows={1} columns={1} submitText={t('buttons.add')} submitIcon={addIcon} customStyles={{ width: '60dvw', minWidth: '60dvw', maxWidth: '60dvw' }}>
                <FilterSectionElement>
                    <Table
                        results={devices}
                        setData={setDevices}
                        rows={12}
                        hasCheckbox
                        primary_key='deviceId'
                        getUrlStream={(item) => item?.stream?.mp4_url?.low}
                        headers={[
                            t('params.name'),
                            'ID',
                            t('params.model'),
                            t('params.location'),
                            t('params.module')
                        ]}
                        columnStyles={['element--medium', 'element--long', 'element--short', 'element--medium', 'element--medium']}
                        row_elements={[
                            (item) => <input className={styles['row__input']} defaultValue={item.name} type='text' placeholder={t('messages.unassigned')} onChange={(e) => onChangeInput(item, 'name', e?.target?.value)} />,
                            'deviceId',
                            (item) => <input className={styles['row__input']} onClick={() => handleOpenModal(item, 'modelo')} readOnly type='text' placeholder={t('messages.unassigned')} value={item.modelo?.nombre_modelo} />,
                            (item) => <input className={styles['row__input']} onClick={() => handleOpenModal(item, 'coordenadas')} readOnly type='text' placeholder={t('messages.unassigned')} value={item.coordenadas} />,
                            (item) => <input className={styles['row__input']} onClick={() => handleOpenModal(item, 'modulos')} readOnly type='text' placeholder={t('messages.unassigned')} value={formatModulesText(item.modulos)} />,
                        ]}
                        sortElements={['name', 'deviceId', 'modelo.nombre_modelo', 'coordenadas', 'warehouse.name', 'modulos']}
                        className={tableStyles['table__content--medium']}
                    />
                </FilterSectionElement>
            </FilterSection>
        </>
    )
}