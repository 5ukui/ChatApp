require('dotenv').config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports.set_status = async (token, current_status) => {
    if (token) {
        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SIGNATURE);
            let user = await User.findByIdAndUpdate(
                decodedToken.id,
                { status: current_status },
            );
            
        } catch (err) {
            console.error(err);
        }
    } else {
        console.log("No token");
    }
}