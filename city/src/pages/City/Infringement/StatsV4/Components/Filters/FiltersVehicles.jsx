import { useContext } from 'react'
import { useTranslation } from 'react-i18next';

//Components
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'

//constants
import { direccionCamara, autocompleteColors } from '@constants/common'

//Context
import MainDataContext from '../../../../../../../context/MainDataContext';

//Icons
import filterIcon from '@icons/actions/filter.svg?react'


export const FiltersVehicles = ({
    setFilterOpen, //cerrar filtro
    filterData, //función filtrar datos
    filterState, setFilterState,
}) => {
    
    const {autocompleteCountries} = useContext(MainDataContext)
    const { t } = useTranslation()


    return(
        <FilterSection setIsOpen={setFilterOpen} title={t('buttons.filter')} submitText={t('buttons.filter')} onReset={()=>setFilterState({})} onSubmit={filterData} rows={3} columns={3} customStyles={{ width: '70dvw', maxWidth: '1250px' }} onChange={setFilterState} state={filterState} submitIcon={filterIcon} unequalRows>

            {/* Columna 1 */}
            <FilterSectionElement title={t('params.licensePlate')}  name="licensePlate" inputType="text" />
            <FilterSectionElement title={t('params.brand')}  name="brand" inputType="text" />
            <FilterSectionElement title={t('params.direction')}  name="direction" inputType="ITEMS" items={direccionCamara} itemName='name' strictInput />

            {/* Columna 2 */}
            <FilterSectionElement title={t('params.nationality')}  name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
            <FilterSectionElement title={t('params.model')}  name="model" inputType="text" />
            <FilterSectionElement title={t('params.speed')} name="speed" inputType="text" hint={t('hints.speed')} />

            {/*Columna 3*/}
            <span />
            <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
            <FilterSectionElement title={t('params.confidence')} name="confidence" inputType="text" hint={t('hints.confidence')} />
            
        </FilterSection>
    )
}