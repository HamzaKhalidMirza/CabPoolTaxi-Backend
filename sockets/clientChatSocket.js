const Chat = require('./../models/chatModel');

module.exports = function(io){
     
    io.on('connection', (socket) => {

        socket.on('clientSendMessage', async (data) => {
            const chatMessageClientEvent = data.client + '-clientMessageSuccessfullySent';
            const chatMessageDriverEvent = data.driver + '-driverReceivedMessage';
            const doc = await Chat.create(data);
            if(doc) {
                io.emit(chatMessageClientEvent, doc);
                io.emit(chatMessageDriverEvent, doc);
            }
        });
        
        socket.on('clientQueriedChatMessages', async (data) => {
            const chatMessageEvent = data.client + '-clientGetChatMessages';
            const docs = await Chat.find(data);
            if(docs) {
                io.emit(chatMessageEvent, docs);
            } else {
                io.emit(chatMessageEvent, {
                    data: 'None'
                });
            }
        });
    });
}