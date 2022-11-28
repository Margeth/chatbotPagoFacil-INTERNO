const config = require("./../config");
const express = require('express');
const goCrypto = require("crypto");
const Key = require('../Model/Key');
const bodyParser = require('body-parser');
const Message = require("../Model/Message");
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const goSecurityService= require('../services/SecurityService');
const router= express.Router();
const authenticationRouter= require('../routes/Authenticationroutes');
const messageService=require('../services/MessagesService');
const bussinessService=require('../services/BussinessService');
const { response } = require("express");
const { exception } = require("console");
const {getResultJsonMessage, responseMessageExceptionActivated} = require("../helpers/answerHelper");


/*router.use(bodyParser.urlencoded({
    extended:true
}));*/

router.use(bodyParser.json({
    limit: '50mb'
  }));
  
router.use(bodyParser.urlencoded({
    limit: '50mb',
    parameterLimit: 1000000,
    extended: true 
  }));

router.get('/', async function(req,res,next){
    try{
        res.json(await bussinessService.getCompanies());
    }
    catch(err){
        next(err);
    }
});

router.post('/crearTipoChat',async function(req,res,next){
    try{
        res.json(await messageService.insertTipoChat(req.body));

    }catch(err){
        next(err);
    }
    
});

router.post('/setKey', authenticationRouter.rutasProtegidas , async function(request,res){
    try {
        var loKey = null;
        const lcnewKey = request.body.tcKey;
        if (lcnewKey.length == 24) {
            goKey.setKey(request.body.tcKey);
            loKey = getResultJsonMessage(0,1,"La actualización fue realizada con exito",1,"","La actualización fue realizada con exito");
        }
        else {
            loKey = getResultJsonMessage(1,1,"Llave proporcionada invalida",0,"","Llave proporcionada invalida");
        }
        res.json(loKey);
    } 
    catch (exception) 
    {
        res.json(responseMessageExceptionActivated());
    }
})

router.get('/getKey', authenticationRouter.rutasProtegidas, async function(req,res){
    const lckey= goKey.getKey();
    const loKey = getResultJsonMessage(0,1,"La consulta fue realizada con exito",0,"",lckey);
    res.json(loKey);
})

router.post('/pruebinha', function (req, res) {
    const data = req.body;
    for (var i in data.messages) {
        const lcauthor = data.messages[i].tnAuthor;
        const lcbody = data.messages[i].tcBody;
        const lcchatId = data.messages[i].tnChatId;
        const lcsenderName = data.messages[i].tnSenderName;
        
        if(data.messages[i].fromMe)return;

    }
});

router.post('/my_webhook_url', function (req, res) {
    var data = req.body; 
    for (var i = 0; i < data.messages.length; i++) {
        var message = data.messages[i];
    }
    res.send('Ok');
});

router.post('/registerAutomaticMessage',authenticationRouter.rutasProtegidas, async function (req,res){
    const lodata = req.body;
    const lnIdChat = lodata.chatId;
    const lnEmpresa = lodata.empresa;
    const lnmensajeReenviado=lodata.mensajeReenviado;
    const lnmensajeEtiquetado=lodata.mensajeEtiquetado;
    const lcTipoAdjunto = lodata.TipoAdjunto;
    const lcMensaje= lodata.mensaje;

    const lcMessageSystem= await messageService.registerAutomaticMessageGeneral(lnIdChat,lnmensajeReenviado,lnmensajeEtiquetado,lcTipoAdjunto,lcMensaje,lnEmpresa);
    await messageService.apiChatApi('sendMessage', {phone : lcchat, body : lcbody});
    const loResult = getResultJsonMessage(0,1,"El mensaje fue enviado con exito",1,"","El mensaje fue enviado con exito");
    res.json(loResult);    
});

