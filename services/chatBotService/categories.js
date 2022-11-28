const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");
const {listCities} = require("./cities");

const categories =["Servicio eléctrico", "Servicio de agua", "Educación","Otros"];

var logger = fs.createWriteStream('log2.txt', {
    flags: 'a' // 'a' means appending (old data will be preserved)
})
var writeLine = (line) => logger.write(`\n${line}`);
async function listCategories(phone) {
    try {
        const loResponse = await sendMessageButthonAPI(
            {
                "API_KEY": API_KEY_WABO,
                "phone": phone, //.replace(/\0.*$/g, ''),
                "content": "Elija el rubro por favor",
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
                    },
                    {
                        "buttonId": "4",
                        "buttonText": {"displayText": categories[3]},
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

async function chooseCategory(messageChoose, lcphone){
    //choose servicio electrico
    if(messageChoose === categories[0]){
        listCities(lcphone);
    }
    //choose servicio de agua
    if(messageChoose === categories[1]){
        listCities(lcphone)
    }
    //choouse Educacion
    if(messageChoose === categories[2]){
        listCities(lcphone);
    }
    if(messageChoose === categories[3]){
        getOthers(lcphone);
    }
    //choouse Otros

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
    listCategories,
    chooseCategory

}
