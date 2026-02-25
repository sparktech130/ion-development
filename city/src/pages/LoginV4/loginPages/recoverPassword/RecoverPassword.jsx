//lib
import { useState } from "react";

//components
import { EmailPassword } from "./recoverPasswordPages/EmailPassword";
import { CodePassword } from "./recoverPasswordPages/CodePassword";
import { NewPassword } from "./recoverPasswordPages/NewPassword";

//constants
const PAGES = {
  SEND_EMAIL:"sendEmail",
  CODE_2FA:"code2fa",
  NEW_PWD:"newPassword"
}


export function RecoverPassword({ onGoBack }){

  const [page,setPage] = useState(PAGES.SEND_EMAIL)
  const [email,setEmail] = useState("")
  const [code,setCode] = useState("")


  //Gestionar introducir email
  function handleSetEmail(email){
    setPage(PAGES.CODE_2FA)
    setEmail(email)
  }

  //gestionar introducir código
  function handleSetCode(code){
    setPage(PAGES.NEW_PWD)
    setCode(code)
  }


  return <>

    {page === PAGES.SEND_EMAIL &&
      <EmailPassword onSuccess={handleSetEmail} onGoBack={onGoBack} />
    }

    {(page === PAGES.CODE_2FA && email!=="") &&
      <CodePassword onSuccess={handleSetCode} email={email} onGoBack={onGoBack}/>
    }

    {(page === PAGES.NEW_PWD && email!=="" && code!=="" ) &&
      <NewPassword email={email} code={code} onGoBack={onGoBack} />
    }

  </>
}