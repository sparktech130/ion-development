import styles from './AddModal.module.css'
import { useState, useContext } from "react"
import { useTranslation } from 'react-i18next'

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from '../../../../../../components/Maps/MapV4/MapV4'

//Context
import MainDataContext from '../../../../../../context/MainDataContext'

//Icons
import marker from '../../../../../../assets/icons/markers/marker-investigation.svg?react'
import addIcon from '@icons/actions/add.svg?react'

//API
import { URL_INSERTAR_INVESTIGACION } from '../../../../../../api/connections/urls';

//Utils
import { coordsToString } from '../../../../../../components/Maps/MapV4/mapUtils'


export const AddModal = ({
    setIsOpen,
    updateData, //pide las investigaciones
}) => {

    //Context
    const { requestAPI, setIsLoading, setInfoMessage } = useContext(MainDataContext)
    const {t} = useTranslation()

    //inputs
    const [coordinates, setCoordinates] = useState(null)

    //--------------------API-----------------------------------------

    //Inserta investigación
    const insertInvestigation = async (payload) => {
        let error = true
        try {
            setIsLoading(true)

            let c = coordsToString(coordinates)
            if(c){
                //params
                const params = {
                    coordenadas: c,
                    nombre_investigacion: payload?.nombre_investigacion,
                    descripcion: payload?.descripcion
                }

                //pedir datos
                let data = await requestAPI(URL_INSERTAR_INVESTIGACION, params, 'city')
                if (!data.error) {
                    updateData()
                    setIsOpen(false)
                    error = false
                }
            }else{
                error=false
                setIsLoading(false)
                setInfoMessage(t('errors.selectLocation'))
            }

        } finally {
            setTimeout(() => {
                setIsLoading(false)
                if(error){
                    setInfoMessage(t('errors.request'))
                }
            }, 300);
        }
    }

    //---------------------FUNCIONES-------------------------------------

    //limpia filtros
    const handleReset = () => {
        setCoordinates(null)
    }


    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.addElement', {element:t('terms.investigation')})} onSubmit={insertInvestigation} onReset={handleReset} rows={3} unequalRows columns={1} submitText={t('buttons.add')} noCloseOnSubmit customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.location')} required customStyles={{ width: '100%' }}  >
                <div className={styles['map__wrapper']}>
                    <MapV4 coordinates={coordinates} setCoordinates={setCoordinates} coordinatesIcon={marker} />
                </div>
            </FilterSectionElement>
            <FilterSectionElement title={t('params.investigation')} name="nombre_investigacion" inputType="text"  required placeholder={t('params.name')} />
            <FilterSectionElement title={t('params.description')} name="descripcion" inputType="text" required />

        </FilterSection>
    )
}