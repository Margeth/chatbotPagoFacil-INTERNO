class MessageConversation{

    constructor(idMessage, received, messageWap, content, messagerewarded, isbot) {
        this.idMessage = idMessage;
        this.received = received;
        this.messageWap = messageWap;
        this.content = content;
        this.messagerewarded = messagerewarded;
        this.isbot = isbot;
    }
}

module.exports = MessageConversation;
