const db= require('./db');
const config=require('../config');
const token = config.token, apiUrl = config.apiUrl, apiUrladitional = config.apiUrladitional;
const gcTokenChatApi=config.tcTokenChatApi;
const tcCipherKey = config.tcipherKey;
const fetch = require('node-fetch');
const fs = require('fs');
const requestqr= require('request-promise');
const bodyParser = require('body-parser');
const goSecurityService=require('../services/SecurityService');
const goCrypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const messageDao= require('../dao/messagedao');
const { tcTokenChatApi } = require('../config');
const {getSuccessfulOperationMessage, getFailedOperationMessage, getNumericalSuccessMessage, getNumericalFailMessage} = require("../helpers/answerHelper");
const {getCurrentDate,getCurrentHour} = require ('../helpers/dateHelpers');

/**************************************************************************************
 * Description..: optains a company's chat data
 * Return.......: JSON: chat information
 * Parameters...: method: Required: method Http
 *                tcChatId: Required: numerical ID that identifies a chat
 *                tcInstance: Required: numerical ID that identifies a instance of a company
 *                tcToken:: Required: token 
 **************************************************************************************/
async function getChatInformation(method,tcChatId,tcInstance,tcToken){
    const options = {};
    options['method'] = "GET";
    const url = `${apiUrladitional}${tcInstance}/${method}?token=${tcToken}&chatId=${tcChatId}`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}
