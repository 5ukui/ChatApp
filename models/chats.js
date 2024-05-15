const mongoose = require('mongoose');

const chatsSchema = new mongoose.Schema({
    users: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }],
        validate: {
            validator: function(usersArray) {
                return Array.isArray(usersArray) && usersArray.length === 2 && new Set(usersArray).size === 2;
            },
            message: 'The users array must contain exactly two unique user IDs.'
        }
    }
}, {
    timestamps: true
});

const chatsModel = mongoose.model("Chats", chatsSchema);
module.exports = chatsModel;
