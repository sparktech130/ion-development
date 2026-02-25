//Comprueba un array
export const checkArray = (array, min = 1) => {
    if (array && Array.isArray(array) && array.length >= min) {
        return true
    }
    return false
}

//Comprueba si una imagen es base64
export const checkBase64 = (str) => {
    return /^data:image\/[a-zA-Z]+;base64,/.test(str);
}