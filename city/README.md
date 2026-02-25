# Documentación componentes

README dedicado a la documentación de componentes

**Componentes:**
- [Table](#Table.jsx)
- [InputItems](#InputItems)
- [FilterSection & FilterSectionElement](#FilterSection-&-FilterSectionElement)

## Table.jsx

Componente usado para la realización de tablas y su respectivo contenido basado en la librería [react-paginated-list]. 

Contiene los componentes Table.jsx para la estrucutra general y Row.jsx para las filas.

Ambos componentes estan estilados con CSS Modules.



### Localización

Ubicado en src > components > Table


### Ejemplo de uso

```javascript

<Table 
    results={data}
    rows={20}
    primary_key={'cod_alerta'}
    headers={['Fecha', 'Hora', 'Matrícula', 'Código', 'Descripción']}
    columnStyles={['element--short', 'element--short', 'element--short', 'element--short', 'element--long']}
    row_elements={[(item)=> moment(item.fecha).format('L'), 'hora', 'matricula', 'cod_alerta', 'incidencia']}
    hasCheckbox
    currentData={currentData}
    setCurrentData={setCurrentData}
/>
```


### Props


| Parámetro | Tipo     | Description                |
| :-------- | :------- | :------------------------- |
| `results` | `array`  |  Array que contiene los resultados que mostraremos por pantalla

| Parámetro | Tipo     | Description                |
| :-------- | :------- | :------------------------- |
| `rows`    | `int`    |  Número de filas que tendrá la tabla por página

| Parámetro     | Tipo     | Description                |
| :--------     | :------- | :------------------------- |
| `primary_key` | `string` |  String que servirá como clave primaria para la realización de funciones.

| Parámetro | Tipo     | Description                |
| :-------- | :------- | :------------------------- |
| `headers` | `array`  |  Array que contiene los elementos que se utilizaran como la cabecera de la tabla.

| Parámetro      | Tipo     | Description                |
| :--------      | :------- | :------------------------- |
| `columnStyles` | `array`  |  Array que contiene los estilos que se aplicaran a las columnas. (Ver Table.module.css)

| Parámetro     | Tipo      | Description                |
| :--------     | :-------  | :------------------------- |
| `hasCheckbox` | `boolean` |  Activar o desactivar los checkbox de la tabla.

| Parámetro     | Tipo     | Description                |
| :--------     | :------- | :------------------------- |
| `currentData` | `object` |  Objeto actual seleccionado. Util para realizar la comparativa al hacer click sobre una fila.

| Parámetro        | Tipo     | Description                |
| :--------        | :------- | :------------------------- |
| `setCurrentData` | `object` |  Almacenar el objeto de la fila al hacer click sobre ella.

| Parámetro        | Tipo     | Description                |
| :--------        | :------- | :------------------------- |
| `goToPage`       | `int`    |  Valor para indicar a que página queremos ir.

| Parámetro        | Tipo     | Description                |
| :--------        | :------- | :------------------------- |
| `setActualPage`    | `int`    |  Almacena el valor para indicar a que página queremos ir.

| Parámetro        | Tipo     | Description                |
| :--------        | :------- | :------------------------- |
| `currentPage`    | `int`    |  Página actual de la tabla

| Parámetro        | Tipo     | Description                |
| :--------        | :------- | :------------------------- |
| `setCurrentPage` | `int`    |  Almacena el valor actual de la página

| Parámetro        | Tipo         | Description                |
| :--------        | :-------     | :------------------------- |
| `isReport`       | `boolean`    |  Opción para saber si queremos abrir el detalle del reconocimiento 

| Parámetro             | Tipo          | Description                |
| :--------             | :-------      | :------------------------- |
| `setOpenReport`       | `function`    |  Almacena si el modal de detalle del reconocimiento está abierto





## InputItems
es un input text con un desplegable

se puede usar como función para autocompletar, o como funcion para seleccionar elementos

### Ejemplo de uso *como autocomplete*
```jsx
<InputItems 
    items={COLORES} 
    onChange={setColorInput} 
    value={colorInput} 
    placeholder='Color'
/>

```

### Ejemplo de uso *como selector*
```jsx
<InputItems 
    items={COLORES} 
    onSelect={setColorInput} 
    selectedItem={colorInput} 
    placeholder='Color' 
    strictInput
/>
```


### Props
| Parámetro             | Tipo          | Description                |
| :- | :- | :- 
| `blankOption`  | `boolean`    |  Se añade una primera celda vacia para limpiar el input
| `strictInput`  | `boolean`    |  Define si el input tiene que ser exactamente uno de la lista (con strictInput usar **onSelect** y **selectedItem**)
| `placeholder`  | `string`    |  Placeholder del input
| `items`        | `aArray`    |  Puede ser un array de objetos o un array de strings
| `caseSensitive`| `boolean`    | Define si las busquedas seran estrictas con las mayusculas
| `onSelect`     | `function`    |  Devolvera como parametro el item entero ya sea string o Objeto
| `selectedItem` | `string \| objeto`    |  Elemento seleccionado, **no usar con value, pueden haber conflictos**
| `onChange`     | `function`    |  Se ejecuta cuando el campo input se actualiza
| `value`        | `string`    |  Valor del campo input
| `itemName`     | `string`    |  En caso de que los **items** sean objeto, será la `key` del objeto que se mostrará como texto
| `getItemText`        | `function`    |  En caso de que los **items** sean objeto, se ejecutará esta función con el item como parametro, y el retorno de esta como string, se usará como valor
| `debounceTime`        | `number`    |  en caso de usar **strictInput**, será el tiempo a esperar antes de limpiar el input








## FilterSection & FilterSectionElement

son dos elementos que se usan para formar un tablero formulario.

**FilterSection** es el componente padre, y este va a convertir los elementos dentro de el en un grid

**FilterSectionElement** es el componente encargado de envolver un input y ponerle un titulo, incluso gestionar si se quiere como header, footer o mas...

> [!TIP]
> Para mostrar espacios vacios en el formulario, simplemente añadir un elemento vacio como `<span/>`.

```jsx
{isFilterOpen &&
  <FilterSection 
    setIsOpen={setIsFilterOpen} 
    title="Filtrar" 
    onReset={()=>{}}
    onSubmit={()=>{}}
    rows={2}
    columns={2}
  >

    <FilterSectionElement title="Nombre" hint="Tu nombre"> 
      <input className='input' type="text" name="" id="" placeholder='Tu nombre' />
    </FilterSectionElement>

    <FilterSectionElement title="Apellido">
      <input className='input' type="text" name="" id="" placeholder='Tu apellido' />
    </FilterSectionElement>

    <FilterSectionElement title="Apellido">
      <input className='input' type="text" name="" id="" placeholder='Tu apellido' />
    </FilterSectionElement>

    <FilterSectionElement title="Apellido">
      <input className='input' type="text" name="" id="" placeholder='Tu apellido' />
    </FilterSectionElement>
  </FilterSection>
}
```

### Props FilterSection
| Parámetro             | Tipo          | Description                |
| :- | :- | :- 
| `title`           | `string`    | Titulo que aparecerá en la parte superior
| `onSubmit`        | `function`  | Se ejecuta al pulsar en el botón de Submit 
| `onReset`         | `function`  | Se ejecuta al pulsar en el botón de reset
| `submitLoading`   | `boolean`   | Estado para indicar que está cargando (muestra spinner)
| `resetLoading`    | `boolean`   | Estado para indicar que está cargando (muestra spinner)
| `noCloseOnSubmit` | `boolean`   | Por defecto `false` y al hacer submit tambén cierra el modal, cuando `true` no lo cierra después del submit
| `submitText`      | `string`    | Texto que se muestra en el botón de submit
| `resetText`       | `string`    | Texto que se muestra en el botón de submit
| `setIsOpen`       | `function`  | Función que se ejecuta al pulsar fuera del modal o en la cruz de cerrar
| `columns`         | `number`    | Por defecto `1` número de columnas
| `rows`            | `number`    | Por defecto `1` número de filas
| `buttons`         | `Array`     | Array de botones extras
| `asRow`           | `boolean`   | Organiza los elementos por filas en lugar de por columnas
| `unequalRows`     | `boolean`   | Permite que dos filas no tengan la misma altura
| `unequalColumns`  | `boolean`   | Permite que dos columnas no tengan el mismo ancho


El array de botones, es un array de objetos que definen los botones.
formato:`{onClick,red,text,loading}`
```js
[
    {
        onClick:()=>{},
        text="Aceptar 2"
    },
    {
        onClick:()=>{},
        text="Cancelar 2",
        red:true
    }
] 
```
> [!NOTE]
> **FilterSection** está pensado para usar como grid, pero en algunos casos, se puede usar normal con un div wrapper, ya que por defecto tiene una fila y una columna


### Props FilterSectionElement

| Parámetro             | Tipo          | Description                |
| :- | :- | :- 
| `title`       | `string`    | Titulo del campo
| `hint`        | `string \| jsx`    | Texto para mostrar como ayuda
| `width`       | `number`    | por defecto `1`, cuantas columnas de ancho tiene que ocoupar
| `height`      | `number`    | por defecto `1`, cuantas filas de alto tiene que ocoupar
| `header`      | `boolean`   | cuando `true` se mostrará el primer elemento ocupando todo el ancho
| `footer`      | `boolean`   | cuando `true` se mostrará el último elemento ocupando todo el ancho
| `error`       | `string`    | Mensaje de error
| `parentWidth` | `number`    | **parametro interno** 
| `parentHeight`| `number`    | **parametro interno**
| `x`| `number`    | posición X en el grid
| `y`| `number`    | posición Y en el grid
| `w`| `number`    | ancho (celdas) en el grid (requiere *X*)
| `h`| `number`    | alto (celdas) en el grid (requiere *Y*)
| `hideHeader`| `boolean`    | esconde la cabecera, con el título y hint


### Mensaje de error
Para mostrar el mensaje de error, simplemente enviar un string !=="" y se mostrará en rojo,
eso también provocará que el contenido del componente esté envuelto por una clase de CSS llamada **filterSectionElementHasError**, con esta clase se puede estilar un componente de input para que se muestre en rojo
```css
.filterSectionElementHasError .input{
  border-bottom: 1px solid var(--red);
  color: var(--red);
}
```


## FilterSection embededInputs.

Para integrar los inputs directamente, ahorrar logica y añadir funcionalidades como *required*.
Se puede seguir usando en combinación con los `FilterSectionElement`anteriores.

### Props extra FilterSection
| Parámetro   | Tipo              | Description                |
| :- | :- | :- 
| `state`     | `useState getter` | Estado del filtro para poder cerrar y abrir y mantener el estado
| `onChange`  | `useState setter` | Función que se ejecuta cada vez que se actualiza un cambio en un *embededInput*
| `errors`  | `objeto` | objeto donde *key* es el *name* del input y el *valor* es un string con el contenido del error

### Props extra FilterSectionElement
| Parámetro         | Tipo              | Description                |
| :- | :- | :- 
| `parentOnChange`  | `funtion`  | Función interna para llamar a <FilterSection>
| `errors`  | `objeto` | Parametro interno, el padre le retorna este parametro a todos los inputs
| `name`            | `string`   | Key del objeto payload
| `required`        | `boolean`  | Obliga al *embededInput* a ser requerido
| `inputType`       | `string`   | "text" | "number" | "checkbox" | "ITEMS"
| `placeholder`     | `string`   | placeholder
| `className`       | `string`   | classname para el input
| `initialValue`    | `any`      | valor inicial del input, undefined por defecto
| `getInputValue`   | `function` | función para conseguir el valor del input Default:`e=>e.target.value`
| `...props`        |            | valores extra que se le añadirán al input

*Ejemplo:*

```jsx

const autocompleteColors = [
  {cod: "YELLOW",name: "Amarillo"},
  {cod: "BLUE",name: "Azul"},
  /* ... */
]

const [isFilterOpen,setFilterOpen] = useState(false)
const [filterState,setFilterState] = useState({})

function handleSubmit(payload){
  //"Matricula", payload.matricula
  //"Color", payload.color?.cod, payload.color?.name
}

<FilterSection 
  setIsOpen={setFilterOpen} 
  title="Filtrar" 
  onReset={()=>setFilterState({})} 
  onSubmit={handleSubmit} 
  onChange={setFilterState} 
  state={filterState} 
>

  <FilterSectionElement title="Matrícula" name="matricula" inputType="text" />

  <FilterSectionElement title="Color" name="color" inputType="ITEMS" items={autocompleteColors} itemName="name"/>

  <FilterSectionElement>
    {/* Retrocompatible con los inputs anteriores */}
    <input type="text" {/* ... */}/>
  </FilterSectionElement>
  
</FilterSection>
```
