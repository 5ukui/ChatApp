const user = require("../models/user");
const chats = require("../models/chats");
const friends = require("../models/friends");
const friends_controller = require('../controllers/friends_controller');
const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports.get_public_key = async (req, res) => {
    try {
        const user = await verifyToken(req.params.token);
        if (user.id) {
            const friend = await findByUsername(req.params.username);
            if (friend) {
                const friendship = await checkFriendship(user.id, friend._id);
                if (friendship) {
                    res.status(200).json({username: friend.username, publicKey: friend.publicKey});
                } else {
                    res.status(404).json({message: `Not friends`});
                }
            } else {
                res.status(500).json({message: `Couldn't find user.`})
            }

        } else {
            res.status(500).json({message: `Couldn't verify the JSON web token.`});
        }

    } catch(error) {
        res.status(500).json({message: error});
    }
}

module.exports.get_private_key = async (req, res) => {
    try {
        const user = await verifyToken(req.params.token);
        if (user.id) {
            const user_data = await findById(user.id);
            if (user_data) {
                res.status(200).json({privateKey: user_data.publicKey});
            } else {
                res.status(500).json({message: `Couldn't find user.`});
            }

        } else {
            res.status(500).json({message: `Couldn't verify the JSON web token.`});
        }
    } catch(error) {
        res.status(500).json({message: error});
    }
}

const verifyToken = async function (token) {
    const user = jwt.verify(token, process.env.JWT_SIGNATURE);
    return user;
}

const findById = async function (id) {
    const User = await user.findOne({_id: id});
    return User;
}

const findByUsername = async function (username) {
    const User = await user.findOne({username: username});
    return User;
}

const checkFriendship = async function (sender, recepient) {
    const friendship = await friends.findOne({
        $or: [
            { $and: [{ user: sender }, { friend: recepient }, {status: "accepted"}] },
            { $and: [{ user: recepient }, { friend: sender }, {status: "accepted"}] }
        ]
    });
    if (friendship) {
        return true;
    } else {
        return false;
    }
}