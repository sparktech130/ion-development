import { useTranslation } from 'react-i18next';

//Components
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'



export const Filters = ({
    setFilterOpen, //cerrar filtro
    filterData, //función filtrar datos
    filterState, setFilterState,
}) => {
    
    const { t } = useTranslation()


    return(
        <FilterSection setIsOpen={setFilterOpen} title={t('buttons.filter')} submitText={t('buttons.filter')} onReset={()=>setFilterState({})} onSubmit={filterData} rows={1} columns={1} customStyles={{ width: '70dvw', maxWidth: '1250px' }} onChange={setFilterState} state={filterState} submitIcon={filterIcon} unequalRows>

            <FilterSectionElement title={'Test'}  name="test" inputType="text" />

        </FilterSection>
    )
}