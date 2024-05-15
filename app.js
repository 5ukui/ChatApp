const axios = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.static('public'));
app.use(express.json());
app.use(cookieParser());

// View Engine
app.set('view engine', 'ejs');

const server = app.listen(3000);
mongoose.connect(process.env.ATLAS_URI)
.then((result) => server)
.catch((err) => console.log(err));

const routes = require('./routes/routes');
const User = require('./models/user'); // User model
app.use(routes)

// WebSocket Server
const updateStatus = require('./middleware/updateStatus');
const io = require('socket.io')(server);
const connections = {};

io.on('connection', async (socket) => {   
    if (socket.handshake.headers.cookie) {
        const token = socket.handshake.headers.cookie.split("=")[1];
        const user = await verifyToken(token);
        if (user) {
            connections[user.id] = socket.id;
        };

        socket.on('getUsername', async () => {
            const full_user = await User.findOne({_id: user.id});
            socket.emit('username', full_user.username);
        });

        updateStatus.set_status(token, "online");
        socket.emit('current-status', "online");
        let conversations = await updateConversations(socket, token);

        if (!conversations.message) {
            const chatIds = conversations.map(conversation => conversation.chatId);
            const messages = await getMessages(chatIds);
            socket.emit('receive-messages', messages);
        };

        socket.on('getPrivateKey', async () => {
            try {
                const privateKey = await getPrivateKey(token);
                if (privateKey) {
                    socket.emit('privateKey', privateKey);
                }
            } catch (error) {
                console.log(error);
            }
        });

        socket.on('getPublicKey', async (username) => {
            try {
                const publicKey = await getPublicKey(token, username);
                if (publicKey) {
                    socket.emit('publicKey', publicKey);
                }
            } catch(error) {
                console.log(error);
            }
        });

        socket.on('message', async (data) => {
            try {
                data.token = token;
                const new_message = await sendMessage(data);
                const messages = await getMessages([data.chatId]);

                if (messages) {
                    for(const id of new_message) {
                        if (connections[id]) {
                            io.to(connections[id]).emit('receive-messages', messages);
                        }
                    }
                } else {
                    console.log("Messages could not be retrieved.");
                }

            } catch(error) {
                console.log(error);
            }
        });

        socket.on('get-messages', async (chatId) => {
            const messages = await getMessages(chatId);
            socket.emit('receive-messages', messages);
        });

        socket.on('disconnect', () => {
            updateStatus.set_status(token, "offline");
            socket.emit('current-status', "offline");
            const userId = Object.keys(connections).find(key => connections[key] === socket.id);
            if (userId) {
                delete connections[userId];
            }
        });
    }
});

async function getPublicKey(token, username) {
    const response = await axios.get(`http://localhost:3000/chat/public-key/${token}/${username}`);
    return response.data;
};

async function getPrivateKey(token) {
    const response = await axios.get(`http://localhost:3000/chat/private-key/${token}`);
    return response.data.privateKey;
};

async function updateConversations(socket, token) {
    try {
        let conversations = await getConversations(token);
        socket.emit('chatData', conversations);
        setInterval(async () => {
            const newConversations = await getConversations(token);
            if (newConversations && JSON.stringify(conversations) !== JSON.stringify(newConversations)) {
                socket.emit('chatData', newConversations);
                conversations = newConversations;
                return conversations;
            }
        }, 500);
        return conversations;
    } catch (error) {
        console.error(error);
    }
};

async function getConversations(token) {
    try {
        const response = await axios.get('http://localhost:3000/chat', {
            headers: {
                'jwt': token
            }
        });

        return response.data;
    } catch (error) {
        console.error(error);
        throw error;
    }
};

async function sendMessage(data) {
    try {
        const response = await axios.post('http://localhost:3000/create-message', {
            data: data
        });
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }

    } catch(error) {
        console.log(error);
    } 
};

async function getMessages(chatId) {
    try {
        const response = await axios.post(`http://localhost:3000/messages/`, {
            chatId
        });
        if (response.status === 200) {
            return response.data;
        } else {
            return null;
        }

    } catch(error) {
        console.log(error);
    } 
};

async function closeSocketIoConnections() {
    io.close();
};

async function handleServerShutdown() {
    console.log('Server is shutting down');
    closeSocketIoConnections();
    server.close(() => {
        console.log('Server has been gracefully shut down');
        process.exit(0);
    });
};

async function verifyToken (token) {
    try {
        const user = jwt.verify(token, process.env.JWT_SIGNATURE);
        return user;
    } catch (error) {
        console.log(error);
        return null;
    }
};

process.on('SIGINT', handleServerShutdown);
process.on('SIGTERM', handleServerShutdown);


