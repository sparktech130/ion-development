import styles from './ModalAdd.module.css'
import { useState, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { FilterSectionElement } from '../../../../../../components/FilterSection/FilterSectionElement'

//Context
import { MainDataContext} from '../../../../../../context/MainDataContext'

//Components
import { Modal } from "../../../../../../components/Modal/Modal"
import { Box } from '../../../../../../components/Box/Box'
import { Menu } from './Menu/Menu'
import { SortableGrid } from '../SortableGrid/SortableGrid'
import { ButtonComponent } from '../../../../../../components/ButtonComponent/ButtonComponent'

//Services
import { URL_INSERTAR_GRID } from '../../../../../../api/connections/urls'

//Icons
import addIcon from '@icons/actions/add.svg?react'


export const ModalAdd = ({
    closeModal,
    getLayouts,
    devices=[],
    clouds = [],
    modulo,
    isLoadingDevices
}) => {

    const {setIsLoading, requestAPI, setInfoMessage} = useContext(MainDataContext)
    const {t} = useTranslation()

    //datos grid
    const [name, setName] = useState('')
    const [gridDevices, setGridDevices] = useState([])

    //Errores
    const [nameError, setNameError] = useState(false)


    //------------------FUNCIONES BACK----------------------

    //guardar layout
    const saveLayout = async () => {
        if(!name){
            setNameError(true)
        }else if(gridDevices?.length<1){
            setInfoMessage(t('messages.addCamera'))
        }else{
            try{
                setIsLoading(true)
                let grid = ""
                gridDevices?.forEach((device)=>{
                    grid += device.cod_dispositivo+";"
                })
                if(grid.length>1){
                    grid = grid.slice(0, -1)
                }
                let params = {
                    nombre_grid: name,
                    dispositivos: grid,
                    modulos: [{"cod_modulo": modulo, "seleccionar": false}]
                }
                let data = await requestAPI(URL_INSERTAR_GRID, params)
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


    return(
        <Modal closeModal={closeModal} title={t('crud.addElement', {element:t('terms.layout')})}>
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
                            <ButtonComponent onClick={saveLayout} text={t('buttons.add')} icon={addIcon} />
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
    )
}