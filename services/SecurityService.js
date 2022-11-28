//const router= express.Router();
const config = require("../config");
const goPad = require('pad');
const Key = require('../Model/Key');
const goKey = new Key(config.cipherMethod, config.decipherMethod, config.tcipherKey);
const goCrypto = require("crypto");

function encrypt3DES(input, key) {
    let loCipherIv = goCrypto.createCipheriv( goKey.getDecryptionType() , key , null);
    var lcinputToString = input.toString();
    const lnlength = lcinputToString.length;
    lcinputToString = goPad( lcinputToString , (lnlength + 8 - (lnlength % 8)), '\0');
    let lcencryptedData = loCipherIv.update( lcinputToString , "utf8", "base64" ) + loCipherIv.final( "base64" );
    return lcencryptedData;
}

function descrypt3DES(input, key) {
    let loCipherIv = goCrypto.createDecipheriv(goKey.getDecryptionType(), key, null);
    let lcdecryptedData = loCipherIv.update(input, 'base64', 'utf8') + loCipherIv.final("utf8");
    return lcdecryptedData;
}

module.exports={
    encrypt3DES,
    descrypt3DES
}
