import styles from './NewZoneModal.module.css'
import { useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next';

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"
import { TextModal } from '../../../../../../components/TextModal/TextModal'
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent';
import { MapV4 } from '../../../../../../components/Maps/MapV4/MapV4'

//Icons
import { cityAlertsIcons } from "../../../../../../constants/icons"
import { useState } from 'react'
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'

//Api
import { URL_OBTENER_DISPOSITIVOS, URL_INSERTAR_ZONA, URL_MODIFICAR_ZONAS, URL_ELIMINAR_ZONAS, URL_OBTENER_INFRACCIONES_GESTION } from '../../../../../../api/connections/urls'

//Constants
import { zoneColors } from '../../../../../../constants/common'

//Utils
import { checkArray } from '../../../../../../utils/functions/functions';


//Modal para crear/editar zonas
export const NewZoneModal = ({

    setIsOpen,
    updateData,

    //Infracciones
    infractions, setInfractions,

    //Si es para editar zona
    currentData, //Objeto zona

    //Opcionales
    setImportExcelOpen, //si se quiere abrir modal importar vehículos al finalizar

}) => {

    //Context
    const {setIsLoading, setInfoMessage, requestAPI} = useContext(MainDataContext)
    const {t} = useTranslation()

    //datos
    const [devices, setDevices] = useState(null)

    //Parámetros
    const [name, setName] = useState('')
    const [zoneType, setZoneType] = useState(null)
    const [newZone, setNewZone] = useState(null) //string coordenadas
    const [zoneCleaned, setZoneCleaned] = useState(false)

    //modales
    const [deleteOpen, setDeleteOpen] = useState(false)

    //Botones para filterSection
    const buttons = [{   
            text:t('crud.deleteElement', {element:t('terms.zone')}), 
            red:true, 
            loading:false, 
            onClick: () => {setDeleteOpen(true)},
            icon: deleteIcon
    }]

    //--------USEEFFECTS------------------------

    //pido datos iniciales y si estamos editando doy valores iniciales a los inputs
    useEffect(()=>{
        getDevices()
        if(currentData){
            setName(currentData.nombre_area)
            setZoneType(currentData.tipo_area)
        }
    //eslint-disable-next-line
    },[])


    //------------INPUTS------------------------

    //click tipo zona
    const onClickZoneType = (codTipo) =>{
        //quitar y poner el componente de dibujo, No he implementado aún el cambio de color etc
        cleanzone()
        setTimeout(() => {
            setZoneType(codTipo) 
        }, 100); 
    }

    //reset inputs
    const resetFilter = () => {
        setName('')
        cleanzone()
    }

    //CleanZone
    const cleanzone = () => {
        setZoneType(null)
        setNewZone(null)
        setZoneCleaned(true)
    }

    //-----------API----------------------------

    //obtiene dispositivos
    const getDevices = async () =>{
        try{
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS, {modulos:[11]})
            if(!data.error){
                setDevices(data)
            }else{
                setDevices([])
            }
        }catch{
            setDevices([])
        }
    }

    //insert/update zona
    const guardarZona = async (payload) => {
        if (newZone && name && zoneType) {
            setIsLoading(true)
            try{
                let data;
                let params = {
                    nombre_area: name,
                    tipo_area: zoneType,
                    coordenadas: newZone,
                    cod_infraccion: payload?.infraction?.cod
                }
                //update
                if(currentData){ 
                    params.cod_area = currentData?.cod_area
                    data = await requestAPI(URL_MODIFICAR_ZONAS, params, 'city')
                //insert
                }else{
                    data = await requestAPI(URL_INSERTAR_ZONA, params, 'city')
                }
                if(!data.error){
                    setIsOpen(false) 
                    await updateData()
                    if(setImportExcelOpen){ setImportExcelOpen(true) }
                    setIsLoading(false)  
                }else{
                    setIsLoading(false)
                    setInfoMessage(data.message || t('errors.request'))
                }   
            }catch{
                setIsLoading(false)
                setInfoMessage(t('errors.request'))
            }
        }else{
            setInfoMessage(t('errors.fillRequiredFields'))
        }
    };

    //Elimina las lista
    const deleteZones = async () => {
        if(currentData?.cod_area){
            setIsLoading(true)
            setDeleteOpen(false)
            const params = {
                cod_area: currentData?.cod_area,
            }
            //Delete
            let data =  await requestAPI(URL_ELIMINAR_ZONAS, params, 'city')
            //Error
            if(data.message){
                setIsLoading(false)
                setInfoMessage(data.message)
                return
            }
            await updateData(true)
            setIsLoading(false)
            setIsOpen(false)
        }
    }

    //Obtiene las infracciones
    const getInfractions = async () => {

        //Llamada para obtener los resultados
        const data = await requestAPI(URL_OBTENER_INFRACCIONES_GESTION, { cod_modulo: '0011' }, 'city')

        const renamedDataArray = data.map(obj => {
            return {
                cod: obj.cod_infraccion,  // Rename cod_infraccion to cod
                desc_infraccion: obj.desc_infraccion,
                importe_infraccion: obj.importe_infraccion,
                importe_reducido: obj.importe_reducido,
                puntos: obj.puntos,
                cod_modulo: obj.cod_modulo
            }
        })
        setInfractions(renamedDataArray)

    }

    //Pide infracciones si no las tiene
    useEffect(()=>{
        if(!checkArray(infractions)){
            getInfractions()
        }
    //eslint-disable-next-line
    },[])


    return(
        <>
            {/*Eliminar zona*/}
            {deleteOpen &&
                <TextModal zIndex={10} title={t('crud.deleteElement', {element:t('terms.zone')})} aceptar={deleteZones} cancelarRed cancelar={()=>{setDeleteOpen(false)}}>{t('crud.deleteConfirmation', {element:t('terms.zone')})}</TextModal>
            }

            {/* Crear/Editar zona */}
            <FilterSection zIndex={8} noCloseOnSubmit setIsOpen={setIsOpen} title={currentData ? t('crud.editElement', {element: t('terms.zone')}) : t('crud.addElement', {element: t('terms.zone')})} onSubmit={guardarZona} onReset={resetFilter} rows={4} columns={1} unequalRows unequalColumns submitText={currentData ? t('buttons.edit') : t('buttons.add')} buttons={currentData ? buttons : []} submitIcon={currentData ? editIcon : addIcon}>
                <FilterSectionElement required title={t('params.name')}>
                    <input className='input' type="text" placeholder={t('params.name')} value={name} onChange={e=>setName(e.target.value)} />
                </FilterSectionElement>
                <FilterSectionElement title={t('params.infraction')} name="infraction" inputType="ITEMS" items={infractions || []} itemName='cod' description='desc_infraccion' defaultItem={currentData?.cod_infraccion} />
                <FilterSectionElement title={t('params.zoneType')} required>
                    <div className={styles['types__wrapper']}>
                        <ButtonComponent big icon={cityAlertsIcons['0100']} accesibleText={t('codes.cityAlerts.0100')} onClick={()=>{onClickZoneType('ZAR')}} selected={zoneType==='ZAR'} />
                        <ButtonComponent big icon={cityAlertsIcons['0101']} accesibleText={t('codes.cityAlerts.0101')} onClick={()=>{onClickZoneType('ZBE')}} selected={zoneType==='ZBE'} />
                        <ButtonComponent big icon={cityAlertsIcons['0102']} accesibleText={t('codes.cityAlerts.0102')} onClick={()=>{onClickZoneType('DUM')}} selected={zoneType==='DUM'} />
                        {false && <ButtonComponent big icon={cityAlertsIcons['0103']} accesibleText={t('values.Nieve')} onClick={()=>{onClickZoneType('NIE')}} selected={zoneType==='NIE'} />}
                    </div>
                </FilterSectionElement>
                <FilterSectionElement title={t('params.location')} required>
                    <div className={styles['map__wrapper']}>
                        <MapV4
                            markersArray={[{
                                markers: devices,
                            }]}
                            setZoneCoords={zoneType ? setNewZone : null}
                            zoneColor={zoneColors[zoneType]}
                            initialZoneCoords={!zoneCleaned ? currentData?.coordenadas : null}
                        />
                    </div>
                </FilterSectionElement>
            </FilterSection>
        </>
    )
}