/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function searchInstanceByIdUserWhatsApp(tcInstanceNumber){
    const laInstanceList = await apiChatApiInstanceGet();
    var loInformationUserComplete = null;
    var loInstanceId = await messageDao.searchInstancesInWhatsAppByNumberInstance(tcInstanceNumber);
    var lcPhoneNumberUserFromInformationUser = await getChatApi('me',loInstanceId.Instancia,loInstanceId.Token);
    loInformationUserComplete = {
        instanciaWhatsapp: loInstanceId.InstanciaWhatsapp,
        instancia: loInstanceId.Instancia,
        token: loInstanceId.Token,
        phoneNumber: lcPhoneNumberUserFromInformationUser.id,
        username: lcPhoneNumberUserFromInformationUser.name
    }
    return loInformationUserComplete;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function registerFileMessage(loInstanceAndUsername, tnChatIdWhatsApp,tcUsername, tnIdEmpresa, typeMessage,messageContent,messageIdWhatsApp,isbotMessage,lcfilename){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa,loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp,tnIdEmpresa,lnIdUser,tcUsername);
    const lnmessageTypeNumber = defineTypeFile(typeMessage);
    const lnagentchatId = await searchLastAgentToChat(lnChatId);
    const lnconversation = await searchConversationByChatAgentId(lnagentchatId);
    var message = "Mensaje Enviado";
    message = await registerAutomaticMessage(lnIdUser, lnChatId, lnmessageTypeNumber, lnagentchatId, lnconversation, messageIdWhatsApp, messageContent, isbotMessage, lcfilename);
    return message;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function registerTextMessage(loInstanceAndUsername, tnChatIdWhatsApp, tcUsername, tnIdEmpresa,messageContent,messageIdWhatsApp){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa,loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp,tnIdEmpresa,lnIdUser,tcUsername);
    var lntypeMessage=4;
    const lnagentchatId = await searchLastAgentToChat(lnChatId);
    const lnconversation = await searchConversationByChatAgentId(lnagentchatId);
    var message = "Mensaje Enviado";
    message = await registerAutomaticMessage(lnIdUser, lnChatId, lntypeMessage, lnagentchatId, lnconversation, messageIdWhatsApp, messageContent, 1, "");
    return message;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function verifyChatAgentGeneral(req,res){
    var values=0;
    const data= req.body.messages[values];
    var message="Mensaje Enviado";
    if(await verifyAgentChat(data.chatId)==='0'){
        message = await registerChat(req.body.messages[0],);
    }
//    res.json({message});
}
/**************************************************************************************
 * Description..: Change the agent of a chat
 * Return.......: String: Status message
 * Parameters...: tnAgent: Required: numerical ID that identifies the agent
 *                tnChatId: Required: numerical ID that identifies the chat
 *********************************/
async function changeAgent(tnAgent,tnChatId){
    var lnChatAgentId = await searchLastActiveChatAgentInAConversation(tnChatId);
    if(lnChatAgentId!=0){
        var lnResultDisableChatAgent = await closeChatAgent(lnChatAgentId);
    }
    var lnasigAgentToConversation = await registerChatAgent(tnAgent, tnChatId);
    return lnasigAgentToConversation;
}

async function registerAutomaticMessageGeneral(chatId,mensajeReenviado,mensajeEtiquetado,tipoAdjunto,mensaje,empresa){
    const lnexistRow= await searchLastActiveAgentToConversationByChat(chatId);
    if(lnexistRow!=0){
        const loChatCompanyMessage=await searchLastActiveAgentToConversationByChat(chatId);
        const loresponse=await registerAutomaticMessage(empresa,loChatCompanyMessage.Agente,chatId,tipoAdjunto,loChatCompanyMessage.Conversacion,mensaje);
    }
    else{
        const lnempresa= await registerAutomaticMessage
        const loresponse=await registerAutomaticMessage(empresa,0,chatId,tipoAdjunto,0,mensaje);


    }
    return "Registro automatico realizado exitosamente";
}


/*************************      QUERY       *************************************************/
/**************************************************************************************
 * Description..: register a chat type
 * Return.......: string: status of operation
 * Parameters...: tipoChat: Required: numerical ID that identifies the enterprise
 **************************************************************************************/
async function insertTipoChat(tipoChat){
    const result= await db.query(
        'INSERT INTO TIPOCHAT(TipoChat,TipoDeChat,Estado) VALUES (?,?,?)',
        [
            tipoChat.TipoChat,
            tipoChat.TipoDeChat,
            tipoChat.Estado
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(insertTipoChat.name) :getFailedOperationMessage(insertTipoChat.name);

}

/**************************************************************************************
 * Description..: create a new user
 * Return.......: string: status of operation
 * Parameters...: None
 **************************************************************************************/
async function insertUser(user){
    let lcdate= getCurrentDate() ;
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO USUARIO(UsuarioWhatsApp,NombreWhatsApp,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            user.author,
            user.senderName,
            1, //what does it mean?
            lcdate,
            lchour
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(insertUser.name) :getFailedOperationMessage(insertUser.name);
}

/**************************************************************************************
 * Description..: register a new user's chat
 * Return.......: string: status of operation
 * Parameters...: chat: Required: numerical ID that identifies a chat
 *                 user: Required: numerical ID that identifies to user
 *                 rol: Required: numerical ID that identifies to user's rol
 **************************************************************************************/
async function registerUserChat(chat,user,rol){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO USUARIOCHAT(Chat,Usuario,Rol,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?)',
        [
            chat,
            user,
            rol,
            1,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerUserChat.name): getFailedOperationMessage(insertUser.name);
}

/**************************************************************************************
 * Description..: verifies that a whatsapp chat exists
 * Return.......: string: Numeric message of the status of the operation
 * Parameters...: chatId: Required: numerical ID that identifies the chat
 **************************************************************************************/
async function verifyChat(chatId){
  //  var lcmessage='1';
    const result= await db.query(
        'SELECT * FROM CHAT WHERE ChatWhatsApp=?',
        [
            chatId
        ]
    );
    return result.length>0? getNumericalSuccessMessage():getNumericalFailMessage();

}

/**************************************************************************************
 * Description..: check message sent
 * Return.......: string: Numeric message of the status of the operation
 * Parameters...: tnChatId: Required: numerical ID that identifies the user
 **************************************************************************************/
async function verifyChatInSendMessage(tnChatId){
    const loResult= await db.query(
        'SELECT * FROM CHAT WHERE ChatWhatsApp=?',
        [
            tnChatId
        ]
    );
    return loResult.length>0? loResult[0].Chat:getNumericalFailMessage();

}

/**************************************************************************************
 * Description..: Is looking for an agent of a company
 * Return.......: string: Numeric message of the status of the operation
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 **************************************************************************************/
async function searchAgentFromACompany(tnChatId){

    const loResult= await db.query(
        'SELECT EMPRESAAGENTE.Agente FROM EMPRESAAGENTE, EMPRESA, CHAT, AGENTE '+
        'WHERE CHAT.Chat=? '+
        'AND EMPRESA.Empresa = CHAT.Empresa '+
        'AND EMPRESAAGENTE.Empresa = EMPRESAAGENTE.Empresa ',
        [
            tnChatId
        ]
    );
    return loResult.length>0? loResult[0].Agente:getFailedOperationMessage(searchAgentFromACompany.name);

}

async function registerChat(chat,typechat,empresa){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO CHAT(Empresa,TipoChat,ChatWhatsApp,Nombre,Estado,UsrFecha,UsrHora,UsrFechaEliminacion,UsrHoraEliminacion) VALUES (?,?,?,?,?,?,?,?,?)',
        [
            empresa,
            typechat,
            chat.chatId,
            chat.senderName,
            1,
            lcdate,
            lchour,
            lcdate,
            lchour,
        ]
    );
    return result.affectedRows? getNumericalSuccessMessage():getNumericalFailMessage();

}

/**************************************************************************************
 * Description..: register a new chat with sender's name
 * Return.......: chart: Numerical Message
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function registerChatInSend(chatId,senderName,typechat,empresa){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour(); // new Router = route(
    const result= await db.query(
        'INSERT INTO CHAT(Empresa,TipoChat,ChatWhatsApp,Nombre,Estado,UsrFecha,UsrHora,UsrFechaEliminacion,UsrHoraEliminacion) VALUES (?,?,?,?,?,?,?,?,?)',
        [
            empresa,
            typechat,
            chatId,
            senderName,
            1,
            lcdate,
            lchour,
            lcdate,
            lchour,
        ]
    );
    return result.affectedRows? getNumericalSuccessMessage(): getNumericalFailMessage();

}

async function registerChatUser(rol,chatId,usuarioId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO USUARIOCHAT(Rol,Estado,Chat, Usuario,UsrFecha, UsrHora) VALUES (?,?,?,?,?,?)',
        [
            rol,
            1,
            chatId,
            usuarioId,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows? getNumericalSuccessMessage(): getNumericalFailMessage();

}

async function registerMessage(chatId,userId,typeMessage,chatagente,conversation,messageId,messageReenviado,messageEtiquetado,messageContent,messageDescription){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();

    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatAgente,Conversacion,Recibido,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado,ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            userId,
            chatId,
            typeMessage,
            chatagente,
            conversation,
            1,
            messageId,
            messageReenviado,
            messageEtiquetado,
            messageContent,
            0,
            messageDescription,
            1,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerMessage.name): getFailedOperationMessage(registerMessage.name);

}

async function registerChatAgent(tnAgent,tnChatId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO CHATAGENTE(Agente,Chat,Estado,UsrHora,UsrFecha) VALUES (?,?,?,?,?)',
        [
            tnAgent,
            tnChatId,
            1,
            lchour,
            lcdate
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerChatAgent.name): getFailedOperationMessage(registerChatAgent.name);
}

async function searchLastActiveChatAgentInAConversation(tnChatId){
    const result= await db.query(
        'SELECT ChatAgente as id '+ 
        'FROM CHATAGENTE '+
        'WHERE Estado=? '+
        'AND Chat=?',
        [
            1,
            tnChatId
        ]   
    );
    return result.length>0? result[0].id:  getNumericalFailMessage();

}

/**************************************************************************************
 * Description..: change the status of a ChatAgent to "disabled"
 * Return.......: String: Status Message operation
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function closeChatAgent(tcChatAgentId) {
    const result = await db.query(
        `UPDATE CHATAGENTE
        SET Estado=? WHERE ChatAgente=?`,
        [   
            0,
            tcChatAgentId
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(closeChatAgent.name): getFailedOperationMessage(closeChatAgent.name);

}

/**************************************************************************************
 * Description..: Change the status of conversation of a ChatAgent to "disabled"
 * Return.......: String: Status Message
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function closeChatAgentToConversation(conversacion) {
    const result = await db.query(
        `UPDATE CHATAGENTECONVERSACION
        SET Estado=? WHERE AsignarAgenteConversacion=?`,
        [   
            0,
            conversacion
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(closeChatAgentToConversation.name): getFailedOperationMessage(closeChatAgentToConversation.name);

}

async function registerConversation(tcTipoConversacion,tcChat){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO CONVERSACION(TipoConversacion,UsrFechaExpiracion,UsrHoraExpiracion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?)',
        [
            tcTipoConversacion,
            1,
            lcdate,
            lchour,
            lcdate,
            lchour,
            
        ]
    );
    return result.affectedRows? getNumericalSuccessMessage(): getNumericalSuccessMessage();

}

async function queryToUser(userWhatsApp){

    const result= await db.query(
        'SELECT * FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    return result.length >0? getNumericalSuccessMessage(): getNumericalFailMessage();

}

async function searchUser(userWhatsApp){
    const loResult= await db.query(
        'SELECT Usuario FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    return loResult[0].Usuario;

}

async function searchUserByIdUser(tnIdUser) {
    const loResult = await db.query(
        'SELECT UsuarioWhatsApp FROM USUARIO WHERE Usuario=?',
        [
            tnIdUser
        ]
    );
    return loResult[0].UsuarioWhatsApp;
}

async function searchChat(chatId){
    const loResult= await db.query(
        'SELECT Chat FROM CHAT WHERE ChatWhatsApp=?',
        [
            chatId
        ]
    );
    return loResult[0].Chat;

}

async function registerTaggedMessage(messsageTagged,typeMessage){
    const result= await db.query(
        'INSERT INTO MENSAJEREENVIADO(IdentificadorMensajeEtiquetado,ContenidoMensaje,TipoAdijunto) VALUES (?,?,?)',
        [
            messsageTagged.id,
            messsageTagged.body,
            typeMessage
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerTaggedMessage.name): getFailedOperationMessage(registerTaggedMessage.name);

}

async function searchLastAgentToChat(chatId){
    const loresult= await db.query(
        'SELECT ChatAgente  FROM CHATAGENTE WHERE Estado=? AND Chat=?',
        [
            1,
            chatId
        ]   
    );
    return loresult.length>0?loresult[0].ChatAgente:getNumericalFailMessage();

}


async function searchLastActiveAgentToConversationByChat(chat){
    const loresult= await db.query(
        'SELECT ChatAgenteConversacion as id,Empresa,Agente,Conversacion  FROM CHATAGENTECONVERSACION WHERE Estado=? AND Chat=?',
        [
            1,
            chat
        ]   
    );
    return loresult[0];
}

async function searchConversationByChatAgentId(chatAgentId){

    const loresult= await db.query(
        'SELECT CONVERSACION.Conversacion as id '+
        'FROM CHATAGENTECONVERSACION, CONVERSACION, CHATAGENTE '+
        'WHERE CONVERSACION.Conversacion = CHATAGENTECONVERSACION.Conversacion '+
        'AND CHATAGENTE.ChatAgente = CHATAGENTECONVERSACION.ChatempresaAgente '+
        'AND CHATAGENTECONVERSACION.Estado=? '+
        'AND CHATAGENTE.ChatAgente=? ',
        [
            1,
            chatAgentId
        ]   
    );
    return loresult.length>0?loresult[0].id:getNumericalFailMessage();
}

async function registerAutomaticMessage(user,chatId,typeMessage,chatAgente,
    conversation , idMessage
    ,contentMessage,isbotMessage,messageDescription){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatAgente,Conversacion,Recibido,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado, ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
                user,
                chatId,
                typeMessage,   
                chatAgente,
                conversation,
                0,
                idMessage,
/*                messageResent,
                messageResent,
                messageForwarded,*/
                0,
                0,
                contentMessage,
                isbotMessage,
                messageDescription,
                1,
                lcdate,
                lchour
        ]   
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerAutomaticMessage.name): getFailedOperationMessage(registerAutomaticMessage.name);

}

