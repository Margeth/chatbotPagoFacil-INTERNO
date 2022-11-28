const express = require('express');
const messageService=require('../services/MessagesService');
const bussinessService=require('../services/BussinessService');
const config = require("./../config");
const router= express.Router();
const goSecurityService= require('../services/SecurityService');
const companydao= require('../dao/companydao');
const tokenAPI= config.uid;
const authenticationRouter= require('../routes/Authenticationroutes');
const Key = require('../Model/Key');
const Message = require("../Model/Message");
const Conversation = require('../Model/Conversation');
const MessageConversation = require('../Model/Messageconversation');
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const helpers = require('../helpers/dateHelpers');
const {getResultJsonMessage, responseMessageExceptionActivated} = require("../helpers/answerHelper");



router.post('/registrarEmpresa',authenticationRouter.rutasProtegidas, async function registerCompany(req, res) {
    var lcmessage = await bussinessService.registerCompany(req.body);
    if(lcmessage==='1'){
        let loLastCompany= await bussinessService.getLastBussiness();
        var lctokenSecret = await bussinessService.generateTokenSecret();
        var lctokenService = await bussinessService.generateTokenService();
        var lccommerceID = await bussinessService.generateCommerceID();    
        var lcmessageTokenRegistered = await bussinessService.registerTokenCompany(loLastCompany[0].Empresa, 1, 'TipoToken1', 'MetodoDeCreacion', 'NOmbreEmpresa', lctokenService, lctokenSecret, 'http:/pagoFacilBolivia.com', 'http://pagoFacilBolivia.com', 'Buenas tardes');
        const loKey = {
            error: 0,
            status: 1,
            message: "Registro exitoso de empresa, Generación de licencias correctas",
            messageMostrar: 1,
            messageSistema: lcmessageTokenRegistered,
            values: {         
                tokenSecret: lctokenSecret,
                tokenService: lctokenService,
                CommerceID: lccommerceID
         }
        };
        res.json(loKey);

    }
    else{
        const loKey = getResultJsonMessage(1,1,"Ocurrio un error en el registro de la empresa",1, lcmessageTokenRegistered,"Ocurrio un error en el registro" );
        res.json(loKey);

    }
//    var message = await messageService.registerCompany(req.body);
});

router.post('/generartokensempresa',authenticationRouter.rutasProtegidas, async function registerCompany(req, res) {
    try{
        var lnEmpresaCommerceId= req.body.tnEmpresaComercio;//goSecurityService.descrypt3DES(req.body.tnEmpresaComercio, goKey.getKey());;
        var lctokenSecret = await bussinessService.generateTokenSecret();
        var lctokenService = await bussinessService.generateTokenService(lnEmpresaCommerceId);
        var company= await bussinessService.getCompanyData(lnEmpresaCommerceId);
        //var lcmessageTokenRegistered = await bussinessService.registerTokenCompany(company.Empresa, 1, 'Service', 'generateBussinessKeys', company.Nombre , lctokenService, lctokenSecret, company.direccion, company.email, 'Buenas tardes');
        const loKey = {
            error: 0,
            status: 1,
            message: "Generación de licencias correctas",
            messageMostrar: 1,
            messageSistema: "Generación de llaves realizado con exito",
            values: {
                tokenSecret: lctokenSecret,
                tokenService: lctokenService
            }
        };
    
        res.json(loKey);
    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());

    }
//    res.json({message:lctokenSecret});
});


router.post('/actualizarTokenSecreto',authenticationRouter.rutasProtegidas,async function(req,res,next){
    try {
        var lnEmpresaId= goSecurityService.descrypt3DES(req.body.tnEmpresa, goKey.getKey());
        let lcMessageService = await bussinessService.updateKeySecret(lnEmpresaId);
        const loKey = getResultJsonMessage(0,0,"Actuaización de token exitoso",1, lcMessageService );
        res.json(loKey);

    }catch(err){
        const loKey = getResultJsonMessage(1,1,"Ocurrió un error en la actuaización de token",0, "Ocurrió un error en la actualización del token", "Llave inválida" );
        next(loKey);
    }
});

