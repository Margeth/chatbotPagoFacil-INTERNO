const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");
const messageService = require("../MessagesService");


var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);

async function listServicebyCity(nameCity, lcphone) {
    try {
        const loResponse = await messageService.apiChatApinv(
            {
                "API_KEY": API_KEY_WABO,
                "phone": lcphone,//.replace(/\0.*$/g, ''),
                "content": "1.COOPAGUAS \n"+
                    "2.COOPLAN\n"+
                    "3.COMAYO\n"+
                    "4.Aguas del Urubo\n"
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
async function nameCityClear(nameCity){
    return nameCity.substring(2, nameCity.length-1);
}
//let lcmessageNameCity = nameCityClear(nameCity);
async function chooseService(customerOption, lcPhone){
    //customerOption = customerOption.substring(0,1);
    if(customerOption ===1){
        getLink("https://lpf.app/COOPAGUAS",lcPhone );
    }
    if(customerOption ===2){
        getLink("https://lpf.app/COOPLAN",lcPhone );
    }
    if(customerOption ===3){
        getLink("https://lpf.app/COSCHAL",lcPhone );
    }

}
async function getLink(linkCompany, lcphone){
    const loResponse = await messageService.apiChatApinv(
        {
            "API_KEY": API_KEY_WABO,
            "phone": lcphone, //.replace(/\0.*$/g, ''),
            "content": linkCompany
        }
    );
}
async function getOthers(lcphone){
    const loResponse = await messageService.apiChatApinv(
        {
            "API_KEY": API_KEY_WABO,
            "phone": lcphone, //.replace(/\0.*$/g, ''),
            "content": "1.Telecomunicaciones \n"+
                "2.Comerciales\n"+
                "3.Profesionales\n"+
                "4.Organizaciones\n"+
                "5.Crowfunding\n"+
                "6.Delivery"
        }
    );
}

module.exports = {
    listServicebyCity,
    chooseService
}
