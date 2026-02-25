//styles
import styles from "../../loginPages.module.css"

//lib
import { useForm } from "../../../../../utils/customHooks/useForm/useForm";
import { useTranslation } from 'react-i18next';

//api
import { recuperarPassword2FA } from "../../../../../api/services/login";


export function EmailPassword({onSuccess,onGoBack}){

  //Translate
  const { t } = useTranslation();

  const [
    [
      [inpEmail,setInpEmail,errEmail,setErrEmail],
    ],{getFormValues,validateForEmptyFields}
  ] = useForm(["email"])


  //gestiona envío código al email
  async function handleSubmit(e){
    e.preventDefault()
        
    if( !validateForEmptyFields() ) return

    const payload = getFormValues()
    const response = await recuperarPassword2FA(payload.email)

    if(!response || response.error){
      setErrEmail(response?.message || t('errors.email'))
      return
    }
    
    onSuccess(payload.email)
  }



  return(

    <form className={styles['form__wrapper']} onSubmit={handleSubmit}>

      <div className={styles['form']}>

        <h2>{t('login.recover')}</h2>
        <p className={styles['description']}>{t('login.recoverDescription')}</p>

        <div>
          <input 
            type="email" 
            className={errEmail ? styles['form__input--error'] : ''} 
            placeholder={t('params.email')}
            value={inpEmail}
            onChange={e=>setInpEmail(e.target.value)}
            autoFocus
          />
          <span className={styles['error']}>{errEmail}</span>
        </div>
      </div>

      <button type="submit" className={styles['button']}>{t('buttons.sendCode')}</button>

      <button type="button" onClick={onGoBack} className={styles['return__button']}>{t('buttons.back')}</button>

    </form>
  )
}