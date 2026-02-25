
//Styles
import styles from "./loginPages.module.css"

//Librerías
import { useState } from "react";
import { useTranslation } from 'react-i18next';

//Utils
import { useForm } from "../../../utils/customHooks/useForm/useForm";

//components
import { InputPassword } from "../../../components/InputPassword/InputPassword";

//context
import { useLoginDataContext } from "../../../context/LoginDataContext";



export function LoginForm({
    onSuccess, //Gestionar cuando el login es correcto para pasar a página 2FA
    onClickForgot, //Click 'he olvidado contraseña'
    isCapsLockActive //control si está el teclado en mayúsculas
}) {

    //--------------------VARIABLES---------------------------------

    //Context
    const { makeLogin } = useLoginDataContext()

    //Translate
    const { t } = useTranslation();

    //Estado autentiación
    const [loginIn, setLoginIn] = useState(false)

    //Inputs
    const [
        [
            [inpLogin, setInpLogin, errInpLogin],
            [inpPassword, setInpPassword, errPassword, setErrPassword],
        ], { getFormValues, validateForEmptyFields }
    ] = useForm(["name", "password"])


    //---------------FUNCIONES----------------------------------

    //OnClick 'Iniciar sesión'
    async function handleSubmit(e) {

        //Bloqueamos el botón de login para evitar múltiples llamadas
        setLoginIn(true)

        e?.preventDefault()

        //Control inputs vacíos
        if (!validateForEmptyFields()) {
            setLoginIn(false)
            return
        }

        //pide el login
        const payload = getFormValues()
        const userData = await makeLogin(payload.name, payload.password)

        //control errores
        if (userData?.error) {
            setLoginIn(false)
            setErrPassword(t('errors.credentials'))
            return
        } else if (!userData?.cod_usuario) {
            setLoginIn(false)
            setErrPassword(t('errors.request'))
            return
        }

        //Pasa a page 2FA
        setLoginIn(false)
        onSuccess(payload)
    }

    //OnClick 'He olvidado contraseña'
    function handleGoToForgot(e) {
        e?.preventDefault()
        onClickForgot()
    }


    return (

        <form className={styles['form__wrapper']} onSubmit={handleSubmit}>
            <div className={styles['form']}>
                <h2>{t('login.login')}</h2>
                <div style={{ display: 'flex', flexFlow: 'column nowrap', gap: '10px' }}>
                    <input
                        type="text"
                        className={errInpLogin ? styles['form__input--error'] : ""}
                        placeholder={t('params.user')}
                        value={inpLogin}
                        onChange={e => setInpLogin(e.target.value)}
                        autoFocus
                        autoComplete="username"
                    />

                    <div>
                        <InputPassword
                            value={inpPassword}
                            onChange={e => setInpPassword(e.target.value)}
                            className={errPassword ? styles['form__input--error'] : ""}
                        />
                        {
                            (errPassword || errInpLogin || isCapsLockActive) ?
                                <span className={styles['error']}>{errPassword || errInpLogin || t('errors.capsLockOn')}</span>
                                : null
                        }
                        <button type='button' onClick={handleGoToForgot} className={styles['forgotten__password']}>{t('login.forgotten')}</button>
                    </div>


                </div>
            </div>
            <button type='submit' className={`${styles['button']} ${loginIn ? styles['button--disabled'] : ''}`}>{t('buttons.login')}</button>
        </form>
    )
}