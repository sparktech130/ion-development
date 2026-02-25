import React from 'react'
import { useTranslation } from 'react-i18next'
import { FilterSection } from '../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement'

//Icons
import addIcon from '@icons/actions/add.svg?react'


export const RedsysModal = ({closeModal, action, onChange, state}) => {

    const { t } = useTranslation()

    return (

        <FilterSection zIndex={20} setIsOpen={closeModal} title={t('integrations.linkWithIntegration', {integration:'Redsys'})} onSubmit={action} rows={6} unequalRows columns={2} onChange={onChange} state={state} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={addIcon}>

            {/* Columna 1 */}
            <FilterSectionElement title={t('params.tpvTerminal')} name="name" inputType="text" required />
            <FilterSectionElement title={t('params.code')} name="name" inputType="text" required />
            <FilterSectionElement title={t('params.version')} name="name" inputType="text" />
            <FilterSectionElement title={t('params.commerceUrl')} name="name" inputType="text" required width={2}/>
            <FilterSectionElement title={t('params.successUrl')} name="name" inputType="text" width={2}/>
            <FilterSectionElement title={t('params.failureUrl')} name="name" inputType="text" width={2}/>

            {/* Columna 2 */}
            <FilterSectionElement title={t('params.holderName')} name="name" inputType="text" required />
            <FilterSectionElement title={t('params.currency')} name="name" inputType="ITEMS" items={['Dólares ($)', 'Euros (€)']} required />
            <FilterSectionElement title={t('params.key')} name="name" inputType="text"/>


        </FilterSection>

    )

}

export const PinbalModal = ({closeModal, action, onChange, state}) => {

     const { t } = useTranslation()

    return (

        <FilterSection zIndex={20} setIsOpen={closeModal} title={t('integrations.linkWithIntegration', {integration:'Pinbal'})} onSubmit={action} rows={8} unequalRows columns={2} onChange={onChange} state={state} submitText={t('buttons.add')} customStyles={{ width: '70dvw', maxWidth: '1000px' }} submitIcon={addIcon}>

            {/* Columna 1 */}
            <FilterSectionElement title={t('params.requesterId')} name="id" inputType="text" required/>
            <FilterSectionElement title={t('params.processingUnit')} name="unit" inputType="text" required/>
            <FilterSectionElement title={t('params.procedureCode')} name="pro_code" inputType="text" required/>

            <hr style={{ gridColumnStart: 'span 2', height: '1px', background: 'var(--color-border)', margin: '20px 0px' }}></hr>

            <FilterSectionElement title={t('params.code')} name="code" inputType="text" width={2} required/>
            <FilterSectionElement title={t('params.user')} name="user" inputType="text" required />
            <FilterSectionElement title={t('params.testEndpoint')} name="test_endpoint" inputType="text" width={2}/>
            <FilterSectionElement title={t('params.productionEndpoint')} name="production_endpoint" inputType="text" width={2}/>

            {/* Columna 2 */}
            <FilterSectionElement title={t('params.requesterName')} name="name" inputType="text" required/>
            <FilterSectionElement title={t('params.processingUnitCode')} name="unit_code" inputType="text" required/>
            <FilterSectionElement title={t('params.procedureName')} name="pro_code" inputType="text" required/>
            <FilterSectionElement title={t('params.password')} name="password" inputType="password" required />


        </FilterSection>

    )

}
