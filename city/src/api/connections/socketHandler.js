
import socketIO from 'socket.io-client';

const socket = socketIO("wss://ec2-52-28-246-249.eu-central-1.compute.amazonaws.com", {
    withCredentials: true,
    cors: {
        origin: '*',
        credentials: true
    },
    transports: ['websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionDelay: 1000
})

export const subscribeToEvent = (eventName, callback) => {
    socket.on(eventName, callback)
};

export const unsubscribeFromEvent = (eventName) => {
    socket.off(eventName)
};

export const sendEvent = (eventName, data) => {
    socket.emit(eventName, data)
}

//Conjunto de rooms a las que nos hemos unido
const joinedRooms = new Set();

//Unirse a room
export const joinRoom = (roomName) => {
    if (!joinedRooms.has(roomName)) {
        sendEvent('join_room', { server: roomName });
        joinedRooms.add(roomName);
    }
}

//Dejar room
export const leaveRoom = (roomName) => {
    if (joinedRooms.has(roomName)) {
        sendEvent('leave_room', { server: roomName });
        joinedRooms.delete(roomName);
    }
}

//Reconexión a todas las rooms tras posible desconexión
socket.on("connect", () => {
    joinedRooms.forEach(room => {
        sendEvent('join_room', { server: room });
    })
})

