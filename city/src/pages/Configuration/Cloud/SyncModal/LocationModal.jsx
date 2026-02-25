import { useTranslation } from "react-i18next"
import { useState } from "react"

//Components
import { FilterSection } from "@components/FilterSection/FilterSection"
import { FilterSectionElement } from "@components/FilterSection/FilterSectionElement"
import { MapV4 } from "@components/Maps/MapV4/MapV4"

//Utils
import { coordsToString, stringToCoords } from "@components/Maps/MapV4/mapUtils.js";

//Styles
import styles from './SyncModal.module.css'


export const LocationModal = ({
    setIsOpen,
    handleSubmit,
    initialValue
}) => {

    const {t} = useTranslation()
    const [coordinates, setCoordinates] = useState(stringToCoords(initialValue))

    return(
        <FilterSection buttonsRight setIsOpen={setIsOpen} title={t('crud.selectElement', {element:t('terms.location')})} onSubmit={()=>handleSubmit(coordsToString(coordinates))} rows={1} columns={1} submitText={t('buttons.accept')} customStyles={{ width: '60dvw'}}>
            <FilterSectionElement title={t('params.location')} required>
                <div className={styles['map__wrapper']}>
                    <MapV4 coordinates={coordinates} setCoordinates={setCoordinates} />
                </div>
            </FilterSectionElement>
        </FilterSection>
    )
}