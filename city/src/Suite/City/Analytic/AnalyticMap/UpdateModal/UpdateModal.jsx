import styles from '../AddModal/AddModal.module.css'
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
import editIcon from '@icons/actions/edit.svg?react'

//API
import { URL_MODIFICAR_INVESTIGACION } from '../../../../../../api/connections/urls'

//Utils
import { stringToCoords, coordsToString } from '../../../../../../components/Maps/MapV4/mapUtils'


export const UpdateModal = ({
    investigation,
    setIsOpen,
    updateData, //pide las investigaciones
}) => {

    //Context
    const { requestAPI, setIsLoading, setInfoMessage }  =useContext(MainDataContext)
    const { t } = useTranslation()

    //inputs
    const [coordinates, setCoordinates] = useState(stringToCoords(investigation?.coordenadas))
    const [coordsAreUpdated, setCoordsAreUpdated] = useState(false)

    //--------------------API-----------------------------------------

    //Modifica investigación
    const updateInvestigation = async (payload) => {

        if(!investigation.cod_investigacion){return}
        let error = true

        try {
            setIsLoading(true)

            let c = coordsToString(coordinates)
            if(c){
                //params
                const params = {
                    cod_investigacion: investigation.cod_investigacion,
                    coordenadas: coordsAreUpdated ? c : undefined,
                    nombre_investigacion: payload?.nombre_investigacion,
                    descripcion: payload?.descripcion
                }

                //pedir datos
                let data = await requestAPI(URL_MODIFICAR_INVESTIGACION, params, 'city')
                if (!data.error && data === true) {
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

    //actualiza coordenadas. Para solo mandarlas a back si han cambiado
    const handleCoordsChange = (item) => {
        setCoordsAreUpdated(true)
        setCoordinates(item)
    }


    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.editElement', {element:t('terms.investigation')})} onSubmit={updateInvestigation} onReset={handleReset} rows={3} unequalRows columns={1} submitText={t('buttons.edit')} noCloseOnSubmit customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={editIcon}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.location')} required customStyles={{ width: '100%' }}  >
                <div className={styles['map__wrapper']}>
                     <MapV4 coordinates={coordinates} setCoordinates={handleCoordsChange} coordinatesIcon={marker} />
                </div>
            </FilterSectionElement>
            <FilterSectionElement initialValue={investigation?.nombre_investigacion} title={t('params.investigation')} name="nombre_investigacion" inputType="text"  required placeholder={t('params.name')} />
            <FilterSectionElement initialValue={investigation?.descripcion} title={t('params.description')} name="descripcion" inputType="text" required />

        </FilterSection>
    )
}