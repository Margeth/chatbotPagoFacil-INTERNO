function ApiWhatsappStrategyContext (toStrategy, tcUrl, tcKey){

    this.strategy = toStrategy;
    this.key = tcKey;

    /* Method: Modification of the strategy at run time
    */
    this.setStrategy = function (

    ){
        this.strategy = toStrategy;
    }

    this.apiChatApi = function (method, instance, instanceToken, params){
        return this.strategy.apiChatApi(method, instance, instanceToken, params);
    }

    this.apiChatApiNVAudio = function (params){
        return this.strategy.apiChatApiNVAudio(params);
    }

    this.apiChatApiNVFile = function (params){
        return this.strategy.apiChatApiNVFile(params);
    }

    this.apiChatApiNVLocation = function (params){
        return this.strategy.apiChatApiNVLocation(params);
    }

    this.apiChatApinv = function (params){
        return this.strategy.apiChatApinv(params);
    }

}

module.exports = {
    ApiWhatsappStrategyContext,

};
