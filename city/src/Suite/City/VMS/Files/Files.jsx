
import { useContext, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

//Styles
import styles from './Files.module.css'
import consultingStyles from '../../../../../styles/sections/Consulting.module.css'
import consultingGridStyles from '../../../../../components/ConsultingGridImage/ConsultingGrid.module.css'

//Context
import MainDataContext from '../../../../../context/MainDataContext'
import { useLoginDataContext } from '../../../../../context/LoginDataContext'

//components
import { Box } from '../../../../../components/Box/Box'
import { File } from './File/File'
import { FilterSection } from '../../../../../components/FilterSection/FilterSection'
import { FilterSectionElement } from '../../../../../components/FilterSection/FilterSectionElement'
import { InputDate } from '../../../../../components/Inputs/InputDate/InputDate'
import { ClipVmsModal } from '../../../../../components/VMS/ClipVms/ClipVmsModal/ClipVmsModal'
import { ButtonComponent } from '../../../../../components/ButtonComponent/ButtonComponent'

//API
import { URL_OBTENER_VIDEOS_COMPARTIDOS } from '../../../../../api/connections/urls'

//Icons
import filterIcon from '@icons/actions/filter.svg?react'


export const Files = ({
    modulo
}) => {

    const {t} = useTranslation()
    const {codUsuario} = useLoginDataContext()
    const {setIsLoading, forceUpdateModule, requestAPI} = useContext(MainDataContext)
    const [subtitle, setSubtitle] = useState(t('messages.results', { value: 0 }))

    //datos
    const [archivos, setArchivos] = useState([])
    const [selectedItem, setSelectedItem] = useState(null)

    //modales
    const [filterOpen, setFilterOpen] = useState(false)
    const [clipOpen, setClipOpen] = useState(false)

    //filtros
    const [dateIni, setDateIni] = useState(undefined)
    const [dateFin, setDateFin] = useState(undefined)


    //-------------------------BACK-----------------------------

    //obtener archivos compartidos
    const getFiles = async () => {
        setIsLoading(true)
        let error = false
        try{
            let filtrados = (dateIni || dateFin) ? true :  false
            let params = {
                usuario_compartido: codUsuario,
                fecha_ini: dateIni,
                fecha_fin: dateFin,
                limit: filtrados ? undefined : 100,
                cod_modulo: modulo,
                enlace_video: false,
            }
            let data = await requestAPI(URL_OBTENER_VIDEOS_COMPARTIDOS, params)
            if(!data.error && Array.isArray(data.rows)){
                setArchivos(data.rows)
                setSubtitle(
                    (filtrados ? 
                        t('messages.resultsFiltered', {value:data.rows.length})
                        :
                        t('messages.resultsTotal', {value:data.rows.length, total:data.total})
                    )
                )
            }else{
                error = true
            }
        }catch{
            error = true
        }finally{
            if(error){
                setArchivos([])
                setSubtitle(t('messages.resultsNone'))
            }
            setTimeout(() => {
                setIsLoading(false)
            }, 300);
        }
    }

    //pide inicialmente los datos
    useEffect(()=>{
        getFiles()
        setClipOpen(false)
    //eslint-disable-next-line
    },[forceUpdateModule])

    //-----------------FILTRAR----------------------------------

    //limpia filtros
    const resetFilters = () => {
        setDateIni(undefined)
        setDateFin(undefined)
    }

    //--------------ONCLICK----------------------------------

    //clic en registro
    const onClickItem = (item) => {
        setSelectedItem(item)
        setClipOpen(true)
    }


    return(
        <>
            <main className={consultingStyles['consulting']}>

                {/* modal filtrar */}
                {filterOpen &&
                    <FilterSection setIsOpen={setFilterOpen} title={t('crud.filterElements', {elements:t('terms.files')})} submitText={t('buttons.filter')} onReset={resetFilters} onSubmit={getFiles} rows={1} columns={2} customStyles={{ width: '70dvw', maxWidth: '750px' }} submitIcon={filterIcon}>
                        <FilterSectionElement title={t('params.startDate')}> 
                            <InputDate textStart='' value={dateIni} onChange={e=>setDateIni(e.format("YYYY-MM-DD"))}/>
                        </FilterSectionElement>
                        <FilterSectionElement title={t('params.endDate')}> 
                            <InputDate textStart='' value={dateFin} onChange={e=>setDateFin(e.format("YYYY-MM-DD"))}/>
                        </FilterSectionElement>
                    </FilterSection>
                }

                {/* modal clip seleccionado */}
                {clipOpen && selectedItem &&
                    <ClipVmsModal
                        url={selectedItem?.enlace_video}
                        file = {selectedItem}
                        infoGrabacion={selectedItem?.timeline_grabacion}
                        infoMovimientos={selectedItem?.timeline_movimiento}
                        dispositivo={selectedItem}
                        posicion={selectedItem?.pos}
                        duracion={selectedItem?.endPos-selectedItem?.pos}
                        closeModal={setClipOpen}
                    />
                }

                {/* registros compartidos */}
                <Box routes={[{name:t('sections.ARCHIVOS')}]} className={consultingStyles['registers']}>
                    <h2 className='subtitle'>{subtitle}</h2>
                        <ButtonComponent onClick={()=>setFilterOpen(true)} permissionType='consultas' icon={filterIcon} text={t('buttons.filter')} />
                    <div className={consultingStyles['grid']}>
                        <div className={consultingGridStyles['grid__body']}>
                            {(Array.isArray(archivos) && archivos?.length > 0) &&
                                archivos?.map((item, index) => (
                                    <File key={index} item={item} onClickItem={()=>onClickItem(item)} getFiles={getFiles} />
                                )) 
                            }
                            {(!archivos || (Array.isArray(archivos) && archivos?.length === 0)) &&
                                <div className={styles['no__data']}><p>{t('messages.resultsNone')}</p></div>
                            }
                        </div>
                    </div>
                </Box>
            </main>
        </>
    )
}