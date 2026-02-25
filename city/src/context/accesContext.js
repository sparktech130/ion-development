//Archivo para acceder a cosas del context desde arhivos js normales

//instancias
let requestAPIInstance = null
let urlOriginInstance = null


//----------------REQUEST API-----------------------------

//set requestAPI
export const setRequestAPI = (requestAPI) => {
  requestAPIInstance = requestAPI;
};

//get requestAPI
export const getRequestAPI = () => {
  return requestAPIInstance;
};

//----------------URLS-----------------------------

//set requestAPI
export const seturlOriginAccess = (url) => {
  urlOriginInstance = url;
};

//get requestAPI
export const getUrlOriginAcces = () => {
  return urlOriginInstance;
};