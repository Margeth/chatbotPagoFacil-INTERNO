const config = require("./config");
//const token = config.token, apiUrl = config.apiUrl;
const app = require('express')();
var request = require('request');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const express = require('express');
const goPad = require('pad');
const Key = require('./Model/Key');
const goMessage = require('./Model/Message');
const goCrypto = require("crypto");
const cryptoJS = require("crypto-js");
const messageService= require("./services/MessagesService");
const Message = require("./Model/Message");
const e = require("express");
app.use(bodyParser.json());
const goSecurityService= require("./services/SecurityService");
const rutasProtegidas = express.Router();
//const goKey = new Key("des-ede3", "des-ede3", "8108B805CA8641258B30406B");
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const messagesRouter= require('./routes/messageroutes');
const authenticationRouter= require('./routes/Authenticationroutes');
const bussinessRouter=require('./routes/Bussinessroutes');
const chatBotRouter = require('./routes/chatbotroutes');
//const empresaRouter=require('./routes/rutasEmpresa');
//const apiWhatsappRouter = require('./routes/apiWhatsapp');
const path = require("path");
const cors = require('cors');
const {getGreeting} = require("./services/chatBotService/greeting");
const {listMenu, categories, chooseMenu} = require("./services/chatBotService/menu");

const server = require('http').Server(app);
const WebSocketServer = require("websocket").server;
const fs = require('fs');
const {listCities, cities, chooseCity} = require("./services/chatBotService/cities");
const {chooseCategory} = require("./services/chatBotService/categories");
const {chooseService} = require("./services/chatBotService/services");

const port = process.env.PORT || 5002;
var d = new Date();
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));

//app.use(express.static(path.join(__dirname+"")));
app.use(express.static(__dirname+""))
app.use(bodyParser.urlencoded({
    extended:true
}));

//______________________________________
app.use('/mensajes',messagesRouter.router);
app.use('/authentication',authenticationRouter.router);
app.use('/bussiness',bussinessRouter.router);
app.use('/chatbot',chatBotRouter.router);
//app.use('/api-whatsapp', apiWhatsappRouter);
//app.use('/bussiness',empresaRouter.router);
//________________________________


app.listen(port,function () {
    console.log('Listening on port',port);
});

app.set('llave',config.llave);

process.on('unhandledRejection', err => {
    console.log(err)
});

app.post('/', async function (req, res) {
    console.log(req.body);
    await messageService.verifyUser(req, res);
    await messageService.verifyChatGeneral(req, res);
    await messageService.registerReceivedMessageGeneral(req, res);    
});

app.get('/linkprueba', async function(request,res){
    const loResult ={
        error: 0,
        status: 1,
        message: "El contacto fue enviado con exito.",
        messageMostrar: 1,
        messageSistema: "",
        values: { message: "Contacto enviado exitosamente" }
    };
    res.json(loResult);

})

app.post('/jwtexample', async function(req,res){
    const text = await goSecurityService.encrypt3DES(req.body.text, goKey.getKey());    
    /*const message = await goSecurityService.encrypt3DES(req.body.message, goKey.getKey()); 
    const chatId = await goSecurityService.encrypt3DES(req.body.ChatId, goKey.getKey());
    const user = await goSecurityService.encrypt3DES(req.body.usuario, goKey.getKey());
    const empresa = await goSecurityService.encrypt3DES(req.body.empresa, goKey.getKey());          
    */
    res.json(
        {
            dato: text
        });

});

/********************* SOCKET *************/

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);

const wsServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
});

//set configurations
app.set("port", 3000);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));

/************************************************************
 * Description: server websocket: verifies that a server customer to be same.
 * Return: boolean
 * Parameters: chart: origen localhost direction
 ************************************************************/
function originIsAllowed(origin) {
    return origin === "http://localhost:3000";
} // Once the server has been validated, the message is sent.
wsServer.on("request", (request) =>{
    const connection = request.accept(null, request.origin);

    connection.on("message", (message) => {
        var datetime = d.toLocaleString();console.log(datetime);
        writeLine(datetime + " Server: " + message.utf8Data);
        var lcPhone=JSON.parse(message.utf8Data).phone.substring(0,11);
        getGreeting(lcPhone);
       // chooseMenu(JSON.parse(message.utf8Data).message, lcPhone);
       // //lista Menu
     /* chooseMenu(JSON.parse(message.utf8Data).message, lcPhone);
        chooseCategory(JSON.parse(message.utf8Data).message,lcPhone);
        chooseCity(JSON.parse(message.utf8Data).message,lcPhone);
        chooseService(JSON.parse(message.utf8Data).message,lcPhone);*/
        //return to customer
        connection.sendUTF("Recibido: " + message.utf8Data);
    });
    connection.on("message", (message) => {
        var lcPhone=JSON.parse(message.utf8Data).phone.substring(0,11);
        listMenu(lcPhone);
        chooseMenu(JSON.parse(message.utf8Data).message, lcPhone);
        connection.sendUTF("Recibido: " + message.utf8Data);
    });

    connection.on("close", (reasonCode, description) => {
        console.log("El cliente se desconecto");
    });
});


// Init Serve
try {
    server.listen(app.get('port'), () =>{
        var datetime = d.toLocaleString();console.log(datetime);
        writeLine(datetime + " Server: " +'Servidor iniciado en el puerto: ' + app.get('port'));
    })
}
catch (err){
    writeLine(err.name);
    writeLine(err.message);
    writeLine(err.stack);
}





