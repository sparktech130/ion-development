
import countries from 'i18n-iso-countries'

// Funciones explícitas de import por idioma
const loadLocale = {
  es: () => import('i18n-iso-countries/langs/es.json'),
  ca: () => import('i18n-iso-countries/langs/ca.json'),
  en: () => import('i18n-iso-countries/langs/en.json'),
  ja: () => import('i18n-iso-countries/langs/ja.json')
};

//cambia el idioma i18n-iso-countries
export const countriesSetup = async (lng) => {
  try {
    if (loadLocale[lng]) {
      const localeModule = await loadLocale[lng]()
      countries.registerLocale(localeModule.default)
    }
  } catch (err) {
    const fallbackLocale = await loadLocale['es']()
    countries.registerLocale(fallbackLocale.default)
  }
}