import { useState, useMemo, useContext, useEffect } from "react"
import { useTranslation } from "react-i18next"

//Components
import { FilterSection } from "@components/FilterSection/FilterSection"
import { FilterSectionElement } from "@components/FilterSection/FilterSectionElement"

//Utils
import { checkArray } from "../../../../utils/functions/functions"

//Icons
import { deviceIcons } from "../../../../constants/icons"

//Context
import MainDataContext from "../../../../context/MainDataContext"

//Constants
import { url_path } from "../../../../constants/common"

//Styles
import styles from './SyncModal.module.css'


export const ModelModal = ({
    setIsOpen,
    handleSubmit,
    categories
}) => {

    //Context
    const {url_origin} = useContext(MainDataContext)
    const {t} = useTranslation()

    //State
    const [insertState, setInsertState] = useState({})

    //Inputs
    const [selectedCategory, setSelectedCategory] = useState('')
    const [selectedManufacturer, setSelectedManufacturer] = useState('')
    const [selectedModel, setSelectedModel] = useState('')


    //----------------------------CUSTOM ICONS------------------------------------------

    //Categorías
    const customIconsCategories = useMemo(()=>{
        if(checkArray(categories)){
            //Dejo las de cámara y monitor
            return categories
                ?.filter(item=>(['0002', '0004'].includes(item.cod_categoria)))
                ?.map(item=>({code: item.cod_categoria, icon: deviceIcons[item.cod_categoria], text: item.nombre_categoria}))
        }
        return undefined
    }, [categories])

    //Fabricantes
    const customIconsfacturers = useMemo(() => {
        //Buscamos la categoría seleccionada
        if (selectedCategory && checkArray(categories)) {
            let categoria = categories.find(item => item.cod_categoria === selectedCategory)
            //Cogemos sus fabricantes
            if (checkArray(categoria?.fabricantes)) {
                return categoria?.fabricantes?.map(item=>({code: item.cod_fabricante, icon: url_origin+url_path+'/'+item?.logo_fabricante, text: item.nombre_fabricante}))
            }
        }
        return undefined
        //eslint-disable-next-line
    }, [categories, selectedCategory])

    //Modelos
    const customIconsModels = useMemo(() => {
        //Buscamos la categoría seleccionada
        if (selectedCategory && checkArray(categories)) {
            let categoria = categories.find(item => item.cod_categoria === selectedCategory)
            //Cogemos sus fabricantes
            if (categoria && checkArray(categoria.fabricantes)) {
                let fabricante =  categoria?.fabricantes?.find(item => item.cod_fabricante === selectedManufacturer)
                //Cogemos sus modelos
                if(checkArray(fabricante?.modelos)){ //.filter(item=>(item?.cod_categoria===selectedCategory && item?.cod_fabricante===selectedManufacturer)) por si no se arregla en back añadir esto despues del map (no vienen filtrados por categoría los modelos)
                    return fabricante?.modelos?.map(item=>({code: item.cod_modelo, icon: url_origin+url_path+'/'+item?.foto_modelo, text: item.nombre_modelo}))
                }
            }
        }
        return undefined
    //eslint-disable-next-line
    }, [categories, selectedCategory, selectedManufacturer])



    //--------------------------USE EFFECT---------------------------------------------------

    //Actualiza valores seleccionados al cambiar insertState
    useEffect(()=>{
        setSelectedCategory(checkArray(insertState?.categoria) ? insertState?.categoria[0] : undefined)
        setSelectedManufacturer(checkArray(insertState?.fabricante) ? insertState?.fabricante[0] : undefined)
        setSelectedModel(checkArray(insertState?.modelo) ? insertState?.modelo[0] : undefined)
    },[insertState])


    //---------------------------FUNCIONES--------------------------------------

    //Busca el objeto modelo a partir del código
    const findModel = (cod) => {
        //Bucle por categorías
        if (checkArray(categories)) {
            for (const category of categories) {
                //Bucle por cada fabricantes de cada categoría
                if (checkArray(category.fabricantes)) {
                    for (const fabricante of category.fabricantes) {
                        //Buvle por cada modelos de cada fabricante de cada categoría
                        if (checkArray(fabricante.modelos)) {
                            const model = fabricante.modelos.find(m => m.cod_modelo === cod);
                            if (model) return model;
                        }
                    }
                }
            }
        }
        return undefined;
    }


    return(
        <FilterSection buttonsRight setIsOpen={setIsOpen} title={t('crud.selectElement', {element:t('terms.model')})} onSubmit={()=>handleSubmit(findModel(selectedModel))} rows={3} columns={4} submitText={t('buttons.accept')} customStyles={{ width: '60dvw'}} state={insertState} onChange={setInsertState} unequalRows >
            <FilterSectionElement title={t('params.category')} inputType="ICONS" name="categoria" selectOne customIcons={customIconsCategories} disableSelectAll width={4} required />
            <FilterSectionElement title={t('params.brand')} inputType="ICONS" name="fabricante" selectOne customIcons={customIconsfacturers} disableSelectAll width={4} className={styles['selectIcons--image']} required/>
            <FilterSectionElement title={t('params.model')} inputType="ICONS" name="modelo" selectOne customIcons={customIconsModels} disableSelectAll width={4} className={styles['selectIcons--big']} required/>
        </FilterSection>
    )
}