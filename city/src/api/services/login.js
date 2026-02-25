import { URL_AUHT_CAMBIAR_PWD_2FA, URL_AUTH_COMPROBAR_2FA, URL_AUTH_LOGIN, URL_AUTH_LOGOUT, URL_AUTH_RECUPERAR_PWD } from "../connections/urls";
import {getRequestAPI} from '../../context/accesContext'

export async function ObtenerLogin2FA(username, password){
  //request de login
  const loginPromise = ObtenerLogin(username, password);

  const [loginResponse] = await Promise.all([loginPromise]);
  return [loginResponse]
}

//01.login2.php
export async function ObtenerLogin(username, password){
  const requestAPI = getRequestAPI();
  const response = await requestAPI(URL_AUTH_LOGIN,{
      login:username,
      password:password
  })

  if(response.error) return {error:true,...response}
  return response
}

//2o paso de 2 Factor Autentification 2FA
//comprueba si el codigo corresponde con el enviado por correo
export const comprobar2FA = async (cod_usuario, cod_2fa, email = undefined) => {
  const requestAPI = getRequestAPI();
  const response = await requestAPI(URL_AUTH_COMPROBAR_2FA,{
    cod_usuario:cod_usuario,
    cod_autenticacion:cod_2fa,
    email:email
  })

  return response
}

export const logoutAPI = async () => {
  try{
    const requestAPI = getRequestAPI();
    await requestAPI(URL_AUTH_LOGOUT)
  }catch{
    //
  }
}

// Envía un correo con un código 2FA al usuario recibido
export const recuperarPassword2FA = async (email) => {
  const requestAPI = getRequestAPI();
  const response = await requestAPI(URL_AUTH_RECUPERAR_PWD,{
    email:email
  })

  if(response.error) return undefined
  return response
}

// Cambia la contraseña del usuario si el cod_autenticacion es correcto
export const cambiarPassword2FA = async (email, newPassword, cod_auth) => {
  const requestAPI = getRequestAPI();
  const response = await requestAPI(URL_AUHT_CAMBIAR_PWD_2FA,{
    email:email,
          password:newPassword,
          cod_autenticacion:cod_auth
  })

  if(response.error) return undefined
  return response

}