async function registerAutomaticLocationMessage(user,chatId,typeMessage,chatAgente,
    conversation, idMessage
    ,contentMessage,addressName){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatAgente,Conversacion,Recibido,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado, ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            user,
            chatId,
            typeMessage,   
            chatAgente,
            conversation,
            0,
            idMessage,
/*            messageResent,
            messageResent,
            messageForwarded,*/
            0,
            0,
            contentMessage,
            1,
            addressName,
            1,
            lcdate,
            lchour
        ]   
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerAutomaticLocationMessage.name): getFailedOperationMessage(registerAutomaticLocationMessage.name);
}

async function registerAgentChat(agentId,chatId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const loResult= await db.query(
        'INSERT INTO CHATAGENTE(Agente,Chat,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            agentId,
            chatId,
            1,
            lcdate,
            lchour
        ]
    );
    return loResult.affectedRows? getNumericalSuccessMessage(): getNumericalSuccessMessage();
}

async function verifyAgentChat(idChat){
    const result= await db.query(
        'SELECT * FROM CHATAGENTE WHERE Chat=?',
        [
            idChat
        ]
    );
    return result.length>0? getNumericalSuccessMessage(): getNumericalSuccessMessage();
}

async function registerRewardedAutomaticMessage(user,chatId,typeMessage,chatAgente,
                                                conversation , idMessage
    ,contentMessage,isbotMessage,messageDescription, messageForwardedId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,'+
        'ChatAgente,Conversacion,Recibido,'+
        'MensajeWhatsApp,MensajeReenviado,'+
        'MensajeEtiquetado, ContenidoMensaje,'+
        'IsBotAutomatico,MensajeDescripcion,'+
        'Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            user,
            chatId,
            typeMessage,
            chatAgente,
            conversation,
            0,
            idMessage,
            messageForwardedId,
            0,
            contentMessage,
            isbotMessage,
            messageDescription,
            1,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows? getSuccessfulOperationMessage(registerRewardedAutomaticMessage.name): getFailedOperationMessage(registerRewardedAutomaticMessage.name);
}
async function searchCompanyByIdPhoneNumber(lcPhoneNumber) {

    const loresult = await db.query(
        'SELECT EMPRESAUSUARIO.Empresa FROM EMPRESAUSUARIO,USUARIO ' +
        'WHERE  EMPRESAUSUARIO.Usuario = USUARIO.Usuario ' +
        'AND USUARIO.UsuarioWhatsApp=?',
        [
            lcPhoneNumber
        ]
    );
    console.log("Del numero de telefono "+lcPhoneNumber+" Resultado empresa "+loresult);
    return loresult[0].Empresa;

}

