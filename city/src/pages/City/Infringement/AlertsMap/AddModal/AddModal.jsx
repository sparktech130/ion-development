import styles from './AddModal.module.css'
import { useState, useContext } from "react"
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from '../../../../../../components/Maps/MapV4/MapV4'
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent'

//Icons
import iconItv from '../../../../../../assets/icons/alerts/itv2.svg?react'
import iconInsurance from '../../../../../../assets/icons/alerts/insurance.svg?react'

//API
import { URL_INSERTAR_CAMPAIGN } from '../../../../../../api/connections/urls';

//Const
import { zoneColors } from '../../../../../../constants/common'

//Icons
import addIcon from '@icons/actions/add.svg?react'



export const AddModal = ({
    setIsOpen,
    devices,
    updateData = ()=>{}
}) => {

    //Context
    const {requestAPI, setInfoMessage, setIsLoading} = useContext(MainDataContext)
    const {t} = useTranslation()

    //inputs
    const [newZone, setNewZone] = useState(null)
    const [zoneType, setZoneType] = useState(null)


    //---------------------API--------------------------------

    //insert/update campaña
    const guardarZona = async (payload) => {
        if (newZone && payload) {
            setIsLoading(true)
            try{
                let data;
                let params = {
                    nombre_campaign: payload.nombre_campaign,
                    fecha_ini: payload.initial_date,
                    fecha_fin: payload.final_date,
                    cod_tipo_camp: zoneType==="Vehículo sin seguro" ? 2 : 1,
                    coordenadas: newZone
                }

                data = await requestAPI(URL_INSERTAR_CAMPAIGN, params, 'city')

                if(!data.error){
                    updateData()
                    setIsOpen(false)
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


    //---------------------FUNCIONES---------------------------

    //gestionar click en tipo de investigación
    const handleType = (opcion) => {
        cleanzone()
        setTimeout(() => {
            setZoneType(opcion) 
        }, 100); 
    }

    //limpia filtros
    const handleReset = () => {
        cleanzone()
    }

    //CleanZone
    const cleanzone = () => {
        setZoneType(null)
        setNewZone(null)
    }



    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.addElement', {element:t('terms.campaign')})} onSubmit={guardarZona} onReset={handleReset} rows={4} unequalRows columns={2} submitText={t('buttons.add')} noCloseOnSubmit customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.name')} name="nombre_campaign" inputType="text" width={2} required />
            <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" required /> 
            
            <FilterSectionElement title={t('params.type')} width={2} required>
                <div className={styles['alerts__wrapper']}>
                    <ButtonComponent big icon={iconItv} accesibleText={'ITV'} onClick={()=>handleType('Vehículo sin ITV')} selected={zoneType === 'Vehículo sin ITV'} />
                    <ButtonComponent big icon={iconInsurance} accesibleText={t('terms.insurance')} onClick={()=>handleType('Vehículo sin seguro')} selected={zoneType === 'Vehículo sin seguro'} />
                </div>
            </FilterSectionElement>
            <FilterSectionElement title={t('params.location')} required width={2} >
                <div className={styles['map__wrapper']}>
                    <MapV4
                        centerItems={devices}
                        markersArray={[{
                            markers: devices,
                        }]} 
                        setZoneCoords={zoneType ? setNewZone : null}
                        zoneColor={zoneColors[zoneType]}
                    />
                </div>
            </FilterSectionElement>

            {/*Columna 2*/}
            <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" required /> 
            

        </FilterSection>
    )
}