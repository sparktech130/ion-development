
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

//Styles
import styles from "../../loginPages/loginPages.module.css"


//solo deja ejecutar el call cuando han pasado 30 segundos
export function ResendCodeBtn({
  text,
  call,
  seconds = 30
}){

  //------------------VARIABLES-------------------------------------

  const { t } = useTranslation();

  const timeout = seconds * 1000 //30 seconds
  const [disableTimestamp,setDisableTimestamp] = useState(new Date())
  const [remaining, setRemaining] = useState(Math.floor(timeout/1000))
  const [disabled,setDisabled] = useState(true)


  //---------------------USE EFFECT--------------------------------

  //se ejecuta cada segundo para actualizar el contador
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const dif = (now - disableTimestamp)

      if (dif >= timeout) {
        clearInterval(timer)
        setDisabled(false)
      }else{
        setRemaining(Math.floor((timeout - dif)/1000))
      }
    }, 1000)

    return () => clearInterval(timer)
  //eslint-disable-next-line
  }, [disableTimestamp]);


  //-------------------------FUNCIONES--------------------------

  //OnClick
  function handleCall(e){
    const now = new Date()
    if((now - disableTimestamp) > timeout){
      call(e)
      setDisableTimestamp(now)
      setDisabled(true)
    }
  }

  return(
    <button
      type="button"
      onClick={(e)=>handleCall(e)} 
      className={styles['forgotten__password']} 
      title={disabled ? t('login.waitToResend', {seconds: remaining}) : ""}
      disabled={disabled}
    >
      {text}
    </button>
  )
}