/** @author eloifabrega@ionsmart.eu */

const SPECIAL_CHARACTERS = "!@#$%^&*()_-+={}[]|:;\"<>,.?/~\\`"


//validar par de contraseñas
export function validatePasswordPair(password1, password2) {
  //return [true,"",""] //skip only for development
  const [firstValid,err1] = validatePassword(password1)
  let err2 = (password1 === password2) ? "" : "errors.mismatch"
  const isAllValid = firstValid && err2===""

  //[false,"Minimo 2 caracteres","No coinciden"]
  //[true,"",""]
  return [isAllValid,err1,err2]
}


//validar una contraseña para que contenga todos los requisitos
export function validatePassword(password){
  const hasMinimumLength = password.length>=6
  const hasLowercase = /[a-z]/.test(password)
  const hasUppercase = /[A-Z]/.test(password)
  const hasNumber = /[0-9]/.test(password)
  const hasSpecialCharacter = password.split("").some(x => SPECIAL_CHARACTERS.includes(x))

  let err1 = ""

  if (!hasMinimumLength) {
    err1 = 'errors.passwordMinLength'
  }else if(!hasLowercase){
    err1="errors.passwordLowerCase"
  }if (!hasSpecialCharacter && !hasUppercase && !hasNumber) {
    err1 = "errors.passwordRequirements"
  }

  //[true,""]
  //[false,"Minimo una minuscula"]
  return [err1==="",err1]
}