const chats = require("../models/chats");
const user = require("../models/user");
const friends = require("../models/friends");
const jwt = require('jsonwebtoken');
require('dotenv').config();

const findChat = async function (senderId, recepientId) {
    try {
        const chat = await chats.findOne({
            users: {$all: [senderId, recepientId]}
        });
        if (chat) {
            return chat;
        } else {
            const chat = new chats({
                users: [senderId, recepientId]
            });
            const response = await chat.save();
            return response;
        }
    } catch(error) {
        console.log(error);
    }
}

const verifyToken = async function (token) {
    const userId = jwt.verify(token, process.env.JWT_SIGNATURE);
    return userId;
}

const findByUsername = async function (username) {
    const User = await user.findOne({username: username});
    return User;
}

const findById = async function (id) {
    const User = await user.findOne({_id: id});
    return User;
}

const checkFriendship = async function (sender, recepient) {
    const friendship = await friends.findOne({
        $or: [
            { $and: [{ user: sender }, { friend: recepient }] },
            { $and: [{ user: recepient }, { friend: sender }] }
        ]
    });
    if (friendship) {
        return true;
    } else {
        return false;
    }
}

module.exports.chat = async (req, res) => {
    const friend_username = req.body.friend;
    try {
        const sender = await verifyToken(req.headers.cookie.split("=")[1]);
        if (sender.id) {
            const friend = await findByUsername(friend_username);
            const friend_id = friend._id.toString();
            if (friend_id) {
                const friendship = await checkFriendship(sender.id, friend_id);
                if (friendship === true) {
                    const Chat = await findChat(sender.id, friend_id);
                    if (Chat) {
                        res.status(200);
                    } else {
                        res.status(500).json({message: "An error occured during finding or creation of the chat."});
                    }
                } else {
                    console.log("Not friends");
                }
            } else {
                console.log("Friend id not found.");
            }
        } else {
            console.log("User token cannot be verified.");
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
}

// Get all user chats.
module.exports.get_chats = async (req, res) => {
    try {
        const token = await verifyToken(req.headers.jwt);
        const all_chats = await chats.find({
            users: {$in: token.id}
        }).sort({ timestamp: -1 });
        if (all_chats && all_chats.length > 0) {
            const conversations = await create_conversations(all_chats, token);
            res.status(200).json(conversations);
        } else {
            res.status(200).json({message: "User has no conversations."});
        }
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
    
}

// Create the conversations array
const create_conversations = async function (all_chats, token) {
    let conversations = [];
    for (const chat of all_chats) {
        for (const user of chat.users) {
            if (user.toString() !== token.id) {
                const friend = await findById(user.toString());
                const friend_username = friend.username;
                const friend_status = friend.status;
                conversations.push({
                    chatId: chat._id,
                    friend: friend_username,
                    status: friend_status,
                    created: chat.createdAt,
                    updated: chat.updatedAt
                });
            }
        }
    }
    return conversations;
}