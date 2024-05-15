const { json } = require('express');
const User = require('../models/user');
const Friend = require('../models/friends');

// (GET) Function for search
module.exports.search_username = async (req, res) => {
    const searchQuery = req.query.q;
    
    try {
        const results = await User.find(
            { $text: { $search: searchQuery } },
            { username: 1, _id: 1 } // Projection to include only the username field
        ).sort({ score: { $meta: 'textScore' } }).limit(10);
        
        if (results && results.length > 0) {
            const usernames = results.map(user => ({username: user.username, id: user._id})); // Extracting usernames from results
            res.status(200).json({ usernames });
        } else {
            res.status(404).json({ message: 'No users found' });
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}


const find_user = async function (data, cond=null) { // Change cond to args in the future
    const user = await User.findOne(data);
    if (cond === 'status') {
        return user.status;
    } else {
        return;
    }
}

module.exports.check_user_status = async (req, res) => {
    const user = await find_user({ username: req.body.username }, 'status');
    if (user) {
        res.status(200).json({message: user});
    } else {
        res.status(404).json({message: "User not found"});
    }

}