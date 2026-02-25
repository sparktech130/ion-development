import styles from '../ModalAdd/ModalAdd.module.css'
import { useState, useContext, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import { MainDataContext} from '../../../../../../context/MainDataContext'

//Components
import { Modal } from "../../../../../../components/Modal/Modal"
import { Box } from '../../../../../../components/Box/Box'
import { Menu } from '../ModalAdd/Menu/Menu'
import { SortableGrid } from '../SortableGrid/SortableGrid'
import { FilterSectionElement } from '../../../../../../components/FilterSection/FilterSectionElement'
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent'
import { TextModal } from '../../../../../../components/TextModal/TextModal'

//Services
import { URL_MODIFICAR_GRID, URL_ELIMINAR_GRID} from '../../../../../../api/connections/urls'

//Icons
import editIcon from '@icons/actions/edit.svg?react'
import deleteIcon from '@icons/actions/delete.svg?react'


export const ModalUpdate = ({
    closeModal,
    getLayouts,
    layout,
    devices=[],
    clouds=[],
    isLoadingDevices
}) => {

    const {setIsLoading, requestAPI, setInfoMessage} = useContext(MainDataContext)
    const { t } = useTranslation()

    //datos grid
    const [name, setName] = useState(layout?.nombre_grid || '')
    const [gridDevices, setGridDevices] = useState([])
    const [deleteOpen, setDeleteOpen] = useState(false)

    //Errores
    const [nameError, setNameError] = useState(false)

    
    //da valor a gridDevices quitando los los que han dejado de estar asignados al módulo
    useEffect(()=>{
        if(devices.length>0){
            setGridDevices(layout?.dispositivos?.split(';').map(cod => devices.find(device => device.cod_dispositivo === cod)).filter(device => device !== undefined) || [])
        }
    //eslint-disable-next-line
    },[devices])


    //------------------FUNCIONES BACK----------------------

    //modificar layout
    const updateLayout = async () => {
        if(!name){
            setNameError(true)
        }else if(gridDevices.length<1){
            setInfoMessage(t('messages.addCamera'))
        }else{
            try{
                setIsLoading(true)
                let grid = ""
                gridDevices.forEach((device, i)=>{
                    grid += device.cod_dispositivo+";"
                })
                if(grid.length>1){
                    grid = grid.slice(0, -1)
                }
                let params = {
                    cod_grid: layout.cod_grid,
                    nombre_grid: name,
                    dispositivos: grid,
                }
                let data = await requestAPI(URL_MODIFICAR_GRID, params)
                if(!data.error){
                    setTimeout(() => {
                        getLayouts()
                        closeModal(false)
                    }, 300);
                }else{
                    if(data?.error && data?.message){
                        setInfoMessage(data.message)
                    }else{
                        setInfoMessage(t('errors.request'))
                    }
                    setIsLoading(false)
                }
            }catch{
                setInfoMessage(t('errors.request'))
                setIsLoading(false)
            }
        }
    }

    //elimina layout
    const deleteLayout = async () => {
        try{
            if(layout?.cod_grid){
                setIsLoading(true)
                let data = await requestAPI(URL_ELIMINAR_GRID, {cod_grid:layout.cod_grid})
                if(!data.error){
                    setTimeout(() => {
                        getLayouts(true)
                        closeModal(false)
                    }, 300);
                }else{
                    setInfoMessage(t('errors.request'))
                    setIsLoading(false)
                }
            }
        }catch{
            setIsLoading(false)
        }
    }
    
    //-------------------------ONCLICK---------------------------------

    //clic eliminar layout
    const handleClickDelete = () => {
        if(layout?.cod_grid){
            setDeleteOpen(true)
        }
    }


    return(
        <>
            {/* modal eliminar*/}
            {deleteOpen &&
                <TextModal zIndex={8} setIsOpen={setDeleteOpen} title={t('crud.deleteElement', {element:t('terms.layout')})} aceptar={deleteLayout} cancelarRed cancelar={()=>setDeleteOpen(false)}>{t('crud.deleteConfirmationName', {element:t('terms.layout'), name:layout?.nombre_grid})}</TextModal>
            }

            <Modal zIndex={6} closeModal={closeModal} title={t('crud.editElement', {element:t('terms.layout')})}>
                <div className={styles['addModal']}>

                        {/* barra lateral */}
                        <div className={styles['left__section']}>

                            <FilterSectionElement title={t('params.name')} error = {nameError} required>
                                <input className={'input'} placeholder={t('params.name')} value={name} onChange={e=>{setNameError(false);setName(e.target.value)}}/>
                            </FilterSectionElement>

                            <Box title={t('terms.servers')} />
                            
                            {/* Menú */}
                            <div className={styles['menu__wrapper']}>
                                <Menu items={clouds} devices={devices} gridDevices={gridDevices} setGridDevices={setGridDevices} isLoadingDevices={isLoadingDevices} />
                            </div>

                            {/* botones */}
                            <div className={styles['buttons__wrapper']}>
                                <ButtonComponent  onClick={updateLayout} text={t('buttons.edit')} icon={editIcon} />
                                <ButtonComponent isRed text={t('crud.deleteElement', {element:t('terms.layout')})} icon={deleteIcon} onClick={handleClickDelete} />
                            </div>
                            
                        </div>

                    
                        {/* grid */}
                        <div className={styles['right__section']}>  
                            <div className={styles['grid__wrapper']}>
                                <SortableGrid gridDevices={gridDevices} setGridDevices={setGridDevices} defaultNumCams={9}  />
                            </div>
                        </div>
                </div>
            </Modal>
        </>
    )
}