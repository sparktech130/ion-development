import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/variable.css'
import './styles/reset.css'
import './styles/styles.css'
import './styles/pagination.css'
import './styles/leaflet.css'
import './styles/animations.css'

import { LoginDataProvider } from './context/LoginDataContextProvider.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
    <LoginDataProvider>
      <App />
    </LoginDataProvider>
)
