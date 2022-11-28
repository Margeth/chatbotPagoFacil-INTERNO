const db = require('./db');
const goCrypto = require("crypto");
const { v4: uuidv4 } = require('uuid');
const config = require('../connectiondatabase/connection');
const goCompanyDao = require('../dao/companydao');
const dateHelpers =  require('../helpers/dateHelpers');
const  answerHelpers = require("../helpers/answerHelper");

/***********************************************************************************
 * Description..: generates token for an enterprise
 * Return.......: Chart: encrypted token for an enterprise
 * Parameters...: tnEmpresaComercio: numerical ID that identifies the enterprise
 ***********************************************************************************/
async function generateTokenService(tnEmpresaComercio){
    var lcTS="|";
    var company= await getCompanyData(tnEmpresaComercio);
    var lcCadenaBase1 = company.Empresa + lcTS + company.Pais + lcTS + company.Region + lcTS + company.Nombre.trim();
    var lcCadenaBase2 = company.RazonSocial.trim() + lcTS + String(company.NIT) + lcTS + company.Email;
    var lcCadenaBase3 = company.Empresa + lcTS + company.Serial + lcTS + company.Pais + lcTS + company.Region + lcTS + company.Nombre.trim();
    var lcCadenaBase4 = String(company.RazonSocial).trim() + lcTS + company.NIT.toString() + lcTS + String(company.Email).trim() + lcTS + String(company.tnTipoToken);
    let lcHash1 = goCrypto.createHash('sha256').update(lcCadenaBase1).digest('base64').trim();
    let lcHash2 = goCrypto.createHash('sha256').update(lcCadenaBase2).digest('base64').trim();
    let lcHash3 = goCrypto.createHash('sha256').update(lcCadenaBase3).digest('base64').trim();
    let lcHash4 = goCrypto.createHash('sha256').update(lcCadenaBase4).digest('base64').trim();

    return lcHash1 + lcHash2 + lcHash3 + lcHash4;
   /* let lcHash = lcHash1 + lcHash2 + lcHash3 + lcHash4;
    return lcHash;*/
}

/************************************************************************************
 * Description..: generates an UUID(Universal Unique Identifier)token for an enterprise
 * Return.......: Chart: UUID token for an enterprise
 * Parameters...: None
 ************************************************************************************/
function generateTokenSecret(){
    var loGUID = uuidv4();
//    var loGUID = new ActiveXObject("Scriptlet.TypeLib")
    var lcKey = loGUID.substring(2, 36);
    lcKey = lcKey.replace(/-/g,"");
    lcKey = lcKey.substring(0, 24);
    return lcKey;
}

/**************************************************************************************
 * Description..: updated a enterprise's service token
 * Return.......: Chart: Message error or updated token
 * Parameters...: tnEmpresa: Required: numerical ID that identifies the enterprise
 **************************************************************************************/
async function updateKeyService(tnEmpresa) {
    var lcTokenService= await generateTokenService(tokenService.empresa);
    const coresult = await db.query(
        `UPDATE empresatoken
        SET TokenService=? WHERE Empresa=?`,
        [   
            lcTokenService,
            tnEmpresa
        ]
    );
    return coresult.affectedRows? lcTokenService: 'Error updating the key';

}

/**************************************************************************************
 * Description..: gets the instance available on WhatsApp
 * Return.......: Object: Message error or updated token
 * Parameters...: None
 **************************************************************************************/
async function getAvailableInstancesInWhatsApp(){
    const loAvailableinstances = await goCompanyDao.getAvailableInstancesInWhatsApp();

    var laActiveInstanceList = [];
    var loResult ={};
    if (loAvailableinstances.length > 0) {

        for (var i = 0; i < loAvailableinstances.length; i++) {
            var laActiveInstance = {
                idinstancia: loAvailableinstances[i].InstanciaWhatsapp,
                numeroinstancia: loAvailableinstances[i].Instancia,
                tokeninstancia: loAvailableinstances[i].Token          
            }
            laActiveInstanceList.push( laActiveInstance );
        }
        loResult = answerHelpers.getResultJsonMessage(0,1,"Lista de instancias obtenidas correctamente.",1,"Obtencion de instancias exitosa", laActiveInstanceList);

    }
    else{
        loResult = answerHelpers.getResultJsonMessage(1,2,"NO existe instancias activas",1,"No se pudo obtener instancias activas", "No se pudo obtener instancias activas");
    }

    return loResult;
}

