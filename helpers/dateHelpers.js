
/************************************************************************
 * Description..: get current time
 * Return.......: Chart: 00:00:00
 * Parameters...: None
 ************************************************************************/
function getCurrentHour(){
    let loDate = new Date();
    let lchours = loDate.getHours();
    let lcminutes = loDate.getMinutes();
    let lcseconds = loDate.getSeconds();
    return lchours + ":" + lcminutes + ":" + lcseconds;
}

/************************************************************************
 * Description..: get current date
 * Return.......: Chart: YYYY-MM-DD
 * Parameters...: None
 ************************************************************************/
function getCurrentDate(){
    let loDate = new Date();
    let lcday = ("0" + loDate.getDate()).slice(-2);
    let lcmonth = ("0" + (loDate.getMonth() + 1)).slice(-2);
    let lcyear = loDate.getFullYear();
    return lcyear + "-" + lcmonth + "-" + lcday;

}

/************************************************************************
 * Description..: Establishes the messages and statuses for a function/ list of available instances
 * Return.......: Object: results in json format
 * Parameters...: tnError: Required:
 *                tnStatus: Required:
 *                tsMessage: Required:
 ************************************************************************/


module.exports= {
    getCurrentDate,
    getCurrentHour
}