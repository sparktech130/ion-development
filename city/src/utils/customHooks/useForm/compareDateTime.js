/** @author eloifabrega@ionsmart.eu */

// no traducido!!

import moment from "moment"

//validar par de contraseñas
export function validateDatePair(date1, date2) {
  //return [true,"",""] //skip only for development

  if(!date1 || !date2){
    return [true,"",""]
  }

  const moment1 = moment(date1)
  const moment2 = moment(date2)
  
  const isAllValid = moment1.isSameOrBefore(moment2)
  let err2 = isAllValid ? "" : "Fecha anterior a la fecha inicio"

  //[false,"Minimo 2 caracteres","No coinciden"]
  //[true,"",""]
  return [isAllValid,"",err2]
}







export function validateDateTimePair(time1,date1,time2,date2){

  const d1 = moment(date1)
  const d2 = moment(date2)

  if(d1.isSame(d2,"day")){
    
    const t1 = moment(date1+" "+time1)
    const t2 = moment(date2+" "+time2)

    const isAllValid = t1.isSameOrBefore(t2)
    const err2 = isAllValid ? "" : "Hora anterior a la hora de inicio"

    return [isAllValid,"",err2]
  }
  return [true,"",""]
}