const User = require('../models/user');

module.exports.home = (req, res) => {
    res.render('home')
}

const handleError = (err) => {
    console.log(err.message, err.code);
    let errors = {email: '', password: ''};
    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
            errors[properties.path] = properties.message;
        });
        
    }

    // Duplicate Email Handler
    if (err.code === 11000) {
        errors.email = 'This Email is already registered.'
    }

    // Login Error Handler
    if (err.message.includes('Invalid Email or password')) {
        errors.password = err.message;
    }
    return errors;
}


require('dotenv').config();
const jwt = require('jsonwebtoken');
// Create JWT Cookie
const maxAge = 1 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SIGNATURE, {expiresIn: maxAge});
}


// (GET) Function for rendering the about page
module.exports.about = (req, res) => {
    res.render('about')
}



// (GET) Function for rendering the signup page
module.exports.signup_get = (req, res) => {
    res.render('signup')
}

// (GET) Function for rendering the login page
module.exports.login_get = (req, res) => {
    res.render('login')
}

// (POST) Function for handling signup
module.exports.signup_post = async (req, res) => {
    const {username, email, password} = req.body; // Retrieve the username, email and password.
    try {
        const user = await User.create({username, email, password});
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, secure: true, sameSite:'none'})
        res.status(201).json({user: user._id});
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({errors});
    }
}

// (POST) Function for handling login
module.exports.login_post = async (req, res) => {
    const {email, password} = req.body; // Retrieve the email and password.
    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);
        res.cookie('jwt', token, {httpOnly: true, secure: true, sameSite:'none'});
        res.status(200).json({user: user._id});
    } catch (err) {
        const errors = handleError(err);
        res.status(400).json({errors});
    }
}

// (GET) Function for logging user out
module.exports.logout_get = (req, res) => {
    res.cookie('jwt', '', {maxAge: 1});
    res.redirect('/');
}



// (GET) Function for rendering chats page
module.exports.chats_get = (req, res) => {
    res.render('chats');
}