//styles
import styles from "../../loginPages.module.css"

//Utils
import { useForm } from "../../../../../utils/customHooks/useForm/useForm";
import { useTranslation } from "react-i18next";
import { formatCode2FA } from '../../../utils/formatCode2FA';

//api
import { comprobar2FA, recuperarPassword2FA } from "../../../../../api/services/login";
import { ResendCodeBtn } from "../../../utils/ResendCodeBtn/ResendCodeBtn";


export function CodePassword({email, onSuccess, onGoBack}){

  //Translate
  const { t } = useTranslation();

  const [
    [
      [inpCode,setInpCode,errCode,setErrCode],
    ],{getFormValues,validateForEmptyFields}
  ] = useForm(["code2fa"])


  //----------------------FUNCIONES----------------------------------

  //Enviar código a back
  async function handleSubmit(e){
    e.preventDefault()
        
    if( ! validateForEmptyFields() ) return

    const payload = getFormValues()
    const isValid = await comprobar2FA(undefined,payload.code2fa,email)
    
    if(!isValid.success){
      setErrCode(t('errors.code'))
      return
    }

    onSuccess(payload.code2fa)
  }

  //Gestiona escribir en input
  function handleCodeChange(e){
    e.preventDefault();
    const inputValue = e.target.value.trim();
    const key = e.nativeEvent.data
    setInpCode(prev=>formatCode2FA(inputValue,key,prev))
  }

  //Reenviar código a email
  async function handleResendCode(e){
    e.preventDefault()
    await recuperarPassword2FA(email)
  }


  return(

    <form className={styles['form__wrapper']} onSubmit={handleSubmit}>

      <div className={styles['form']}>

        <h2>{t('login.recover')}</h2>
        <p className={styles['description']}>{t('login.2faEmailDescription')}<span style={{fontWeight: 'var(--bold)' }}>{email}</span></p>

        <div>
          <input 
            type="text" 
            className={errCode ? styles['form__input--error'] : ''} 
            placeholder="2FA"
            value={inpCode}
            onChange={handleCodeChange}
            autoFocus
          />
          <span className={styles['error']}>{errCode}</span>
          <ResendCodeBtn text={t('login.codeNotReceived')} call={handleResendCode} />
        </div>
      </div>

      <button type="submit" className={styles['button']}>{t('buttons.authenticate')}</button>

      <button type="button" onClick={onGoBack} className={styles['return__button']}>{t('buttons.back')}</button>

    </form>

  )
}



