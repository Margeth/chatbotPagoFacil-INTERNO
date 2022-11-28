import WebSocket from 'ws';

const ws = new WebSocket('ws://www.whatsapp.pagofacil.com.bo/');

ws.on('open', function open() {

    ws.send('Inicia socket para el cliente con numero: ' );
});

ws.on('message', function message(data) {
    //console.log('received: %s', data);
});


/*
// Se invoca cuando se oprime el botón Enviar
function enviarTexto(event){
    event.preventDefault();
    var campo = event.target.texto;
    // Enviamos el valor del campo al servidor
    doSend(campo.value);
    // Vaciamos el campo
    campo.value="";
}

// La función init se ejecuta cuando termina de cargarse la página
function init() {
    // Conexión con el servidor de websocket
    wsConnect();
}

// Invoca esta función para conectar con el servidor de WebSocket
function wsConnect() {
    // Connect to WebSocket server
    websocket = new WebSocket("ws://localhost:3000");

    // Asignación de callbacks
    websocket.onopen = function (evt) {
        onOpen(evt)
    };
    websocket.onclose = function (evt) {
        onClose(evt)
    };
    websocket.onmessage = function (evt) {
        onMessage(evt)
    };
    websocket.onerror = function (evt) {
        onError(evt)
    };
}

// Se ejecuta cuando se establece la conexión Websocket con el servidor
function onOpen(evt) {
    // Habilitamos el botón Enviar
    document.getElementById("enviar").disabled = false;
    // Enviamos el saludo inicial al servidor
    doSend("Hola");
}

// Se ejecuta cuando la conexión con el servidor se cierra
function onClose(evt) {

    // Deshabilitamos el boton
    document.getElementById("enviar").disabled = true;

    // Intenta reconectarse cada 2 segundos
    setTimeout(function () {
        wsConnect()
    }, 2000);
}

// Se invoca cuando se recibe un mensaje del servidor
function onMessage(evt) {
    // Agregamos al textarea el mensaje recibido
    var area = document.getElementById("mensajes")
    area.innerHTML += evt.data + "\n";
}

// Se invoca cuando se presenta un error en el WebSocket
function onError(evt) {
    console.log("ERROR: " + evt.data);
}

// Envía un mensaje al servidor (y se imprime en la consola)
function doSend(message) {
    console.log("Enviando: " + message);
    websocket.send(message);
}


// Se invoca la función init cuando la página termina de cargarse
window.addEventListener("load", init, false);
*/
/*
// Importing the required modules
const WebSocketServer = require('ws');

// Creating a new websocket server
const wss = new WebSocketServer.Server({ port: 8080 })


wss.on("connection", ws => {
    console.log("new client connected");
    ws.on("message", data => {
        console.log(`Client has sent us: ${data}`)
    });
    ws.on("close", () => {
        console.log("the client has connected");
    });
    ws.onerror = function () {
        console.log("Some Error occurred")
    }
});
console.log("The WebSocket server is running on port 8080");
*/
