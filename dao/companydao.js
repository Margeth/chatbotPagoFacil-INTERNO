const db= require('../services/db');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const {getCurrentDate, getCurrentHour} = require("../helpers/dateHelpers");
const {getSuccessfulOperationMessage, getFailedOperationMessage, getNumericalSuccessMessage, getNumericalFailMessage} = require("../helpers/answerHelper");

/**********************************************
* Description...: Search company information
* Return: ......: company information
* Parameters....: chatId: Required: Chat a Id
***********************************************/
async function searchCompanyByIdChat(chatId){
    var lnidChatFounded = 0;
    const result= await db.query(
        'SELECT Empresa FROM chat WHERE CHAT=?',
        [
            chatId
        ]
    );
    if(result.length>0){
        lnidChatFounded=result[0].Empresa;
    }
    return lnidChatFounded;
}

/**********************************************
 * Description:
 * Return:
 * Parameters:
 ***********************************************/
async function changeAgent(empresa,agente,conversacion){
    var lnIdAsignAgent= await searchLastActiveAgentToConversation(conversacion);
    if(lnasigAgentToConversation!=0){
        var lncloseConversation= await closeConversation(lnIdAsignAgent);
    }
    var lnasigAgentToConversation = await asignAgentToConversation(conversacion, empresa, agente);
    return lnasigAgentToConversation;
}

/**********************************************
 * Description: creates an agent for a conversation
 * Return: string: Status message
 * Parameters:
 ***********************************************/
async function asignAgentToConversation(conversation,empresa,agente){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO asignaragenteconversacion(Conversacion,Empresa,Agente,UsrHora,UsrFecha,Estado) VALUES (?,?,?,?,?,?)',
        [
            conversation,
            empresa,
            agente,
            lchour,
            lcdate,
            1
        ]
    );

    return result.affectedRows?getSuccessfulOperationMessage('Conversacion se registró correctamente'): getFailedOperationMessage('Error en registro de conversacion');

}

/**********************************************
 * Description: updates the status of a conversation to "closed".
 * Return: Status message
 * Parameters: Number: Conversacion
 ***********************************************/
async function closeConversation(conversacion) {
    const result = await db.query(
        `UPDATE asignaragenteconversacion
        SET Estado=? WHERE AsignarAgenteConversacion=?`,
        [   
            0,
            conversacion
        ]
    );
    return result.affectedRows?getSuccessfulOperationMessage(closeConversation.name): getFailedOperationMessage(closeConversation.name);
}

/************************************************************
 * Description: updates the status of instance to "available".
 * Return: Numerical message of the status of the request
 * Parameters: Number: InstanceNumber
 ************************************************************/
async function putInstanceAvailable(tnInstanceNumber) {
    const result = await db.query(
        `UPDATE INSTANCIAWHATSAPP
        SET Estado=? WHERE Instancia=?`,
        [   
            1,
            tnInstanceNumber
        ]
    );
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();

}

/************************************************************
 * Description: create a new conversation
 * Return: Numerical message of the status of the request
 * Parameters: list: conversation data
 ************************************************************/
async function registerConversation(conversation){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO CONVERSACION(TipoConversacion,Estado,UsrFecha,UserHora,UsrFechaExpiracion,UsrHoraExpiracion,Chat) VALUES (?,?,?,?,?,?,?)',
        [
            conversation.TipoConversacion,
            1,
            lcdate,
            lchour,
            lcdate,
            lchour,
            conversation.Chat,
        ]
    );
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();

}

/************************************************************
 * Description: obtains a user's data
 * Return: Numerical message of the status of the request
 * Parameters: chart:userWhatsApp user's phone number +@ + c.us
 ************************************************************/
