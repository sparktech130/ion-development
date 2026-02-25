//Lib
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

//Constants
import { idiomas, url_path_city } from './constants/common'
 


//Inicializar traductor
if (!i18n.isInitialized){

    //Se añade una version diferente cada vez para que actualice el archivo en el caché del navegador. Si no no se actualiza si no limpias caché
    const version = Date.now();

    i18n
    .use(Backend) // carga traducciones desde public/locales
    .use(LanguageDetector) //Coge el idioma del navegador o guardado en navegador
    .use(initReactI18next) // conecta con React
    .init({
        fallbackLng: 'es', //idioma si no encuentra el seleccionado
        supportedLngs: idiomas.map(item=>item.cod), //Idiomas permitidos
        //debug: true, //Por si se necesita debug errores en consola
        interpolation: {
            escapeValue: false // React ya escapa por defecto
        },
        backend: {
            loadPath: url_path_city+'/locales/{{lng}}/{{ns}}.json?v={{'+version+'}}', // ruta de los archivos
        },
        detection: { //guarda el idioma en localstorage. Si no está coge el del navegador
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        }
    });

}


export default i18n;