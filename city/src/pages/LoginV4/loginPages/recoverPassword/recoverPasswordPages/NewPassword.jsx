import { useState } from "react";
import { useTranslation } from "react-i18next";

//styles
import styles from "../../loginPages.module.css"

//utils
import { useForm } from "../../../../../utils/customHooks/useForm/useForm";

//Api
import { cambiarPassword2FA } from "../../../../../api/services/login";

//components
import { InputPassword } from "../../../../../components/InputPassword/InputPassword";


export function NewPassword({email, code, onGoBack}){

  //Translate
  const { t } = useTranslation();

  const [isSuccess,setIsSuccess] = useState(false)

  const [
    [
      [inpPassword,setInpPassword,errPassword],
      [inpPassword2,setInpPassword2,errPassword2],
    ],{getFormValues,validateForEmptyFields,validateForValidFields}
  ] = useForm(["password","password2"])


  //Api cambiar contraseña
  async function handleSubmit(e){
    e.preventDefault()
    
    if( ! validateForEmptyFields() ) return
    if( ! validateForValidFields() ) return
    
    const payload = getFormValues()
    await cambiarPassword2FA(email,payload.password,code)
    
    setIsSuccess(true)
  }


  return <>

    {isSuccess &&
        <div className={styles['form__wrapper']}>

          <div className={styles['form']}>
            <h2>{t('login.recover')}</h2>
            <p className={styles['description']}>{t('login.recoverSuccess')}</p>
          </div>

          <button onClick={onGoBack} className={styles['button']}>{t('login.login')}</button>
        </div>
    }

    {!isSuccess && 
      <>
        <form className={styles['form__wrapper']} onSubmit={handleSubmit}>

          <div className={styles['form']}>

            <h2>{t('login.recover')}</h2>

            <div className={styles['Login__form__input__wrapper']}>
              <InputPassword
                placeholder={t('placeholders.newPassword')}
                value={inpPassword}
                onChange={e=>setInpPassword(e.target.value)}
                className={errPassword ? styles['form__input--error'] : ""}
              />
            </div>

            <div className={styles['Login__form__input__wrapper']}>
              <InputPassword
                placeholder={t('placeholders.repeatNewPassword')}
                value={inpPassword2}
                onChange={e=>setInpPassword2(e.target.value)}
                className={errPassword2 ? styles['form__input--error'] : ""}
              />
              {((errPassword || errPassword2)) ?
                    <span className={styles['error']}>{t(errPassword2 || errPassword)}</span>
                : null
              }
            </div>

          </div>

          <button type="submit" className={styles['button']}>{t('buttons.resetPassword')}</button>

          <button type="button" onClick={onGoBack} className={styles['return__button']}>{t('buttons.back')}</button>

        </form>



      </>
    }

  </>
}