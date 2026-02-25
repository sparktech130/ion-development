/** @author eloifabrega@ionsmart.eu */

//Lib
import { useState } from "react";
import { useTranslation } from 'react-i18next'

//utils
import { validatePassword, validatePasswordPair } from "./comparePasswords";
import { checkField } from "./checkField";
import { validateDatePair, validateDateTimePair } from "./compareDateTime";

//Const
const DEFAULT_VALIDATORS = {
  "nombre":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "apellidos":[{type:"minlength",n:4},{type:"maxlength",n:20}],
  "username":[{type:"minlength",n:4},{type:"maxlength",n:20},"reducedChars","lowercase"],
  "dni":"dni",
  "email":"email",
  "telefono":"phone",
}

/*
EXAMPLE UTILITZATION
  const [
    [
      [inpName,           setInpName,           errName,            setErrName],
      [inpUsername,       setInpUsername,       errUsername,        setErrUsername],
      [inpPassword,       setInpPassword,       errPassword,        setErrPassword],
      [inpRepeatPassword, setInpRepeatPassword, errRepeatPassword,  setErrRepeatPassword]
      [inpPhone,          setInpPhone,          errPhone,           setErrPhone]
    ],{
      getFormValues,
      resetForm,
      formValues,
      resetFormValues,
      formIsEdited,
      validateForEmptyFields,
      validateFoValidFields,
      setAllIgnores,
      setIsValidating,
      isValidating
    }] = useForm([
      "name",
      {fieldName:"userName",validator:[{type:"minlength",n:4},{type:"maxlength",n:20},"reducedChars","lowercase"]},
      {fieldName:"password"},
      {fieldName:"password2",validator:"password2"},
      {fieldName:"phone", validator:"phone", noMandatory:true}
    ])



    //HANDLE SUBMIT
    async funciton handleSubmit(){
      if( ! validateForEmptyFields() ) return
      if( ! validateForValidFields() ) return //valida contraseñas
    
      const payload = getFormValues()
      await apiCall(payload)
    }



    //FORMULARY

    <input type="text" value={inpName} onChange={e=>setInpName(e.target.value)} />
    {errName && <span className="error">{errName}</span>}

*/

/**
 * useForm - un custom hook para gestionar estados de formularios, errores y validaciones de este
 *
 * @param {Array} fields - Un array de campos, cada campo puede ser un string, o un objeto con propiedades
 *   - si el campo es un objeto:
 *     - fieldName: {string} - El nombre del campo (obligatorio).
 *     - validator: {string|Object|function|Array} - validator del objeto. 
 *        - string => "nombre" | "phone" | "lowercase" | "reducedChars" ...
 *        - object => {type: "minlength", n: 4} | {type:"maxlength",n:20}
 *        - function (use setErr)=> (value,setErr)=>{if(!EXPECTED_VALUES.includes(value)){setErr("Unexpected value")}}
 *        - function (return Boolean) => (value)=>EXPECTED_VALUES.includes(value)
 *        - o un array de los anteriores (e.g.,["lowercase", {type: "minlength", n: 4}] ).
 *     - ignoreDefaultValidator: {boolean} - puesto a true ignora el validator por defecto.
 *     - noMandatory: {boolean} - puesto a true, cuenta el campo como no obligatorio.
 *     - ignore: {boolean} - puesto a true, ignora el valor y no lo devuelve.
 *     - noValidate: para no validar el campo
 *
 *   - If a field is a string:
 *     - fieldName: {string} - El nombre del campo (obligatorio).
 *     - validator: {string} - validator del campo, validator por defecto es "name".
 *     - ignoreDefaultValidator: {boolean} - puesto a true ignora el validator por defecto.
 *     - noMandatory: {boolean} - puesto a true, cuenta el campo como no obligatorio.
 *     - ignore: {boolean} - puesto a true, ignora el valor y no lo devuelve.
 *
 * @returns {Array} array con dos elementos:
 *   1. un array de estados de cada campo, cada array de estados contiene:
 *      [inputValue, setInputValue, errInput, setErrInput, ignore, setIgnore]
 *   2. Un objeto que contiene funcioones glovales del formulario:
 *      - validateForm: {Function} - Valida todos los campos del formulario.
 *      - resetForm: {Function} - reinicia el formulario al valor inicial.
 *      - resetFormValues: {Function} - reinicia el formulario con los valores indicados.
 *      - formIsEdited: {Function} - comprueba si algun elemento del formulario ha sido editado.
 *      - validateForEmptyFields: {Function} - valida campos obligatorios que no estén vacios.
 *      - validateFoValidFields: {Function} - valida campos, y parejas de campos como (password y password2, date y date2, time y time2).
 */


