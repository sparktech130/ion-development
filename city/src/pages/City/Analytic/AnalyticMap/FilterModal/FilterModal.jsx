import { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"

//Components
import { FilterSection } from "../../../../../../components/FilterSection/FilterSection"
import { FilterSectionElement } from "../../../../../../components/FilterSection/FilterSectionElement"

//Icons
import vehiclesIcon from '../../../../../../assets/icons/navbar/traffic.svg?react'
import facialIcon from '../../../../../../assets/icons/navbar/facial-recognition.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'

//Autocomplete
import { getAutocompleteUsers } from '../../../../../../api/services/autocomplete';


export const FilterModal = ({
    setIsOpen,
    getData, //pide las investigaciones
    filterState, setFilterState, //estado filtros
    autocompleteUsers, setAutocompleteUsers,
}) => {

    const {t} = useTranslation()

    //opciones input items
    const [estados] = useState([{cod:'En curso', name:t('values.En curso')}, {cod:'Finalizada', name:t('values.Finalizada')}])
    const [customIcons] = useState([{code: 1, icon: vehiclesIcon, text: t('titles.vehicles')}, {code: 2, icon: facialIcon, text: t('titles.facialRecognition')}])


    //----------Autocompletar-------------------------------------------------

    //Obtiene usuarios para autocomplete
    async function getAutocompletes() {
        const users = await getAutocompleteUsers()
        setAutocompleteUsers(users)
    }

    //pide autocompletar si es la primera vez que entras en el modal
    useEffect(() => {
        //si ya los tiene no lo pido
        if(!(Array.isArray(autocompleteUsers) && autocompleteUsers.length>0)){
            getAutocompletes()
        }
    //eslint-disable-next-line
    }, [])

    //---------------------GESTION TIPO---------------------------

    //limpia filtros
    const handleReset = () => {
        setFilterState({})
    }



    return(
        <FilterSection setIsOpen={setIsOpen} title={t('crud.filterElements', {elements:t('terms.investigations')})} onSubmit={getData} onReset={handleReset} rows={3} unequalRows columns={4} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

            {/*Columna 1*/}
            <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" /> 
            <FilterSectionElement title={t('params.code')} name="cod_investigacion" inputType="number" />
            <FilterSectionElement title={t('params.type')}name="type" width={4} inputType="ICONS" customIcons={customIcons} disableSelectAll />

            <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
            <FilterSectionElement title={t('params.investigation')} name="nombre_investigacion" inputType="text" />

            <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time" />
            <FilterSectionElement title={t('params.status')} name="estado" inputType="ITEMS" items={estados} itemName='name' strictInput />

            <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />
            <FilterSectionElement title={t('params.responsible')} name="responsable" inputType="ITEMS" items={autocompleteUsers} itemName='name' strictInput />

        </FilterSection>
    )
}