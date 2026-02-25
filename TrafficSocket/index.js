import axios from "axios";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import { createServer } from "http";
import https from "https";
import { Server as SocketIoServer } from "socket.io";
import mqtt from "mqtt";

import { configDotenv } from "dotenv";

import { nuevaOcupacion } from "./callbacks/analysis.mjs";
import { modificacionReserva, anulacionReserva } from "./callbacks/booking.mjs";
import {
    estadoMaquina,
    nuevosPickings,
    nuevasLlamadas,
    nuevosConsumos,
    alertaMaquina,
    estadoMaquinas,
    nuevaAlertaFinalizada
} from "./callbacks/industry.mjs";
import {
    cambioAlertasSki,
    ocupacionParking,
    ocupacionRestaurante,
    personaTransportada,
    plazasOcupadasRemontador,
    tiempoEsperaRemontador,
    tiempoEsperaTaquillas,
    personaAtendidaTaquillas
} from "./callbacks/ionSki.mjs";
import {
    nuevoVideo,
    nuevoMovimiento,
    nuevaAlerta,
    nuevaDenuncia,
    nuevaPosicion
} from "./callbacks/plataforma.mjs";
import { reconocimientosPkg, reconocimientos } from "./callbacks/reconocimientos.mjs";
import { estadoAmbiente, estadoDistancias } from "./callbacks/sensores.mjs";

import {
    mqttActividadMuelle,
    mqttAlertaFinalizadaMaquinas,
    mqttAlertaMaquinas,
    mqttEstadoMaquina,
    mqttEstadosConsumo,
    mqttEstadosMaquinas,
    mqttLlamadas,
    mqttPickings
} from "./callbacks/mqtt/industry.mjs";
import { mqttNuevaAlerta, mqttNuevaDenuncia, mqttNuevaPosicion, mqttNuevoMovimiento, mqttNuevoVideo } from "./callbacks/mqtt/plataforma.mjs";
import { mqttNuevaOcupacion } from "./callbacks/mqtt/analysis.mjs";
import { mqttCambioAlertasSki, mqttOcupacionParking, mqttOcupacionRestaurante, mqttPersonaAtendidaTaquillas, mqttPersonaTransportada, mqttPlazasOcupadasRemontador, mqttTiempoEsperaRemontador, mqttTiempoEsperaTaquillas } from "./callbacks/mqtt/ionSki.mjs";
import { mqttReconocimientos, mqttReconocimientosPkg } from "./callbacks/mqtt/reconocimientos.mjs";
import { mqttEstadoAmbiente, mqttEstadoDistancias } from "./callbacks/mqtt/sensores.mjs";
import { mqttAnulacionReserva, mqttModificacionReserva } from "./callbacks/mqtt/booking.mjs";

configDotenv()

const PORT = 8101
const HTTPS_PORT = 443
const HOST = "127.0.0.1"
const app = express()

// Cookies
app.use(function(_, res, next) {
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Credentials", true)
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, authorization"
    )
    res.header("Access-Control-Allow-Methods", "GET,POST,DELETE,PUT,OPTIONS")
    next()
})

app.use(express.json())

app.use(bodyParser.json({ limit: '50mb' }));

app.use(
    cors({
        credentials: true,
        origin: function(origin, callback) {
            return callback(null, true)
        }
    })
)

// ============ ROUTES ===========
app.get("/", (_, res) => {
    res.status(200).send({ "message": "Route working" })
})

app.get("/check-ssl", (_, res) => {
    axios.get('https://incomplete-chain.badssl.com')
        .then(function(response) {
            console.log(response)
            res.status(200).send(response)
        })
        .catch(function(error) {
            console.log(error)
            res.status(500).send(error)
        })
})

app.post("/video_compartido", nuevoVideo)
app.post("/movimiento_detectado", nuevoMovimiento)
app.post("/nueva_alerta", nuevaAlerta)

app.post("/nueva_denuncia", nuevaDenuncia)
app.post("/nueva_posicion", nuevaPosicion)

app.post("/nueva_ocupacion", nuevaOcupacion)

// ===== SKI =====
app.post("/skialertas_cambio", cambioAlertasSki)
app.post("/nueva_ocupacion_parking", ocupacionParking)
app.post("/nueva_ocupacion_restaurante", ocupacionRestaurante)

app.post("/nueva_persona_transportada", personaTransportada)
app.post("/plazas_ocupadas_remontadores", plazasOcupadasRemontador)
app.post("/nuevo_tiempo_espera_remontadores", tiempoEsperaRemontador)

app.post("/nuevo_tiempo_espera_taquillas", tiempoEsperaTaquillas)
app.post("/nueva_persona_atendida", personaAtendidaTaquillas)

// ===== SENSORES =====
app.post("/nuevo_estado_ambiente", estadoAmbiente)
app.post("/nuevo_estado_distancia", estadoDistancias)

// ===== INDUSTRY =====
app.post("/nuevo_estado_maquina", estadoMaquina)
app.post("/estados_maquinas", estadoMaquinas)
app.post("/alertas_maquinas", alertaMaquina)
app.post("/fin_alertas_maquinas", nuevaAlertaFinalizada)
app.post("/nuevos_pickings", nuevosPickings)
app.post("/nuevas_llamadas", nuevasLlamadas)
app.post("/nuevos_consumos", nuevosConsumos)

// ===== BOOKING ======
app.post("/modificacion_reserva", modificacionReserva)
app.post("/anulacion_reserva", anulacionReserva)

