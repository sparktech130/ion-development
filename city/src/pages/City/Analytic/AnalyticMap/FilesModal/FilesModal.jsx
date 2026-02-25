import { useState } from 'react'
import { useTranslation } from 'react-i18next'

//Styles
import styles from './FilesModal.module.css'

//Components
import { Modal } from '../../../../../../components/Modal/Modal'
import { DetailModal } from '../../../../../../components/DetailModal/DetailModal'
import { DetailModalFacial } from '../../../../../../components/DetailModal/DetailModalFacial'
import { GridReport } from '../../../../../../components/ConsultingGridImage/GridReport'
import { FilterSection } from '../../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../../components/FilterSection/FilterSectionElement'
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent'

import { vehicleConversion, colorConversion, orientationConversion } from '../../../../../../utils/conversions'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'



export const FilesModal = ({
    setIsOpen,
    onClickRegistroRuta
}) => {

    const {t} = useTranslation()

    //Modales
    const [detailOpen, setDetailOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)

    //Datos
    const [currentData, setCurrentData] = useState(null)
    const [reconocimientos] = useState([
        {
            "cod_reconoc": "260032",
            "fecha": "2025-10-07",
            "hora": "10:50:25",
            "matricula": "1356GHJ",
            "pais": "esp",
            "confidence": "0.000000",
            "foto": "2025-10-07_10-50-24_1356GHJ.jpg",
            "fotop": "2025-10-07_10-50-24_1356GHJp.jpg",
            "cod_dispositivo": "000001",
            "nom_dispositivo": "INCA001",
            "marca": "",
            "modelo": "",
            "color": "",
            "tipo_vh": "",
            "estado": "",
            "velocidad_vehiculo": null,
            "orientacion": "",
            "cod_alertagest": null,
            "modulos": "0001;0008;0011;0015"
        }])

    //-----------------------ONCLICK--------------------------

    //Click reconocimiento
    const onClickItem = (item) => {
        setCurrentData(item)
        setDetailOpen(true)
    }

    //Click ruta
    const onClickRuta = (item) => {
        onClickRegistroRuta(item)
        setDetailOpen(false)
        setIsOpen(false)
    }

    //Paquete de parametros que pasaremos a gridReport para que nos muestre la información de los registros
    const dataInfo = (x) => {
        return {
            code: x.cod_reconoc,
            title: x.matricula,
            subtitle: `${t('values.'+vehicleConversion(x))} ${x?.marca} ${x?.modelo} ${t(colorConversion(x?.color))}`,
            description: `${x?.nom_dispositivo} - ${t('values.'+orientationConversion(x))}`,
            alert: x?.cod_alertagest,
        }
    }



    return(
        <>
            {/* detalle reconocimiento */}
            {detailOpen && currentData &&
                <>
                    {currentData.facial ? (
                        <DetailModalFacial
                            zIndex={8}
                            currentData={currentData}
                            setIsOpen={setDetailOpen}
                            onClickRegistroRuta={onClickRuta}
                            disableButtons
                        />
                    ) : (
                        <DetailModal
                            zIndex={8}
                            currentData={currentData}
                            setIsOpen={setDetailOpen}
                            licensePlate={currentData?.matricula}
                            onClickRegistroRuta={onClickRuta}
                            disableButtons
                        />
                    )}
                </>
            }

            {/*Filtro*/}
            {filterOpen &&
                <FilterSection title={t('crud.filterElements', {elements:t('terms.records')})} submitText={t('buttons.filter')} setIsOpen={setFilterOpen} onReset={()=>{}} onSubmit={()=>{}} rows={2} columns={4} onChange={()=>{}} state={null} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                   <FilterSectionElement title={t('params.startDate')} name="initial_date" inputType="DATE"  />
                   <FilterSectionElement title={t('params.licensePlate')} name="license" inputType="text" />

                    <FilterSectionElement title={t('params.endDate')} name="final_date" inputType="DATE" />
                    <span/>

                    <FilterSectionElement title={t('params.startTime')} name="initial_hour" inputType="time"/>
                    <span/>
                     
                    <FilterSectionElement title={t('params.endTime')} name="final_hour" inputType="time" />

                </FilterSection>
            }

            {/* Modal registros  */}
            <Modal zIndex={6} closeModal={setIsOpen} title='CCTV barcelona 1412'>
                <div className={styles.wrapper}>
                    <ButtonComponent onClick={()=>setFilterOpen(true)} text={t('buttons.filter')} icon={filterIcon} />
                    <div className={styles['files']}>
                        {reconocimientos.map((item, i) => (
                            <GridReport
                                key={i}
                                item={item}
                                data={{
                                    index: i,
                                    code: dataInfo(item)?.code,
                                    title: dataInfo(item)?.title,
                                    subtitle: dataInfo(item)?.subtitle,
                                    description: dataInfo(item)?.description,
                                    alert: dataInfo(item)?.alert
                                }}
                                onClick={onClickItem}
                            />
                        ))}
                    </div>
                </div>
            </Modal>
        </>
    )
}