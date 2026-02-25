import { useMemo, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next';

//Styles
import styles from './Login.module.css'

//Components
import { MainIcon } from '../Dashboard/Navbar/MainIcon'
import { LoginForm } from './loginPages/LoginForm'
import { Login2FA } from './loginPages/Login2FA'
import { RecoverPassword } from "./loginPages/recoverPassword/RecoverPassword"

//Icons
import worldIcon from '@icons/navbar/world.svg?react'

//Constants
import { version, idiomas } from '../../constants/common'
import { AccesibleIcon } from '../../components/AccesibleIcon/AccesibleIcon';

//utils
import { handleKey } from '../../utils/functions/accessibility';



export const Login = () => {

    //---------------------CONSTANTES------------------------------------------

    const { i18n, t } = useTranslation();

    const PAGES = {
        LOGIN:'AUTENTICACIÓN',
        DFA:"2FA",
        FORGOT:"RECUPERACIÓN",
    }

    const year = useMemo(()=> { return new Date().getFullYear()}, [])


    //---------------------VARIABLES------------------------------------------

    const [page, setPage] = useState(PAGES.LOGIN)
    const [loginPayload, setLoginPayload] = useState({})
    const [isCapsLockActive, setIsCapsLockActive] = useState(false)
    const [languageOpen, setLanguageOpen] = useState(false)


    //---------------------FUNCIONES------------------------------------------

    //Cambia a la page 2FA cuando se hace login
    function handleLogin(payload){
        setPage(PAGES.DFA)
        setLoginPayload(payload) // guardar datos solo para el caso de que el usuario solicita otro codigo en el correo
    }
    
    
    //----------------USEEFFECT----------------------------------------------

    //Evento para comprobar si está el 'Bloq mayús' activado
    useEffect(()=>{
        const checkCapsLock = (event) => {
            const isCaps = event.getModifierState && event.getModifierState('CapsLock');
            setIsCapsLockActive(isCaps);
        };
        document.addEventListener('keydown',checkCapsLock)
        return ()=>document.removeEventListener('keydown',checkCapsLock)
    },[])

    //--------------------ONCLICK---------------------------------------

    const onClickLanguageSelector = () => {
        setLanguageOpen(!languageOpen)
    }

    return(
        <div className={styles['wrapper']}>

            {/* Imágen fondo */}
            <img className={styles['background']} src={'images/smartcity.webp'} alt="Imágen de fondo" loading='lazy' />

            {/* Navbar login */}
            <div className={styles['navbar']}>

                {/* Header */}
                <div className={styles['header']}>
                    <MainIcon />
                    <div className={styles['language']+' '+(languageOpen ? styles['language--open'] : '')} onClick={onClickLanguageSelector} tabIndex={0} onKeyDown={e=>handleKey(e, onClickLanguageSelector)}>
                        <AccesibleIcon src={worldIcon} />
                        <h3>{idiomas?.find(item=>item.cod===i18n.language)?.name || 'Español'}</h3>
                        <div className={styles['language__selector']} tabIndex={-1}>
                            {idiomas?.map(item=>(
                                <p className={item.cod===i18n.language ? styles['language--selected'] : ''} key={item.cod} onClick={()=>i18n.changeLanguage(item.cod)} tabIndex={languageOpen ? 0 : -1} onKeyDown={e=>handleKey(e, ()=>i18n.changeLanguage(item.cod))}>{item.name}</p>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Login */}
                <div className={styles['login']}>

                    <div className={styles['login__header']}>
                        <h2>ION SMART</h2>
                        <h3>{t('login.slogan')}</h3>
                    </div>

                    {page === PAGES.LOGIN &&
                        <LoginForm onSuccess={handleLogin} onClickForgot={()=>setPage(PAGES.FORGOT)} isCapsLockActive={isCapsLockActive} />
                    }
                    {page === PAGES.DFA &&
                        <Login2FA loginData={loginPayload} onGoBack={()=>setPage(PAGES.LOGIN)}/>
                    }
                    {page === PAGES.FORGOT &&
                        <RecoverPassword onGoBack={()=>setPage(PAGES.LOGIN)}/>
                    }
                </div>

                {/* Footer */}
                <div className={styles['footer']}>
                    <p>{version}</p>
                    <p>ION SMART {year} ©</p>
                </div>

            </div>

        </div>
    )
}