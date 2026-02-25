# ION Smart PHP 
## Ficheros clave generales
### [consts.php](./consts.php)
Fichero responsable de:
- Cargar las dependencias de composer
- Cargar las variables de entorno declaradas en el fichero ```.env```
- Declara las constantes de funcionamiento, como rutas de APIs, MQTT, módulos, etc.

### [database.php](./database.php)
Gestión de base de datos, hay distintos tipos de conexion, cada una con sus respectivas
credenciales, declaradas en el fichero de entorno: ["base", "industry", "ionsmart"],
y se usan como parámetro en la funcion ```obtenerConexion()```.

La función de obtenerConexion intentará conectarse, si no lo consigue en 30 segundos, dará error timeout.
El máximo de segundos antes de dar timeout se puede configurar en el fichero ```config.json```.

Para usar la conexion, se puede hacer una consulta directamente con el PDO que 
devuelve la funcion, o se pueden usar las distintas funciones genéricas para ejecutar consultas.

- ```insertarDatosTabla()```
- ```modificarDatosTabla()```
- ```eliminarDatosTabla()```
- ```ejecutarConsultaSQL()```

### [verificarToken.php](./verificarToken/verificarToken.php)
Esta función se ejecuta para realizar llamadas que requieren un token validado, 
que se obtiene al hacer login en la plataforma.
También acepta la autorización básica (usuario:password).

### [mqtt.php](./mqtt.php)
Gestión del cliente de escritura de datos MQTT. Por ahora solo acepta la conexión
a un único broker, con sus credenciales declaradas en el fichero de entorno.

Al usar la función ```enviarDatosBroker(topic, data, qos)``` podemos enviar datos a dicho broker.


## Ficheros clave específicos
### cors.php
Este fichero puede variar en cada módulo, y se encarga de mandar los headers y 
controlar el acceso.

### funciones.php
Este fichero declara la lógica principal en cada módulo, y en caso de ser un desarrollo anterior,
contiene todas las funciones en uso.

### main.php
En caso del módulo de [industry](./ionindustry), cada apartado tiene sus propias funciones,
compartimentalizadas, para un uso más específico.

## Despliegue
### Dependencias
Dentro del directorio principal, instalaremos las dependencias con composer.

```bash
composer update
composer install
```

### Entorno
Para preparar el entorno, podemos crear el fichero ```.env``` copiando el de ejemplo, 
y modificando el fichero en base a la plantilla.

```bash
cp .env.example .env
```