/*************************          FUNCTION *****************************************/
async function registerAudioMessage(loInstanceAndUsername, tnChatIdWhatsApp, tcUsername,tnIdEmpresa,messageContent,messageIdWhatsApp){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa,loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp,tnIdEmpresa,lnIdUser,tcUsername);
    var lntypeMessage=5;
    const lnagentchatId= await searchLastAgentToChat(lnChatId);
    const lnconversation= await searchConversationByChatAgentId(lnagentchatId);
    var message="Mensaje Enviado";
    message = await registerAutomaticMessage(lnIdUser, lnChatId, lntypeMessage, lnagentchatId, lnconversation, messageIdWhatsApp, messageContent, 1,"ppt");
    return message;
}

async function registerContactMessage(loInstanceAndUsername, tnChatIdWhatsApp, tcUsername,tnIdEmpresa,messageContent,messageIdWhatsApp){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa,loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp,tnIdEmpresa,lnIdUser,tcUsername);
    var lntypeMessage=7 ;
    const lnagentchatId= await searchLastAgentToChat(lnChatId);
    const lnconversation= await searchConversationByChatAgentId(lnagentchatId);
    var message="Mensaje Enviado";
    message = await registerAutomaticMessage(lnIdUser, lnChatId, lntypeMessage, lnagentchatId, lnconversation, messageIdWhatsApp, messageContent, 1,"contact");
    return message;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
