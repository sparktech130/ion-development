import { autocompleteColors } from '../constants/common';


//Da formato a numeros altos(1.5K, 1M,...) (estandar anglosajón 1_000_000_000 = 1B)
export const numberConversion = (total) => {

    //Da formato value+suffix (2.5K)
    const format = (value, suffix) => {
        //Añade decimal si es necesario
        const fixed = (value % 1 === 0) ? value.toFixed(0) : value.toFixed(1);
        return fixed + suffix;
    };

    if (total >= 1e18) {
        return '+Q'; // Más allá de cuatrillón
    } else if (total >= 1e15) {
        return format(total / 1e15, 'Q'); // Cuatrillón
    } else if (total >= 1e12) {
        return format(total / 1e12, 'T'); // Trillón
    } else if (total >= 1e9) {
        return format(total / 1e9, 'B');  // Billón
    } else if (total >= 1e6) {
        return format(total / 1e6, 'M');  // Millón
    } else if (total >= 1e3) {
        return format(total / 1e3, 'K');  // Mil
    } else {
        return total.toString();
    }
};

//Conversión de la fiabilidad del reconocimiento.
export const confidenceConversion = (currentData) => {
    if (currentData?.confidence * 100 < '60') { return 'confidence--low' }
    else if (currentData?.confidence * 100 < '85') { return 'confidence--medium' }
    else if (currentData?.confidence * 100 <= '100') { return 'confidence--high' }
    else if (isNaN(currentData?.confidence * 100)) { return 'confidence--low' }
    else { return null }
}

//Conversión de la orientación del reconocimiento.
export const orientationConversion = (currentData) => {

    switch (currentData?.orientacion?.toLowerCase() || currentData?.direccion?.toLowerCase()) {
        case 'approach':
            return 'Entrada'
        case 'away':
            return 'Salida'
        case 'e':
            return 'Entrada'
        case 's':
            return 'Salida'
        default:
            return 'Sin identificar'
    }
}

//Conversión del color del reconocimiento.
export const colorConversion = (color) => {

    const colorInput = color?.toLowerCase();

    if (!colorInput) return '';

    const foundColor = autocompleteColors?.find(
        (item) => item.cod === colorInput
    );

    return foundColor ? foundColor?.nameCode : '';

}

//Conversión del tipo vh. Añadir en constants/common/tiposVehiculo y en constants.icons
export const vehicleConversion = (currentData) => {

    switch (currentData?.tipo_vh?.toLowerCase()) {
        case 'car':
            return 'Turismo'
        case 'truck':
        case 'big truck':
            return 'Camión'
        case 'bike':
        case 'motorcycle':
        case 'motorbike':
            return 'Moto'
        case 'van':
            return 'Furgoneta'
        case 'bus':
            return 'Autobús'
        case 'suv':
            return 'SUV'
        case 'police':
            return 'Policía'
        case 'ambulance':
            return 'Ambulancia'
        case 'moped':
            return 'Ciclomotor'
        case 'bicycle':
            return 'Bicicleta'
        case 'fire engine':
            return 'Bomberos'
        case 'trailer':
            return 'Remolque'
        case 'unknown':
        default:
            return ''
    }
}

//Conversión de las descripciones de alerta
export const statusConversion = (status) => {

    switch (status?.toLowerCase()) {
        case 'p':
            return 'Pendiente'
        case 'r':
            return 'Rechazada'
        case 'c':
        case 's':
            return 'Enviada'
        default:
            return '-'
    }
}

//Comprueba si el campo existe
export const validField = (currentData) => {
    return currentData !== undefined && currentData !== null && currentData !== '' ? currentData : '-';
}

//Retorna el estado del remontador actual con texto y color
export const occupationIndexConversion = (percentage, type) => {

    let occupation = {};

    const texts = {
        'wastes': {
            high: 'messages.availableCapacityHigh',
            moderate: 'messages.availableCapacityModerate',
            low: 'messages.availableCapacityLow'
        }
    }

    const selectedText = texts[type]

    if (percentage > 80) {
        occupation = { text: selectedText?.high, color: '#E93636' }
    } else if (percentage >= 50) {
        occupation = { text: selectedText?.moderate, color: '#FFAB49' }
    } else {
        occupation = { text: selectedText?.low, color: '#4CD984' }
    }

    return occupation;
}

//Función que retorna MB, GB o TB dependiendo de los GB pasados como param
export function convertGB(valueInGB) {

    const units = ["MB", "GB", "TB"] //Unidades
    const valueInMB = valueInGB * 1024 //Valor base

    //Determinamos las unidades
    const unitIndex = Math.min(Math.floor(Math.log(valueInMB) / Math.log(1024)), units.length - 1);

    const convertedValue = valueInMB / Math.pow(1024, unitIndex)
    return `${Math.round(convertedValue)} ${units[unitIndex]}`
}

export function generateMatchingColors(baseColor, count) {
    const hsl = hexToHSL(baseColor)
    const baseHue = hsl.h
    const hueOffsets = [0, 40, 160, 200, 300]

    const results = []

    for (let i = 0; i < count; i++) {
        const offset = hueOffsets[i % hueOffsets.length]
        const newHue = (baseHue + offset) % 360
        const newSaturation = clamp(hsl.s * 0.8 + 20, 45, 75)
        const newLightness = clamp(hsl.l + 15, 60, 80)
        results.push(hslToHex(newHue, newSaturation, newLightness))
    }

    return results
}

function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
}

function hexToHSL(H) {
    let r = 0, g = 0, b = 0;
    if (H.length === 4) {
        r = parseInt(H[1] + H[1], 16);
        g = parseInt(H[2] + H[2], 16);
        b = parseInt(H[3] + H[3], 16);
    } else if (H.length === 7) {
        r = parseInt(H.slice(1, 3), 16);
        g = parseInt(H.slice(3, 5), 16);
        b = parseInt(H.slice(5, 7), 16);
    }

    r /= 255;
    g /= 255;
    b /= 255;

    const cmin = Math.min(r, g, b);
    const cmax = Math.max(r, g, b);
    const delta = cmax - cmin;
    let h = 0, s = 0, l = 0;

    if (delta === 0) h = 0;
    else if (cmax === r) h = ((g - b) / delta) % 6;
    else if (cmax === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;

    h = Math.round(h * 60);
    if (h < 0) h += 360;

    l = (cmax + cmin) / 2;
    s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    s = +(s * 100).toFixed(1);
    l = +(l * 100).toFixed(1);

    return { h, s, l };
}

function hslToHex(h, s, l) {
    s /= 100;
    l /= 100;

    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;

    if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
    else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
    else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
    else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
    else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
    else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return "#" + [r, g, b].map(x => x.toString(16).padStart(2, "0")).join("");
}