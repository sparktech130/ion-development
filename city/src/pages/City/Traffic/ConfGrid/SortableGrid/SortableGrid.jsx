import styles from './SortableGrid.module.css'
import {SortableContainer, SortableElement} from 'react-sortable-hoc'
import {arrayMoveImmutable} from 'array-move'
import { useState, useContext, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

//Context
import MainDataContext from '../../../../../../context/MainDataContext';

//constants
import { url_path } from '../../../../../../constants/common';


//item ordenable
const SortableItem = SortableElement(({value, devicesImgError, setDevicesImgError}) => {
    const {url_origin} = useContext(MainDataContext)
    const {t} = useTranslation()
    const handleError = (cod) => {
        if(!devicesImgError.includes(cod)){
            setDevicesImgError([...devicesImgError, cod])
        }
    }
    return(
        <div className={styles['img__wrapper']}>
            <div className={styles['title']}>
                <p>{value?.nom_dispositivo}</p>
            </div>
            {(value?.foto && !(devicesImgError.includes(value.cod_dispositivo))) ? (
                <img src={url_origin+url_path+'/fotos/'+value?.foto} alt="" className={styles['image']} onError={()=>{handleError(value?.cod_dispositivo)}} />
            ) : (
                <div className={styles['no__image']}>
                    <p>{t('messages.noImage')}</p>
                </div>
            )} 
        </div>
    )
});
  
//lista de items ordenables
const SortableList = SortableContainer(({items, disabled, devicesImgError, setDevicesImgError, defaultNumCams}) => {

    //Número de espacios vacíos
    const numEmptySpaces = useMemo(() => {
        //si hay menos de nueve relleno hasta 9
        const count = items?.length || 0;
        if (count < defaultNumCams) {
            return defaultNumCams - count;
        }
        //Si hay más de nueve que sea un múltiplo de 3
        const nextMultipleOf3 = Math.ceil(count / 3) * 3;
        return nextMultipleOf3 - count;
    //eslint-disable-next-line
    }, [items]);

    return (
      <div className={styles['images__wrapper']}>
        {items?.map((value, index) => (
          <SortableItem key={index} index={index} value={value} disabled={disabled} devicesImgError={devicesImgError} setDevicesImgError={setDevicesImgError}/>
        ))}
        {Array.from({ length: numEmptySpaces }).map((_, i) => (
            <div key={`empty-${i}`} className={styles['img__wrapper']}>
                <div className={styles['empty__camera']} />
            </div>
        ))}
      </div>
    );
});


//grid ordenable
export const SortableGrid = ({
    disableDrag,
    gridDevices= [],
    setGridDevices,
    defaultNumCams = 12
}) => {
    const [devicesImgError, setDevicesImgError] = useState([])

    //reordena imágenes
    const onSortEnd = ({ oldIndex, newIndex }) => {
        setGridDevices(arrayMoveImmutable(gridDevices, oldIndex, newIndex));
    };
    
    return(
        <SortableList 
            items={gridDevices}
            onSortEnd={onSortEnd}
            axis={'xy'}
            disabled={disableDrag}
            helperClass={styles['sortableHelper']} 
            devicesImgError={devicesImgError}
            setDevicesImgError={setDevicesImgError}
            defaultNumCams={defaultNumCams}
        />
    )
}