function defineTypeFile(messageType){
    var typeFile=4;
    if (messageType === 'Video') {
        typeFile = 2;
    }
    else
        if (messageType === 'Imagen') {
            typeFile = 1;
        }
        else
            if (messageType === 'Archivo') {
                typeFile = 3;
            }

    return typeFile;
}

async function registerRewardedMessage(loInstanceAndUsername, tnChatIdWhatsApp, tcUsername,tnIdEmpresa,messageContent,messageIdWhatsApp){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa, loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp, tnIdEmpresa, lnIdUser, tcUsername);
    var lntypeMessage = 8;
    const lnagentchatId = await searchLastAgentToChat(lnChatId);
    const lnconversation = await searchConversationByChatAgentId(lnagentchatId);
    const lnidRewardedMessage = await messageDao.registerRewardMessageGeneral(messageIdWhatsApp, "", "Texto");
    var message = "Mensaje Enviado";
    message = await registerRewardedAutomaticMessage(lnIdUser, lnChatId, lntypeMessage, lnagentchatId, lnconversation, messageIdWhatsApp, messageContent, 1, "rewarded", lnidRewardedMessage);
    return message;
}
var locationType =6;

async function registerLocationMessage(loInstanceAndUsername,tnChatIdWhatsApp, tcUsername,tnIdEmpresa,messageContent,messageIdWhatsApp,addressName){
    const lnIdUser = await messageDao.verifyUserCompany(loInstanceAndUsername.phoneNumber, loInstanceAndUsername.username, tnIdEmpresa,loInstanceAndUsername.instanciaWhatsapp);
    const lnChatId = await verifyChatGeneralInSendMessage(tnChatIdWhatsApp,tnIdEmpresa,lnIdUser,tcUsername);
    var typeMessage=locationType;
    const lnagentchatId= await searchLastAgentToChat(lnChatId);
    const lnConversation= await searchConversationByChatAgentId(lnagentchatId);
    var message="Send message";
    message = await registerAutomaticLocationMessage(
        lnIdUser,lnChatId,
        typeMessage,lnagentchatId,
        lnConversation,
        messageIdWhatsApp,messageContent
        ,addressName);
    return message;
}

