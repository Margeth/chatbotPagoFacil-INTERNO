const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");
const {listServicebyCity} = require("./services");

const cities =["Santa Cruz", "La Paz", "Cochabamba","Otros"];

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);
async function listCities(phone) {
    try {
        const loResponse = await sendMessageButthonAPI(
            {
                "API_KEY": API_KEY_WABO,
                "phone": phone, //.replace(/\0.*$/g, ''),
                "content": "Elija su ciudad",
                "footerContent": "Pago Facil",
                "buttons": [
                    {
                        "buttonId": "1",
                        "buttonText": {"displayText": cities[0]},
                        "type": 1
                    },
                    {
                        "buttonId": "2",
                        "buttonText": {"displayText": cities[1]},
                        "type": 1
                    },
                    {
                        "buttonId": "3",
                        "buttonText": {"displayText": cities[2]},
                        "type": 1
                    },
                    {
                        "buttonId": "4",
                        "buttonText": {"displayText": cities[3]},
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

async function chooseCity(messageChoose, lcphone){

    //choose Santa Cruz
    if(messageChoose === categories[0]){
        listServicebyCity(messageChoose,lcphone);
    }
    //choose La Paz
    if(messageChoose === categories[1]){
        listCities(lcphone)
    }
    //choouse Cochabamba
    if(messageChoose === categories[2]){
        getCustomerService(lcphone);
    }
    //choouse Other
    if(messageChoose === categories[3]){
        getOthers(lcphone);
    }

}
async function getOthers(lcphone){
    const loResponse = await messageService.apiChatApinv(
        {
            "API_KEY": API_KEY_WABO,
            "phone": lcphone, //.replace(/\0.*$/g, ''),
            "content": "1.Tarija \n"+
                "2.Chuquisaca\n"+
                "3.Oruro\n"+
                "4.Beni\n"
        }
    );
}


module.exports = {
    listCities,
    chooseCity,
    cities
}
