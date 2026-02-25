import { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import { ObtenerLogin2FA, comprobar2FA, logoutAPI } from "../api/services/login";
import LoginDataContext from "./LoginDataContext";

import { smartcity_modules } from "../constants/common";

//Utils
import { stringToCoords } from "../components/Maps/MapV4/mapUtils";


export const LoginDataProvider = ({ children }) => {

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  //Traducción
  const { t } = useTranslation();

  //valores del usuario
  const [codUsuario, setCodUsuario] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [fotoPerfil, setFotoPerfil] = useState('');
  const [defaultCoords, setDefaultCoords] = useState(undefined);
  const [token,setToken] = useState('')
  const [server, setServer] = useState(undefined)

  //licencias
  const [defaultLicencias, setDefaultLicencias] = useState({}) //Módulos en los que no se comprueban las licencias
  const [licencias, setLicencias] = useState({}); //Formato: {'0015': {canales:5, cod_sector:'001'}, ...} - usos: (licencias['0015'] ? ...), (licencias['0015']?.canales) o con función checkLicenses
  const [licenciasBD, setLicenciasBD] = useState([]) //licencias en el formato que vienen de BD
  
  //permisos
  const [permisos, setPermisos] = useState('');  //cod_permiso
  const [permisosSecciones, setPermisosSecciones] = useState([]); //Todos los permisos usuario actual
  const [permisosSeccionActual, setPermisosSeccionActual] = useState(undefined) //Permisos de la seccion actual {acceso:true, consultas:false, editar:true, compartir:false} uso: permisosSeccionActual.conultas ? 


  //---------------------LOGIN------------------------------------------

  //logout
  async function logout(noCallAPI){
    localStorage.removeItem('temp_data')
    if(!noCallAPI){
      await logoutAPI()
    }
    window.location.reload()
  }


  async function makeLogin(username,password){
    const [response] = await ObtenerLogin2FA(username,password)

    if(response && response.cod_usuario){
      setCodUsuario(response.cod_usuario)
      setPermisos(response.permisos)
      setUsername(response.username)
      setEmail(response.email)
      setFotoPerfil(response.foto_perfil)
      setToken(response.token)

      return response
    }else if(response.error && !response.noConnection){
      return {error:true}
    }

    return undefined
  }

  async function makeLogin2FA(cod2fa){
    if(!codUsuario || codUsuario === "") return {logged: false}

    const isValid = await comprobar2FA(codUsuario,cod2fa)

    if((isValid.success === true) && !isValid.licencias?.error && Array.isArray(isValid.licencias)){
        setToken(isValid.token)
        setPermisosSecciones(isValid.permisos)
        setLicencias(formatLicencias(isValid.licencias));
        setDefaultCoords(stringToCoords(isValid.coordenadas))
        setServer(isValid.server)
        setIsLoggedIn(true)
        return {logged: true}
    }else{
        setIsLoggedIn(false)
        let message;
        if(isValid.success !== true){
          message = t('errors.code')
        }else{
          message = t('errors.request')
        }
        return {logged: false, message: message}
    }

  }

  //--------------------------LICENCIAS---------------------------------------------

  //Guarda los módulos que no necesitan licencia
  useEffect(() => {
    //añado conf, mantenimiento y seguridad
    let objeto = { '0108': {}, '0010': {}, '0109': {} };
    // añado los módulos que no necesitan licencia
    smartcity_modules.forEach(item => {
        if (item.noRequiresLicense) {
            objeto[item.code] = {}; // Añade en el mismo formato
        }
    });
    setDefaultLicencias(objeto)
  }, []);

  //setter para actualizar las licencias desde fuera del context
  const formatAndSetLicenses = (licencias) => {
    setLicencias(formatLicencias(licencias))
  }

  /*Da formato a las licencias para consultarlas fácilmente. 
    formato: {'0015': {canales:5, cod_sector:'001'}, ...}
    uso: (licencias['0015'] ? ...), (licencias['0015']?.canales) o con función checkLicenses
  */
  const formatLicencias = (licencias) => {
    setLicenciasBD(licencias)
    let formatLicenses = {...defaultLicencias};
    //si hay licencias
    if(licencias && Array.isArray(licencias) && licencias.length>0){
      //crea un objeto con las licencias {'0015':{canales:5}, ...}
      formatLicenses = licencias.reduce((objeto, licencia) => {
        //si es un tipo de licencia repetido sumo los canales
        if(objeto[licencia.cod_modulo]){
          objeto[licencia.cod_modulo].canales += licencia.canales || 0
        //si no la añado
        }else{
          objeto[licencia.cod_modulo] = {canales: licencia.canales || 0, cod_sector: licencia.cod_sector}
        }
        return objeto
      }, {...defaultLicencias}) //valor inicial del objeto
    }
    return formatLicenses
  }

  //Comprueba si hay licencias
  const checkLicenses = (cod_modulo, cod_sector) => {
    // Por cod_modulo
    if (cod_modulo && licencias[cod_modulo]) {
      return true;
    }
    // Por sector
    if (cod_sector) {
      return Object.values(licencias).some(licencia => parseInt(licencia.cod_sector) === parseInt(cod_sector));
    }
    return false;
  }


  //---------------------------PERMISOS----------------------------------------------

  //esto es solo para accesos (navbar, etc). para comprobar si tiene permisos cuando ya estás en la sección usar <CheckPermission></CheckPermission>

  //comprueba si tiene permiso de acceso.
  /* posibles params:
      cod_modulo - comprueba si tiene acceso a alguna seccion de ese modulo
      cod_front - comprueba si tiene acceso a esa seccion (traffic-live)
      cod_sector - comprueba si se tiene acceso a alguna sección del sector
  */
  const checkPermission = (cod_modulo, cod_front, cod_sector) => {
    let permiso = false
    try{
      //si es admin true
      if(permisos==='000001'){
        permiso = true
      //si es otro usuario
      }else if(Array.isArray(permisosSecciones) && permisosSecciones.length>0){
        permiso = permisosSecciones.some((item) => {
          // Si se pasan cod_front comprueba si tiene 'acceso' a la sección
          if (cod_front) {
            return (
              item.cod_front === cod_front &&
              item.acceso === 1
            );
          } else if (cod_modulo) {
            // Si solo se pasa cod_modulo, comprueba si tiene acceso a alguna seccón de ese módulo
            return (
              item.cod_modulo === cod_modulo &&
              item.acceso === 1
            );
            //si solo se pasa el cod_sector comprueba si tiene acceso a alguna sección del sector
          } else if (cod_sector){
            return (
              item.cod_sector === cod_sector &&
              item.acceso === 1
            );
          }
          return false;
        });
      }
      return permiso
    }catch{
      return false
    }
  }

  //devuelve el cod_front de una seccion a la que tenga permiso de acceso del modulo
  const getSectionWithPermission = (cod_modulo, nombre_modulo) => {
    let seccion = undefined
    try{
       if(Array.isArray(permisosSecciones) && permisosSecciones.length>0){
        seccion = permisosSecciones.find((item) => {
          if (cod_modulo) {
            return (
              item.cod_modulo === cod_modulo &&
              item.acceso === 1
            );
            //si solo se pasa el cod_sector comprueba si tiene acceso a alguna sección del sector
          } else if (nombre_modulo){
            return (
              item.nombre_modulo === nombre_modulo &&
              item.acceso === 1
            );
          }
          return false;
        });
      }
      return seccion?.cod_front
    }catch{
      return undefined
    }
  } 

  return (
    <LoginDataContext.Provider
      value={{ 
        //valores del usuario
        codUsuario,
        username,
        email,
        fotoPerfil,
        defaultCoords,
        server,
        token, setToken,
        isLoggedIn,

        //licencias
        licencias, setLicencias, licenciasBD,
        formatLicencias, formatAndSetLicenses,
        checkLicenses,

        //permisos
        permisos,
        permisosSecciones, setPermisosSecciones,
        checkPermission,
        getSectionWithPermission,
        permisosSeccionActual, setPermisosSeccionActual,

        //pedir login
        makeLogin,

        //pedir autenticacioon
        makeLogin2FA,

        //borrar valores del login
        logout
        }}
      >
      {children}
    </LoginDataContext.Provider>
  );
};