/**************************************************************************************
 * Description..:
 * Return.......: string: status message
 * Parameters...: req: Required: numerical ID that identifies the enterprise
 *                res: Required:
 **************************************************************************************/
async function registerReceivedMessageGeneral(req,res){
    var lntypeMessage = 4;
    var lcaditionalMessageContent = "Void";
    const data = req.body.messages[0];
    if(data.type==='video'){
        lntypeMessage=2;
    }
    else{
        if(data.type==='document'){
            lntypeMessage=3;
            lcaditionalMessageContent=req.body.messages[0].caption;
        }else
        {
            if(data.type==='image'){
                lntypeMessage=1;
            }
            else{
                if(data.type==='audio'){
                    lntypeMessage=2;
                }
                else{
                    if(data.type==='location'){
                        lntypeMessage=6;
                        lcaditionalMessageContent=req.body.messages[0].caption;

                    }
                }
            }
        }
    }
    var lcIdChat = await searchChat(data.chatId);
    var lcIdUser = await searchUser(data.author);

    const lnagentchatId = await searchLastAgentToChat(lcIdChat);
    const lnconversation = await searchConversationByChatAgentId(lnagentchatId);
    
    var message = "Mensaje Enviado";
    message = await registerMessage(lcIdChat, lcIdUser, lntypeMessage,lnagentchatId, lnconversation,data.id, 0, 0, data.body,lcaditionalMessageContent);
}

/**************************************************************************************
 * Description..: checks if the user exists
 * Return.......:   string: status message
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function verifyUser(req,res){
    var values=0;
    const data= req.body.messages[values];
//    var lcregisterSuccessful=1;
    if(await queryToUser(data.author)==='0'){
        message = await insertUser(data);
//        lcregisterSuccessful=1;
    }
//    res.json({message});
//    return lcregisterSuccessful;

}

async function verifyChatGeneral(req,res){
    var values=0;
        const data= req.body.messages[values];
    var message="Mensaje Enviado";
    if(await verifyChat(data.chatId)==='0'){
        var lntypeChat = 1;
        var loInstanceId = await messageDao.searchInstancesInWhatsAppByNumberInstance( req.body.instanceId);
        const loresult = await getChatApi('me', req.body.instanceId,loInstanceId.Token);
        var lcIdPhoneWhatsApp = loresult.id;
        var lcChatId= data.chatId.split("-");
        if(lcChatId.length>1){
            lntypeChat=2;
        }
        const lcIdCompany = await searchCompanyByIdPhoneNumber(lcIdPhoneWhatsApp);
        const lnResultRegisterChat = await registerChat(data,lntypeChat,lcIdCompany);
        if(lnResultRegisterChat==1){
            const lcChatId = await searchChat(data.chatId);
            const lcUserId = await searchUser(data.author);
            const lnResultRegisterUserChat = await registerChatUser(1,lcChatId,lcUserId);
            const lnIdAgent = await searchAgentFromACompany(lcChatId);
            const lnregisterChatAgent= await registerAgentChat(lnIdAgent,lcChatId);
        }
    }
}

/**************************************************************************************
 * Description..:
 * Return.......: string: status message
 * Parameters...: lcChatIdwhatsApp: Required: numerical ID that identifies the Chat
 *                lnIdCompany: Required: numerical ID that identifies the company
 *                lnIdUser: Required: numerical ID that identifies the user
 *                lcUserName: Required: company name
 **************************************************************************************/