/**************************************************************************************
 * Description..: updated a enterprise's secrect token
 * Return.......: Chart: Message error or updated token
 * Parameters...: tnEmpresa: Required: Enterprise ID
 **************************************************************************************/
async function updateKeySecret(tnEmpresa) {
    var lcTokenService= await generateTokenSecret();
    const coresult = await db.query(
        `UPDATE EMPRESATOKEN
        SET TokenSecret=? WHERE Empresa=?`,
        [
            lcTokenService,
            tnEmpresa
        ]
    );

    return coresult.affectedRows? lcTokenService: 'Error in updating programming language';

}

/***************************** PASAR A SEED COMPANY???? */
/***********************************************************************************
 * Description..: register a company
 * Return.......: Chart: Operation status message
 * Parameters...: name: Required: explication
 ***********************************************************************************/
async function registerCompany(company){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const result= await db.query(

        'INSERT INTO empresa(`Nombre`, `RazonSocial`, `Descripcion`, `Codigo`, `Token`, `Url_Icon`, `F_Edicion`, `Estado`, `ClienteIntegral`, `EstadoWebService`, `TipoDebug`, `ServerIP`, `ServerIpProxy`, `TigoDirecto`, `MaxCodigoCliente`, `EtiquetaCodigoFijo`, `Sistema`, `CadenaConexion`, `url_web`, `url_facebook`, `url_twitter`, `url_youtube`, `TipoEmpresa`, `Pais`, `region`, `direccion`, `email`, `telefono`, `FotoFrente`, `TipoComision`, `NIT`, `latitud`, `longitud`, `Email_TO`, `Email_CC`, `Email_CCO`, `Email_InformeError`, `Referencia_EmailError`, `Usr`, `UsrHora`, `UsrFecha`, `FotoDentro`, `Url_Imagen_Grande`, `EtiquetaAviso`, `EtiquetaTipoNota`, `EtiquetaDeuda`, `EtiquetaAvisoCompleta`, `EtiquetaItemPago`) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            company.tcNombre,
            company.tcRazonSocial,
            company.tcDescripcion,
            company.tcCodigo,
            company.tcToken,
            null,
            lcdate,
            1,
            1,
            1,
            1,
            company.tcServerIP,
            null,
            null,
            1000,
            'Cliente',
            1,
            '',
            'sin direccion web',
            'sin direccion facebook',
            'sin direccion twitter',
            'sin direccion youtube',
            null,
            1, 
            1, 
            'sin direccion', 
            company.tcEmail,
            '628921251',
            '',
            0, 
            company.tcNit,
            '0',
            '0',
            null,
            null, 
            null, 
            '', 
            '',
            1, 
            lchour,
            lcdate,
            '', 
            '', 
            null, 
            null, 
            null, 
            null, 
            'Facturas'
        ]
    );
    return result.affectedRows? answerHelpers.getSuccessfulOperationMessage(registerCompany.name): answerHelpers.getFailedOperationMessage(registerCompany.name);

}

/***************************** PASAR A SEED COMPANY???? TERMINAR DE BUSCAR CAMPOS EN LA DB
 * TERMINAR DE BUSCAR CAMPOS EN LA DB
 * tnTokenMethodCreation
 * tcUrlReturn = cesar.corvera@pagofacil.com.bo? */
/***********************************************************************************
 * Description..: register a token for a company
 * Return.......: Chart: Operation status message
 * Parameters...: companySerial: Required: indefined
 *                serial: Required: company serial
 *                tokenType: Required: token type
 *                tnTokenMethodCreation: Required:
 *                tcTitle: Required: title for a company token
 *                tcTokenService: Required: Company's service token
 *                tcTokenSecret: Required: Company's secret token
 *                tcUrlCallBack: Required: url to call the readMessage service
 *                tcUrlReturn: Required: url to return data
 *                tcMessajeClient: Required: Message to the customer
 ***********************************************************************************/
