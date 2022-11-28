const db= require('../services/db');
const bodyParser = require('body-parser');
const {getSuccessfulOperationMessage, getFailedOperationMessage, getNumericalSuccessMessage, getNumericalFailMessage} = require("../helpers/answerHelper");


/************************************************************
 * Description: create a chat type
 * Return: Message of the status of the operation
 * Parameters: Number: tipoChat
 ************************************************************/
async function insertTipoChat(tipoChat){
    const result= await db.query(
        'INSERT INTO TIPOCHAT(TipoChat,TipoDeChat,Estado) VALUES (?,?,?)',
        [
            tipoChat.TipoChat,
            tipoChat.TipoDeChat,    
            tipoChat.Estado
        ]
    );
    return result.affectedRows?getSuccessfulOperationMessage(insertTipoChat.name): getFailedOperationMessage(insertTipoChat.name);

}

async function insertUser(lcAuthor,lcSenderName){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO USUARIO(UsuarioWhatsApp,NombreWhatsApp,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            lcAuthor,
            lcSenderName,
            1,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows?getSuccessfulOperationMessage(insertUser.name): getFailedOperationMessage(insertUser.name);
}


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
    return result.affectedRows?getSuccessfulOperationMessage(registerUserChat.name): getFailedOperationMessage(registerUserChat.name);

}

/************************************************************
 * Description: verifies that a chat exists
 * Return: Message of the status of the operation
 * Parameters: Number: chatId
 ************************************************************/
async function verifyChat(chatId){
    const result= await db.query(
        'SELECT * FROM CHAT WHERE ChatWhatsApp=?',
        [
            chatId
        ]
    );
    return result.length>0?getNumericalSuccessMessage():getNumericalFailMessage();

}

async function searchAgentFromACompany(chatId){
    const result= await db.query(
        'SELECT Chat FROM CHAT WHERE ChatWhatsApp=?',
        [
            chatId
        ]
    );
    return result[0].Chat;

}

async function registerChat(chat,typechat,empresa){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO CHAT(Empresa,TipoChat,ChatWhatsApp,Nombre,Estado,UsrFechaRegistro,UsrHoraRegistro,UsrFechaEliminacion,UsrHoraEliminacion) VALUES (?,?,?,?,?,?,?,?,?)',
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
    return result.affectedRows?getSuccessfulOperationMessage(registerChat.name): getFailedOperationMessage(registerChat.name);

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
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();
}


async function registerMessage(chat,user,chatempresa,conversation,mensajeReenviado){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();

    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatEmpresaAgente,Conversacion,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado,ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            user,
            chat.chatId,
            typeMessage,   
            chatempresa,
            conversation,
            chat.mensajeId,
            messageReenviado,
            messageEtiquetado,
            chat.body,
            0,
            messageDescription,
            1,
            lcdate,
            lchour
        ]
    );
    return result.affectedRows?getSuccessfulOperationMessage(registerMessage.name): getFailedOperationMessage(registerMessage.name);

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

    return result.affectedRows?getSuccessfulOperationMessage(registerTaggedMessage.name): getFailedOperationMessage(registerTaggedMessage.name);
}


async function searchLastAgentToChat(chatId){
    var lnidAgentChatFounded=0;
    const loresult= await db.query(
        'SELECT ChatAgente  FROM CHATAGENTE WHERE Estado=? AND Chat=?',
        [
            1,
            chatId
        ]   
    );
    if(loresult.length>0){
        lnidAgentChatFounded=loresult[0].ChatAgente; 

    }

    return lnidAgentChatFounded;
}


async function searchLastActiveAgentToConversationByChat(chat){
    const loresult= await db.query(
        'SELECT AsignarAgenteConversacion as id,Empresa,Agente,Conversacion  FROM ASIGNARAGENTECONVERSACION WHERE Estado=? AND Chat=?',
        [
            1,
            chat
        ]   
    );
    return loresult[0];
}



