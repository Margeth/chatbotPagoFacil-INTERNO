const express = require('express');
const config = require("../config");
const Key = require('../Model/Key');
const jwt = require('jsonwebtoken');
const app = require('express')();
const goSecurityService= require('../services/SecurityService');
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const rutasProtegidas = express.Router();
const messageService=require('../services/MessagesService');
const router= express.Router();
const {getResultJsonMessage, responseMessageExceptionActivated} = require('../helpers/answerHelper');

router.post('/authenticate', (req, res) => {
    try{
        var loFechaHoraExpiracion = getExpirationDate();
        const lobdata = req.body;
        const lcUser =goSecurityService.descrypt3DES(lobdata.tcUser, goKey.getKey());
        const lcPasswrd = goSecurityService.descrypt3DES(lobdata.tcPassword, goKey.getKey());
        if(lcUser.replace(/\0.*$/g, '') === "whatsapp@pagofacil" && lcPasswrd.replace(/\0.*$/g, '')=== "WhatsAppPagoFacil$") {
            const loPayload = {
                check: true
            };
            const lotoken = jwt.sign(loPayload, config.llave, {
                expiresIn: "1d"
            });
            const loResult =
                {
                error: 0,
                status: 1,
                message: "Autenticación correcta",
                messageMostrar: 1,
                messageSistema: "",
                values: {
                        message: 'Autenticación correcta',
                        fechaExpiracion: loFechaHoraExpiracion,
                        token: lotoken
    
                }
            };
            res.json(loResult);
        } else {
            const loResult = getResultJsonMessage(1,2,`Usuario o contraseña incorrecto. el usuario es ${lcUser} el passwrd es ${lcPasswrd}`,1,"","El usuario o la contaseña estan incorrectos");
            res.json(loResult);
    
        }    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
});


function getExpirationDate(){
    var currentDate= new Date();

    var dayOfexpiration= currentDate.getDate();
    var monthOfexpiration= currentDate.getMonth()+1;
    var yearOfexpiration = currentDate.getFullYear();

    if(monthOfexpiration == 12 && dayOfexpiration==31 ){
        yearOfexpiration +=1;
        monthOfexpiration = 1;
    }

    if(monthOfexpiration == 2){
            if( dayOfexpiration == 28){
                monthOfexpiration = monthOfexpiration+1;
                dayOfexpiration = 1;
            }
            else
            {
                dayOfexpiration = dayOfexpiration + 1;
            }
        }
        else{
            if( monthOfexpiration % 2 ) {
                if( dayOfexpiration == 30){
                    monthOfexpiration = monthOfexpiration+1;
                    dayOfexpiration = 1;
                }
                else
                {
                    dayOfexpiration = dayOfexpiration + 1;
                }
            }
            else{
                if( dayOfexpiration == 31){
                    monthOfexpiration = monthOfexpiration+1;
                    dayOfexpiration = 1;
                }
                else
                {
                    dayOfexpiration = dayOfexpiration + 1;
                }
            }
        }
        
    var daystring="";
    var monthstring="";
    var hourstring="";
    var minutestring="";
    var secondstring="";

    if( dayOfexpiration <10)
        daystring ="0"+dayOfexpiration;
    else
        daystring =dayOfexpiration+"";

    if( monthOfexpiration <10)
        monthstring ="0"+monthOfexpiration;
    else
        monthstring =monthOfexpiration+"";

        //TIEMPO SETEAR
     if( currentDate.getHours() <10)
         hourstring ="0"+currentDate.getHours();
    else
        hourstring = currentDate.getHours()+"";
    if( currentDate.getMinutes() <10)
        minutestring ="0"+currentDate.getMinutes();
    else
        minutestring =currentDate.getMinutes()+"";
    if( currentDate.getSeconds() <10)
        secondstring ="0"+currentDate.getSeconds();
    else
        secondstring = +currentDate.getSeconds()+"";


    return daystring+"-"+monthstring+"-"+yearOfexpiration +"  "+hourstring + ":" + minutestring + ":" + secondstring;
}

rutasProtegidas.use((req, res, next) => {
        const token = req.headers['access-token'];
        if (token) {
          jwt.verify(token, config.llave, (err, decoded) => {      
            if (err) {
                const loResult = getResultJsonMessage(0,1,"Token inválido", 1, "Token invalido","Token invalido");
               return res.send(loResult);

            } else {
              req.decoded =decoded;
              next();
            }
          });
        } else {
            const loResult = getResultJsonMessage(0,1,"Token no proveido", 1, "", "Token no proveido");
            res.send(loResult);
        }
});
 
module.exports={
    router,
    rutasProtegidas
}