router.post('/actualizarTokenServicio',authenticationRouter.rutasProtegidas,async function(req,res,next){
    try {
        var lnEmpresaId= goSecurityService.descrypt3DES(req.body.tnEmpresa, goKey.getKey());;
        let lcMessageService = await bussinessService.updateKeyService(lnEmpresaId);
        const loKey = getResultJsonMessage(0,1,"La actualización fue realizada con exito",1, "La actualización fue realizada con exito", lcMessageService );
        res.json(loKey);

    }catch(err){
        const loKey = getResultJsonMessage(1,1,"Ocurrio un error con la actualización",0, "", "Llave invalida" );
        res.json(loKey);
    }

});

router.get('/addInstance',authenticationRouter.rutasProtegidas,async function(request,res){
    const  loparams =
    {
        "uid": tokenAPI,
        "type": "whatsapp"
    }
    const loResponse = await messageService.apiChatApiInstancePost('newInstance', loparams);
    var loResult = null;
    if (loResponse.result.status === 'created') {
        const lcMessage = await bussinessService.registerNewInstance(loResponse.result.instance.id, loResponse.result.instance.token);
        loResult = getResultJsonMessage(0,1,"Exito en crear la nueva instancia",1,"La nueva instancia se creó correctamente", lcMessage);
    }
    else {
        loResult = getResultJsonMessage(0,1,"Error al crear la nueva instancia",1,"La nueva instancia no se creó correctamente", "Instancia no fue creada correctamente");
    }
    res.json(loResult);
});

router.get('/listaInstancias', authenticationRouter.rutasProtegidas, async function (request, res) {
    const loResponse = await messageService.apiChatApiInstanceGet();
    let loResult = getResultJsonMessage(0,1,"Lista de instancias obtenida correctamente",1,"Lista de instancias se obtuvo exitosamente", loResponse);
    res.json(loResult);
});


router.post('/deleteInstance', authenticationRouter.rutasProtegidas, async function (request, res) {
    try{
        const lobdata = request.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        let loResult ;
        const loparams =
        {
            "uid": tokenAPI,
            "instanceId": lcInstanceNumber.replace(/\0.*$/g, '')
        }
        var lcMessage = "La instancia no se eliminó correctamente";
        const loResponse = await messageService.apiChatApiInstancePost('deleteInstance', loparams);
        if (loResponse.result === 'deleted') {
            lcMessage = bussinessService.deleteInstance(lcInstanceNumber.replace(/\0.*$/g, ''));
            loResult = getResultJsonMessage(0,1,"Exito en borrar la instancia",1,"La instancia se borro correctamente", lcMessage);
        }
        else {
            loResult = getResultJsonMessage(0,1,"Fallo en borrar la instancia",1,"Fallo en borrar la instancia", lcMessage);
        }
        res.json(loResult);
    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());

    }
});


router.get('/getqruser', authenticationRouter.rutasProtegidas, async function(req,res){
    const loinstanceAvailable= await companydao.searchAvailableInstancesInWhatsApp();
    const loResponse = await messageService.apiChatApiDialogQRCode(res,loinstanceAvailable.Instancia, loinstanceAvailable.Token);
});


router.post('/cerrarSesion', authenticationRouter.rutasProtegidas, async function (request, res) {
    try{
        const lobdata = request.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey()); 
        var loInstanceAndUsername = await messageService.searchInstanceByIdUserWhatsApp(lcInstanceNumber.replace(/\0.*$/g, ''));
        const loResponse = await messageService.apiChatApiLogoutSystem('logout', loInstanceAndUsername.instancia, loInstanceAndUsername.token);
        var loResult=null;
        if(typeof(loResponse.result)==='undefined'){
            loResult = getResultJsonMessage(1,2,"Error al cerrar la sesion",1,"Fallo al cerrar sesion", loResponse);
        }
        else{
            loResult = getResultJsonMessage(0,1,"Exito al cerrar sesión",1,"Se cerró la sesión correctamente", loResponse);

        }
        res.json(loResult);    
    }
    catch(exception){
        res.json(responseMessageExceptionActivated());

    }
});



