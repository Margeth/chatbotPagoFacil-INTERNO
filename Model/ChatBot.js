
class chatbot{
    constructor(phone, message) {
        this.phone = phone;
        this.message = message;
    }

    setPhone(newPhone){
        this.phone = newPhone;
    }

    getPhone(){
     return this.phone;
    }

    setMessage(message){
        return this.message= message;
    }

}

module.exports = chatbot;
