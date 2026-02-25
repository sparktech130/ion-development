import { useMemo } from 'react'
import { useTranslation } from 'react-i18next';

//Components
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'
import upper_body from '@icons/analysis/upper_body.svg?react'
import lower_body from '@icons/analysis/lower_body.svg?react'

//Constants
import { analysis_icons } from '@constants/icons';
import { autocompleteColors} from '@constants/common'


export const Filters = ({
    setFilterOpen, //cerrar filtro
    filterData, //función filtrar datos
    filterState, setFilterState
}) => {
    
    const { t } = useTranslation()

    //CustomIcons
        //Características de conducta de los peatones
        const pedestrian_keys = useMemo(() => {
            return Object.entries(analysis_icons).map(([key, value]) => (
                { code: key, text: t(`params.${key}`), icon: value }
            ))
            //eslint-disable-next-line
        }, [])
    
        //Colores ropa superior peatones
        const pedestrian_upper_colors = useMemo(() => {
            return autocompleteColors.map((e) => ({ code: e.cod, text: t(e.nameCode), icon: upper_body, customColor: e?.hex }))
            //eslint-disable-next-line
        }, [])
    
        //Colores ropa inferior peatones
        const pedestrian_lower_colors = useMemo(() => {
            return autocompleteColors.map((e) => ({ code: e.cod, text: t(e.nameCode), icon: lower_body, customColor: e?.hex }))
            //eslint-disable-next-line
        }, [])
    


    return(
        <FilterSection title={t('crud.filterElements', { elements: t('terms.recognitions') })} setIsOpen={setFilterOpen} onReset={()=>setFilterState({})} onSubmit={filterData} rows={3} columns={4} onChange={setFilterState} state={filterState} customStyles={{ width: '70dvw', maxWidth: '1250px' }} submitText={t('buttons.filter')} unequalRows submitIcon={filterIcon}>
            <FilterSectionElement title={t('params.upper_clothing')} name="upper_clothing" inputType="ICONS" width={4} customIcons={pedestrian_upper_colors} disableSelectAll />
            <FilterSectionElement title={t('params.lower_clothing')} name="lower_clothing" inputType="ICONS" width={4} customIcons={pedestrian_lower_colors} disableSelectAll />
            <FilterSectionElement title={t('params.pedestrian_keys')} name="keys" inputType="ICONS" width={4} customIcons={pedestrian_keys} disableSelectAll />

        </FilterSection>
    )
}