const mongoose = require('mongoose');
const crypto = require('crypto');

const messageSchema = mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chats',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        maxlength: 10000
    }
},{
    timestamps: true
});

const message = mongoose.model('Message', messageSchema);
module.exports = message;