async function searchLastActiveAgentToConversationByChat(chat){
    const loresult= await db.query(
        'SELECT AsignarAgenteConversacion as id,Empresa,Agente,Conversacion  FROM ASIGNARAGENTECONVERSACION WHERE Estado=? AND Chat=?',
        [
            1,
            chat
        ]   
    );
    return loresult[0];
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
  


  async function registerAutomaticMessage(user,chatId,typeMessage,chatAgente,
    conversation , idMessage
    ,contentMessage,isbotMessage,messageDescription){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatAgente,Conversacion,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado, ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
                user,
                chatId,
                typeMessage,   
                chatAgente,
                conversation,
                idMessage,
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
    return result.affectedRows?getSuccessfulOperationMessage(registerAutomaticMessage.name): getFailedOperationMessage(registerAutomaticMessage.name);
}

async function registerAutomaticLocationMessage(user,chatId,typeMessage,chatAgente,
    conversation, idMessage
    ,contentMessage,conversation,addressName){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO MENSAJE(Usuario,Chat,TipoAdjunto,ChatAgente,Conversacion,MensajeWhatsApp,MensajeReenviado, MensajeEtiquetado, ContenidoMensaje,IsBotAutomatico,MensajeDescripcion,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            user,
            chatId,
            typeMessage,   
            chatAgente,
            conversation,
            idMessage,
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
    return result.affectedRows?getSuccessfulOperationMessage(registerAutomaticLocationMessage.name): getFailedOperationMessage(registerAutomaticLocationMessage.name);

}


async function searchMessagesByIdChat(chatId){
    const loresult= await db.query(
        'SELECT Usuario,TipoAjunto,MensajeWhatsApp,MensajeReenviado,MensajeEtiquetado,ContenidoMensaje,isBotAutomatico,MensajeDescripcion FROM MENSAJE WHERE Estado=? AND Chat=?',
        [
            1,
            chatId
        ]   
    );
    return loresult[0];
}

async function searchChatListByIdEmpresa(tnIdCompany){
    const loresult= await db.query(
        'SELECT TipoChat,ChatWhatsApp,Nombre FROM CHAT '+
        'WHERE Estado=? AND Empresa=?',
        [
            1,
            tnIdCompany
        ]   
    );
    return loresult;

}

async function searchConversationsByIdChat(tnIdChat){

    const loresult= await db.query(
        'SELECT CONVERSACION.Conversacion,CONVERSACION.TipoConversacion '+
        'FROM CONVERSACION,CHAT,CHATAGENTECONVERSACION '+
        'WHERE CONVERSACION.Estado=? '+
        'AND CHAT.Chat=chatagente.Chat '+
        'AND chatagenteconversacion.ChatAgente=chatagente.ChatAgente '+
        'AND chatagenteconversacion.Conversacion=CONVERSACION.Conversacion '+
        'AND CHAT.Chat=?',
        [
            1,
            tnIdChat
        ]   
    );
    return loresult[0];

}

async function searchMessagesByIdConversation(tnConversationId){
    
    const loresult= await db.query(
        'SELECT Usuario,TipoAjunto,MensajeWhatsApp,MensajeReenviado,MensajeEtiquetado,ContenidoMensaje,isBotAutomatico,MensajeDescripcion '+
        'FROM MENSAJE WHERE Estado=? AND Chat=?',
        [
            1,
            chatId
        ]   
    );


}

async function searchAvailableInstancesInWhatsApp(){
    var quantity= null;
    const loResult= await db.query(
        'SELECT InstanciaWhatsapp, Instancia, Token '+
        'FROM INSTANCIAWHATSAPP WHERE Estado=?',
        [
            0,
        ]   
    );
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


async function listInstancesInWhatsApp(){
    var quantity= null;
    const loResult= await db.query(
        'SELECT InstanciaWhatsapp, Instancia, Token '+
        'FROM INSTANCIAWHATSAPP WHERE Estado=?',
        [
            0,
        ]   
    );
    return loResult;
}

async function searchInstancesInWhatsAppByNumberInstance(lnInstanceNumber){
    const loResult= await db.query(
        'SELECT InstanciaWhatsapp ,Instancia,Token '+
        'FROM INSTANCIAWHATSAPP WHERE Instancia=?',
        [
            lnInstanceNumber,
        ]   
    );
    var loObjectReturn=null;
    if(loResult.length>0){
        var loObjectReturn= {
            InstanciaWhatsapp:loResult[0].InstanciaWhatsapp,
            Instancia:loResult[0].Instancia,
            Token:loResult[0].Token
        };
    }
    return loObjectReturn;
}

async function registerNewInstance(lcInstance,lcToken){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO INSTANCIAWHATSAPP(Instancia,Token,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            lcInstance,
            lcToken,
            1,
            lcdate,
            lchour 
        ]
    );

   return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();

   /*let lnRegisterResult=0;

    if(result.affectedRows){
        message=lnRegisterResult;
    }

    return lnRegisterResult;
*/
}

async function asignInstanceWhatsAppToEmpresaUsuario(instanceId,empresaUsuarioId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    console.log("Registro instancia empresa usuario INSTANCIA "+instanceId+" empresa usuario "+empresaUsuarioId  )
    const result= await db.query(
        'INSERT INTO INSTANCIAEMPRESAUSUARIO(InstanciaWhatsApp,EmpresaUsuario,Estado,UsrHora,UsrFecha) '+ 
        'VALUES (?,?,?,?,?)',
        [
            instanceId,
            empresaUsuarioId,
            1,
            lchour,
            lcdate,
        ]   
    );
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();
}


async function registerEmpresaUser(idUser,idEmpresa){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(
        'INSERT INTO EMPRESAUSUARIO(Empresa,Usuario,Estado,UsrFecha,UsrHora) '+ 
        'VALUES (?,?,?,?,?)',
        [
            idEmpresa,
            idUser,
            1,
            lcdate,
            lchour
        ]   
    );
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();

}

async function registerNewEmpresaNumberInChatAPI(tnIdUser,tnIdEmpresa){
    const lcMessage = "Todas las Instancias estan ocupadas";
    const tcInstance= await searchAvailableInstancesInWhatsApp();
    if(tcInstance.InstanciaWhatsapp!=0){
        const lcIdEmpresaUsuario =  registerEmpresaUser(tnIdUser,tnIdEmpresa);
        const registerAsignInstanceWithEmpresaUsuario = await asignInstanceWhatsAppToEmpresaUsuario(tcInstance.InstanciaWhatsapp,lcIdEmpresaUsuario);
    }

}

async function queryToUser(userWhatsApp){
    var lnIdUser=0;
    const loResult= await db.query(
        'SELECT Usuario FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    if(loResult.length>0){
        lnIdUser=loResult[0].Usuario;

    }
    return lnIdUser;

}


async function verifyUserCompany(tnIdWhatsAppNumber,tcSenderName,tnIdEmpresa,tnInstanceNumber){
    var lnIdUser=0;
    var message="";
    const loResultSearchIdUser = await queryToUser(tnIdWhatsAppNumber);
    if (loResultSearchIdUser == 0) {
        message = await insertUser(tnIdWhatsAppNumber, tcSenderName);
        const lcIdUser = await searchUser(tnIdWhatsAppNumber);
        lnIdUser = lcIdUser;
        const lnIdregisterUserCompany = await registerEmpresaUser(lcIdUser, tnIdEmpresa);
        if (lnIdregisterUserCompany != 0) {
            const lnIdUserCompany = await searchLastUserCompany();
            const registerAsignInstanceWithEmpresaUsuario = await asignInstanceWhatsAppToEmpresaUsuario(tnInstanceNumber, lnIdUserCompany);
        }
    }
    else{
        lnIdUser=loResultSearchIdUser;
    }
    return lnIdUser;
}

async function searchLastUserCompany(){
    const loResult= await db.query(
        'SELECT Empresausuario FROM EMPRESAUSUARIO WHERE Estado=? ORDER BY Empresausuario DESC LIMIT 1',
        [
            1
        ]
    );
    return loResult[0].Empresausuario;
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

async function searchInstanceByIdUser(tnIdUsuario)
{
    var quantity=null;
    const loResult= await db.query(
        'SELECT Usuario FROM USUARIO WHERE UsuarioWhatsApp=?',
        [
            userWhatsApp
        ]
    );
    if(loResult.length>0){
        quantity=loResult[0]; 
    }
    else{
        quantity={
            InstanciaWhatsapp:0
        }
    }
    return loResult[0].Usuario;

}

async function registerChatInSend(chatId,senderName,typechat,empresa){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
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
    return result.affectedRows?getNumericalSuccessMessage():getNumericalFailMessage();

}

async function registerRewardMessageGeneral(messageId,messsageRewardedContent,typeMessage){
    const lnResultRegisterRewardMessage= await registerRewardMessage(messageId,messsageRewardedContent,typeMessage);
    var idRewardMessage=0;
    if(lnResultRegisterRewardMessage==1){
        idRewardMessage= searchLastRewardedMessageRegisteredByIdWhatsAppMessage();
    }
    return idRewardMessage;
}

async function registerRewardMessage(messageId,messsageRewardedContent,typeMessage) {
    const loResult = await db.query(
        'INSERT INTO MENSAJEREENVIADO(IdentificadorMensajeReenviado,ContenidoMensaje,TipoAdjunto) VALUES (?,?,?)',
        [
            messageId,
            messsageRewardedContent,
            typeMessage
        ]
    );
    return loResult.affectedRows ? getNumericalSuccessMessage() : getNumericalFailMessage();
}


async function searchLastRewardedMessageRegisteredByIdWhatsAppMessage(){
    var lnValueId=0;
    const loResult= await db.query(
        'SELECT MensajeReenviado FROM MENSAJEREENVIADO ORDER BY MensajeReenviado DESC LIMIT 1',
        [
            1

        ]
    );
    if(loResult.length>0){
        lnValueId=loResult[0].MensajeReenviado;

    }

    return lnValueId;
}


module.exports={
    insertTipoChat,
    insertUser,
    registerChat,
    registerMessage,
    registerChatUser,
    registerAutomaticMessage,
    registerAutomaticMessageGeneral,
    searchMessagesByIdChat,
    registerNewInstance,
    verifyUserCompany,
    searchInstancesInWhatsAppByNumberInstance,
    registerChatInSend,
    registerRewardMessageGeneral


}


