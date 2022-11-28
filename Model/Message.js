class Message{

    constructor(idMessage, message, fromMe, self, isForwarded, author, time, chatId, messageNumber, type, senderName, quoutedMsgBody, quotedMsgId, quotedMsgType, chatName) {
        this.idMessage = idMessage;
        this.message = message;
        this.fromMe = fromMe;
        this.self = self;
        this.isForwarded = isForwarded;
        this.author = author;
        this.time = time;
        this.chatId = chatId;
        this.messageNumber = messageNumber;
        this.type = type;
        this.senderName = senderName;
        this.quoutedMsgBody = "No tiene contenido";
        if (quoutedMsgBody) {
            this.quoutedMsgBody = quoutedMsgBody;
        }
        this.quotedMsgId = "No tiene contenido";
        if (quotedMsgId) {
            this.quotedMsgId = quotedMsgId;
        }
        this.quotedMsgType = "NO tiene contenido";
        if (quotedMsgType) {
            this.quotedMsgType = quotedMsgType;
        }
        this.chatName = chatName;

    }
}

module.exports = Message;