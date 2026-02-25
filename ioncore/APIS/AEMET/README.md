INTEGRACION AEMET
1. Endpoint del backend
POST /core/APIS/AEMET/index.php
2. Contrato general
Request (JSON)
{
  "accion": "nombre_accion",
  "parametro1": "valor",
  "parametro2": "valor"
}
Response (éxito)
{
  "ok": true,
  "tipo": "nombre_accion",
  "data": {}
}
Response (error)
{
  "ok": false,
  "error": "Descripción del error"
}

4. Acciones disponibles

5.1 Predicción horaria por municipio
Request
{
  "accion": "prediccion_municipio_horaria",
  "idMunicipio": "07027",
  "modo": "compact"
}
•	idMunicipio: código INE (5 dígitos)
•	modo:
o	raw → estructura AEMET original
o	compact → estructura optimizada para frontend (recomendado)
Response (compact)
{
  "ok": true,
  "tipo": "prediccion_municipio_horaria",
  "data": {
    "municipio": "Inca",
    "provincia": "Illes Balears (Mallorca)",
    "elaborado": "2026-02-06T09:02:13",
    "horas": [
      {
        "hora": "08",
        "cielo": "Despejado",
        "temp": 11,
        "sens": 11,
        "humedad": 79,
        "prec_mm": 0,
        "viento": {
          "dir": "SO",
          "vel_kmh": 19,
          "racha_kmh": 33
        }
      }
    ]
  }
}
Uso frontend
•	Tablas horarias
•	Gráficas de temperatura / viento
•	No es necesario procesar estructuras complejas

5.2 Avisos meteorológicos (CAP)
Request
{
  "accion": "avisos_cap",
  "area": "esp"
}
Response
{
  "ok": true,
  "tipo": "avisos_cap",
  "data": {
    "count": 1,
    "alerts": [
      {
        "evento": "Aviso de nevadas",
        "nivel": "amarillo",
        "zona": "Pirineo oscense",
        "inicio": "2026-02-05T12:00:00+01:00",
        "fin": "2026-02-05T23:59:59+01:00",
        "descripcion": "Acumulación de nieve en 24 horas: 5 cm"
      }
    ]
  }
}
Notas
•	El backend convierte XML CAP → JSON
•	El frontend no debe parsear XML

5.3 Rayos
Request
{
  "accion": "rayos"
}
Response
{
  "ok": true,
  "tipo": "rayos",
  "data": {
    "mode": "url",
    "mime": "image/gif",
    "datos_url": "https://opendata.aemet.es/opendata/sh/XXXX"
  }
}
Uso frontend
<img src="https://opendata.aemet.es/opendata/sh/XXXX" alt="Mapa de rayos">

5.4 Redes especiales (radiación, ozono…)
Request básica
{
  "accion": "redes_especiales",
  "tipo": "radiacion",
  "modo": "compact"
}
Request filtrada por estación
{
  "accion": "redes_especiales",
  "tipo": "radiacion",
  "modo": "compact",
  "estacion": "8178D"
}
Response (compact)
{
  "ok": true,
  "tipo": "redes_especiales",
  "data": {
    "fecha": "2026-02-05",
    "producto": "RADIACION SOLAR",
    "estaciones": [
      {
        "nombre": "Albacete",
        "indicativo": "8178D",
        "series": {
          "GL": {
            "horas": { "05": 1, "06": 1 },
            "suma": 883
          }
        }
      }
    ]
  }
}
Tipos soportados
tipo	estación
radiacion	opcional
ozono	opcional
perfilozono	obligatoria
contaminacionfondo	obligatoria

 5.5 Incendios (mapas de riesgo)
Request
{
  "accion": "incendios",
  "area": "esp",
  "dia": "2026-02-06",
  "producto": "previsto"
}
Response disponible
{
  "ok": true,
  "tipo": "incendios",
  "available": true,
  "data": {
    "mode": "url",
    "datos_url": "https://opendata.aemet.es/opendata/sh/XXXX"
  }
}
Response no disponible
{
  "ok": true,
  "tipo": "incendios",
  "available": false,
  "warning": "Servicio no disponible temporalmente",
  "data": null
}
Regla frontend (IMPORTANTE)
•	available=false NO es un error
•	Mostrar aviso y permitir reintento

6. Ejemplo genérico en JavaScript (fetch)
async function callAemet(payload) {
  const res = await fetch('/core/APIS/AEMET/index.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

7. Gestión de estados en frontend
Caso	Acción
ok=false	Mostrar error
ok=true + data	Renderizar
available=false	Mostrar aviso
mode=url	Usar <img> / <iframe>

8. Recomendaciones de caché
Servicio	Caché
Predicción	10–30 min
Rayos	5 min
Avisos	10–15 min
Redes	30–60 min
Incendios	30–60 min

