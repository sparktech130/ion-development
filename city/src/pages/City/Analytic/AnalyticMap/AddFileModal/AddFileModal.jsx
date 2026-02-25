import styles from './AddFileModal.module.css'
import { useState } from "react"
import { useTranslation } from 'react-i18next'

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"
import { MapV4 } from '../../../../../../components/Maps/MapV4/MapV4';

//Icons
import vehiclesIcon from '../../../../../../assets/icons/navbar/traffic.svg?react'
import facialIcon from '../../../../../../assets/icons/navbar/facial-recognition.svg?react'
import marker from '../../../../../../assets/icons/markers/marker-file.svg?react'
import addIcon from '@icons/actions/add.svg?react'


export const AddFileModal = ({
    setIsOpen,
}) => {

    const {t} = useTranslation()

    //inputs
    const [coordinates, setCoordinates] = useState(null)
    const [customIcons] = useState([{code: 1, icon: vehiclesIcon, text: t('titles.vehicles')}, {code: 2, icon: facialIcon, text: t('titles.facialRecognition')}])


    //---------------------GESTION TIPO---------------------------

    //limpia filtros
    const handleReset = () => {
        setCoordinates(null)
    }


    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.addElement', {element:t('terms.file')})} onSubmit={(e)=>{}} onReset={handleReset} rows={4} unequalRows columns={4} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.location')} required width={4} >
                <div className={styles['map__wrapper']}>
                    <MapV4 coordinates={coordinates} setCoordinates={setCoordinates} coordinatesIcon={marker} />
                </div>
            </FilterSectionElement>
            <FilterSectionElement title={t('params.date')}name="fecha" inputType="DATE" required /> 
            <FilterSectionElement title={t('params.file')} name="archivo" inputType="FILE" width={4} multiple required hideList showFileInput acceptImage acceptVideo />
            <FilterSectionElement title={t('params.type')} name="type" width={4} inputType="ICONS" customIcons={customIcons} disableSelectAll />

            {/*Columna 2*/}
            <FilterSectionElement title={t('params.time')} name="hora" inputType="time" required />

            {/*Columna 3*/}
            <FilterSectionElement title="" name="test" inputType="text" className={{display:'none'}} disabled />


        </FilterSection>
    )
}