const Chat = require('./../models/chatModel');

module.exports = function(io){
     
    io.on('connection', (socket) => {

        socket.on('driverSendMessage', async (data) => {
            const chatMessageDriverEvent = data.driver + '-driverMessageSuccessfullySent';
            const chatMessageClientEvent = data.client + '-clientReceivedMessage';
            const doc = await Chat.create(data);
            if(doc) {
                io.emit(chatMessageDriverEvent, doc);
                io.emit(chatMessageClientEvent, doc);
            }
        });

        socket.on('driverQueriedChatMessages', async (data) => {
            const chatMessageEvent = data.driver + '-driverGetChatMessages';
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