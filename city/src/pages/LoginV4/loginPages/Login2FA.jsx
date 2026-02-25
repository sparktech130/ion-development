import { useState } from "react";
import { useTranslation } from 'react-i18next';

//styles
import styles from "./loginPages.module.css"

//Utils
import { useForm } from "../../../utils/customHooks/useForm/useForm";
import { formatCode2FA } from "../utils/formatCode2FA"
import { ResendCodeBtn } from "../utils/ResendCodeBtn/ResendCodeBtn.jsx";

//Context
import { useLoginDataContext } from "../../../context/LoginDataContext.js";


export function Login2FA({
    loginData,
    onGoBack
}) {

    //----------------------VARIABLES-------------------------------

    const { makeLogin2FA, makeLogin } = useLoginDataContext()

    //Translate
    const { t } = useTranslation();

    const [loginIn, setLoginIn] = useState(false)

    const [
        [
            [inpCode, setInpCode, errCode, setErrCode],
        ], { getFormValues, validateForEmptyFields }
    ] = useForm(["code2fa"])


    //--------------------FUNCIONES--------------------------------

    async function handleSubmit(e) {

        //Bloqueamos el botón de acceder para evitar múltiples llamadas
        setLoginIn(true)

        e.preventDefault()

        if (!validateForEmptyFields()){
            setLoginIn(false)
            return
        } 

        const payload = getFormValues()
        const isValid = await makeLogin2FA(payload.code2fa)

        if (!isValid.isLogged) {
            setLoginIn(false)
            setErrCode(isValid.message || t('errors.code'))
            return
        }
    }

    async function handleResendCode(e) {
        e?.preventDefault()
        await makeLogin(loginData.name, loginData.password)
    }

    function handleCodeChange(e) {
        e.preventDefault();
        const inputValue = e.target.value.trim();
        const key = e.nativeEvent.data
        setInpCode(prev => formatCode2FA(inputValue, key, prev))
    }


    return(

        <form className={styles['form__wrapper']} onSubmit={handleSubmit}>
            <div className={styles['form']}>
                <h2>2FA</h2>
                <p className={styles['description']}>{t('login.2faDescription')}</p>

                <div>
                    <input
                        type="text"
                        className={errCode ? styles['form__input--error'] : ""}
                        placeholder="2FA"
                        value={inpCode}
                        onChange={handleCodeChange}
                        autoFocus
                    />
                    <span className={styles['error']}>{errCode}</span>
                    <ResendCodeBtn text={t('login.codeNotReceived')} call={handleResendCode} />
                </div>

            </div>

            <button type="submit" className={`${styles['button']}  ${loginIn ? styles['button--disabled'] : ''}`}>{t('buttons.authenticate')}</button>
            <button type="button" onClick={onGoBack} className={styles['return__button']}>{t('buttons.back')}</button>

        </form>
    )
}