import styles from './UpdateModal.module.css'
import { useState, useContext } from "react"
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from '../../../../../../components/Maps/MapV4/MapV4'

//API
import { URL_MODIFICAR_CAMPAIGN } from '../../../../../../api/connections/urls';

//Const
import { zoneColors } from '../../../../../../constants/common'

//Icons
import editIcon from '@icons/actions/edit.svg?react'


export const UpdateModal = ({
    campaign,
    setIsOpen,
    devices,
    updateData = ()=>{}
}) => {

    //Context
    const {requestAPI, setInfoMessage, setIsLoading} = useContext(MainDataContext)
    const{t} = useTranslation()

    //inputs
    const [newZone, setNewZone] = useState(null)
    const [drawing, setDrawing] = useState(true)

    const [zoneCleaned, setZoneCleaned] = useState(false)


    //---------------------API--------------------------------

    //Update campaña
    const guardarZona = async (payload) => {

        if(!campaign?.cod_campaign){ return }
        
        if (newZone && payload) {
            setIsLoading(true)
            try{
                let data;
                let params = {
                    cod_campaign: campaign?.cod_campaign,
                    nombre_campaign: payload.nombre_campaign,
                    fecha_fin: payload.final_date,
                    coordenadas: newZone
                }

                data = await requestAPI(URL_MODIFICAR_CAMPAIGN, params, 'city')

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


    //limpia filtros
    const handleReset = () => {
        //Quito y pongo el componente de dibujo para que se resetee
        setDrawing(false)
        setTimeout(() => {
                setDrawing(true)
                setNewZone(null)
                setZoneCleaned(true)
        }, 100);
    }


    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.editElement', {element:t('terms.campaign')})} onSubmit={guardarZona} onReset={handleReset} rows={3} unequalRows columns={1} submitText={t('buttons.edit')} noCloseOnSubmit customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon}>
            
            <FilterSectionElement title={t('params.name')} name="nombre_campaign" inputType="text" width={1} required initialValue={campaign?.nombre_campaign} />
            <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" required initialValue={campaign?.fecha_fin} width={1} /> 
            <FilterSectionElement title={t('params.location')} required width={1} >
                <div className={styles['map__wrapper']}>
                    <MapV4
                        markersArray={[{
                            markers: devices,
                        }]} 
                        setZoneCoords={drawing ? setNewZone : null}
                        zoneColor={zoneColors[campaign?.nombre_alerta]}
                        initialZoneCoords={!zoneCleaned ? campaign?.coordenadas : null}
                    />
                </div>
            </FilterSectionElement>

        </FilterSection>
    )
}