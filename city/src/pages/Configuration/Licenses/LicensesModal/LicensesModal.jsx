
import styles from './LicensesModal.module.css'
import { useState, useEffect, useContext, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import MainDataContext from '../../../../context/MainDataContext'

//Components
import { Modal } from "../../../../components/Modal/Modal"
import { Table } from '../../../../components/Table/Table'
import { TextModal } from '../../../../components/TextModal/TextModal'
import { FilterSection } from '../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../components/FilterSection/FilterSectionElement'
import { ButtonComponent } from '@components/ButtonComponent/ButtonComponent'

//Api
import { URL_ELIMINAR_LICENCIA } from '../../../../api/connections/urls'

//Icons
import deleteIcon from '@icons/actions/delete.svg?react'
import filterIcon from '@icons/actions/filter.svg?react'


export const LicensesModal = ({
    closeModal,
    cardInfo, //info de la card
    licencias = [], //todas las licencias
    callAPI, //actualizar datos padre
    updateLicensesContext, //actualizar licencias context
    getLicenses //pedir licencias para filtrar desde aquí
}) => {

    //Context
    const { setIsLoading, requestAPI, setInfoMessage } = useContext(MainDataContext)

    //Translation
    const { t } = useTranslation()

    //datos
    const [data, setData] = useState([])
    const [currentData, setCurrentData] = useState(null)
    const [modulo, setModulo] = useState('')

    //Modales
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)
    const [filterState, setFilterState] = useState({})
    const [seHaFiltrado, setSeHaFiltrado] = useState(false) //si hemos filtrado las licencias al salir del modal hay que volverlas a pedir sin filtrar

    const itemsLicenses = useMemo(() => {
        return [
            { cod: "EN USO", name: t('values.EN USO') },
            { cod: "VALIDA", name: t('values.VALIDA') },
            { cod: 'PRORROGA', name: t('values.PRORROGA') },
            { cod: "EXPIRADA", name: t('values.EXPIRADA') }
        ]
        //eslint-disable-next-line
    }, [])

    //------------API----------------------------------------------

    //Elimina la licencia seleccionada
    const deleteLicense = async () => {

        //Ocultamos modal de edición
        setDeleteOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            clave_licencia: currentData?.clave_licencia
        }

        //Llamada para eliminar clientes
        let data = await requestAPI(URL_ELIMINAR_LICENCIA, params)

        //Control de errores
        if (data.message) {
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        callAPI()
        updateLicensesContext()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage(t('crud.elementDeleted'))
        }, 500);
    }

    //--------------USEEFFECT-------------------------------------

    //quita las licencias para dejar las de este módulo
    useEffect(() => {
        if (Array.isArray(licencias) && cardInfo?.modulo) {
            setData(licencias.filter(item => item.modulo === cardInfo.modulo))
        }
        setModulo(capitalizeFirstLetter(cardInfo?.modulo))
        //eslint-disable-next-line
    }, [licencias])

    //---------------FUNCIONES---------------------------

    //Pone la primera letra en mayúsculas
    function capitalizeFirstLetter(string) {
        if (!string) return;
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    //cierra modal actualizando datos de fuera por si se ha filtrado las licencias vuelva a estar sin filtrar lo de fuera
    const handleClose = () => {
        closeModal(false)
        if (seHaFiltrado) {
            callAPI()
        }
    }

    //filtrar dtos
    const handlefilterData = (payload) => {
        setSeHaFiltrado(true)
        getLicenses(payload)
    }


    return (
        <>

            {/* Modal eliminar */}
            {deleteOpen &&
                <TextModal zIndex={10} setIsOpen={setDeleteOpen} title={t('crud.deleteElement', { element: t('terms.license') })} aceptar={deleteLicense} cancelarRed cancelar={() => setDeleteOpen(false)}>{t('crud.deleteConfirmation', { element: t('terms.license') })}</TextModal>
            }

            {/* Filtrar licencias */}
            {filterOpen &&
                <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', { elements: t('terms.licenses') })} onSubmit={handlefilterData} onReset={() => { setFilterState({}) }} rows={1} columns={2} onChange={setFilterState} state={filterState} submitText={t('buttons.filter')} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>

                    <FilterSectionElement title={t('params.key')} name="clave_licencia" inputType="text" />
                    <FilterSectionElement title={t('params.status')} name="estado" inputType="ITEMS" items={itemsLicenses} itemName='name' strictInput />

                </FilterSection>
            }

            {/* Modal licencias */}
            <Modal zIndex={8} closeModal={handleClose} title={modulo}>
                <div className={styles['wrapper']} style={{ width: '70dvw', maxWidth: '1050px' }}>
                    <div className={styles['button__wrapper']}>
                        {currentData && <ButtonComponent onClick={()=>setDeleteOpen(true)} permissionType='editar' text={t('buttons.delete')} icon={deleteIcon} />}
                        <ButtonComponent onClick={()=>setFilterOpen(true)} permissionType='consultas' text={t('buttons.filter')} icon={filterIcon}/>
                    </div>
                    <div className={styles['list']}>
                        <Table
                            results={data}
                            rows={11}
                            primary_key={'cod_licencia'}
                            headers={[t('params.channels'), t('params.activationDate'), t('params.expirationDate'), t('params.key'), t('params.status')]}
                            columnStyles={['element--short', 'element--medium', 'element--medium', 'element--long', 'element--medium']}
                            row_elements={['canales', 'fecha_activacion', 'fecha_expiracion', 'clave_licencia', (item) => t('values.' + item.estado)]}
                            sortElements={['canales', 'fecha_activacion', 'fecha_expiracion', 'clave_licencia', 'estado']}
                            sortAccesors={{
                                estado: item => t('values.' + item.estado),
                            }}
                            currentData={currentData}
                            setCurrentData={setCurrentData}
                            className={styles['table']}
                            checkRedRowFunction={(item) => { return item.estado === 'PRORROGA' || item.estado === 'EXPIRADA' }}
                        />
                    </div>
                </div>
            </Modal>

        </>
    )
}