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
const MessageConversation = require('../Model/messageconversation');
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const answerHelp = require('../helpers/answerHelper');
const {llave} = require("../config");
const {getResultJsonMessage} = require("../helpers/answerHelper");


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
        const loKey = getResultJsonMessage(1,1,"Ocurrio un error en el registro de la empresa",1,lcmessageTokenRegistered,"Ocurrio un error en el registro");
        res.json(loKey);

    }
//    var message = await messageService.registerCompany(req.body);
});

router.post('/generartokensempresa',authenticationRouter.rutasProtegidas, async function registerCompany(req, res) {
    try{
        var lnEmpresaCommerceId= goSecurityService.descrypt3DES(req.body.tnEmpresaComercio, goKey.getKey());;
        var lctokenSecret = await bussinessService.generateTokenSecret();
        var lctokenService = await bussinessService.generateTokenService(lnEmpresaCommerceId);
        var company= await bussinessService.getCompanyData(lnEmpresaCommerceId);
        var lcmessageTokenRegistered = await bussinessService.registerTokenCompany(company.Empresa, 1, 'Service', 'generateBussinessKeys', company.Nombre , lctokenService, lctokenSecret, company.direccion, company.email, 'Buenas tardes');
        const loKey =
            {
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
        res.json(answerHelp.responseMessageExceptionActivated());

    }
//    res.json({message:lctokenSecret});
/*    res.json({tokenSecret:lctokenSecret,
    tokenService:lctokenService});*/
});


router.post('/actualizarTokenSecreto',authenticationRouter.rutasProtegidas,async function(req,res,next){
    try {
        var lnEmpresaId= goSecurityService.descrypt3DES(req.body.tnEmpresa, goKey.getKey());;
        let lcMessageService = await bussinessService.updateKeySecret(lnEmpresaId);
        const loKey = answerHelp.getResultJsonMessage(0,0,"Actualización con exito",1,"",{TokenSecret: lcMessageService}); //{TokenSecret: lcMessageService}
        res.json(loKey);

    }catch(err){
        const loKey = answerHelp.getResultJsonMessage(1,1,"Error en la actualización",0,"","llave invalida");
        next(loKey);
    }
});

router.post('/actualizarTokenServicio',authenticationRouter.rutasProtegidas,async function(req,res,next){
    try {
        var lnEmpresaId= goSecurityService.descrypt3DES(req.body.tnEmpresa, goKey.getKey());;
        let lcMessageService = await bussinessService.updateKeyService(lnEmpresaId);
        const loKey =answerHelp.getResultJsonMessage(0,1,"Actualizacion exitosa",1,"",{ TokenSecret: lcMessageService });
        res.json(loKey);

    }catch(err){
        const loKey = answerHelp.getResultJsonMessage(1,1,"Error con la actualizacion",0,"","Llave invalida" );
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
        loResult = answerHelp.getResultJsonMessage(0,1,"Exito al crear la nueva instancia",1,"Exito al crear la nueva instancia",{ mensaje: lcMessage });
    }
    else {
        loResult = answerHelp.getResultJsonMessage(0,1,"Error al crear la nueva instancia",1,"Error al crear la nueva instancia","Instancia no fue creada correctamente" );
    }
    res.json(loResult);
});

router.get('/listaInstancias', authenticationRouter.rutasProtegidas, async function (request, res) {
    const loResponse = await messageService.apiChatApiInstanceGet();
    var loResult = answerHelp.getResultJsonMessage(0,1,"Exito al listar instancias",1,"Exito al listar instancias",{ values: loResponse });
    res.json(loResult);
});



router.post('/deleteInstance', authenticationRouter.rutasProtegidas, async function (request, res) {
    try{
        const lobdata = request.body;
        const lcInstanceNumber = goSecurityService.descrypt3DES(lobdata.tcInstance, goKey.getKey());
        const loparams =
        {
            "uid": tokenAPI,
            "instanceId": lcInstanceNumber.replace(/\0.*$/g, '')
        }
        var lcMessage = "La instancia no se eliminó correctamente";
        const loResponse = await messageService.apiChatApiInstancePost('deleteInstance', loparams);
        console.log(loResponse);
        if (loResponse.result === 'deleted') {
            lcMessage = bussinessService.deleteInstance(lcInstanceNumber.replace(/\0.*$/g, ''));
            var loResult = answerHelp.getResultJsonMessage(0,1,"Exito al borrar la nueva instancia",1,"Exito al borrar la nueva instancia",{ mensaje: lcMessage });
        }
        else {
            var loResult = answerHelp.getResultJsonMessage(0,1,"Fallo en borrar la nueva instancia",1,"Fallo en borrar la nueva instancia",{ mensaje: lcMessage });
        }
        res.json(loResult);
    
    }
    catch(exception){
        res.json(answerHelp.responseMessageExceptionActivated());

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
            loResult = answerHelp.getResultJsonMessage(1,2,"Ocurrio un error en el cierre de sesión",1,"Ocurrio un error en el cierre de sesión",{ values: loResponse });
        }
        else{
            loResult = answerHelp.getResultJsonMessage(0,1,"Exito en cerrar sesión",1,"Exito en cerrar sesión",{ values: loResponse });
        }
        res.json(loResult);    
    }
    catch(exception){
        res.json(answerHelp.responseMessageExceptionActivated());

    }
});

