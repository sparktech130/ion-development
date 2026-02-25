import { useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next';

//Components
import { FilterSection } from '@components/FilterSection/FilterSection'
import { FilterSectionElement } from '@components/FilterSection/FilterSectionElement'

//autocomplete
import { getAutocompleteDevices, getAutocompleteListas } from '@api/services/autocomplete';

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
    autocompletes
}) => {
    
    const {autocompleteCountries} = useContext(MainDataContext)
    const {autocompleteLists, setAutocompleteLists,autocompleteDevices, setAutocompleteDevices} = autocompletes
    const { t } = useTranslation()

    //*---------------------------------OBTENER AUTOCOMPLETE DE API--------------------------------------*//

    //Autocompletar
    async function getAutocompletes(){
        if(autocompleteLists?.length===0){
            const lists = await getAutocompleteListas()
            setAutocompleteLists(lists)
        }
        if(autocompleteDevices?.length===0){
            const devices = await getAutocompleteDevices({modulos: ['0015']})
            setAutocompleteDevices(devices)
        }
    }

    //Llamada inicial para obtener los autocompletar
    useEffect(() => {
        getAutocompletes()
        //eslint-disable-next-line
    }, [])


    return(
        <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', {elements:t('terms.recognitions')})} submitText={t('buttons.filter')} onReset={()=>setFilterState({})} onSubmit={filterData} rows={4} columns={4} customStyles={{ width: '70dvw', maxWidth: '1250px' }} onChange={setFilterState} state={filterState} submitIcon={filterIcon} unequalRows>

            {/* Columna 1 */}
            <FilterSectionElement title={t('params.licensePlate')}  name="licensePlate" inputType="text" />
            <FilterSectionElement title={t('params.brand')}  name="brand" inputType="text" />
            <FilterSectionElement title={t('params.list')} name="list" inputType="ITEMS" items={autocompleteLists} itemName='name' strictInput />
            <FilterSectionElement title={t('sections.ALERTAS')}  name="alerts" inputType="ICONS" width={4} traffic />

            {/* Columna 2 */}
            <FilterSectionElement title={t('params.nationality')}  name="nacionality" inputType="ITEMS" items={autocompleteCountries} itemName='name' width={1} strictInput />
            <FilterSectionElement title={t('params.model')}  name="model" inputType="text" />
            <FilterSectionElement title={t('params.direction')}  name="direction" inputType="ITEMS" items={direccionCamara} itemName='name' strictInput />

            {/*Columna 3*/}
            <span />
            <FilterSectionElement title={t('params.color')} name="color" inputType="ITEMS" items={autocompleteColors} itemName='name' strictInput />
            <FilterSectionElement title={t('params.speed')} name="speed" inputType="text" hint={t('hints.speed')} />

            {/*Columna 4*/}
            <span />
            <span />
            <FilterSectionElement title={t('params.confidence')} name="confidence" inputType="text" hint={t('hints.confidence')} />

        </FilterSection>
    )
}