async function queryToUser(userWhatsApp){
    var message='0';
    const result= await db.query(
        'SELECT * FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    return result.length>0?getNumericalSuccessMessage():getNumericalFailMessage();

}

/************************************************************
 * Description: obtains a user's data
 * Return: user´s data
 * Parameters: chart:userWhatsApp: user's phone number +@ + c.us
 ************************************************************/
async function searchUser(userWhatsApp){
    const loResult= await db.query(
        'SELECT Usuario FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    return loResult[0].Usuario;

}

/************************************************************
 * Description: search conversation by ChatAgentId
 * Return: query: user´s conversation
 * Parameters: Number:chatAgentId: chat agent ID
 ************************************************************/
async function searchConversationByChatAgentId(chatAgentId){
    var lnIdAsignAgent=0;
    const loresult= await db.query(
        'SELECT conversacion.Conversacion as id '+
        'FROM CHATAGENTECONVERSACION, CONVERSACION, CHATAGENTE '+
        'WHERE CONVERSACION.Conversacion = chatagenteconversacion.Conversacion '+
        'AND CHATAGENTE.ChatAgente = chatagenteconversacion.ChatempresaAgente '+
        'AND chatagenteconversacion.Estado=? '+
        'AND CHATAGENTE.ChatAgente=? ',
        [
            1,
            chatAgentId
        ]   
    );
    if(loresult.length>0){
        lnIdAsignAgent=loresult[0].id;
    }
    return lnIdAsignAgent;
}

/************************************************************
 * Description: create the agent for a chat
 * Return: query: Message of the status of the operation
 * Parameters: Number:chatAgentId: chat agent ID
 ************************************************************/
async function registerAgentChat(agentId,chatId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO chatagente(Agente,Chat,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            agentId,
            chatId,
            1,
            lcdate,
            lchour,
        ]
    );

    return result.affectedRows? getSuccessfulOperationMessage(registerAgentChat.name): getFailedOperationMessage(registerAgentChat.name);

}

/************************************************************
 * Description: verifies that the chat agent exists
 * Return: query: Numeric message of the status of the operation
 * Parameters: Number:IdChat: chat ID
 ************************************************************/
async function verifyAgentChat(idChat){
    const result= await db.query(
        'SELECT * FROM chatagente WHERE Chat=?',
        [
            idChat
        ]
    );
    return result.length>0?getNumericalSuccessMessage():getNumericalFailMessage();
}

/************************************************************
 * Description: search for whatsapp instances with the status "available"
 * Return: query: instance data
 * Parameters: None
 ************************************************************/
async function searchAvailableInstancesInWhatsApp(){
    var quantity= null;
    const loResult= await db.query(
        'SELECT InstanciaWhatsapp, Instancia, Token '+
        'FROM INSTANCIAWHATSAPP WHERE Estado=?',
        [
            1
        ]   
    );
//    console.log("La instancia es "+loResult[0].Instancia+" y el token es "+loResult[0].Token);
    if(loResult.length>0){
        quantity=loResult[0]; 
    }
    else{
        quantity={
            InstanciaWhatsapp:0
        }
    }
    return quantity;
}

/***********************************************************************************
 * Description..: gets the instance available on WhatsApp
 * Return.......: Object: ID Instanciawhatsapp, Instancia, token avaibles
 * Parameters...: None
 ***********************************************************************************/
async function getAvailableInstancesInWhatsApp(){

    const loResult= await db.query(
        'SELECT InstanciaWhatsapp, Instancia, Token '+
        'FROM INSTANCIAWHATSAPP WHERE Estado=?',
        [
            1
        ]   
    );
//    console.log("La instancia es "+loResult[0].Instancia+" y el token es "+loResult[0].Token);
    return loResult;
}
async function searchCompany(){

}

async function isNewUser(phone){
    return isEmpty(await db.query(
        'SELECT SUBSTRING_INDEX(ChatWhatsApp,1,11) '+
    'FROM CHAT WHERE ChatWhatsApp = ?',
        [
            phone
        ]
    ));
}

async function isEmpty(query){
    return query.length>0? true: false;
}

async  function getNameCompany(id){
    return await db.query(
        'SELECT Nombre '+
        'FROM EMPRESA WHERE Empresa = ?',
        [
            id
        ]
    );
}
async function getServiceByCity(nameCity){
    nameCityClear = nameCity.substring(1, nameCity.length-1);
    return ""

}

module.exports={
    queryToUser,
    registerConversation,
    searchConversationByChatAgentId,
    changeAgent,
    searchAvailableInstancesInWhatsApp,
    putInstanceAvailable,
    getAvailableInstancesInWhatsApp,
    isNewUser,
    getNameCompany

}