export function useForm(fields,customValidators){

  //Translate
  const { t } = useTranslation();

  //list of validators to use in this form
  const defaultValidators ={
    ...DEFAULT_VALIDATORS,
    ...customValidators
  }

  //fields mapped to an object
  const formFields =fields.flatMap(x=>{
    if(typeof x === "string"){
      return {
        fieldName : x,
        validator: defaultValidators[x] || x,
        noMandatory:false,
        ignore: false,
        ignoreDefaultValidator:false
      }
    }else if(typeof x === "object"){
      if(x.fieldName) return x
    }
    console.error("Wrong formated field",x)
    return []
  })
  
  //fields values
  const initialState = {};
  formFields.forEach((field) => {
    initialState[field.fieldName] = {value:field?.value || '',err:'',edited:false, ignore:field.ignore || false};
  });

  const [isValidating,setIsValidating] = useState(false);
  const [formValues, setFormValues] = useState(initialState);


  //setter for field value
  const setValue = (fieldName, value) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].value=value(updated[fieldName].value)
      }else{
        updated[fieldName].value=value;
      }
      updated[fieldName].err=""
      updated[fieldName].edited=true
      return updated
    });
  };

  //setter for field error
  const setError = (fieldName, value) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].err = value(updated[fieldName].err)
      }else{
        updated[fieldName].err=value
      }
      return updated
    });
  };

  //setter for field error
  const setIgnore = (fieldName, value=true) => {
    setFormValues((prev) => {
      const updated = {...prev}
      if(typeof value === "function"){
        updated[fieldName].ignore = value(updated[fieldName].ignore)
      }else{
        updated[fieldName].ignore=value
      }
      return updated
    });
  };

  

  //getter field value
  function getValue(fieldName){
    return formValues[fieldName]?.value
  }

  //getter field error
  function getError(fieldName){
    return formValues[fieldName]?.err
  }

  //getter field Ingore
  function getIgnore(fieldName){
    return formValues[fieldName]?.ignore
  }

  //getter field Edited
  function getEdited(fieldName){
    return formValues[fieldName]?.edited
  }




  //validate the form values, if i there any mandatory field empty returns false and sets the errors
  function validateForEmptyFields(){
    let isValid = true
    for (const k of formFields) {
      const value = getValue(k.fieldName)
      if((value === undefined || value === "") && !getIgnore(k.fieldName) && !k.noMandatory){//vacio && !igonrar && mandatory
        isValid = false
        setError(k.fieldName, t('errors.required'))
      }else{
        setError(k.fieldName,"")
      }

    }

    return isValid
  }


  //validates the form values, if there is any value non valid, it sets the error and returns false
  function validateForValidFields(){
    setIsValidating(true)
    let valid = true

    //valida la pareja de contraseñas
    const pwd1Finder = (x)=>x.validator === "password" || x.validator === "password1"
    const pwd2Finder = (x)=>x.validator === "password2"
    const paswordsValid = validatePair(pwd1Finder, pwd2Finder, validatePasswordPair, validatePassword)
    if(!paswordsValid) return false


    //valida la pareja de fechas
    const date1Finder = (x)=>["date","date1","date_from","date_start","fecha_ini"].includes(x.validator)
    const date2Finder = (x)=>["date2","date_to","date_end","fecha_fin"].includes(x.validator)
    const isValidDate = validatePair(date1Finder,date2Finder,validateDatePair)
    if(!isValidDate) return false


    //valida la pareja de horas con fechas
    const time1Finder = (x)=>["time","time1","time_from","time_start","hora_ini"].includes(x.validator)
    const time2Finder = (x)=>["time2","time_to","time_end","hora_fin"].includes(x.validator)


    const date1 = formFields.find(date1Finder)
    const date2 = formFields.find(date2Finder)
  
    const isDateTimeValid = validatePair(time1Finder,time2Finder,(t1,t2)=>validateDateTimePair(t1,getValue(date1.fieldName),t2,getValue(date2.fieldName)))
    if(!isDateTimeValid) return false

    
    //if passwords valid, check non password fields
    const nonPasswordFields = formFields.filter((field) => !pwd1Finder(field) && !pwd2Finder(field))

    for (const field of nonPasswordFields) {
      const {validator,fieldName,ignoreDefaultValidator,noValidate} = field
      const value = getValue(field.fieldName)
      const setErr = (err)=>setError(field.fieldName,err)
      const ignore = getIgnore(field.fieldName)

      const defaultValidator = (!validator && fieldName && !ignoreDefaultValidator) ? ( defaultValidators[validator] || defaultValidators[fieldName] || validator) : undefined
      const fieldValidator = validator ? validator : defaultValidator

      if(!fieldValidator || ignore || noValidate){ // noMandatory?
        continue
      }

      //VALIDATIONS
      const currentValid = checkField(value,setErr,fieldValidator)
      valid = currentValid && valid

    }
  
    return valid
  }



  function validatePair(finder1, finder2, validateBoth, validateSingle){
    const field1 = formFields.find(finder1)
    const field2 = formFields.find(finder2)
  
    if(field1){
      const checkField1 = (!field1.noMandatory && !getIgnore(field1.fieldName) && !field1.noValidate) //obligatorio && !ignorar
      const checkField2 = (!field2.noMandatory && !getIgnore(field2.fieldName) && !field2.noValidate) //obligatorio && !ignorar
  
      if(checkField1){
  
        if(field2){
          if(checkField2){
            const [isPairValid,err1,err2] = validateBoth(getValue(field1.fieldName),getValue(field2.fieldName))
            if(!isPairValid){
              setError(field1.fieldName,err1)
              setError(field2.fieldName,err2)
              return false
            }
          }
        }else{
          if(validateSingle){
            const [isValidField1,err1] = validateSingle(getValue(field1.fieldName))
            if(!isValidField1){
              setError(field1.fieldName,err1)
              return false
            }
          }
        }
      }
    }

    return true
  }





  //states like useState
  const statePair = formFields.map(k=>[
    getValue(k.fieldName),      //value
    v=>setValue(k.fieldName,v), //setValue
    getError(k.fieldName),      //error
    e=>setError(k.fieldName,e), //setError
    getIgnore(k.fieldName),     //ignore
    i=>setIgnore(k.fieldName,i) //setIgnore
  ])

  //resets the form to its initials values
  function resetForm(){
    setFormValues(initialState);
  }


  //sets all the ignore flags
  function setAllIgnores(setTo=false){
    setFormValues(prev=>{
      const updated = {...prev}
      Object.keys(updated).forEach((key)=>{
        updated[key].ignore=setTo
      })
      return updated
    })
  }

  //sets the values to its corresponding,
  //if values is Array, will set the values in order as declared on the contructor
  //if values is Object, will set the values using key as <fieldName>
  // also resets <edited> and <ignore>
  function resetFormValues(values=""){
    const newState = {};
    //set initial edited and initial ignore?

    if (Array.isArray(values)) {
      formFields.forEach(({fieldName}, i) => {
        newState[fieldName] = { value: values[i], err: '', edited: false, ignore:false };
      });
    } else if (typeof values === 'object' && values !== null) {
      Object.entries(values).forEach(([key, value]) => {
        if(formFields.some(x=>x.fieldName===key)){
          newState[key] = { value, err: '', edited: false, ignore:false};
        }else{
          console.error("Field not found in field declaration")
        }
      });
    }else if(values === undefined || values === ""){
      formFields.forEach(({fieldName}, i) => {
        newState[fieldName] = { value: '', err: '', edited: false, ignore:false };
      });
    }

    setFormValues(newState);
  }

  //returns true if some field has been edited
  function formIsEdited(){
    return Object.values(formValues).some(x=>x.edited)
  }

  //returns an object with key fieldname and value vits value
  function getFormValues(){
    const result = {}
    for (const field of formFields) {
      result[field.fieldName]=getValue(field.fieldName)
    }
    return result
  }


  return [statePair,{
    getEdited,
    getFormValues,
    resetForm,
    formValues,
    resetFormValues,
    formIsEdited,
    validateForEmptyFields,
    validateForValidFields,
    setAllIgnores,
    setIsValidating,
    isValidating
  }]
}




