async function registerTokenCompany(companySerial,tnSerial,tnTokenType,tnTokenMethodCreation,tcTitle,tcTokenService,tcTokenSecret,tcUrlCallBack,tcUrlReturn,tcMessajeClient){
    let lcdate= dateHelpers.getCurrentDate();
    const result= await db.query(
        'INSERT INTO EMPRESATOKEN(Empresa,Serial,Estado,TipoToken,FechaCreacion,FechaLimite,MetodoCreacionToken,Titulo,TokenService,TokenSecret,UrlCallBack,UrlReturn,MensajeCliente) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)',
        [
            companySerial,
            tnSerial,
            1,
            tnTokenType,
            lcdate,
            '2022-06-02',
            tnTokenMethodCreation,
            tcTitle,
            tcTokenService,
            tcTokenSecret,
            tcUrlCallBack,
            tcUrlReturn,
            tcMessajeClient,
        ]
    );

    return result.affectedRows? answerHelpers.getSuccessfulOperationMessage(registerTokenCompany.name): answerHelpers.getFailedOperationMessage(registerTokenCompany.name);

}

/***************************** PASAR A SEED COMPANY???? */
/***********************************************************************************
 * Description..: register a new instance or a company
 * Return.......: Chart: Operation status message
 * Parameters...: tnInstance: Required: ID of the instance of a company
 *                tcToken: Required: Token of the instance of a company
 ***********************************************************************************/
async function registerNewInstance(tcInstance,tcToken){
    let lcdate= dateHelpers.getCurrentDate();
    let lchour= dateHelpers.getCurrentHour();
    const result= await db.query(
        'INSERT INTO INSTANCIAWHATSAPP(Instancia,Token,Estado,UsrFecha,UsrHora) VALUES (?,?,?,?,?)',
        [
            tcInstance,
            tcToken,
            1,
            lcdate,
            lchour
        ]
    );

    return result.affectedRows? answerHelpers.getSuccessfulOperationMessage(registerNewInstance.name): answerHelpers.getFailedOperationMessage(registerNewInstance.name);
}

/***********************************************************************************
 * Description..: deletes the instance of a company
 * Return.......: Chart: Operation status message
 * Parameters...: tnInstance: Required: ID of the instance of a company
 ***********************************************************************************/
async function deleteInstance(tcInstance){
    const coresult = await db.query(
        `UPDATE INSTANCIAWHATSAPP
        SET Estado=? WHERE Instancia=?`,
        [
            0,
            tcInstance
        ]
    );
    return coresult.affectedRows? answerHelpers.getSuccessfulOperationMessage(deleteInstance.name): answerHelpers.getFailedOperationMessage(deleteInstance.name);

}

// WARNING---------------- NO ESTA HACIENDO LO QUE DEBE HACER
/***********************************************************************************
 * Description..: obtains a company's information
 * Return.......: List: a list with data of a specific company
 * Parameters...: tnEmpresaComercio: Required: ID of a specific company
 ***********************************************************************************/
async function getCompanyData(tnEmpresaComercio){
    var message='0';
    var i=0;
    const lnResult= await db.query(
        'SELECT * FROM EMPRESA WHERE Empresa=?',
        [
            tnEmpresaComercio
        ]
    );

    if(lnResult.length>0){
        message='1';

    }
    return lnResult[i];
}

/***********************************************************************************
 * Description..: Obtains company data since the last
 * Return.......: query: Sql query of the companies since the last company
 * Parameters...: None
 ***********************************************************************************/
async function getLastBussiness(){
    return await db.query('SELECT Empresa FROM EMPRESA ORDER BY Empresa DESC LIMIT 1');

    /*const lnResult= await db.query(
        'SELECT Empresa FROM EMPRESA ORDER BY Empresa DESC LIMIT 1'
    );
    return lnResult;*/

}

