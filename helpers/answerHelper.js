
/***********************************************************************************
 * Description..: Obtains company data since the last
 * Return.......: query: Sql query of the companies since the last company
 * Parameters...: None
 ***********************************************************************************/
function getResultJsonMessage(tnError, tnStatus, tsMessage, tnShowMessage, tsMessageSystem, toValues){
    return {
        error: tnError,
        status: tnStatus,
        message: tsMessage,
        messageMostrar: tnShowMessage,
        messageSistema: tsMessageSystem,
        values: {
            answerMessage:toValues //JSON.parse(toValues)
        }
    }
}

/***********************************************************************************
 * Description..: Generate a numeric message
 * Return.......: Chart: Number identifying the action of "Successful operation".
 * Parameters...: None
 ***********************************************************************************/
function getNumericalSuccessMessage (){
    return '1';
}

/***********************************************************************************
 * Description..: Generate a numeric message
 * Return.......: Chart: Number identifying the action of "failed operation".
 * Parameters...: None
 ***********************************************************************************/
function getNumericalFailMessage (){
    return '0';
}

/***********************************************************************************
 * Description..: Generate a numeric message
 * Return.......: Chart: Number identifying the action of "failed operation".
 * Parameters...: None
 ***********************************************************************************/
function getSuccessfulOperationMessage (tcNameFunction){
    return 'La operación' + tcNameFunction +'fue realizada con exito';
}

/***********************************************************************************
 * Description..: Generate a numeric message
 * Return.......: Chart: Number identifying the action of "failed operation".
 * Parameters...: None
 ***********************************************************************************/
function getFailedOperationMessage (tcNameFunction){
    return 'Error. La operación' + tcNameFunction+ 'no fue realizada con exito';
}

/**************************************************************************************
 * Description..: Exception message body
 * Return.......: An exception message
 * Parameters...: None
 **************************************************************************************/
function responseMessageExceptionActivated(){
    const loResult = {
        error: 1,
        status: 2,
        message: "Operación fallida ",
        messageMostrar: 1,
        messageSistema: "",
        values: { message: "Revise los parametros de envío en la solicitud" }
    };
    return loResult;
}

module.exports = {
    getResultJsonMessage,
    getNumericalSuccessMessage,
    getNumericalFailMessage,
    getSuccessfulOperationMessage,
    getFailedOperationMessage,
    responseMessageExceptionActivated,
}