async function verifyChatGeneralInSendMessage(lcChatIdwhatsApp,lnIdCompany,lnIdUser,lcUserName){
    var lnChatId = 0;
    var lnResultChatId = await verifyChatInSendMessage(lcChatIdwhatsApp);
    if (lnResultChatId == 0) {
        var lntypeChat = 1;
        const laChatIdElements = lcChatIdwhatsApp.split("-");
        if (laChatIdElements > 1) {
            lntypeChat = 2;
        }
        const lnResultRegisterChat = await registerChatInSend(lcChatIdwhatsApp, lcUserName, lntypeChat, lnIdCompany);
        if (lnResultRegisterChat == 1) {
            const lcChatId = await searchChat(lcChatIdwhatsApp);
            lnChatId=lcChatId;
            const lnResultRegisterUserChat = await registerChatUser(1, lcChatId, lnIdUser);
            const lnIdAgent = await searchAgentFromACompany(lcChatId);
            const lnregisterChatAgent = await registerAgentChat(lnIdAgent, lcChatId);
        }
    }else {
        lnChatId = lnResultChatId;
    }
    return lnChatId;
}

/**************************************************************************************
 * Description..:
 * Return.......: string: status message
 * Parameters...: method: Required: http method
 *                params: Required: JSON body
 **************************************************************************************/
async function apiChatApiInstancePost(method,params){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };
    const url = `https://us-central1-app-chat-api-com.cloudfunctions.net/${method}`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: Json body
 * Parameters...: None
 **************************************************************************************/
