import { useState } from "react"
import { useTranslation } from "react-i18next"

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"

//Icons
import vehiclesIcon from '../../../../../../assets/icons/navbar/traffic.svg?react'
import facialIcon from '../../../../../../assets/icons/navbar/facial-recognition.svg?react'


export const RadarModal = ({
    setIsOpen,
    devices
}) => {

    const {t} = useTranslation()

    //inputs
    const [investigation, setInvestigation] = useState(null)
    const [customIcons] = useState([{code: 1, icon: vehiclesIcon, text: t('titles.vehicles')}, {code: 2, icon: facialIcon, text: t('titles.facialRecognition')}])



    return(
        <FilterSection setIsOpen={setIsOpen} title={t('titles.fileShareRequest')} onSubmit={()=>{}} onReset={()=>{}} rows={8} unequalRows columns={4} submitText={t('buttons.accept')} customStyles={{ width: '70dvw', maxWidth: '750px' }}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.user')} width={4} >JohnDoe</FilterSectionElement>
            <FilterSectionElement title={t('params.name')}>John</FilterSectionElement>
            <FilterSectionElement title={t('sections.DISPOSITIVOS')} width={4}>{devices?.length || 0}</FilterSectionElement>
            <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" required /> 
            <FilterSectionElement title={t('params.investigation')} name="investigacion" inputType="ITEMS" width={4} required items={[{cod:1001, name:"Investigación 1"}, {cod:2654, name:"Investigación 2"}]} itemName='name' itemNameInfo='cod' getInputString setInputValueOutside={setInvestigation} hint={t('hints.selectOrCreateInvestigation')} />
            <FilterSectionElement title={t('params.description')} name="descripción" inputType="text" width={4} required disabled={investigation?.cod ? true : false} value={investigation?.cod ? 'placeholder descripción' : undefined} />
            <FilterSectionElement title={t('params.reason')} name="motivo" inputType="text" width={4} required />
            <FilterSectionElement title={t('params.type')} name="type" width={4} inputType="ICONS" customIcons={customIcons} disableSelectAll />

            {/*Columna 2*/}
            <FilterSectionElement title={t('params.lastName')}>Doe</FilterSectionElement>
            <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" required /> 

            {/*Columna 3*/}
            <FilterSectionElement title={t('params.email')} >JohnDoe@gmail.com</FilterSectionElement>
            <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" required />

            {/*Columna 4*/}
            <span />
            <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" required />

        </FilterSection>
    )
}