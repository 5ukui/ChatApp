const { request } = require('express');
const { requireAuth } = require('../middleware/checkToken');
const User = require('../models/user');
const Friend = require('../models/friends');
require('dotenv').config();
const jwt = require('jsonwebtoken');

// (POST) Function for handling sending friend requests
module.exports.send_request = async (req, res) => {
    const recipientUsername = req.body.username;
    const recipient  = await User.findOne({ username: recipientUsername });
    const recipientId = recipient._id.toString();
    const sender = jwt.verify(req.cookies.jwt, process.env.JWT_SIGNATURE);
    const existingFriendships = await Friend.find({
        $or: [
            { user: sender.id, friend: recipientId },
            { user: recipientId, friend: sender.id }
        ]
    });
    
    if (sender.id === recipientId) {
        return res.status(400).json({ message: "You cannot add yourself" });
    } else if (existingFriendships.length > 0) {
        const existingFriendship = existingFriendships[0];
        if (existingFriendship.status === "pending") {
            return res.status(400).json({ message: 'Friend request already sent' });
        } else if (existingFriendship.status === "accepted") {
            return res.status(400).json({ message: 'You\'re already friends with this user' });
        }
    } else {
        try {
            const friendship = await Friend.create({ user: sender.id, friend: recipientId, status: "pending" });
            res.status(201).json({ friendshipid: friendship._id, message: "Request sent" });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
}
    


module.exports.check_friendship_status = async (req, res) => {
    const sender = jwt.verify(req.cookies.jwt, process.env.JWT_SIGNATURE);
    if (sender.id === req.body.id) {
        res.status(400).json({message: "Same account"});
    } else {
        if (sender) {
            const friendshipStatus = await Friend.findOne({
                $or: [
                { user: sender.id, friend: req.body.id },
                { user: req.body.id, friend: sender.id }
                ]
            });

            if (friendshipStatus) {
                if (friendshipStatus.status === "pending") {
                    res.status(200).json({ message: "Friend request pending" });
                } else if (friendshipStatus.status === "accepted") {
                    res.status(200).json({ message: "Already friends" });
                }
            } else {
                res.status(400).json({ message: "Not friends" });
            }
        }
    }
}

module.exports.check_friends = async (req, res) => {
    const sender = jwt.verify(req.cookies.jwt, process.env.JWT_SIGNATURE);
    const senderUsername = await User.findById(sender.id);
    if (sender) {
        const friendships = await Friend.find({
            $or: [
            { user: sender.id },
            { friend: sender.id }
            ]
        });
        if (friendships && friendships.length > 0) {
            const userIds = friendships.map(friendship => friendship.user);
            const friendIds = friendships.map(friendship => friendship.friend);

            try {
                // Fetch usernames corresponding to user IDs
                const users = await User.find({ _id: { $in: userIds } });
                const userMap = users.reduce((map, user) => {
                    map[user._id.toString()] = user.username;
                    return map;
                }, {});

                // Fetch usernames corresponding to friend IDs
                const friends = await User.find({ _id: { $in: friendIds } });
                const friendMap = friends.reduce((map, friend) => {
                    map[friend._id.toString()] = friend.username;
                    return map;
                }, {});

                // Combine usernames with existing friendships
                const allFriendships = friendships.map(friendship => ({
                    user: userMap[friendship.user],
                    friend: friendMap[friendship.friend],
                    status: friendship.status
                }));
                res.status(200).json({ allFriendships, message: senderUsername.username });
            } catch (error) {
                console.error(error);
                res.status(500).json({ message: "Internal server error. Check friends controller." });
            }
        } else {
            res.status(404).json({ message: "No friends added" });
        }
    }
}


module.exports.modify_status = async (req, res) => {
    const newStatus = req.body.status;
    const targetUsername = req.body.target;
    const recipient = jwt.verify(req.cookies.jwt, process.env.JWT_SIGNATURE);
    if (recipient) {
        const target = await User.findOne({username: targetUsername});
        if (target) {

            const existingFriendship = await Friend.find({
                $or: [
                    { user: target._id.toString(), friend: recipient.id },
                    { user: recipient.id, friend: target._id.toString() }
                ]
            });
            
            if (existingFriendship) {
                await Friend.updateOne(
                    {
                        $or: [
                            { user: target._id.toString(), friend: recipient.id },
                            { user: recipient.id, friend: target._id.toString() }
                        ]
                    },
                    { $set: { status: newStatus } }
                );

                res.status(200).json({message: 'Friend status modified successfully'})
            } else {
                res.status(404).json({message: 'Friendship not found'});
            }

        } else {
            res.status(404).json({message: 'Target not found'});
        }
    } else {
        res.status(404).json({message: 'Recepient not found.'});
    }

}