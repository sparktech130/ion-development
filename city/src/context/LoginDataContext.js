import { createContext, useContext } from "react";

const LoginDataContext = createContext();
export default LoginDataContext

export const useLoginDataContext = ()=>{
  return useContext(LoginDataContext)
}

/* exmaple how to use

  const {
    codUsuario,
    permisos,
    username,
    fotoPerfil,
    token,
    licencias,
    isLoggedIn,

    //pedir login
    makeLogin,

    //pedir autenticacioon
    makeLogin2FA,

    //borrar valores del login
    logout
  } = useLoginDataContext()


*/
