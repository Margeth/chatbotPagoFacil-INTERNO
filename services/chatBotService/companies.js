const {API_KEY_WABO} = require("../../config");
const {getResultJsonMessage} = require("../../helpers/answerHelper");
const res = require("express/lib/response");
const fs = require('fs');
const {sendMessageButthonAPI} = require("../MessagesService");

async function listCompany(phone, companies) {
    const loResponse = await messageService.apiChatApinv(
        {
            "API_KEY": API_KEY_WABO,
            "phone": phone,//.replace(/\0.*$/g, ''),
            "content": companies,//.replace(/\0.*$/g, '')
        }
    );
    if (loResponse.status) {
        res.json( getResultJsonMessage(0, 1, "El mensaje fue enviado con exito.", 1, "", "El mensaje fue enviado con exito.", loResponse));
    } else {
        res.json( getResultJsonMessage(1, 2, "El mensaje no fue enviado", 1, "El mensaje no pudo enviarse por un error interno de la API", loResponse));
    }
}

async function choseCompany(category) {
    if (category == 1) {
        const loResponse = await messageService.apiChatApinv(
            {
                "API_KEY": API_KEY_WABO,
                "phone": phone, //.replace(/\0.*$/g, ''),
                "content": "eligio el servicio1" //.replace(/\0.*$/g, '')
            }
        );

    }
    if (loResponse.status) {
        res.json( getResultJsonMessage(0, 1, "El mensaje fue enviado con exito.", 1, "", "El mensaje fue enviado con exito.", loResponse));
    } else {
        res.json( getResultJsonMessage(1, 2, "El mensaje no fue enviado", 1, "El mensaje no pudo enviarse por un error interno de la API", loResponse));
    }
}
