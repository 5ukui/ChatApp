// Import mongoose
const mongoose = require('mongoose');

const crypto = require('crypto');

// Import validator to validate emails
const {isEmail} = require('validator');

// Import bcrypt to encypt passwords
const bcrypt = require('bcrypt');

// Creating user schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please enter a username'],
        unique: true,
        minlength: [5, 'Minimum length is 6 characters'],
        maxlength: [39, 'Maximum length is 40 characters'],
        validate: [{
            validator: function(value) {
                // Check if username starts with a letter
                return /^[a-zA-Z]/.test(value);
            },
            message: 'Username must start with a letter'
        }, {
            validator: function(value) {
                // Check if username contains only letters and underscores
                return /^[a-zA-Z_]*$/.test(value);
            },
            message: 'Only use letters and underscores'
        }]
    },
    
    email: {
        type: String,
        required: [true, 'Please enter an email'],
        unique: true,
        lowercase: true,
        validate: [isEmail, 'Email Invalid'] // Email validation
    },
    
    password: {
        type: String,
        required: [true, 'Please enter a password'],
        minlength: [6, 'Minimum length is 6 characters']
    },

    status: {
        type: String,
        enum: ['offline', 'online', 'appear offline'], 
        default: 'offline',
    },

    publicKey: {
        type: String,
    },

    privateKey: {
        type: String,
    },
});

// Create a text index for the username field
userSchema.index({username: 'text'});

// Function exec before event 'save' new user
userSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('password')) {
        try {
            const salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, salt);

            // Generate public and private keys
            const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
                modulusLength: 2048,  // Adjust modulus length as needed
                publicKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                },
                privateKeyEncoding: {
                    type: 'pkcs1',
                    format: 'pem'
                }
            });

            // Set the generated keys to the document
            this.publicKey = publicKey;
            this.privateKey = privateKey;
            next();

        } catch(error) {
            next(error);
        }

    } else {
        // If the document is not new or password is not modified, proceed to next middleware
        next();
    }
});

// Function to login existing user
userSchema.statics.login = async function(email, password) {
    const user = await this.findOne({email}) // "this" refers to the User model
    if (user) {
        const auth = await bcrypt.compare(password, user.password); // Compare sign in password with password stored in db.
        if (auth) {
            return user;
        }
        throw Error('Invalid Email or password')
    } 
    throw Error('Invalid Email or password')
}


const User = mongoose.model('user', userSchema);
module.exports = User;