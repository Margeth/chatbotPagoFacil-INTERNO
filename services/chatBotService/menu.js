const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");
const {listCities} = require("./cities");
const messageService = require("../MessagesService");
const {listCategories} = require("./categories");

const categories = ["Pagos","Consultar facturas","Atención al cliente"];

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);
async function listMenu(phone) {
    try {
        const loResponse = await sendMessageButthonAPI(
            {
                "API_KEY": API_KEY_WABO,
                "phone": phone, //.replace(/\0.*$/g, ''),
                "content": "¿Qué acción desea realizar?",
                "footerContent": "Pago Facil",
                "buttons": [
                    {
                        "buttonId": "1",
                        "buttonText": {"displayText": categories[0]},
                        "type": 1
                    },
                    {
                        "buttonId": "2",
                        "buttonText": {"displayText": categories[1]},
                        "type": 1
                    },
                    {
                        "buttonId": "3",
                        "buttonText": {"displayText": categories[2]},
                        "type": 1
                    }
                ]
            }
        );
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


async function getCustomerService(lcphone) {
    try {
        const loResponse = await messageService.apiChatApinv(
            {
                "API_KEY": API_KEY_WABO,
                "phone": lcphone,//.replace(/\0.*$/g, ''),
                "content": "https://pagofacil.com.bo/online/es/endesarrollo",//.replace(/\0.*$/g, '')
            }
        );
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

async function chooseMenu(messageChoose, lcphone){
    //choose Pago
    if(messageChoose === categories[0]){
        listCategories(lcphone);
    }
    //choose Facturas
    if(messageChoose === categories[1]){
        listCities(lcphone)
    }
    //chouse Atencion al cliente
    if(messageChoose === categories[2]){
        getCustomerService(lcphone);
    }
}


module.exports = {
    listMenu,
    chooseMenu,
    categories
}