router.post('/asignarAgenteAChat',authenticationRouter.rutasProtegidas,  async function (request,res){
    try{
        const lodata = request.body;
        const lnChatIdDatabase = goSecurityService.descrypt3DES(lodata.tnChatId, goKey.getKey());
        const lnAgent = goSecurityService.descrypt3DES(lodata.tnAgente, goKey.getKey());
        //    const lcconversacion=lobdata.conversacion;
        const lcAgent = await messageService.changeAgent(lnAgent, lnChatIdDatabase);
        const loKey = getResultJsonMessage(0,1,"La actualización fue realizada con exito",1,"",lcAgent);
        res.json(loKey);
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
});

router.post('/crearConversacion',authenticationRouter.rutasProtegidas, async function (request,res){
    try {
        const loData = request.body;
        const lcTipoConversacion = goSecurityService.descrypt3DES(loData.tcTipoConversacion, goKey.getKey());
        const lcChat = goSecurityService.descrypt3DES(loData.tcChatId, goKey.getKey());
        const lnmessage = await messageService.
        registerConversation(lcTipoConversacion, lcChat);

        if (lnmessage == 1) { //Succeful message
            const loKey = getResultJsonMessage(0,1,"El registro de la conversación fue realizada con exito",1,"","El registro de la conversación fue realizada con exito");
            res.json(loKey);
        }
        else {
            const loKey = getResultJsonMessage(1,1,"Registro fallido",1,"","registro fallido");
            res.json(loKey);

        }

    }
    catch (exception) {
        res.json(responseMessageExceptionActivated());
    }

});

router.post('/chatList',authenticationRouter.rutasProtegidas, async function (req, res) {
    try {
        const lobdata = req.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResponse = await messageService.getChatApi('dialogs', loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        const loResult = getResultJsonMessage(0,1,"Lista de chats obtenido exitosamente",1,"El listado de chats se pudo obtener",loResponse);
        res.json(loResult);
    }
    catch (exception) {
        res.json(responseMessageExceptionActivated());
    }
});

router.post('/sendMessage',authenticationRouter.rutasProtegidas, async function (req, res) {
    //try{
        const lobdata = req.body;
        const lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        const lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        const lcphone = goSecurityService.descrypt3DES( lobdata.tcPhone , goKey.getKey() );
        const lcmessage = goSecurityService.descrypt3DES( lobdata.tcMessage , goKey.getKey() );
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        console.log('el mensaje '+ lcmessage);
  /*      res.json( {
            lcChatIdwhatsApp: lcChatIdwhatsApp,
            lnIdEmpresa: lnIdEmpresa ,
            lcphone: lcphone,
            lcmessage: lcmessage ,
            lcInstanceNumber: lcInstanceNumber,
            lcChatName: lcChatName});
       var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
       */
        const loResponse = await messageService.apiChatApinv(/*, loInstanceAndUsername.instancia, loInstanceAndUsername.token,*/
/*            {
                body: lcmessage.replace(/\0.*$/g, ''),
                chatId: lcphone.replace(/\0.*$/g, '')
            }*/
            {
                "API_KEY": "lfZaJtnhB8j5OEXXZIkcCOkXQXhnR0hqByBrN87rAj4=",
                "phone": lcphone,//.replace(/\0.*$/g, ''),
                "content": lcmessage,//.replace(/\0.*$/g, '')

            }

        );

        var loResponseServer=null;
        if(/*loResponse.sent*/loResponse.status){
//            await messageService.registerTextMessage(loInstanceAndUsername, lcChatIdwhatsApp, lcChatName, lnIdEmpresa, lcmessage,loResponse.id);
            loResponseServer = getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else{
            loResponseServer=getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer);    
   /* }
    catch(exception){

       res.json({
        body: exception

    });
       // res.json(responseMessageExceptionActivated());
    }*/
});

router.post('/sendFile', authenticationRouter.rutasProtegidas, async function (request, res) {
    try{
        const lobdata = request.body;
        var lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        var lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        var lcPhone = goSecurityService.descrypt3DES(lobdata.tcPhone, goKey.getKey());
        var lcpathfile = lobdata.contentBase64;
        var lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        var lcfilename = goSecurityService.descrypt3DES(lobdata.tcFilename, goKey.getKey());
        var lnType = lobdata.tnType;
        
//        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        var lodataFile = {
            "API_KEY": "lfZaJtnhB8j5OEXXZIkcCOkXQXhnR0hqByBrN87rAj4=",
            "TYPE": lnType,
            "phone": lcPhone.replace(/\0.*$/g, ''),
            "content": lcfilename.replace(/\0.*$/g, ''),
            "name_file": lcfilename.replace(/\0.*$/g, ''),
            "contentBase64": lcpathfile
/*            chatId: lcPhone.replace(/\0.*$/g, ''),
            body: lcpathfile.replace(/\0.*$/g, ''),
            filename: lcfilename.replace(/\0.*$/g, '')*/

        };
      
//        console.log("Mensaje enviado Del numero de telefono "+lcPhone);
        const loResponse = await messageService.apiChatApiNVFile(/*'sendFile', loInstanceAndUsername.instancia, loInstanceAndUsername.token,*/ lodataFile);
        var loResponseServer = null;
        if (loResponse.status) {
//            await messageService.registerFileMessage(loInstanceAndUsername, lcChatIdwhatsApp, lcChatName, lnIdEmpresa, 3, lcpathfile, loResponse.id, 1, lcfilename);
            loResponseServer = getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else {
            loResponseServer = getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer); 
        
    }
    catch(exception){
        
        //res.json(responseMessageExceptionActivated());
        res.json(exception.message);
    }
});

router.post('/sendAudio', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        const lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        const lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        const lcpptpath = goSecurityService.descrypt3DES(lobdata.tcAudiopptpath, goKey.getKey() );
        const lcphone = goSecurityService.descrypt3DES(lobdata.tcPhone, goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        console.log("Mensaje enviado Del numero de telefono "+lcphone);
        const loResponse = await messageService.apiChatApi('sendAudio', loInstanceAndUsername.instancia, loInstanceAndUsername.token, {
            audio: lcpptpath.replace(/\0.*$/g, ''),
            chatId: lcphone.replace(/\0.*$/g, '')
        });
        var loResponseServer=null;
        if(loResponse.sent){
            await messageService.registerAudioMessage(loInstanceAndUsername,lcChatIdwhatsApp,lcChatName,lnIdEmpresa,lcpptpath,loResponse.id);
            loResponseServer=getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else{
            loResponseServer=getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/sendLocation', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        const lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        const lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        const lcphone = goSecurityService.descrypt3DES(lobdata.tcPhone, goKey.getKey() );
        const lflatitude = goSecurityService.descrypt3DES(lobdata.tnLatitude, goKey.getKey() );
        const lflongitude = goSecurityService.descrypt3DES(lobdata.tnLongitude, goKey.getKey() );
        const lcaddressName = goSecurityService.descrypt3DES(lobdata.tcAddress, goKey.getKey() );
        const lcAddressFormed=lflatitude+";"+lflongitude;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        console.log("Mensaje enviado Del numero de telefono "+lcphone);

        const loResponse = await messageService.apiChatApi('sendLocation', loInstanceAndUsername.instancia, loInstanceAndUsername.token, { 
            lat: lflatitude.replace(/\0.*$/g, ''),
            lng: lflongitude.replace(/\0.*$/g, ''), 
            address: lcaddressName.replace(/\0.*$/g, ''), 
            chatId: lcphone.replace(/\0.*$/g, '') 
        });
        var loResponseServer = null;
        if (loResponse.sent) {
            await messageService.registerLocationMessage(loInstanceAndUsername,lcChatIdwhatsApp,lcChatName, lnIdEmpresa, lcAddressFormed, loResponse.id,lcaddressName );
            loResponseServer = getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else {
            loResponseServer = getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/crearGrupo', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const lcnmaeGroup = goSecurityService.descrypt3DES(lobdata.tcGroupName, goKey.getKey() );
        const lcnmessagetext = goSecurityService.descrypt3DES(lobdata.tcMessagetothegroup, goKey.getKey() );
        const lvarrayPhones = messageService.decryptAllChatIdInAGroup(lobdata.taChatIds);
        const loGroupObject={
            groupName: lcnmaeGroup.replace(/\0.*$/g, ''),
            chatIds: lvarrayPhones,
            messageText: lcnmessagetext.replace(/\0.*$/g, '')
        }
        const loResponse = await messageService.apiChatApi ('group',loInstanceAndUsername.instancia, loInstanceAndUsername.token, loGroupObject);
        const loResult = getResultJsonMessage(0,1,"El grupo fue creado con exito",1,"","El grupo fue creado con exito");
        res.json(loResult);
    }
    catch(exception)
    {
        res.json(responseMessageExceptionActivated());
    }
})

router.post("/chatInformation", authenticationRouter.rutasProtegidas,async function(req,res){
    try{
        const lcChatId = goSecurityService.descrypt3DES(req.body.tcChatId,goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(req.body.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResult = await messageService.getChatInformation('dialog', lcChatId.replace(/\0.*$/g, ''),loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        const lcid =  goSecurityService.encrypt3DES(loResult.id, goKey.getKey());
        const lcname =  goSecurityService.encrypt3DES(loResult.name, goKey.getKey());
        const lbisGroup =  goSecurityService.encrypt3DES(loResult.metadata.isGroup, goKey.getKey());
        const laParticipants =  goSecurityService.encrypt3DES(loResult.metadata.participants, goKey.getKey());
        const laAdmins = goSecurityService.encrypt3DES(loResult.metadata.admins, goKey.getKey());
        const laAdminsInfo =  goSecurityService.encrypt3DES(loResult.metadata.participantsInfo, goKey.getKey());
        const lcAditionalValue = messageService.validateAttribute(loResult.metadata.groupInviteLink);
        const lbgroupInviteLink =  goSecurityService.encrypt3DES(lcAditionalValue, goKey.getKey());
        const lnLastTimeInContact =  goSecurityService.encrypt3DES(loResult.last_time, goKey.getKey());
        const lcImage = goSecurityService.encrypt3DES(loResult.image, goKey.getKey());
    
        const loResultResponse = {
            error: 0,
            status: 1,
            message: "Consulta realizada con exito.",
            messageMostrar: 1,
            messageSistema: "",
            values: {
                id: lcid,
                name: lcname,
                metadata: {
                    isGroup: lbisGroup,
                    participants: laParticipants,
                    admins: laAdmins,
                    participantsInfo: laAdminsInfo,
                    groupInviteLink: lbgroupInviteLink
                },
                last_time: lnLastTimeInContact,
                image: lcImage
            }
        };
        res.json(loResultResponse);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }



});

router.post("/messageListByAContact", authenticationRouter.rutasProtegidas,async function (req, res) {
    try{
        const lcChatId = goSecurityService.descrypt3DES(req.body.tcChatId,goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(req.body.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        var result = await messageService.getChatInformation('messages', lcChatId.replace(/\0.*$/g, ''),loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        var laMessages = [];
        for (var i = 0; i < result.messages.length; i++) {
            const lcIdMessage = await goSecurityService.encrypt3DES(result.messages[i].id, goKey.getKey());
            const lcIdBody = await goSecurityService.encrypt3DES(result.messages[i].body, goKey.getKey());
            const lcAditionFromMe = messageService.validateAttribute(result.messages[i].fromMe);
            const lcFromMe = await goSecurityService.encrypt3DES(lcAditionFromMe, goKey.getKey())
            const lnSelf = await goSecurityService.encrypt3DES(result.messages[i].self, goKey.getKey());
            const lnAditionalIsForwarded = messageService.validateAttribute(result.messages[i].isForwarded, goKey.getKey());
            const lnIsForwarded = await goSecurityService.encrypt3DES(lnAditionalIsForwarded, goKey.getKey())
            const lcAuthor = await goSecurityService.encrypt3DES(result.messages[i].author, goKey.getKey());
            const lntime = await goSecurityService.encrypt3DES(result.messages[i].time, goKey.getKey())
            const lcChatId = await goSecurityService.encrypt3DES(result.messages[i].chatId, goKey.getKey());
            const lcMessageNumber = await goSecurityService.encrypt3DES(result.messages[i].messageNumber, goKey.getKey())
            const lcType = await goSecurityService.encrypt3DES(result.messages[i].type, goKey.getKey());
            const lcSenderName = await goSecurityService.encrypt3DES(result.messages[i].senderName, goKey.getKey());
            const lcAditionalValuequotedMsgBody = messageService.validateAttribute(result.messages[i].quotedMsgBody);
            const lcquotedMsgBody = await goSecurityService.encrypt3DES(lcAditionalValuequotedMsgBody, goKey.getKey());
            const lcAditionalValuequotedMsgId = messageService.validateAttribute(result.messages[i].quotedMsgId);
            const lcquotedMsgId = await goSecurityService.encrypt3DES(lcAditionalValuequotedMsgId, goKey.getKey())
            const lcAditionalValuequotedMsgType = messageService.validateAttribute(result.messages[i].quotedMsgType);
            const lcquotedMsgType = await goSecurityService.encrypt3DES(lcAditionalValuequotedMsgType, goKey.getKey());
            const lcChatName = await goSecurityService.encrypt3DES(result.messages[i].chatName, goKey.getKey());
            const message = new Message(lcIdMessage, lcIdBody, lcFromMe, lnSelf,
                lnIsForwarded, lcAuthor, lntime, lcChatId, lcMessageNumber,
                lcType, lcSenderName, lcquotedMsgBody, lcquotedMsgId, lcquotedMsgType,
                lcChatName)
            laMessages.push(message);
        }
        const lcLastMessageNumber = await goSecurityService.encrypt3DES(result.lastMessageNumber, goKey.getKey());
        const loResult = {
            error: 0,
            status: 1,
            message: "Consulta realizada con exito.",
            messageMostrar: 1,
            messageSistema: "",
            values: {
                messages: laMessages,
                lastMessageNumber: lcLastMessageNumber
            }
        };
        res.json(loResult);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
});

router.post('/sendContact', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        var lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        var lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        var lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const laContactId = messageService.decryptAllChatIdInAGroup(lobdata.tcContactId, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResponse= await messageService.apiChatApi('sendContact',loInstanceAndUsername.instancia, loInstanceAndUsername.token, 
        {
            chatId: lcChatIdwhatsApp.replace(/\0.*$/g, ''),
            contactId: laContactId 
        });
        console.log("Mensaje enviado Del numero de telefono "+lcChatIdwhatsApp);

        var loResponseServer = null;
        if (loResponse.sent) {
            var cad = "";
            for(var i in laContactId){
                cad+= laContactId[i]+";";
            
            }    
            await messageService.registerContactMessage(loInstanceAndUsername, 
                lcChatIdwhatsApp, lcChatName, lnIdEmpresa,
                 cad, loResponse.id);
            loResponseServer = getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else {
            loResponseServer = getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer);    

    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/forwardMessage', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        const lcChatId = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        const lcMessageId = goSecurityService.descrypt3DES(lobdata.tcMessageId, goKey.getKey());
        const lnIdEmpresa = goSecurityService.descrypt3DES(lobdata.tnIdEmpresa, goKey.getKey());
        const lcChatName = goSecurityService.descrypt3DES(lobdata.tcChatName, goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResponse = await messageService.apiChatApi('forwardMessage',loInstanceAndUsername.instancia, loInstanceAndUsername.token, 
            {
                chatId: lcChatId.replace(/\0.*$/g, ''),
                messageId: lcMessageId.replace(/\0.*$/g, '')
            });
        var loResponseServer = null;
        if (loResponse.sent) {
            await messageService.registerRewardedMessage(loInstanceAndUsername, 
                lcChatId, lcChatName, lnIdEmpresa,
                 lcMessageId, loResponse.id);
            loResponseServer = getResultJsonMessage(0,1,"El mensaje fue enviado con exito.",1,"","El mensaje fue enviado con exito.",loResponse);
        }
        else {
            loResponseServer = getResultJsonMessage(1,2,"El mensaje no fue enviado",1,"El mensaje no pudo enviarse por un error interno de la API", loResponse);
        }
        res.json(loResponseServer);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/borrarMensaje', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        var lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const lcMessageId = goSecurityService.descrypt3DES(lobdata.tcMessageId, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
    
        const loResponse = await messageService.apiChatApi('deleteMessage', loInstanceAndUsername.instancia, loInstanceAndUsername.token,
            {
                messageId: lcMessageId.replace(/\0.*$/g, '')
            });
        var loResult=null;
        if(loResponse.sent)
        {
            loResult = getResultJsonMessage(0,1,"El mensaje fue borrado con exito",1,"","El mensaje fue borrado con exito")
        }
        else{
            loResult = getResultJsonMessage(0,1,"El mensaje no fue borrado con exito",1,"","El mensaje no fue borrado con exito");
        res.json(loResult);
        }
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/getInformationGroup', authenticationRouter.rutasProtegidas, async function(request,res){
    try{
        const lobdata = request.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const lcChatIdwhatsApp = goSecurityService.descrypt3DES(lobdata.tcChatId, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        var lcIdPhoneInString = lcChatIdwhatsApp.replace(/\0.*$/g, '').split("@");
    //    const lcChatId = goSecurityService.descrypt3DES(lobdata.tnChatId, goKey.getKey());
        const loResponse = await messageService.apiChatApiDialog('dialog',lcIdPhoneInString[0],loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        const laChatIdsMembers=loResponse.metadata.participants;
        const laChatIdsAdmins=loResponse.metadata.admins;
        const lcGroupInviteLink=loResponse.metadata.groupInviteLink;
        const lcNameGroupEncrypted=goSecurityService.encrypt3DES(loResponse.name,goKey.getKey());
        const laChatIdsMembersEncryted=messageService.encryptAllChatIdInAGroup(laChatIdsMembers);
        const laChatIdsAdminsEncryted=messageService.encryptAllChatIdInAGroup(laChatIdsAdmins);
     //   const lcGroupInviteLinkEncryted=goSecurityService.encrypt3DES(lcGroupInviteLink, goKey.getKey());
        const lcImageUrl=goSecurityService.encrypt3DES(loResponse.image, goKey.getKey());
        const loResult =  {
            error: 0,
            status: 1,
            message: "La información del grupo fue obtenido con exito.",
            messageMostrar: 1,
            messageSistema: "",
            values: { 
                name:lcNameGroupEncrypted,
                members:laChatIdsMembersEncryted,
                admins:laChatIdsAdminsEncryted,
    //            groupInviteLink:lcGroupInviteLinkEncryted,
                lcImageUrl:lcImageUrl
            }
        };
        res.json(loResult);
    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());

    }
})

router.post('/informationUser', authenticationRouter.rutasProtegidas, async function (req, res) {
    try{
        const lcInstanceNumber = goSecurityService.descrypt3DES(req.body.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const result = await messageService.getChatApi('me', loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        const lidChat = goSecurityService.encrypt3DES(result.id, goKey.getKey());
        const lbattery = goSecurityService.encrypt3DES(result.battery, goKey.getKey());
        const llocale = goSecurityService.encrypt3DES(result.locale, goKey.getKey());
        const lname = goSecurityService.encrypt3DES(result.locale, goKey.getKey());
        const lwa_version = goSecurityService.encrypt3DES(result.wa_version, goKey.getKey());
        const los_version = goSecurityService.encrypt3DES(result.device.os_version, goKey.getKey());
        const lmanufacturer = goSecurityService.encrypt3DES(result.device.manufacturer, goKey.getKey());
        const model = goSecurityService.encrypt3DES(result.device.model, goKey.getKey());
    
        const loResult = {
            error: 0,
            status: 1,
            message: "El contacto fue enviado con exito.",
            messageMostrar: 1,
            messageSistema: "",
            values: {
                idChat: lidChat,
                battery: lbattery,
                locale: llocale,
                name: lname,
                wa_version: lwa_version,
                device: {
                    os_version: los_version,
                    manufacturer: lmanufacturer,
                    model: model
                }
            }
        };
        res.json(loResult);
    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/existPhone',authenticationRouter.rutasProtegidas, async function (req, res) {
    try{
        const lcNumber = req.body.tcNumeroTelefono;
        console.log("El numero es ",lcNumber);
//        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResultJson = await messageService.setExistANumberOrNot(lcNumber);
//        const model = goSecurityService.encrypt3DES(result.device.model, goKey.getKey());
        const loResult = getResultJsonMessage(0,1,"Se realizó la verificación de número correctamente",1,"", loResultJson.result)
        res.json(loResult);
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());
    }
})

router.post('/postKey',async function(request,res){
    const lcchatId = request.chaId;
    const lcmessageId = request.messageId;
    await messageService.apiChatApi('forwardMessage', { chatId: lcchatId , messageId: lcmessageId }); 
    res.send("OK"); 
})

router.get('/tokenGenerate', async function (req, res){
/*    var lcCadenaBase1 = '1' + 'Pais' + 'Region' + 'Nombre Empresa';
    var lcCadenaBase2 = 'RazonSocial' + 'Nit' + 'Email';
    var lcCadenaBase3 = 'EmpresaSerial' + 'Pais' + 'Region' + 'Nombre Comercio';
    var lcCadenaBase4 = 'Razon Social' + 'Nit' + 'Email' + 'TipoToken';

    let lcHash1 = goCrypto.createHash('sha256').update(lcCadenaBase1).digest('base64').trim();
    let lcHash2 = goCrypto.createHash('sha256').update(lcCadenaBase2).digest('base64').trim();
    let lcHash3 = goCrypto.createHash('sha256').update(lcCadenaBase3).digest('base64').trim();
    let lcHash4 = goCrypto.createHash('sha256').update(lcCadenaBase4).digest('base64').trim();

    let lcHash = lcHash1 + lcHash2 + lcHash3 + lcHash4;

    res.json({KeyGenerated:lcHash});*/


});

router.get('/ultimosmensajes',authenticationRouter.rutasProtegidas, async function (req, res) {
    try {
/*        const lobdata = req.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));*/
        const loResponse = await messageService.apiChatApiGetQueueMessagesNumber('showMessagesQueue');
        const loResult = getResultJsonMessage(0,1,"Mensajes en cola",1,"Lista de mensajes en cola",loResponse);
        res.json(loResult);
    }
    catch (exception) {
        res.json(responseMessageExceptionActivated());
    }
});

router.post('/clearquemessages',authenticationRouter.rutasProtegidas, async function (req, res) {
    try {
/*        const lobdata = req.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));*/
        const loResponse = await messageService.apiChatApiClearQueueMessages('showMessagesQueue');
        const loResult = getResultJsonMessage(0,1,"Se limpio los mensajes correctamente",1,"Los mensajes en cola fueron vaciados correctamente",loResponse);
        res.json(loResult);
    }
    catch (exception) {
        res.json(responseMessageExceptionActivated());
    }
});

module.exports={
    router
/*    ,verifyUser
    ,verifyChat,
    registerMesage,
    registerTextMessage,
    registerVideoMessage,
    registerFileMessage,
    registerImageMessage*/
};