/***       NEW  CLASS CONVERSATION  *****/
/***********************************************************************************
 * Description..: get chat conversation
 * Return.......: Querry: String
 * Parameters...: chatId: Required: chat ID
 ***********************************************************************************/
async function searchConversationListByIdChat(chatId){
    var laConversationsFounded = null;
    const loResult = await db.query(
        'SELECT DISTINCT CONVERSACION.Conversacion as id,CONVERSACION.TipoConversacion as tipo,CONVERSACION.UsrFecha as fecha FROM CONVERSACION, CHATAGENTE, CHATAGENTECONVERSACION ' +
        'WHERE CHATAGENTE.Chat=? ' +
        'AND CHATAGENTECONVERSACION.ChatempresaAgente = CHATAGENTE.ChatAgente ' +
        'AND CONVERSACION.Conversacion = CHATAGENTECONVERSACION.Conversacion',
        [
            chatId,
        ]
    );

    if (loResult.length > 0) {
        laConversationsFounded = loResult;
    }
    return laConversationsFounded;
}

/***********************************************************************************
 * Description..: get message by conversation
 * Return.......: Querry: String
 * Parameters...: tcConversationId: Required: message string
 ***********************************************************************************/
async function searchMessagesByConversationId(tcConversationId){
    var laConversationsFounded = null;
    const loResult = await db.query(
        'SELECT Mensaje as id,Recibido as recibido ,mensajeWhatsApp as idwap, ContenidoMensaje as contenido, mensajeReenviado as menreen, isBotAutomatico as bot ' +
        'FROM MENSAJE '+
        'WHERE Conversacion=?', 
        [
            tcConversationId,
        ]
    );
    if (loResult.length > 0) {
        laConversationsFounded = loResult;
    }
    return laConversationsFounded;
}

/*
async function searchConversationListByIdChat(chatId){
    let lcdate= getCurrentDate();
    let lchour= getCurrentHour();
    const loResult= await db.query(
        'SELECT conversacion.Conversacion,conversacion.TipoConversacion,conversacion.UsrFecha,conversacion.UsrHora '+
        'FROM conversacion, chatagenteconversacion, chatagente '+
        'WHERE chatAgente.Chat=?'+
        'AND chatAgente.ChatAgente=('+
        'SELECT ChatAgente FROM chatagenteconversacion '+
        'ORDER BY column_name ASC '+
        'LIMIT 1;'
        +')',
        [
            agentId,
            chatId,
            1,
            lcdate,
            lchour
        ]
    );
    let message=0;

    if(loResult.affectedRows){
        message=1;
    }

    return message;
}
*/

/***********************************************************************************
 * Description..: get company list
 * Return.......: Querry: String
 * Parameters...: None
 ***********************************************************************************/
async function getCompanies(){
    const rows = await db.query(
        'SELECT * FROM EMPRESA'
    );
    return rows;
}

/***********************************************************************************
 * Description..: generates an encrypted Id
 * Return.......: Querry: String
 * Parameters...: None
 ***********************************************************************************/
function generateCommerceID(){
    return goCrypto.createHash('sha256').update("1").digest('base64').trim();

}

/***********************************************************************************
 * Description..: Updates a company's available instance
 * Return.......: Querry: String
 * Parameters...: tnInstanceNumber: Required: Numerical instance of a company
 ***********************************************************************************/
async function modifyInstanceToAvailable(tnInstanceNumber){
    lnSuccessfulUpdateInstance= await goCompanyDao.putInstanceAvailable(tnInstanceNumber);
}

module.exports={
    generateTokenService,
    generateTokenSecret,
    updateKeyService,
    updateKeySecret,
    registerCompany,
    registerTokenCompany,
    getLastBussiness,
    getCompanies,
    generateCommerceID,
    getCompanyData,
    registerNewInstance,
    deleteInstance,
    modifyInstanceToAvailable,
    searchConversationListByIdChat,
    searchMessagesByConversationId,
    getAvailableInstancesInWhatsApp
}
