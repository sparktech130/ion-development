//Lib
import { useTranslation } from 'react-i18next'

//Components
import { StatsCard } from '@components/Stats/StatsCard/StatsCard'
import { Table } from '@components/Table/Table'



export const Servers = ({
    setCurrentServer
}) => {

    const {t} = useTranslation()


    return(
        <div style={{width: '100%', height: 'calc(100vh - 618px)', minHeight: '350px'}}>
            <StatsCard
                title={t('titles.serverList')}
                type="custom"
            >
                <Table
                    results={[{cod_server:1, nom_server: 'ION SI-3000', status: 'OK', risk: '0%', breaches:'-', alerts:'-', latency: '22 ms', data: '254 TB', users: 32, lastBackup: t('messages.timeAgo', {value:5, unit:t('terms.days')})}]}
                    rows={20}
                    primary_key={'cod_server'}
                    headers={[t('params.server'), t('params.status'), t('params.risk'), t('params.breaches'), t('sections.ALERTAS'), t('titles.latency'), t('params.data'), t('sections.USUARIOS'), t('params.lastBackup')]}
                    columnStyles={['element--medium','element--short','element--short','element--medium','element--short','element--short','element--short','element--short','element--medium']}
                    row_elements={['nom_server', 'status', 'risk', 'breaches', 'alerts', 'latency', 'data', 'users', 'lastBackup']}
                    sortElements={['nom_server', 'status', 'risk', 'breaches', 'alerts', 'latency', 'data', 'users', 'lastBackup']}
                    hideCount
                    setCurrentData={setCurrentServer}
                    style={{height: 'calc(100vh - 790px)', minHeight: '180px'}}
                    
                />
            </StatsCard>
        </div>
    )
}