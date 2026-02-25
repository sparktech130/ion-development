import { useEffect, useState, useContext } from "react"
import moment from "moment"
import { useTranslation } from "react-i18next"

//Styles
import styles from '@styles/sections/StatsIndustry.module.css'

//Components
import { Box } from "@components/Box/Box"
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'
import { FilterSection } from "@components/FilterSection/FilterSection"
import { FilterSectionElement } from "@components/FilterSection/FilterSectionElement"

//Parts
import { Risk } from "./Components/Risk"
import { Security } from "./Components/Security"
import { Alerts } from "./Components/Alerts"
import { ServerGraph } from "./Components/ServerGraph"
import { SecurityGraph } from "./Components/SecurityGraph"
import { ConexionsGraph } from "./Components/ConexionsGraph"
import { ParamsGraph } from "./Components/ParamsGraph"

//Assets
import calendarIcon from "@icons/actions/calendar.svg?react"
import filterIcon from '@icons/actions/filter.svg?react'
import orderIcon from '@icons/actions/order.svg?react'

//Context
import MainDataContext from "@context/MainDataContext"


export const CurrentServer = ({
    currentServer, setCurrentServer
}) => {

    //--------------------------VARIABLES----------------------------

    //Context
    const { setIsLoading, setInfoMessage } = useContext(MainDataContext)
    const { t } = useTranslation()

    //Loading
    //eslint-disable-next-line
    const [loadingsControl, setLoadingsControl] = useState({ })

    //Modals
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [filterOpen2, setFilterOpen2] = useState(false)

    const [filterState2, setFilterState2] = useState({})

    //eslint-disable-next-line
    const [payload, setPayload] = useState(null)
    //eslint-disable-next-line
    const [payload2, setPayload2] = useState(null)

    //Dropdown date
    const [presetOptions] = useState([
        { cod: 24, name: t('buttons.today') },
        { cod: 7, name: t('buttons.week') },
        { cod: 30, name: t('buttons.month') },
        { cod: 'custom', name: t('messages.customDate'), onClick: () => setFilterOpen(true) },
    ])
    const [preset, setPreset] = useState(presetOptions[0])

    //Dropdown date 2
    const [presetOptions2] = useState([
        { cod: 24, name: t('buttons.today') },
        { cod: 7, name: t('buttons.week') },
        { cod: 30, name: t('buttons.month') },
        { cod: 'custom', name: t('messages.customDate'), onClick: () => setFilterOpen2(true) },
    ])
    const [preset2, setPreset2] = useState(presetOptions[0])

    //Dropdown order
    const [orderOptions] = useState([
        { cod: 'status', name: t('params.status') },
        { cod: 'time', name: t('params.time') },
    ])
    const [selectedOrder, setSelectedOrder] = useState(orderOptions[0])


    //------------------------USE EFFECT--------------------------------------

    //gestiona cambio de preset 1
    useEffect(() => {
        if (preset?.cod === 24) {
            let dateI = moment().format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload({ initial_date: dateI, final_date: dateF })
            setFilterState({})
        } else if (preset?.cod === 7) {
            let dateI = moment().subtract(6, 'days').format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload({ initial_date: dateI, final_date: dateF })
            setFilterState({})
        } else if (preset?.cod === 30) {
            let dateI = moment().subtract(1, 'month').format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload({ initial_date: dateI, final_date: dateF })
            setFilterState({})
        }
    }, [preset])

    //gestiona cambio de preset 2
    useEffect(() => {
        if (preset2?.cod === 24) {
            let dateI = moment().format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload2({ initial_date: dateI, final_date: dateF })
            setFilterState2({})
        } else if (preset2?.cod === 7) {
            let dateI = moment().subtract(6, 'days').format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload2({ initial_date: dateI, final_date: dateF })
            setFilterState2({})
        } else if (preset2?.cod === 30) {
            let dateI = moment().subtract(1, 'month').format('YYYY-MM-DD')
            let dateF = moment().format('YYYY-MM-DD')
            setPayload2({ initial_date: dateI, final_date: dateF })
            setFilterState2({})
        }
    }, [preset2])

    //Gestiona el loading
    useEffect(() => {
        //Si alguna card tiene el loading lo pone
        const isLoading = Object?.values(loadingsControl)?.some(value => value === true);
        setIsLoading(isLoading);
        //eslint-disable-next-line
    }, [loadingsControl]);


    //---------------------------FILTRAR------------------------------------

    //Filtrar fecha custom
    const filterData = (p, numPreset) => {

        //fechas
        let dateI = p?.initial_date
        let dateF = p?.final_date
        let dateImoment = dateI ? moment(dateI) : undefined
        let dateFmoment = dateF ? moment(dateF) : undefined

        //fechas requeridas
        if (!dateI || !dateF || dateI === 'Invalid date' || dateF === 'Invalid date') {
            setInfoMessage(t('errors.fillRequiredFields'))

            //fecha fin anterior a fecha ini
        } else if (dateImoment > dateFmoment) {
            setInfoMessage(t('errors.startDateBeforeEndDate'))

            //Sipera rango máximo (1 año)
        } else if ((dateFmoment?.diff(dateI, 'days')) > 366) {
            setInfoMessage(t('errors.dateRangeExceeded', {days: 365}))

            //filtrar
        } else {
            //setIsLoading(true) ----------------------------------------poner cuando se implemente!!
            let fechaItext = dateImoment?.format('DD-MM-YYYY')
            let fechaFtext = dateFmoment?.format('DD-MM-YYYY')
            if (numPreset === 2) {
                setFilterOpen2(false)
                setPreset2({ cod: 'custom', name: fechaItext + ' / ' + fechaFtext })
                setPayload2(p)
            } else {
                setFilterOpen(false)
                setPreset({ cod: 'custom', name: fechaItext + ' / ' + fechaFtext })
                setPayload(p)
            }
        }
    }


    return (
        <>

            {/* Modal filtrar fechas */}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.recognitions') })} onSubmit={(p) => filterData(p, 1)} rows={1} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} noCloseOnSubmit submitIcon={filterIcon}>
                    <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" required />
                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" required />
                </FilterSection>
            }

            {/* Modal filtrar fechas 2 */}
            {filterOpen2 &&
                <FilterSection setIsOpen={setFilterOpen2} title={t('crud.filterElements', { elements: t('terms.recognitions') })} onSubmit={(p) => filterData(p, 2)} rows={1} columns={2} onChange={setFilterState2} state={filterState2} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} noCloseOnSubmit submitIcon={filterIcon}>
                    <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE" required />
                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" required />
                </FilterSection>
            }

            <main className={styles['wrapper']}>

                {/* Sección izquierda */}
                <section className={styles['left__section']}>
                    <Box routes={[{ name: t('sections.MONITORIZACION'), action: ()=>setCurrentServer(null) }, {name: currentServer?.nom_server}]}>

                        {/* Buttons */}
                        <div className={styles['button__wrapper']}>

                            <ButtonComponent
                                icon={calendarIcon}
                                options={presetOptions}
                                selectedOption={preset} setSelectedOption={setPreset}
                                /*enableLoading */
                                permissionType="consultas"
                            />


                        </div>

                        {/* Gráficas */}
                        <div className={styles['grid']}>
                            <Risk setLoadingsControl={setLoadingsControl} />
                            <Security setLoadingsControl={setLoadingsControl} />
                            <ServerGraph setLoadingsControl={setLoadingsControl} />
                            <SecurityGraph setLoadingsControl={setLoadingsControl} />
                            <ConexionsGraph setLoadingsControl={setLoadingsControl} />
                            <ParamsGraph setLoadingsControl={setLoadingsControl} />
                        </div>

                    </Box>
                </section>


                {/* Sección derecha */}
                <section className={styles['right__section']}>
                    <div>
                        <h2 className={styles['right__section__title']}>{t('sections.ALERTAS')}</h2>

                        {/* Buttons */}
                        <div className={styles['button__wrapper']}>

                            <ButtonComponent
                                icon={calendarIcon}
                                selectedOption={preset2} setSelectedOption={setPreset2}
                                options={presetOptions2}
                                /*enableLoading*/
                                permissionType="consultas"
                                textStyle={{maxWidth: '106px'}}
                            />

                            <ButtonComponent
                                icon={orderIcon}
                                selectedOption={selectedOrder} setSelectedOption={setSelectedOrder}
                                options={orderOptions}
                                textStyle={{maxWidth: '106px'}}
                            />

                        </div>

                        <Alerts setLoadingsControl={setLoadingsControl} />
                  
                
                    </div>


                </section>

            </main>
        </>
    )
}