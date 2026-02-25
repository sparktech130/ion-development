import { getRequestAPI, getUrlOriginAcces } from '../../context/accesContext'
import { URL_OBTENER_ZONAS, URL_OBTENER_PROVINVIAS, URL_OBTENER_POBLACIONES, URL_OBTENER_CLOUDS, URL_OBTENER_CATEGORIAS, URL_OBTENER_LISTAS, URL_OBTENER_DISPOSITIVOS, URL_OBTENER_CLIENTES, URL_OBTENER_USUARIOS, URL_OBTENER_GRIDS } from "../connections/urls";
import { URL_OBTENER_INSTANCIAS_AI } from '../connections/urlsAI';

//*------------------------AUTOCOMPLETAR SMART CITY---------------------------*//

//Autocompletar listas de Traffic
export async function getAutocompleteListas() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_LISTAS, {}, 'city');
    if (!data.error) {
        const lists = data?.rows?.map(item => ({ name: item.nombre_lista, cod: item.cod_lista }));
        return lists;
    } else {
        return [];
    }
}

//Autocompletar zonas  de Mobility
export async function getAutocompleteAreas() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_ZONAS, {}, 'city');
    if (!data.error) {
        const areas = data?.rows?.map(item => ({ name: item.nombre_area, cod: item.cod_area }));
        return areas;
    } else {
        return [];
    }
}


//*--------------------------AUTOCOMPLETAR GENERAL----------------------------*//

//Autocompletar poblaciones
export async function getAutocompleteTowns() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_POBLACIONES);
    if (!data.error) {
        const items = data.map(item => ({ cod: item.cod_poblacion, name: item.nom_poblacion, cod_provincia: item.cod_provincia }));
        return items;
    } else {
        return [];
    }
}

//Autocompletar provincias
export async function getAutocompleteRegions() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_PROVINVIAS);
    if (!data.error) {
        const items = data.map(item => ({ cod: item.cod_provincia, name: item.nom_provincia }));
        return items;
    } else {
        return [];
    }
}

//Autocompletar dispositivos
export async function getAutocompleteDevices(params) {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_DISPOSITIVOS, params);
    if (!data.error) {
        const devices = data.map(item => ({
            cod: item.cod_dispositivo,
            name: item.nom_dispositivo,
            cod_category: item.cod_categoria,
            model: item?.nombre_modelo,
        }))
        return devices;
    } else {
        return [];
    }
}

//Autocompletar clouds de NX
export async function getAutocompleteClouds() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_CLOUDS, {cod_sector: '001'});
    if (!data.error) {
        const devices = data.map(item => ({ cod: item?.cod_cloud, name: item?.nombre }));
        return devices;
    } else {
        return [];
    }
}

//Autocompletar categorías (tipos dispositivo)
export async function getAutocompleteCategories() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_CATEGORIAS, {cod_sector: '001'});
    if (!data.error) {
        const c = data.map(item => ({ cod: item?.cod_categoria, name: item?.nombre_categoria }));
        return c;
    } else {
        return [];
    }
}

//Autocompletar clientes de la plataforma
export async function getAutocompleteClients() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_CLIENTES);
    if (!data.error) {
        const clients = data.map(item => ({ cod: item?.cod_cliente, name: item?.nombre_cliente }));
        return clients;
    } else {
        return [];
    }
}

//Autocompletar usuarios de la plataforma  
export async function getAutocompleteUsers() {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_USUARIOS);
    if (!data.error) {
        const users = data.map(item => ({ cod: item?.cod_usuario, name: item?.nombre_usuario, email: item?.email }));
        return users;
    } else {
        return [];
    }
}

//Autocompletar grids segun módulo  
export async function getAutocompleteGrids(cod_modulo) {
    const requestAPI = getRequestAPI();
    const data = await requestAPI(URL_OBTENER_GRIDS, { cod_modulo: cod_modulo, cod_modulo_dispositivos: cod_modulo });
    if (!data.error) {
        const grids = data.map(item => ({ cod: item?.cod_grid, name: item?.nombre_grid, devices: item?.dispositivos }));
        return grids;
    } else {
        return [];
    }
}


//*--------------------------ANÁLISIS IA----------------------------*//

//Obtener todas las instancias de análisis IA
export async function getAutocompleteInstances() {
    const requestAPI = getRequestAPI();
    const url = getUrlOriginAcces()
    const data = await requestAPI(URL_OBTENER_INSTANCIAS_AI, {}, url + `/core/CVEDIA-API/`)
    if (!data.error) {
        return data?.instances
    } else {
        return []
    }
}
