import { useState, useMemo, useEffect } from "react"
import { useTranslation } from "react-i18next"

//Components
import { FilterSection } from "@components/FilterSection/FilterSection"
import { FilterSectionElement } from "@components/FilterSection/FilterSectionElement"

//Constants
import { smartcity_modules } from "../../../../constants/common"
import { modulesIcons } from "../../../../constants/icons"


export const ModuleModal = ({
    setIsOpen,
    handleSubmit,
    initialValue
}) => {

    //Context
    const {t} = useTranslation()

    //State
    const [filterState, setFilterState] = useState({})

    //----------------------------CUSTOM ICONS------------------------------------------
    
    //Módulos
    const customIconsModules = useMemo(()=>{
        return smartcity_modules.filter(elemento => !elemento.disabled && !elemento.noRequiresLicense).map((item) => ({code:item.code, text:item.name_simplified, icon:modulesIcons[item?.code]}))
    },[])


    //-----------------------------USE EFFECT--------------------------------

    //Pone el valor inicial en el state
    useEffect(()=>{
        setFilterState({modules: initialValue})
    },[initialValue])


    return(
        <FilterSection buttonsRight setIsOpen={setIsOpen} title={t('crud.selectElement', {element:t('terms.modules')})} onSubmit={(e)=>handleSubmit(e?.modules)} rows={3} columns={4} submitText={t('buttons.accept')} customStyles={{ width: '60dvw'}} state={filterState} onChange={setFilterState} >
            <FilterSectionElement title={t('params.modules')} name="modules" width={4} inputType="ICONS" customIcons={customIconsModules} disableSelectAll initialValue={initialValue} />
        </FilterSection>
    )
}