router.post('/listaConversacionesByIdChat', authenticationRouter.rutasProtegidas, async function (request, res) {
    const loData = request.body;
    const lcChat = goSecurityService.descrypt3DES(loData.tcChatId, goKey.getKey());
    const laConversationsList= await bussinessService.searchConversationListByIdChat(lcChat.replace(/\0.*$/g, ''));
    var loResult=null;
    console.log(typeof laConversationsList);
    var laConversationsArray=[];
    if(typeof laConversationsList != 'undefined' ){
        for( var i = 0; i < laConversationsList.length; i++){
            var lcIdConversation = goSecurityService.encrypt3DES(laConversationsList[i].id, goKey.getKey());
            var lcTypeConversation = goSecurityService.encrypt3DES(laConversationsList[i].tipo, goKey.getKey());
            var lcFecha = goSecurityService.encrypt3DES(laConversationsList[i].fecha, goKey.getKey());
            const loConversation = new Conversation(lcIdConversation, lcTypeConversation, lcFecha);
            laConversationsArray.push(loConversation);
        }
        loResult = answerHelp.getResultJsonMessage(0,1,"Exito listando conversacion",1,"Exito listando conversaciones",{ values: laConversationsArray });
    }
    else{
            loResult = answerHelp.getResultJsonMessage(1,2,"Error al listar conversacion",1,"Error al listar conversacion","No existen conversaciones existentes" );
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
            loResult = answerHelp.getResultJsonMessage(0,1,"Exito al listar mensajes por conversacion",1,"Exito al listar mensajes por conversacion", { values: laMessageListConversationsArray });
        }
        else{
            loResult = answerHelp.getResultJsonMessage(1,2,"No se encontraron conversaciones",1,"No se encontraron conversaciones","No se encontraron conversaciones");
        }
        res.json(loResult);
    
    }
    catch(exception){
        const loResult = answerHelp.getResultJsonMessage(1,2,"Operación fallida de busqueda",1,"Operación fallida de busqueda","Operación fallida de busqueda, revise parametros");
        res.json(loResult);
    }
});

router.post('/generartokensempresa',authenticationRouter.rutasProtegidas, async function registerCompany(req, res){
    try{
        var lnEmpresaCommerceId= goSecurityService.descrypt3DES(req.body.tnEmpresaComercio, goKey.getKey());;
        var lctokenSecret = await bussinessService.generateTokenSecret();
        var lctokenService = await bussinessService.generateTokenService(lnEmpresaCommerceId);
        const loKey = {
            messageSistema: "Generación de llaves realizado con exito",
            values: {
                tokenSecret: lctokenSecret,
                tokenService: lctokenService
            }
        };
    
        res.json(loKey);
    
    }
    catch(exception){
        const loResult ={
            message: "Hubo un error durante el envío del mensaje.",
        };
        res.json(loResult);  
    }
});

module.exports={
    router
}
