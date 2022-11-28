const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");
const {isNewUser, getNameCompany} = require("../../dao/companydao");
const messageService = require("../MessagesService");
const {listMenu} = require("./menu");

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);
let nameCompany= getNameCompany(1);
//${nameCompany}
let greeting =[`¡Hola! Encantado de conocerte. Soy el chatbot de Pago Fácil. Seré tu guía para que puedas cancelar tus servicios de forma rápida y segura.`,
                `¡Hola! Un gusto ayudarte nuevamente.`];

async function getGreeting(lcphone) {
    let loResponse=null;
    try {
        if( isNewUser()){
            loResponse = await messageService.apiChatApinv(
                {
                    "API_KEY": API_KEY_WABO,
                    "phone": lcphone,//.replace(/\0.*$/g, ''),
                    "content": greeting[0],//.replace(/\0.*$/g, '')
                }
            );
        }else{
            loResponse = await messageService.apiChatApinv(
                {
                    "API_KEY": API_KEY_WABO,
                    "phone": lcphone,//.replace(/\0.*$/g, ''),
                    "content": greeting[1],//.replace(/\0.*$/g, '')
                }
            );
        }
        if (loResponse.status) {
            res.json( getResultJsonMessage(0, 1, "El mensaje fue enviado con exito.", 1, "",  loResponse));
        } else {
            res.json( getResultJsonMessage(1, 2, "El mensaje no fue enviado", 1, "", loResponse));
        }
    }
    catch (err){
        writeLine(err.name);
        writeLine(err.message);
        writeLine(err.stack);
    }
}

module.exports = {getGreeting};