router.post('/listaConversacionesByIdChat', authenticationRouter.rutasProtegidas, async function (request, res) {
    const loData = request.body;
    const lcChat = goSecurityService.descrypt3DES(loData.tcChatId, goKey.getKey());
    const laConversationsList= await bussinessService.searchConversationListByIdChat(lcChat.replace(/\0.*$/g, ''));
    var loResult=null;
    var laConversationsArray=[];
    if(typeof laConversationsList != 'undefined' ){
        for( var i = 0; i < laConversationsList.length; i++){
            var lcIdConversation = goSecurityService.encrypt3DES(laConversationsList[i].id, goKey.getKey());
            var lcTypeConversation = goSecurityService.encrypt3DES(laConversationsList[i].tipo, goKey.getKey());
            var lcFecha = goSecurityService.encrypt3DES(laConversationsList[i].fecha, goKey.getKey());
            const loConversation = new Conversation(lcIdConversation, lcTypeConversation, lcFecha);
            laConversationsArray.push(loConversation);
        }
        loResult = getResultJsonMessage(0,1,"Se encontró la conversación ",1,"Conversación encontrada exitosamente", laConversationsArray);
    }else{
            loResult = getResultJsonMessage(1,2,"No se encontró conversaciones existentes",1,"No sé encontró conversaciones existentes", laConversationsArray);
    }
    res.json(loResult);
});


router.post('/listMessagesByConversationId', authenticationRouter.rutasProtegidas, async function (request, res) {
    try{
        const loData = request.body;
        const lcIdConversation = goSecurityService.descrypt3DES(loData.tnConversationId, goKey.getKey());
        const laMessageListConversations= await bussinessService.searchMessagesByConversationId(lcIdConversation.replace(/\0.*$/g, ''));
        var loResult=null;
        var laMessageListConversationsArray=[];
        if(typeof laMessageListConversations != 'undefined' ){
            for( var i = 0; i < laMessageListConversations.length; i++){
                var lnMessageId = goSecurityService.encrypt3DES(laMessageListConversations[i].id, goKey.getKey());
                var lcReceived = goSecurityService.encrypt3DES(laMessageListConversations[i].recibido+"1", goKey.getKey());
                var lcWhatsAppId = goSecurityService.encrypt3DES(laMessageListConversations[i].idwap, goKey.getKey());
                var lcContentMessage = goSecurityService.encrypt3DES(laMessageListConversations[i].contenido, goKey.getKey());
                var lcRewardedMessage = goSecurityService.encrypt3DES(laMessageListConversations[i].menreen, goKey.getKey());
                var lcAutomaticBot= goSecurityService.encrypt3DES(laMessageListConversations[i].bot, goKey.getKey());
                const loConversation = new MessageConversation(lnMessageId,lcReceived,lcWhatsAppId,lcContentMessage,lcRewardedMessage,lcAutomaticBot);
                laMessageListConversationsArray.push(loConversation);
            }
            loResult = getResultJsonMessage(0,1,"Se encontró la lista de mensajes por conversación ",1,"Se encontró la lista de mensajes por conversación exitosamente", laMessageListConversationsArray);

        }else{
            loResult = getResultJsonMessage(1,2,"No se encontró la lista de mensajes por conversación ",1,"No se encontró la lista de mensajes por conversación ", laMessageListConversationsArray);

        }
        res.json(loResult);
    
    }
    catch(exception){
        const loResult = getResultJsonMessage(1,2,"Operación fallida",1,"Revise los parametros enviados en la solicitud", "Revise los parametros enviados en la solicitud");

        res.json(loResult);
    }
});


router.get('/getInstanceInformation', authenticationRouter.rutasProtegidas, async function(req,res){
    const loInformationAvailableInstances = await bussinessService.getAvailableInstancesInWhatsApp(); 
    res.json( loInformationAvailableInstances );
});


module.exports={
    router
}
