import React, { useContext, useState, useEffect, useRef } from 'react'
import ReactDOM from 'react-dom';
import styles from './NavOption.module.css'

//Components
import { AccesibleIcon } from '@components/AccesibleIcon/AccesibleIcon'
import { Tree } from './Tree/Tree';

//context
import { MainDataContext } from '../../../../context/MainDataContext'
import { useLoginDataContext } from '../../../../context/LoginDataContext'

//Utils
import { handleKey } from '../../../../utils/functions/accessibility'

//Assets
import arrow from "@icons/actions/arrow.svg?react"



export const NavOption = ({

    //Básicos
    icon, //icono
    optionSection, //nombre seccion (ej: traffic-live)
    text, //texto
    expanded, //si la navbar está expandida
    action = () => { }, //onclick

    //Submenú
    children, //otros navOptions si es el wrapper
    wrapperOption, //true/false - Si es una navOptoin contenedora
    subOption, //si es una sub opción true/false

    //Separadores
    separator, //pone un separador antes
    separatorBottom, // pone separador después

    //notificaciones
    showAlert,
    forceSelected, //la fuerza a mostrarse seleccionada

    //control permisos (pasar máximo 1 param de estos)
    cod_modulo, //comprueba si tiene acceso a alguna seccion del modulo
    isSection, //comprueba si tiene acceso a la sección.
    cod_sector, //comprueba si tiene acceso a alguna seccion de ese sector
}) => {

    //context
    const { permisosSecciones, checkPermission, checkLicenses } = useLoginDataContext()
    const { section } = useContext(MainDataContext);

    //variables
    const [submenu, setSubmenu] = useState(false);
    const [permiso, setPermiso] = useState(false)
    const [selected, setSelected] = useState(false)
    const [numSubOptions, setNumSubOptions] = useState(0)
    const [tooltipPosition, setTooltipPosition] = useState({})
    const [navbarExpanded, setNavbarExpanded] = useState(expanded)

    //Ref
    const optionRef = useRef()


    //--------------------------------PERMISOS-----------------------------------------

    //comprueba estado permisos/licencias
    useEffect(() => {
        //seccion
        if (isSection){
            setPermiso(checkPermission(null, optionSection))
        //modulo
        } else if(cod_modulo) {
            setPermiso(checkLicenses(cod_modulo) && checkPermission(cod_modulo))
        //sector
        } else if(cod_sector) {
            setPermiso(checkLicenses(null, cod_sector) && checkPermission(null, null, cod_sector))
        //contenedor de secciones (permisos de sus hijos)
        }else if(wrapperOption && children){
                let permiso = false
                let numOptionsTrue = 0
                React.Children.forEach(children, child => {
                    if (React.isValidElement(child) && child?.props?.optionSection) {
                        if(child?.props.isSection){
                            let status = checkPermission(null, child.props.optionSection)
                            if(status){
                                permiso = true
                                numOptionsTrue += 1
                            }  
                        }else{
                            permiso = true
                            numOptionsTrue += 1
                        }                 
                    }
                });
                //Se guarda cuantas tienen permisos para mostrar ese número de ramas del Tree
                setNumSubOptions(numOptionsTrue)
                setPermiso(permiso)
        //por defecto
        } else {
            setPermiso(true)
        }
        //eslint-disable-next-line
    }, [permisosSecciones])


    //--------------------------------FUNCIONES-----------------------------------------

    //Click
    const handleClick = () => {
        //NavOption contenedora: abre lista
        if(wrapperOption){
            setSubmenu(!submenu)
            positionTooltip()
        }
        action()
    }

    //Click subOption: cierra el subMenú
    const handleClickSubOption = () => {
        setSubmenu(false)
    }

    //Guarda posición de navOption contenedora clicada. Para posicionar el tooltip cuando la navbar está contraída
    const positionTooltip = () => {
        if (optionRef.current) {
            const rect = optionRef.current.getBoundingClientRect();
            setTooltipPosition({left:'23px', top:(rect.bottom || 0) + 2})
        }
    };

    //--------------------------------USE EFFECT-----------------------------------------


    //gestiona si se le asigna clase seleccionada
    useEffect(()=>{
        //forzada
        if(forceSelected){
            return true
        //WrapperOption: Si está seleccionada una navOption hija
        }else if(wrapperOption && children){
            let selected = false
            React.Children.forEach(children, child => {
                if (React.isValidElement(child) && child?.props?.optionSection) {
                    if(child?.props?.optionSection === section){
                        selected = true
                    }                      
                }
                setSelected(selected)
            });
        //normal
        }else if(optionSection === section){
            setSelected(true)
        }else{
            setSelected(false)
        }
    //eslint-disable-next-line
    },[section, optionSection, forceSelected])

    //Control navbar expandida/contraída
    useEffect(()=>{
        //Cierro tooltip al contraer/extender navbar para que no quede mal posicionado. Se hace así clonando expanded para que no se vea un momento como cambia antes de contraerse
        setSubmenu(false)
        setNavbarExpanded(expanded)
    },[expanded])



    return (
        <>
            {permiso &&
                <>
                    {separator && <div className={styles['separator']}>{ }</div>}


                    {/* NavOption */}
                    <div
                        onClick={handleClick}
                        onKeyDown={(e)=>handleKey(e, handleClick)}
                        tabIndex={-1}
                        className={styles['navOption'] + " " + (selected ? styles['navOption--selected'] : "") + ' ' + (subOption ? styles['subOption'] : '')}
                        ref={optionRef}
                    >
                        
                        {/* Borde seleccionada */}
                        <div className={(!subOption && selected) ? styles['navOption__border'] : ""} >{ }</div>
                        
                        {/* Icono */}
                        <AccesibleIcon customStyle={styles['accesible__icon']} src={icon} alt={text} text={(!navbarExpanded && !subOption) ? text : ''} textPosition={{ transform: 'translate(32px, -36px)' }} />

                        {/* Texto */}
                        <p className={(!navbarExpanded && !subOption) ? styles['hide__text'] : ''}>{text}</p>
                        {showAlert && <div className={styles['alerta']}></div>}

                        {/* Flecha submenú */}
                        {wrapperOption && children &&
                            <div className={styles['arrow'] + ' ' + (submenu ? styles['arrow--opened'] : '')}>
                                <AccesibleIcon src={arrow} tabIndex={-1} />
                            </div>
                        }

                    </div>

                    
                    {/* Submenú */}
                    {submenu && wrapperOption && children &&
                        <React.Fragment>
                            {navbarExpanded ?
                                <div className={styles['subMenu']} onClick={handleClickSubOption}>
                                    <Tree numOptions={numSubOptions} isTooltip={false} />
                                    {children}
                                </div>
                            :
                                ReactDOM.createPortal(
                                    <div className={styles['subMenu--popup']} style={tooltipPosition} onClick={handleClickSubOption}>
                                        <Tree numOptions={numSubOptions} isTooltip={true} />
                                        {children}
                                    </div>,
                                    document.body
                                )
                            }
                        </React.Fragment>
                    }


                    {separatorBottom && <div className={styles['separator']}>{ }</div>}
                </>
            }
        </>
    )
}