const user = require("../models/user");
const message = require("../models/message");
const chats = require("../models/chats");
const jwt = require('jsonwebtoken');
require('dotenv').config();



module.exports.create_message = async (req, res) => {
    try {
        const token = req.body.data.token;
        const user = await verifyToken(token);
        const chatId = req.body.data.chatId;
        const text = req.body.data.text;

        if (user.id) {
            const senderId = user.id;
            const created_message = new message({
                chatId, senderId, text
            });
            response = await created_message.save();
            const entry = await chats.findOne({
                _id: chatId
            });

            res.status(200).json(entry.users);
        } else {
            console.log(`Could'nt verify token`);
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({error});
    }
}

module.exports.get_messages = async (req, res) => {
    try {
        const chatId = req.body.chatId;
        const messages = await getMessages(chatId);

        const organized_messages = await organize(messages);
        res.status(200).json(organized_messages);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

async function getMessages (chatIds) {
    let all_messages = [];
    if (chatIds.length > 0) {
        for (const chat of chatIds) {
            const messages = await message.find({chatId: chat});
            if (messages.length > 0) {
                all_messages = all_messages.concat(messages);
            }
        }
        return all_messages;
    } else {
        return null;
    }
}

async function organize(messages) {
    const reorganizedMessages = await Promise.all(messages.map(async (curr) => {
        const { chatId, senderId, createdAt, text } = curr;
        const user = await findById(senderId);
        const username = user ? user.username : "Unknown";
        return { chatId, sender: username, createdAt, text };
    }));

    const groupedMessages = reorganizedMessages.reduce((acc, curr) => {
        const { chatId, sender, createdAt, text } = curr;
        if (!acc[chatId]) {
            acc[chatId] = [];
        }
        acc[chatId].push({ sender, createdAt, text });
        return acc;
    }, {});

    return groupedMessages;
}

async function findById (id) {
    const User = await user.findOne({_id: id});
    return User;
}

async function verifyToken (token) {
    const user = jwt.verify(token, process.env.JWT_SIGNATURE);
    return user;
}