const express = require('express');
const router= express.Router();
const fs = require('fs');
const webs = require('ws');
const messageService = require("../services/MessagesService");
const {API_KEY_WABO} = require("../config");
const res = require("express/lib/response");
const {getResultJsonMessage} = require("../helpers/answerHelper");
const {listMenu} = require("../services/chatBotService/menu");

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);
/*
router.post('/categorie',async function (req, res) {
    data = req.body;
    phone = data.phone;
    await listMenu(phone);


});*/

router.post('/readMessage',async function (req, res) {
    const ws = new webs.WebSocket('ws://localhost:3000');
    ws.on('open', function open() {
        ws.send(JSON.stringify(req.body));
    });
   /*
   ws.on('message', function message(data) {
    console.log('received: %s', data);
   });*/

    res.json("exito");

});


module.exports={
    router
}
