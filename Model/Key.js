
class Key {

    constructor(encryptionType,decryptionType,key){
        this.encryptionType=encryptionType;
        this.decryptionType=decryptionType;
        this.key=key;
    }

    setKey(newKey){
        this.key=newKey;
    }

    setEncriptionType(newKey){
        this.key=newKey;
    }

    setDecryptionType(newKey){
        this.key=newKey;
    }


    getKey(){
        return this.key;
    }

    getEncriptionType(){
        return this.encryptionType;
    }

    getDecryptionType(){
        return this.decryptionType;
    }


}

module.exports = Key;