async function apiChatApiInstanceGet(){
    const options = {};
    options['method'] = "GET";
    options['headers'] = { 'Content-Type': 'application/x-www-form-urlencoded'};
    options['params']={'uid': gcTokenChatApi};
    options['body/x-www-form-urlencoded']={"uid": gcTokenChatApi};
    const url = `https://us-central1-app-chat-api-com.cloudfunctions.net/listInstances?uid=${gcTokenChatApi}`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: toMethod: Required: http method
 *                tcInstance: Required
 *                tcToken: Required
 **************************************************************************************/
async function getChatApi(toMethod, tcInstance, tcToken){
    const options = {};
    options['method'] = "GET";
    const url = `${apiUrladitional}${tcInstance}/${toMethod}?token=${tcToken}`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: method: Required: http method
 *                params: Required
 *                tcInstance: Required
 *                tcToken: Required
 **************************************************************************************/
async function apiChatApiDialog(method, params, tcInstance, tcToken){
    const options = {};
    options['method'] = "GET";
    const url = `${apiUrladitional}${tcInstance}/${method}?token=${tcToken}&chatId=${params}%40g.us`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: resp: Required:
 *                tcInstance: Required
 *                tcToken: Required
 **************************************************************************************/
async function apiChatApiDialogQRCode(resp,tcInstance,tcToken){
    const loOptions ={
        method:'GET',
        uri:`https://api.chat-api.com/instance${tcInstance}/qr_code?token=${tcToken}`,
        headers:{
            'Accept': 'image/png',
            'Content-Type': 'image/png'        
        }
    }
    resp.cookie('Instancia', /*goSecurityService.encrypt3DES(tcInstance, tcCipherKey)*/tcInstance);
    var qrImage = await requestqr(loOptions.uri, loOptions).pipe(resp) ;    
}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: method: Required: http method
 *                instance: Required
 *                instanceToken: Required
 **************************************************************************************/
async function apiChatApiLogoutSystem(method, instance, instanceToken ){
    const options = {};
    options['method'] = "POST";
    options['headers'] = { 'Content-Type': 'application/json' };
    const url = `${apiUrladitional}${instance}/${method}?token=${instanceToken}`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: lcNumber: Required
 **************************************************************************************/
async function setExistANumberOrNot(lcNumber ){
    const options = {};
    options['method'] = "GET";
//    options['headers'] = { 'Content-Type': 'application/json' };
    const url= `https://api.chat-api.com/instance298245/checkPhone?token=g674o4qs424rapbe&phone=${lcNumber}`;
//    const url = `${apiUrladitional}${instance}/${method}?token=${instanceToken}`; 
//    console.log("La url es ",url);
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......: chart: value
 * Parameters...: lcNumber: Required
 **************************************************************************************/
function validateAttribute(attribute){
    var lcValue="No tiene contenido";
    if ( typeof attribute === 'undefined')
    {
        return lcValue;
    }

    if( typeof attribute === 'boolean'){
        if(attribute){
            lcValue="1";
        }
        else{
            lcValue="0";
        }
            
    }

    return lcValue;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApiGetQueueMessagesNumber( tcMethod ){
    const options = {};
    options['method'] = "GET";
    const url = `https://api.chat-api.com/instance298245/showMessagesQueue?token=g674o4qs424rapbe`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApiClearQueueMessages( tcmethod ) {
    const options = {};
    options['method'] = "POST";
    const url = `https://api.chat-api.com/instance298245/clearMessagesQueue?token=g674o4qs424rapbe`; 
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}


/**************************************************************************************
 * Description..:
 * Return.......: array: encrypted phones
 * Parameters...: arrayPhones
 **************************************************************************************/
function decryptAllChatIdInAGroup(arrayPhones){
    var lachatIds= [];
    for(var i in arrayPhones){
        lachatIds.push(goSecurityService.descrypt3DES(arrayPhones[i],config.tcipherKey).replace(/\0.*$/g, ''));
    }
    return lachatIds;
}

/**************************************************************************************
 * Description..:
 * Return.......: array: encrypted phones
 * Parameters...: arrayPhones: Required
 **************************************************************************************/
function encryptAllChatIdInAGroup(arrayPhones){
    var lachatIds= [];
    for(var i in arrayPhones){
        lachatIds.push(goSecurityService.encrypt3DES(arrayPhones[i],config.tcipherKey).replace(/\0.*$/g, ''));
    }
    return lachatIds;

}

/**************************************************************************************
 * Description..:
 * Return.......: JSON body
 * Parameters...: method: Required
 *                instance: Required
 *                instanceToken: Required
 *                params: Required
 **************************************************************************************/
async function apiChatApi(method, instance, instanceToken, params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url =`http://3.23.61.101/api/v2/whatsapp/sendTextMessage`;
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApiNVAudio( params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendTextMessage`;
    const apiResponse = await fetch(url, options);
    const jsonResponse = await apiResponse.json();
    return jsonResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApiNVFile( params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendMediaContentMessage`;
    const apiResponse = await fetch(url, options);
    return apiResponse;
}

/**************************************************************************************
 * Description..:
 * Return.......:
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApiNVLocation( params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendTextMessage`;
    const apiResponse = await fetch(url, options);
    return apiResponse;
}
async function registerPersonalInformation(){

}

/**************************************************************************************
 * Description..: Send a message through the api
 * Return.......: JSON body
 * Parameters...: chatId: Required: numerical ID that identifies the enterprise
 *                senderName: Required:
 *                typeChat: Required: chat type
 *                name: Required: company name
 **************************************************************************************/
async function apiChatApinv(params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendTextMessage`;
    return  await fetch(url, options);
//    const jsonResponse = await apiResponse.json();
}

 async function readMessageAPI(content){
     const options = {};
     options['method'] = "POST";
     options['body'] = JSON.stringify(content);
     options['headers'] = { 'Content-Type': 'application/json' }

     return  await fetch(url, options);
 }
async function sendMessageListAPI(params ){
    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendTListMessage`;
    return  await fetch(url, options);
}
async function sendMessageButthonAPI(params ){    const options = {};
    options['method'] = "POST";
    options['body'] = JSON.stringify(params);
    options['headers'] = { 'Content-Type': 'application/json' };

    const url = `http://3.23.61.101/api/v2/whatsapp/sendButtonMessage`;
    return  await fetch(url, options);
}

module.exports={
    apiChatApi,
    apiChatApiNVAudio,
    apiChatApiNVFile,
    apiChatApinv,
    readMessageAPI,
    insertTipoChat,
    insertUser,
    queryToUser,
    verifyChatGeneral,
    verifyUser,
    registerChat,
    registerConversation,
    registerMessage,
    registerChatUser,
    registerAutomaticMessage,
    getChatInformation,
    registerTextMessage,
    searchConversationByChatAgentId,
    registerFileMessage,
    registerAudioMessage,
    registerLocationMessage,
    registerReceivedMessageGeneral,
    getChatApi,
    validateAttribute,
    changeAgent,
    registerAutomaticMessageGeneral,
    decryptAllChatIdInAGroup,
    apiChatApiDialog,
    encryptAllChatIdInAGroup,
    apiChatApiDialogQRCode,
    apiChatApiInstancePost,
    apiChatApiInstanceGet,
    registerChatInSend,
    searchInstanceByIdUserWhatsApp,
    verifyChatGeneralInSendMessage,
    registerContactMessage,
    registerRewardedMessage,
    registerRewardedAutomaticMessage,
    apiChatApiLogoutSystem,
    setExistANumberOrNot,
    apiChatApiGetQueueMessagesNumber,
    apiChatApiClearQueueMessages,
    sendMessageListAPI,
    sendMessageButthonAPI
}   
