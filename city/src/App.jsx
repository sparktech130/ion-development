//Librerías
import React, { useEffect} from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ErrorBoundary } from "react-error-boundary";

//Styles
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import 'leaflet/dist/leaflet.css';
import 'maplibre-gl/dist/maplibre-gl.css';
import './styles/mapLibre.css'
import '@maplibre/maplibre-gl-geocoder/dist/maplibre-gl-geocoder.css';

//Styles
import { useLoginDataContext } from './context/LoginDataContext.js'

//context
import { MainDataProvider } from './context/MainDataContext'

//components
import { Dashboard } from './pages/Dashboard/Dashboard'
import { Login } from './pages/LoginV4/Login'
import { ShortScreen } from './components/ShortScreen/ShortScreen.jsx'
import { VideoWall } from './components/Live/VideoWall/VideoWall.jsx'
import { ErrorFallback } from './pages/Dashboard/ErrorFallback/ErrorFallback.jsx';

//constants
import { url_path_city } from './constants/common.js'

//Translation
import './i18n'
import { useTranslation } from 'react-i18next';

//Utils
import { momentSetup } from './utils/libraries/momentSetup.jsx';
import { countriesSetup } from './utils/libraries/i18n-iso-countriesSetup.jsx';


function App() {

    //Estado para saber si se ha hecho login
    const { isLoggedIn } = useLoginDataContext()

    //Traducción
    const { i18n } = useTranslation();


    //Actualiza el idioma en librerías
    useEffect(() => {

        //moment
        momentSetup(i18n.language);
        
        //i18n-iso-countries
        countriesSetup(i18n.language)

        // React a cambios de idioma
        i18n.on('languageChanged', (lng) => {
            momentSetup(lng);
            countriesSetup(lng)
        });
    }, [i18n]);


    return (
        <MainDataProvider>

            {/*Mensaje en caso de que la pantalla sea muy pequeña*/}
            <ShortScreen />
            
            <BrowserRouter>
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <Routes>
                        <Route 
                            exact 
                            path={url_path_city}
                            element={
                                <>
                                    { isLoggedIn ? <Dashboard /> : <Login /> }
                                </>
                            }
                        />
                        <Route 
                            exact 
                            path={url_path_city + '/videowall'}
                            element={ <VideoWall /> }
                        />
                    </Routes>
                </ErrorBoundary>
            </BrowserRouter>
            
        </MainDataProvider>

    )
}

export default App
