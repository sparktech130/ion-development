import styles from './ConfGrid.module.css'
import { useState, useEffect, useContext } from 'react'
import { useTranslation } from 'react-i18next'

//Context
import { MainDataContext } from '../../../../../context/MainDataContext'

//components
import { SortableGrid } from './SortableGrid/SortableGrid'
import { Menu } from './Menu/Menu'
import { ModalAdd } from './ModalAdd/ModalAdd'
import { ModalUpdate } from './ModalUpdate/ModalUpdate'
import { Route } from '../../../../../components/Route/Route'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent'

//Services
import { URL_OBTENER_GRIDS, URL_OBTENER_DISPOSITIVOS_IMAGEN, URL_OBTENER_CLOUDS } from '../../../../../api/connections/urls'
import { smartcity_modules } from '../../../../../constants/common'

//Icons
import addIcon from '@icons/actions/add.svg?react'
import editIcon from '@icons/actions/edit.svg?react'


export const ConfGrid = ({
    modulo,
}) =>{

    //context
    const {setIsLoading, requestAPI, codSector, section} = useContext(MainDataContext)
    const {t} = useTranslation()

    //modales
    const [isLoadingDevices, setIsLoadingDecices] = useState(true)
    const [editOpen, setEditOpen] = useState(false)
    const [addOpen, setAddOpen] = useState(false)

    //datos
    const [ layouts, setLayouts ] = useState([])
    const [ devices, setDevices ] = useState([])
    const [ clouds, setClouds] = useState([])
    const [ filteredClouds, setFilteredClouds] = useState([])
    const [ selectedLayout, setSelectedLayout] = useState(null)
    const [ gridDevices, setGridDevices] = useState([])


    //-------------pedir datos--------------------------

    //pide layouts
    const getLayouts = async (cleanGrid) => {
        try{

            //Limpiamos si hemos eliminado el layout
            if(cleanGrid){
                setSelectedLayout(null)
                setGridDevices([])
            }  

            //si estamos en vms se pasan diferente los params para que controle que haya dispositivos asignados a algun modulo del sector en vez de al modulo (en vms no se asignan dispositivos al no haber licencias)
            let params = {
                cod_modulo: modulo,
                cod_modulo_dispositivos: section.includes('vms') ? null : modulo,
                cod_sector: section.includes('vms') ? codSector : null
            }
            let data = await requestAPI(URL_OBTENER_GRIDS, params)
            if(!data.error && Array.isArray(data)){
                setLayouts(data)
                //actualizo los datos del layout seleccionado
                if(selectedLayout){
                    let updatedLayout = data.find(item=>item.cod_grid===selectedLayout.cod_grid)
                    if(updatedLayout){
                        setSelectedLayout(updatedLayout)
                    }
                }
            }else{
                setLayouts([])
            }
        }catch{
            setLayouts([])
        }finally{
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //pide dispositivos
    const getDevices = async () => {
        try{
            let modulos = [modulo]
            //Si es de 'Vms city' o 'Vms Ski' los dispositivos que se piden son los asignados a módulos de ese sector (no se asignan al vms) 
            if(modulo===17){
                modulos = smartcity_modules.filter(item=>!item.disabled && item.code!=='0017').map(item=>item.code)
            }
            let data = await requestAPI(URL_OBTENER_DISPOSITIVOS_IMAGEN, {modulos:modulos})
            if(!data.error && Array.isArray(data)){
                setDevices(data)
            }else{
                setDevices([])
            }
        }catch{
            setDevices([])
        }finally{
            setIsLoadingDecices(false)
        }
    }

    //pide clouds
    const getClouds = async () => {
        try{
            let data = await requestAPI(URL_OBTENER_CLOUDS, {cod_sector: codSector})
            if(!data.error && Array.isArray(data)){
                setClouds(data)
            }else{
                setClouds([])
            }
        }catch{
            setClouds([])
        }
    }
    
    //llamada inicial
    useEffect(()=>{
        getLayouts()
        getDevices()
        getClouds()
        //eslint-disable-next-line
    },[])


    // -------------Onclicks-------------------------

    //clic modificar layout
    const handleClickUpdate = () => {
        if(selectedLayout?.cod_grid){
            setEditOpen(true)
        }
    }

    //--------useEffect---------------------

    //quita los clouds que no tienen dispositivos asignado a ese módulo
    useEffect(()=>{
        if(clouds.length>0 && devices.length>0){
            let cloudsFiltrados = clouds.filter((cloud)=>{return devices.some(device => device.cod_cloud === cloud.cod_cloud)})
            setFilteredClouds(cloudsFiltrados)
        }
    },[clouds, devices])

    //actualiza las camaras del grid al cambiar layout
    useEffect(()=>{
        if(devices.length>0 && selectedLayout){
            let dispositivos = selectedLayout?.dispositivos?.split(';').map(cod => devices.find(device => device.cod_dispositivo === cod)).filter(device => device !== undefined) || []
            setGridDevices(dispositivos)
        }else if(!selectedLayout){
            setSelectedLayout(null)
            setGridDevices([])
        }
    },[devices, selectedLayout])



    return(
        <>

            {/* modal editar */}
            {editOpen && 
                <ModalUpdate closeModal={setEditOpen} getLayouts={getLayouts} layout={selectedLayout} devices={devices} clouds={filteredClouds} isLoadingDevices={isLoadingDevices} />
            }

            {/* modal añadir */}
            {addOpen && 
                <ModalAdd closeModal={setAddOpen} getLayouts={getLayouts} devices={devices} clouds={filteredClouds} modulo={modulo} isLoadingDevices={isLoadingDevices} />
            }


            <main className={styles['confgrid']}>

                {/* barra lateral */}
                <div className={styles['left__section']}>

                    <Route routes={[{name:t('sections.LAYOUTS')}]} />

                    {/* botones */}
                    <div className={styles['buttons__wrapper']}>
                        <ButtonComponent text={t('buttons.add')} icon={addIcon} onClick={()=>setAddOpen(true)} />
                        {selectedLayout &&
                            <ButtonComponent text={t('buttons.edit')} icon={editIcon} onClick={()=>handleClickUpdate()} />
                        }
                    </div>
                    
                    {/* Menú */}
                    <div className={styles['menu__wrapper']}>
                        <Menu layouts={layouts} devices={devices} selectedLayout={selectedLayout} setSelectedLayout={setSelectedLayout} modulo={modulo} refreshLayouts={getLayouts} isLoadingDevices={isLoadingDevices} />
                    </div>
                </div>

                {/* grid */}
                <div className={styles['right__section']}>
                    <h2 className={styles['right__section__title']}>{t('titles.visualization')}</h2>
                    <div className={styles['grid__wrapper']}>
                        <SortableGrid disableDrag={true} gridDevices={gridDevices} />
                    </div>
                </div>

            </main>
        </>

    )
}