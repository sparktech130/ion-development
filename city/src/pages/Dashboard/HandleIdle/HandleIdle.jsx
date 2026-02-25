import { useState, useEffect } from 'react'
import { useIdleTimer } from 'react-idle-timer'
import { useTranslation } from 'react-i18next'

//components
import { TextModal } from '../../../components/TextModal/TextModal'

//context
import { useLoginDataContext } from '../../../context/LoginDataContext'


//control cierre sesión por inactividad
export default function HandleIdle() {

  //Context
  const { logout } = useLoginDataContext();
  const {t} = useTranslation()

  //Control inactividad
  const [inactivo, setInactivo] = useState(false);
  const [temporizadorCerrarSesion, setTemporizadorCerrarSesion] = useState(null);


  //------------------PARAMETROS API IDLETIMER---------------------------------

  //si te quedas inactivo
  const onIdle = () => {
    setInactivo(true);
  };

  //si dejas de estar inactivo
  const onActive = () => {
    setInactivo(false);
  };

  //no eliminar. Sí se usa. configuracion idle (ejecuta onIdle a los 30 minutos: 60_000 * 30)
  //eslint-disable-next-line
  const idleTimer = useIdleTimer({
    onIdle,
    onActive,
    timeout: 60_000 * 30,
    throttle: 5000,
  });

  //-------------------------USEEFFECT-------------------------------------------
 
  //Control cierre sesión
  useEffect(()=>{
    //cuando sale mensaje 'cerrando sesión por inactividad' doy 5 segundos para mover raton antes de hacer logout
    if(inactivo){
          setTemporizadorCerrarSesion(setTimeout(() => {logout()}, 5000));
    //si mueve el raton cancelo el cerrar sesión
    }else{
        if (temporizadorCerrarSesion !== null) {
            clearTimeout(temporizadorCerrarSesion);
        }
    }
  // eslint-disable-next-line
  },[inactivo])

  
  return (
    <>
        {inactivo && <TextModal zIndex={100} title={t('titles.info')}>{t('messages.sessionTimeout')+"..."}</TextModal>}
    </>
  );
}