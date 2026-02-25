import moment from 'moment';


// Funciones explícitas de import por idioma
const loadLocale = {
  es: () => import('moment/dist/locale/es.js'),
  ca: () => import('moment/dist/locale/ca.js'),
  ja: () => import('moment/dist/locale/ja.js')
};

//cambia el idioma de moment
export const momentSetup = async (lng) => {
  try {
    
    //Importa y cambia el idioma
    if (loadLocale[lng]) {
      await loadLocale[lng]();
      moment.locale(lng);
    }else{
      moment.locale('en');
    }

  } catch (err) {
    moment.locale('en');
  }
};