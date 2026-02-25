import moment from "moment";

//Utils
import { checkArray } from "./functions";


//devuelve si han pasado más de 3 días entre 2 fechas
export const isMore3Days = (dateI, dateF) => {
    if(dateI && dateF){
        const diferenciaEnDias = moment(dateF).diff(moment(dateI), 'days');
        return(diferenciaEnDias > 3)
    }else{
        return(false)
    }
}

/* Calcula la media teniendo en cuenta los días o horas que han pasado entre 2 fechas (total registros / tiempo real transcurrido)
    datos - [456,651,456]

    //Opcionales
    fecha_ini, fecha_fin -Si es de hoy no hace falta pasar nada. Si fecha_fin es hoy solo cuenta las horas hasta la hora actual. Lo demás pone siempre fecha_ini a las 00:00 y fin al final del día
    decimales - 2
    isDays - true/false. Por si quieres la media por días. Por defecto es por horas
*/
export function arrayAverageDates(datos, fecha_ini, fecha_fin, decimales = 0, isDays = false) {

    if (!checkArray(datos)) {
        return 0;
    }

    //Ajustar Fecha inicio a 00:00:00
    const fInicio = fecha_ini
        ? moment(fecha_ini).startOf('day') // si viene fecha la pone a las 00:00
        : moment().startOf('day');         // si no viene pone hoy a las 00:00

    //Ajustar Fecha fin
    let fFin;
    if (fecha_fin) {
        fFin = moment(fecha_fin);
        if (fFin.isSame(moment(), 'day')) {
            // si fecha_fin es hoy pone la hora actual
            fFin = moment();
        } else {
            // si es otro día pone hasta última hora
            fFin = fFin.endOf('day');
        }
    } else {
        // si no se pasa fecha_fin pone hoy ahora mismo
        fFin = moment();
    }

    // Evitar errores si fechas inválidas
    if (!fFin.isAfter(fInicio)) {
        return 0;
    }

    //Total
    const sumatorio = arrayTotal(datos);

    //Tiempo transcurrido en horas o días
    const unidad = isDays ? 'days' : 'hours';
    const divisor = fFin.diff(fInicio, unidad, true);

    //Retorno
    if (!isNaN(sumatorio) && divisor > 0) {
        return Number((sumatorio / divisor).toFixed(decimales));
    }

    return 0;
}

//Calcula el total entre un array de datos
export const arrayTotal = (array) => {
    if(checkArray){
        //acc=acumulador, se le va sumando cada valor. 0 valor inicial
        return array
                .map(item=>parseFloat(item)) //Por si es string
                .filter(val => !isNaN(val)) //Asegura que sea un número
                .reduce((acc, val) => acc + val, 0); //Sumatorio
    }else{
        return 0
    }
}