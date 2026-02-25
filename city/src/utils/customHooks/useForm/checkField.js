/** @author eloifabrega@ionsmart.eu */

// no traducido!!

const ERR_NOVALID = "No valido"
const REDUCED_CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.'

// >> npm i libphonenumber-js
// import { parsePhoneNumber, AsYouType } from 'libphonenumber-js'

// export function normalizePhoneNumber(phone,doubleCheck=false) {
//   try {
//     // Create an AsYouType instance to format the input
//     const asYouType = new AsYouType();

//     // Input phone number without spaces and dashes
//     const normalizedPhone = phone.replace(/[\s-]/g, '');

//     // Parse the phone number
//     const phoneNumber = parsePhoneNumber(normalizedPhone);

//     if (phoneNumber.isValid()) {
//       // Format the parsed phone number with the country code
//       return asYouType.input(`+${phoneNumber.countryCallingCode}${phoneNumber.nationalNumber}`);
//     }
//   } catch (error) {
//     // Invalid phone number
//   }

//   if(!doubleCheck) return normalizePhoneNumber("+34"+phone,true)
//   return undefined;
// }



export function checkField(value,_setErr,validator,isLooping = false){
  let valid = true
  let hasError = false
  let hasExecutedSetErr = false
  
  function setErr(err=ERR_NOVALID){
    hasExecutedSetErr=true
    valid = false
    if(hasError) return false // no valid
    
    hasError=true
    _setErr(err)
  }


  if(typeof(validator) === "string"){
    const validatorStr = validator.toLowerCase()

    // if(validatorStr === "phone"){
    //   if(normalizePhoneNumber(value)===undefined){
    //     setErr(ERR_NOVALID)
    //   }
    // }else 
    if(validatorStr === "dni"){
      if(!isDniNieValid(value)){
        setErr(ERR_NOVALID)    
      }
  
    }else  if(validatorStr === "email"){
      if(!validateEmail(value)){
        setErr(ERR_NOVALID)    
      }
  
    }else if(validatorStr === "reducedchars"){
      const regex = new RegExp(`[^${REDUCED_CHARS}]`);
      const match = value.match(regex);

      if(match){
        setErr(`Caracter ${match[0]} no permitido`)
      }
    }else if(validatorStr === "lowercase"){
      if(/[A-Z]/.test(value)){
        setErr(`Mayúsculas no permitidas`)
      }
    }


  // OBJETO
  }else if(typeof(validator) === "object" && validator.type){
    const {type,n} = validator

    if(type==="minlength" && n){
      if(value.length<n){
        setErr(`Mínimo ${n} caracteres`)
      }
    }else if(type === "maxlength" && n){
      if(value.length>n){
        setErr(`Máximo ${n} caracteres`)
      }
    }

  }else if(typeof validator === "function"){
    hasExecutedSetErr=false
    const validValidator = validator(value,setErr)
    if(!hasExecutedSetErr && !validValidator){
      setErr()
    }

  // VALIDATOR LIST check recursibely
  }else if(Array.isArray(validator)){
    for (const validation of validator) {
      const currentValid = checkField(value,setErr,validation,true) 
      valid = currentValid && valid
    }
    if(valid){
      setErr("")
      return true
    }else{
      return false
    }
  }

  
  
  if(valid && !isLooping){
    _setErr("")
  }
  return valid
}


export function validateEmail(email) {
  const regex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return regex.test(email);
}



export function isDniNieValid(id) {
  // Remove spaces and convert to uppercase
  id = id.replace(/\s/g, '').toUpperCase();

  // Regular expressions for valid DNI and NIE formats
  const dniRegex = /^[0-9]{8}[A-Z]$/;
  const nieRegex = /^[XYZ][0-9]{7}[A-Z]$/;

  if (dniRegex.test(id)) {
    // Check validity of DNI
    const letter = 'TRWAGMYFPDXBNJZSQVHLCKE';
    const lastChar = id.charAt(8);
    const num = parseInt(id, 10);
    return letter.charAt(num % 23) === lastChar;
  } else if (nieRegex.test(id)) {
    // Check validity of NIE
    const nieFirstChar = id.charAt(0);
    const nieNum = id.substr(1, 7);
    const nieLastChar = id.charAt(8);

    let firstCharNum;
    if (nieFirstChar === 'X') {
      firstCharNum = 0;
    } else if (nieFirstChar === 'Y') {
      firstCharNum = 1;
    } else if (nieFirstChar === 'Z') {
      firstCharNum = 2;
    }

    const fullNIE = firstCharNum + nieNum;

    return 'TRWAGMYFPDXBNJZSQVHLCKE'.charAt(fullNIE % 23) === nieLastChar;
  } else {
    return false; // Neither DNI nor NIE format
  }
}
