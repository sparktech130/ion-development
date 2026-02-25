import { createContext, useEffect, useState } from "react"
import axios from "axios"
import { useTranslation } from 'react-i18next';
import countries from 'i18n-iso-countries'

//Context
import { useLoginDataContext } from "./LoginDataContext"
import { setRequestAPI, seturlOriginAccess } from './accesContext'

//Constants
import { url_path, paises, url_path_ioncity } from "../constants/common";


export const MainDataContext = createContext();


export const MainDataProvider = ({ children }) => {

    //*----------------------------------------VARIABLES------------------------------------------*//

    //Context
    const { token, logout } = useLoginDataContext()
    const { t, i18n } = useTranslation()

    //---General---//
    const [sector] = useState('smartcity')
    const [codSector] = useState('001')
    const [section, setSection] = useState('home')
    const [module, setModule] = useState('main')
    const [forceUpdateModule, setForceUpdateModule] = useState(0) //en algunos casos (por ejemplo si cambias de modulo pero ya estás en ese modulo) necesitas actualizar los datos de un modulo desde fuera. sumarle 1 y añadir al useEffect inicial del módulo
    const [isCalendarModalOpen, _setIsCalendarModalOpen] = useState(false)

    //Light mode
    const [lightMode, setLightMode] = useState(() => {
        const saved = localStorage.getItem("lightMode");
        return saved ? JSON.parse(saved) : false;
    });

    //Urls
    const [hostname] = useState(import.meta.env.DEV ? 'ionsmartest.eu' : window.location.hostname) // ----- ionsmart.ai ionsmart.eu ionsmart.cat  ionsmartcanillo.cat  ionsmartsapobla.cat ionsmartgrandvalira.com ionsmartest.eu ionsmartencamp.cat
    const [url_origin] = useState(import.meta.env.DEV ? 'https://ionsmartest.eu' : window.location.origin)

    //Dispositivo actual seleccionado
    const [currentDevice, setCurrentDevice] = useState(null)

    //loading
    const [isLoading, setIsLoading] = useState(false)
    const [isLoading2, setIsLoading2] = useState(false)

    //alertas
    const [lastAlert, setLastAlert] = useState(null)

    //Notificaciones
    const [notificationsOpen, setNotificationsOpen] = useState(false)
    const [notifications, setNotifications] = useState([]) //placeholder: {opened:true}, {opened:false}

    //descargas
    /* Array de objetos con estos params:
        id: Date.now() timestamp en ms
        url: url de la descarga
        writable: contiene información de ubición y nombre de la descarga de forma segura (File System API)
        name: nombre archivo
    */
    const [downloads, setDownloads] = useState([])

    //filtros
    const [filterTrafficAlert, setFilterTrafficAlert] = useState(null)
    const [filterAlertCode, setFilterAlertCode] = useState(null)
    const [filterInfractionCode, setFilterInfractionCode] = useState(null) //Para ir a prevalidación según el tipo de alerta que és
    const [selectedElement, setSelectedElement] = useState(undefined) //Selector elemento para filtro histórico

    //Autocomplete
    const [autocompleteCountries, setAutocompleteCountries] = useState([]);

    //rooms socket
    const [joinedAlertRoom, setJoinedAlertRoom] = useState(null);

    //text modal
    const [infoMessage, setInfoMessage] = useState(null)

    //Data
    const [rightBarStatsData, setRightBarStatsData] = useState(undefined) //Para guardar los datos y no se pidan cada vez que abres las estadísticas. Limpiar al salir de la alertsMap. Ej: {'trafficFlow':{labels:[1,2,3], total:10, timestamp: Date.now()}, ...}

    //calendar
    const [calendarData, setCalendarData] = useState({
        value: undefined,
        selectMultiple: false,
        onChange: () => { },
        // modify:"",
        // onViewChange:undefined,
        // blockedDays:[],
        inputUID: undefined,
    })


    function setIsCalendarModalOpen(what) {
        //limpia estados al hacer no visible
        if (!what) {
            setCalendarData({
                value: undefined,
                selectMultiple: false,
                onChange: () => { },
                modify: "",
                onViewChange: undefined,
                blockedDays: [],
                inputUID: undefined,
            })
        }
        _setIsCalendarModalOpen(what)
    }

    //------------------USE EFFECT--------------------------------

    //Define autocomplete paises
    useEffect(() => {
        setTimeout(() => { //Se retrasa para asegurar que haya cargado el idioma la api (i18n-iso.countriesSetup)
            let array = paises?.map((cod) => ({ cod: cod, name: countries?.getName(cod, i18n.language) || cod }))
            setAutocompleteCountries(array)
        }, 1000);
    }, [i18n.language])

    //Cambia clases lightMode
    useEffect(() => {
        document.body.className = lightMode ? "light" : "dark";
    }, [lightMode]);

    //------------------CALL API----------------------------------

    //Realiza las llamadas a back de forma unificada
    const requestAPI = async (
        url,
        params = {},
        baseUrl = url_origin + url_path, //Personalizar url base. Por defecto url_origin/core. Si se pasa 'city' te pone url_origin/ioncity
    ) => {
        //pasa el token
        const config = {}
        if (token) {
            config.headers = { 'Authorization': `Bearer ${token}` }
        }
        //realiza la llamada
        let response = '';
        let base = baseUrl
        if (baseUrl === 'city') { base = url_origin + url_path_ioncity }
        try {
            if (params instanceof FormData) {
                response = await axios.create({ baseURL: base }).post(url, params, config);
            } else {
                response = await axios.create({ baseURL: base }).post(url, JSON.stringify(params), config);
            }
            //gestión respuesta
            if (response.data) {
                return response.data;
            } else {
                return { error: true, message: t('errors.request') }
            }
        } catch (err) {
            if (err?.response?.data?.code === 498) {
                setInfoMessage(t('messages.tokenExpired') + '...')
                setTimeout(() => {
                    logout(true)
                }, 2000);
            }
            if (err.response && err.response.data !== undefined) {
                return { error: true, message: t('errors.request'), ...err.response.data }
            } else {
                return { error: true, message: t('errors.request'), noConnection: true }
            }
        }
    };

    //------------------ACCES CONTEXT-----------------------------------------------

    //paso requestAPI a accesContext para poder usarlo desde archivos js
    useEffect(() => {
        setRequestAPI(requestAPI)
    }, [token, url_origin])

    //Url_origin accesible en archivos js
    useEffect(() => {
        seturlOriginAccess(url_origin)
        //eslint-disable-next-line
    }, [url_origin])



    return (
        <MainDataContext.Provider
            value={{
                sector,
                codSector,
                section, setSection,
                module, setModule,
                isLoading, setIsLoading,
                isLoading2, setIsLoading2,
                isCalendarModalOpen, setIsCalendarModalOpen,
                calendarData, setCalendarData,
                lightMode, setLightMode,

                hostname,
                url_origin,

                currentDevice, setCurrentDevice,
                selectedElement, setSelectedElement,

                lastAlert, setLastAlert,

                notificationsOpen, setNotificationsOpen,
                notifications, setNotifications,

                downloads, setDownloads,

                filterAlertCode, setFilterAlertCode,
                filterTrafficAlert, setFilterTrafficAlert,
                filterInfractionCode, setFilterInfractionCode,

                joinedAlertRoom, setJoinedAlertRoom,

                forceUpdateModule, setForceUpdateModule,

                infoMessage, setInfoMessage,

                rightBarStatsData, setRightBarStatsData,

                requestAPI,

                autocompleteCountries
            }}
        >
            {children}
        </MainDataContext.Provider>
    );
};

export default MainDataContext;
