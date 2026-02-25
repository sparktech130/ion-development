// Librerias
import React, { useState, useEffect, useContext, useMemo } from 'react';

//Componentes
import { Box } from '../../../components/Box/Box'
import { FilterSection } from '../../../components/FilterSection/FilterSection';
import { FilterSectionElement } from '../../../components/FilterSection/FilterSectionElement';
import { TextModal } from '../../../components/TextModal/TextModal'
import { Table } from '../../../components/Table/Table';
import { CheckPermission } from '../../../components/CheckPermission/CheckPermission';

//URLS
import { URL_ELIMINAR_CLIENTES, URL_INSERTAR_CLIENTES, URL_MODIFICAR_CLIENTES, URL_OBTENER_CLIENTES } from '../../../api/connections/urls';

//Context
import MainDataContext from '../../../context/MainDataContext'

//Utils
import { numberConversion } from '../../../utils/conversions'
import { url_path } from '../../../constants/common';

//Styles
import styles from './Clients.module.css'


export function Clients(){

    //*------------------------------------------VARIABLES---------------------------------------------*//

    //Loading
    const { setIsLoading, requestAPI, url_origin, setInfoMessage } = useContext(MainDataContext)

    //Información de los clientes
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState(false)
    const [subtitle, setSubtitle] = useState('-')
    const [currentData, setCurrentData] = useState([])
    const [profileImage,setProfileImage] = useState(undefined)

    //Estado de los modales de insertar, filtrar y modificar
    const [insertState,setInsertState] = useState({})
    const [filterState,setFilterState] = useState({})
    const [editState,setEditState] = useState({})

    //Modales
    const [insertOpen, setInsertOpen] = useState(false)
    const [editOpen, setEditOpen] = useState(false)
    const [deleteOpen, setDeleteOpen] = useState(false)
    const [filterOpen, setFilterOpen] = useState(false)

    //Botones para los filterSection
    const buttons = [
        {   
            text:'Eliminar cliente', 
            red:true, 
            loading:false, 
            onClick: () => {setEditOpen(false); setDeleteOpen(true)}
        }
    ]


    //*-------------------------------------FUNCIONES CLOUD-------------------------------------------*//

    //Obtiene los Clouds mediante llamada normal o filtro
    const getClients = async (payload) => {

        //Clouds que mostraremos
        let data = undefined

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            nif: payload?.nif,
            razon_social: payload?.razon_social,
            nombre_cliente: payload?.nombre_cliente,
            direccion: payload?.direccion,
            poblacion: payload?.poblacion,
            provincia: payload?.provincia,
            persona_contacto: payload?.persona_contacto,
            email: payload?.email,
            telefono: payload?.telefono,
        }

        //Comprobamos si estamos filtrando o no
        let isFiltering = Object.values(params).some(param => param !== null && param !== undefined && param !== '' && param.length !== 0);
        setDataFiltered(isFiltering)

        if(!isFiltering){
            data = await requestAPI(URL_OBTENER_CLIENTES, {})
            isFiltering=false
            setDataFiltered(false)
        }else{
            data = await requestAPI(URL_OBTENER_CLIENTES, params)
            setDataFiltered(true)
        }

        //Control de errores
        if(data.message){
            setIsLoading(false)
            setInfoMessage(data.message)
            setSubtitle('NO SE HAN ENCONTRADO RESULTADOS')
            return
        }

        //Asignación de datos en los respectivos useState.
        setData(data)
        setCurrentData(data[0])
        isFiltering ? setSubtitle(`FILTRADOS ${numberConversion(data.length)} RESULTADOS`) : setSubtitle(`${numberConversion(data.length)} RESULTADOS`)

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
        }, 500);
    }

    //Inserta el cliente
    const insertClients = async (payload) => {

        //Iniciamos el formData para enviar los datos
        const formData = new FormData()

        //Ocultamos modal de inserción
        setInsertOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Asignamos los datos del formData.
        formData.append('nif', payload?.nif)
        formData.append('razon_social', payload?.razon_social)
        formData.append('nombre_cliente', payload?.nombre_cliente)
        formData.append('direccion', payload?.direccion)
        formData.append('poblacion', payload?.poblacion)
        formData.append('provincia', payload?.provincia)
        formData.append('persona_contacto', payload?.persona_contacto)
        formData.append('email', payload?.email)
        formData.append('telefono', payload?.telefono)
        formData.append('foto_cliente', payload?.foto_cliente)

        //Llamada para insertar clientes
        let data =  await requestAPI(URL_INSERTAR_CLIENTES, formData)
        
        //Control de errores
        if(data.message){
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getClients()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Cliente añadido correctamente')
        }, 500);
    }

    //Modifica el cliente seleccionado
    const editClients = async (payload) => {

        //Iniciamos el formData para enviar los datos
        const formData = new FormData()

        //Ocultamos modal de edición
        setEditOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Asignamos los datos del formData.
        formData.append('cod_cliente', currentData?.cod_cliente)
        formData.append('nif', payload?.nif)
        formData.append('razon_social', payload?.razon_social)
        formData.append('nombre_cliente', payload?.nombre_cliente)
        formData.append('direccion', payload?.direccion)
        formData.append('poblacion', payload?.poblacion)
        formData.append('provincia', payload?.provincia)
        formData.append('persona_contacto', payload?.persona_contacto)
        formData.append('email', payload?.email)
        formData.append('telefono', payload?.telefono)
        formData.append('foto_cliente', payload?.foto_cliente)

        
        //Llamada para editar clientes
        let data =  await requestAPI(URL_MODIFICAR_CLIENTES, formData)
        
        //Control de errores
        if(data.message){
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getClients()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Cliente modificado correctamente')
        }, 500);
    }

    //Elimina el Cliente seleccionado
    const deleteClients = async () => {

        //Ocultamos modal de edición
        setDeleteOpen(false)

        //Iniciamos pantalla de carga
        setIsLoading(true)

        //Parametros que pasaremos a la función.
        const params = {
            cod_cliente: currentData?.cod_cliente
        }

        //Llamada para eliminar clientes
        let data =  await requestAPI(URL_ELIMINAR_CLIENTES, params)
        
        //Control de errores
        if(data.message){
            setIsLoading(false)
            setInfoMessage(data.message)
            return
        }

        //Volvemos a pedir los clientes para mostrar los actualizados
        getClients()

        //Finalizamos pantalla de carga
        setTimeout(() => {
            setIsLoading(false)
            setInfoMessage('Cliente eliminado correctamente')
        }, 500);
    }


    //*-----------------------------------------USE EFFECT---------------------------------------------*//

    //Llamada inicial para obtener los Cloud
    useEffect(() => {
        getClients()
        //eslint-disable-next-line
    }, [])

    //Vaciamos filtro si no estamos filtrando
    useEffect(() => {
        if(!dataFiltered){
            setFilterState({})
        }     
    //eslint-disable-next-line
    }, [filterOpen, insertOpen, editOpen])

    //Vaciamos el state de modificar al cerrar el modal
    useEffect(() => {
        setEditState({}) 
        setProfileImage(undefined)
    //eslint-disable-next-line
    }, [editOpen])

    //Vaciamos el state de insertar al cerrar el modal
    useEffect(() => {
        setInsertState({}) 
        setProfileImage(undefined)
    //eslint-disable-next-line
    }, [insertOpen])


    //Mostrar la Imagen del cliente
    const urlFoto = useMemo(()=>{

        if(insertOpen) { return "" }

        //Si el cliente tiene Imagen, entonces mostraremos la foto del usuario
        if(currentData?.foto_cliente){
          return `url(${url_origin+url_path}/${currentData.foto_cliente})`
        }
        return ""
    //eslint-disable-next-line
    },[profileImage, currentData, insertOpen])


    
    return <>

        {/*Filtrar cloud*/}
        {filterOpen && 
            <FilterSection setIsOpen={setFilterOpen} title="Filtrar cliente" onSubmit={getClients} onReset={()=>{setFilterState({})}} rows={3} columns={3} onChange={setFilterState} state={filterState} submitText='Filtrar' customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Columna 1*/}
                <FilterSectionElement title="NIF" name="nif" inputType="text"  />
                <FilterSectionElement title="Dirección" name="direccion" inputType="text" />
                <FilterSectionElement title="Persona de contacto" name="persona_contacto" inputType="text" />

                {/*Columna 2*/}
                <FilterSectionElement title="Razón social" name="razon_social" inputType="text" />
                <FilterSectionElement title="Población" name="poblacion" inputType="text" />
                <FilterSectionElement title="Correo electrónico" name="email"  inputType="email" />

                {/*Columna 3*/}
                <FilterSectionElement title="Nombre" name="nombre_cliente" inputType="text" />
                <FilterSectionElement title="Provincia" name="provincia" inputType="text" />
                <FilterSectionElement title="Teléfono" name="telefono"  inputType="tel" />

            </FilterSection>
        }

        {/*Insertar cloud*/}
        {insertOpen && 
            <FilterSection setIsOpen={setInsertOpen} title="Insertar cliente" onSubmit={insertClients} rows={6} columns={3} onChange={setInsertState} state={insertState} submitText='Añadir' customStyles={{ width: '70dvw', maxWidth: '750px' }}>

                {/*Imagen corporativa*/}
                <FilterSectionElement inputType="FILE" name="foto_cliente"  x={1} y={1} w={4} h={3} acceptImage hideHeader hideList>
                    { (urlFoto && !insertState?.foto_cliente) &&
                        <div className={styles['buttonImageInput']} style={{background:urlFoto}}></div>
                    }
                </FilterSectionElement>

                {/*Columna 1*/}
                <FilterSectionElement title="NIF" name="nif" inputType="text" required />
                <FilterSectionElement title="Dirección" name="direccion" inputType="text" required/>
                <FilterSectionElement title="Persona de contacto" name="persona_contacto" inputType="text" />

                {/*Columna 2*/}
                <FilterSectionElement title="Razón social" name="razon_social" inputType="text" required/>
                <FilterSectionElement title="Población" name="poblacion" inputType="text" required/>
                <FilterSectionElement title="Correo electrónico" name="email"  inputType="email" />

                {/*Columna 3*/}
                <FilterSectionElement title="Nombre" name="nombre_cliente" inputType="text" required/>
                <FilterSectionElement title="Provincia" name="provincia" inputType="text" required/>
                <FilterSectionElement title="Teléfono" name="telefono"  inputType="tel" />

            </FilterSection>
        }

        {/*Filtrar cloud*/}
        {editOpen && 
            <FilterSection setIsOpen={setEditOpen} title="Editar cliente" onSubmit={editClients} rows={6} columns={3} onChange={setEditState} state={editState} submitText='Modificar' buttons={buttons} customStyles={{ width: '70dvw', maxWidth: '750px' }}>


                <FilterSectionElement inputType="FILE" name="foto_cliente"  x={1} y={1} w={4} h={3} acceptImage hideHeader hideList>
                    { (urlFoto && !editState?.foto_cliente) &&
                        <div className={styles['buttonImageInput']} style={{background:urlFoto}}></div>
                    }
                </FilterSectionElement>

                {/*Columna 1*/}
                <FilterSectionElement title="NIF" name="nif" inputType="text" initialValue={currentData?.nif} required />
                <FilterSectionElement title="Dirección" name="direccion" inputType="text" initialValue={currentData?.direccion} required/>
                <FilterSectionElement title="Persona de contacto" name="persona_contacto" inputType="text" initialValue={currentData?.persona_contacto} />

                {/*Columna 2*/}
                <FilterSectionElement title="Razón social" name="razon_social" inputType="text" initialValue={currentData?.razon_social} required/>
                <FilterSectionElement title="Población" name="poblacion" inputType="text" initialValue={currentData?.poblacion} required/>
                <FilterSectionElement title="Correo electrónico" name="email"  inputType="email" initialValue={currentData?.email} />

                {/*Columna 3*/}
                <FilterSectionElement title="Nombre" name="nombre_cliente" inputType="text" initialValue={currentData?.nombre_cliente} required/>
                <FilterSectionElement title="Provincia" name="provincia" inputType="text" initialValue={currentData?.provincia} required/>
                <FilterSectionElement title="Teléfono" name="telefono"  inputType="tel" initialValue={currentData?.telefono} />

            </FilterSection >
        }

        {/*Eliminar cloud*/}
        {deleteOpen &&
            <TextModal setIsOpen={setDeleteOpen} title="Eliminar cliente" aceptar={()=>deleteClients()} cancelar={()=>setDeleteOpen(false)}>¿Eliminar el cliente?</TextModal>
        }

        {/*Página de clouds*/}
        <Box routes={[{name:'Clientes'}]} innerClassName={styles['clients']}>
        {/*Sección clouds*/}
        <section className={styles['client']}>
            <Box title="Clientes">
                <h2 className='subtitle'>{subtitle}</h2>
                <div className={styles['button__wrapper']}>
                    <CheckPermission className='button' onClick={()=>{setInsertOpen(true)}} permissionType='editar'>Añadir</CheckPermission>
                    {data?.length>0 && <CheckPermission className='button' onClick={()=>{setEditOpen(true)}} permissionType='editar'>Editar</CheckPermission>}
                    <CheckPermission className='button' onClick={()=>{setFilterOpen(true)}} permissionType='consultas'>Filtrar</CheckPermission>
                </div>
                <div className={styles['list']}>
                    <Table 
                        results={data}
                        rows={50}
                        primary_key={'cod_cliente'}
                        headers={['Nombre', 'Razón social', 'NIF', 'Dirección', 'Población', 'Provincia']}
                        columnStyles={['element--medium', 'element--medium', 'element--short', 'element--long', 'element--medium', 'element--medium']}
                        row_elements={['nombre_cliente', 'razon_social', 'nif', 'direccion', 'poblacion', 'provincia']}
                        currentData={currentData}
                        setCurrentData={setCurrentData}
                        className={styles['table__content']}
                    />
                </div>
            </Box>
        </section>
        {/*Sección información*/}
        <section className={styles['visualization']}>
            <Box title="Información">
                <div className={styles['visualization__info']}>
                <div className={styles['info__element']}>
                        <div className={styles['element__header']}>
                            <h3 className='bold'>IMAGEN CORPORATIVA</h3>
                            <hr/>
                        </div>
                        <div className={styles['element__content']}>
                           <div className={styles['image__element']}>
                                {currentData.foto_cliente 
                                    ? <img src={`${url_origin+url_path}/${currentData.foto_cliente}`} alt="Imagen del cliente" /> 
                                    : null
                                }
                           </div>
                        </div>
                    </div>
                    <div className={styles['info__element']}>
                        <div className={styles['element__header']}>
                            <h3 className='bold'>DETALLES DEL CLIENTE</h3>
                            <hr/>
                        </div>
                        <div className={styles['element__content']}>
                            <div className={styles['content__data']}>
                                <p className='bold'>Razón social</p>
                                <p>{currentData?.razon_social ? currentData?.razon_social : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Nombre</p>
                                <p>{currentData?.nombre_cliente ? currentData?.nombre_cliente : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>NIF</p>
                                <p>{currentData?.nif ? currentData?.nif : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Dirección</p>
                                <p>{currentData?.direccion ? currentData?.direccion : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Población</p>
                                <p>{currentData?.poblacion ? currentData?.poblacion : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Provincia</p>
                                <p>{currentData?.provincia ? currentData?.provincia : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Persona de contacto</p>
                                <p>{currentData?.persona_contacto ? currentData?.persona_contacto : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Correo electrónico</p>
                                <p>{currentData?.email ? currentData?.email : '-'}</p>
                            </div>
                            <div className={styles['content__data']}>
                                <p className='bold'>Teléfono</p>
                                <p>{currentData?.telefono ? currentData?.telefono : '-'}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles['info__element']}>
                        <div className={styles['element__header']}>
                            <h3 className='bold'>LICENCIAS</h3>
                            <hr/>
                        </div>
                        <div className={styles['element__content']}>
                            <div className={styles['list']}>
                                <Table 
                                    results={currentData?.licencias}
                                    rows={20}
                                    primary_key={'cod_licencia'}
                                    headers={['Módulo', 'Canales', 'Clave de activación', 'Estado']}
                                    columnStyles={['element--medium', 'element--short', 'element--extralong', 'element--short']}
                                    row_elements={[(item)=> item?.modulo, 'canales', 'clave_licencia', 'estado']}
                                    hideCount
                                    className={styles['table__content__small']}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
        </section>
        </Box>
    </>
}