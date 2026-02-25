import { useTranslation } from 'react-i18next'

//Styles
import styles from './Info.module.css'

//Components
import { Box } from "../../../components/Box/Box"



export const Info = () => {

    const {t} = useTranslation()

    return (
        <main className={styles['wrapper']}>
            <Box routes={[{name:t('buttons.info')}]} disableFirstRoute innerClassName={styles.box}>

                <h2 className={styles.title} >{t('messages.technologiesAndResourcesUsed')}</h2>

                    {/* Mapa */}
                    <Box title={t('titles.libraries')} />
                    <div className={styles.list}>

                        <div className={styles.block}>
                            <a target="_blank" rel="noopener noreferrer" href="https://maplibre.org/" >© Maplibre</a>
                        </div>
 
                        <div className={styles.block}>
                            <a target="_blank" rel="noopener noreferrer" href="https://www.openstreetmap.org/about/" >© OpenStreetMap</a>
                        </div>

                        <div className={styles.block}>
                            <a target="_blank" rel="noopener noreferrer" href="https://carto.com/platform/" >© CARTO</a>
                        </div>

                        <div className={styles.block}>
                            <a target="_blank" rel="noopener noreferrer" href="https://developer.tomtom.com/" >© TomTom. All rights reserved</a>
                            <h3>This material is proprietary and the subject of copyright protection, database right protection, and other intellectual property rights owned by TomTom or its suppliers. The use of this material is subject to the terms of a license agreement. Any unauthorized copying or disclosure of this material will lead to criminal and civil liabilities.</h3>
                            <h3>The following copyright notice applies to the use of TomTom Traffic: Portions of the data have been provided by Total Traffic & Weather Network, a division of iHeartMedia + Entertainment, Inc. © 2017. Total Traffic & Weather Network, a division of iHeartMedia + Entertainment, Inc. All rights reserved.</h3>
                        </div>

                    </div>


                    {/* Recursos */}
                    <Box title={t('titles.resources')} />
                    <div className={styles.list}>
                        <div className={styles.block}>
                            <div className={styles.line}>
                                <a target="_blank" rel="noopener noreferrer" href="https://sketchfab.com/3d-models/low-poly-truck-98826ebd44e2492298ac925461509216" >Truck 3D Model.</a>
                                <p>created by</p>
                                <a target="_blank" rel="noopener noreferrer" href="https://sketchfab.com/Arifido._" >Arifido._.</a>
                                <p>License:</p>
                                <a target="_blank" rel="noopener noreferrer" href="https://creativecommons.org/licenses/by/4.0/" >CC-BY-4.0</a>
                            </div>
                        </div>
                    </div>
            </Box>
        </main>
    )
}