// ===== RECONS =====
app.post("/reconocimientospkg_cambio", reconocimientosPkg)
app.post("/reconocimientos_cambio", reconocimientos)

const topics = [
    { topic: "plataforma/video_compartido", handler: mqttNuevoVideo },
    { topic: "plataforma/movimiento_detectado", handler: mqttNuevoMovimiento },
    { topic: "plataforma/nueva_alerta", handler: mqttNuevaAlerta },

    { topic: "plataforma/nueva_denuncia", handler: mqttNuevaDenuncia },
    { topic: "plataforma/nueva_posicion", handler: mqttNuevaPosicion },

    { topic: "analysis/nueva_ocupacion", handler: mqttNuevaOcupacion },

    { topic: "ski/alertas_cambio", handler: mqttCambioAlertasSki },
    { topic: "ski/nueva_ocupacion_parking", handler: mqttOcupacionParking },
    { topic: "ski/nueva_ocupacion_restaurante", handler: mqttOcupacionRestaurante },

    { topic: "ski/nueva_persona_transportada", handler: mqttPersonaTransportada },
    { topic: "ski/plazas_ocupadas_remontadores", handler: mqttPlazasOcupadasRemontador },
    { topic: "ski/nuevo_tiempo_espera_remontadores", handler: mqttTiempoEsperaRemontador },

    { topic: "ski/nuevo_tiempo_espera_taquillas", handler: mqttTiempoEsperaTaquillas },
    { topic: "ski/nueva_persona_atendida", handler: mqttPersonaAtendidaTaquillas },

    { topic: "ski/reconocimientos_cambio", handler: mqttReconocimientosPkg },

    { topic: "sensores/nuevo_estado_ambiente", handler: mqttEstadoAmbiente },
    { topic: "sensores/nuevo_estado_distancia", handler: mqttEstadoDistancias },

    { topic: "industry/nuevo_estado_maquina", handler: mqttEstadoMaquina },
    { topic: "industry/estados_maquinas", handler: mqttEstadosMaquinas },
    { topic: "industry/alertas_maquinas", handler: mqttAlertaMaquinas },
    { topic: "industry/fin_alertas_maquinas", handler: mqttAlertaFinalizadaMaquinas },
    { topic: "industry/nuevos_pickings", handler: mqttPickings },
    { topic: "industry/nuevas_llamadas", handler: mqttLlamadas },
    { topic: "industry/nuevos_consumos", handler: mqttEstadosConsumo },
    { topic: "industry/actividad_muelle", handler: mqttActividadMuelle },

    { topic: "book/modificacion_reserva", handler: mqttModificacionReserva },
    { topic: "book/anulacion_reserva", handler: mqttAnulacionReserva },

    { topic: "traffic/reconocimientos_cambio", handler: mqttReconocimientos },
]

function topicCallback(topic, message) {
    topics.forEach((t) => {
        if (t.topic == topic) {
            t.handler(message)
            return
        }
    })
}

app.get("/check", (_, res) => {
    res.status(200).send("Server is running")
})

app.get("/.well-known/pki-validation/D6C10E0BEA092F1EB43F5286A507C88F.txt", (_, res) => {
    res.status(200).sendFile("/home/ubuntu/TrafficSocket/D6C10E0BEA092F1EB43F5286A507C88F.txt")
})

// ===== LISTEN SERVER =====
let server
if (process.env.NODE_ENV === "development") {
    server = createServer(app)
    server.listen(PORT, HOST, () => {
        console.log("Listening on *:" + PORT)
    })
} else {
    const key = fs.readFileSync("./cert/private.key")
    const cert = fs.readFileSync("./cert/certfinal.crt")

    const cred = { key, cert }

    server = https.createServer(cred, app)
    server.listen(HTTPS_PORT)
}

// ===== MQTT CONNECTION =====
const MQTT_BROKER = `mqtts://${process.env.MQTT_BROKER ?? 'test.mosquitto.org'}:${process.env.MQTT_PORT ?? '8883'}`
const MQTT_OPTIONS = {
    username: process.env.MQTT_USER,
    password: process.env.MQTT_PASSWORD,
    rejectUnauthorized: false, // No validar el certificado del servidor
};

global.mqttClient = mqtt.connect(MQTT_BROKER, MQTT_OPTIONS)

global.mqttClient.on("connect", () => {
    console.log(`connected to ${MQTT_BROKER}`)

    topics.forEach((t) => {
        console.log(`Listening to topic ${t.topic}`)
        global.mqttClient.subscribe(t.topic);
    })
});

global.mqttClient.on("message", (topic, message) => {
    topicCallback(topic, message.toString());
});

global.mqttClient.on("error", (err) => {
    console.error('Error in MQTT client:', err);
})


// ===== SOCKET CONNECTION =====
global.socketIO = new SocketIoServer(server, {
    cors: {
        origin: true,
        credentials: true
    }
})

global.socketIO.on("connection", (socket) => {
    console.log(socket.id + " - User connected")

    socket.on("join_room", (data) => {
        const room = data.server
        console.log(socket.id + " - Joined room: " + room)
        socket.join(room)
    })

    socket.on("leave_room", (data) => {
        const room = data.server
        console.log(socket.id + " - Left room: " + room)
        socket.leave(room)
    })

    socket.on("disconnect", () => {
        console.log(socket.id + " - User disconnected")
    })
})
