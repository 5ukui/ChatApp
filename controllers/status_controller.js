const { request } = require('express');
const User = require('../models/user');
require('dotenv').config();
const jwt = require('jsonwebtoken');


module.exports.set_status = async (req, res) => {
    try {
        const token = req.headers.cookie.split("=")[1];
        const decodedToken = jwt.verify(token, process.env.JWT_SIGNATURE);
        const user = await User.findById(decodedToken.id);
        res.json({ status: user.status });
    } catch (error) {
        console.error('Error fetching user status:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
