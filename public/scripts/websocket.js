const socket = io()
const statusSpan = document.getElementById('status');
const convo_container = document.querySelector('.conversations');
const chat_toolbar = document.querySelector('.chat-toolbar');
const name_status_field = document.querySelector('.name-status-field');
const updated_field = document.querySelector('.updated-field');
const chat_container = document.querySelector('.chat-messages');
let conversations;
let messages = [];
let selectedConversation;
let selected_friend;


document.addEventListener('DOMContentLoaded', async () => {
    await socket.emit('getUsername');
});

document.addEventListener('click', async (event) => {
    if (event.target.classList.contains("chat-button")) {
        event.preventDefault();
        const friendLink = event.target.previousElementSibling;
        if (friendLink && friendLink.classList.contains('nav-link') && friendLink.classList.contains('friend')) {
            const friend = friendLink.textContent;
            try {
                const res = await fetch('/chat', {
                    method: 'POST', 
                    body: JSON.stringify({friend}),
                    headers: {'Content-Type': 'application/json'}
                });        

            } catch(err) {
                console.log(err);
            }
        } else {
            console.log("Unable to find the friend's name.");
        }
    } else if (event.target.classList.contains("conversation")) {
        if (selectedConversation && selectedConversation !== event.target) {
            selectedConversation.style.border = "1px solid rgb(204, 204, 204)";
        }
        selectedConversation = event.target;
        event.target.style.border = "1px solid black";
        setChat(selectedConversation);
    }
});

socket.on('current-status', async (current_status) => {
    statusSpan.textContent = current_status;
});

socket.on('chatData', async function(data) {
    if (data.message) {
        convo_container.style.textAlign = 'center';
        convo_container.innerHTML = `<span class="conversations-message" style="font-family: pixel; font-size: 13px; color: rgb(104, 104, 104); letter-spacing: 1px;">${data.message}</span>`;
    } else {
        conversations = data;
        show_conversations(data);
    }
});

socket.on('privateKey', async function(data) {
    sessionStorage.setItem("Private Key", data);
});

socket.on('publicKey', async (data) => {
    const { username, publicKey } = data;
    sessionStorage.setItem(username, publicKey);
});

socket.on('username', async (data) => {
    sessionStorage.setItem('user', data);
});

socket.on('receive-messages', async (updated_messages) => {
    for (const chatId of Object.keys(updated_messages)) {
        if (messages.hasOwnProperty(chatId)) {
            for (const newMessage of updated_messages[chatId]) {
                const existingMessageIndex = messages[chatId].findIndex((message) => {
                    return message.senderId === newMessage.senderId && message.createdAt === newMessage.createdAt && message.text === newMessage.text;
                });

                if (existingMessageIndex === -1) {
                    messages[chatId].push(newMessage);
                }
            }
        } else {
            messages[chatId] = updated_messages[chatId];
        }
    }
    if (selectedConversation) {
        await set_messages();
    }
});

const show_conversations = async function (data) {
    convo_container.style.padding = '1px';
    convo_container.innerHTML = '';
    data.reverse();

    for (convo of data) {
        const friendName = convo.friend;
        const updated = new Date(convo.updated).toLocaleString();

        const convoElement = document.createElement('div');
        convoElement.classList.add('conversation');
        convoElement.classList.add(friendName);
        convoElement.style.display = "block";
        convoElement.style.padding = "10px";
        convoElement.style.marginBottom = "5px";
        convoElement.style.textAlign = 'left';
        convoElement.style.borderRadius = '5px';
        convoElement.style.cursor = 'pointer';
        convoElement.id = convo.chatId;
        if (selectedConversation && selectedConversation.id === convo.chatId) {
            convoElement.style.border = "1px solid black";
            selectedConversation = convoElement;
        } else {
            convoElement.style.border = "1px solid rgb(204, 204, 204)";
        }
        
        // Create and append the friend name span
        const friendNameSpan = document.createElement('span');
        friendNameSpan.classList.add('friend-name');
        friendNameSpan.style.display = 'block';
        friendNameSpan.style.fontFamily = 'pixeloid';
        friendNameSpan.style.fontSize = '11px';
        friendNameSpan.textContent = friendName;
        friendNameSpan.style.pointerEvents = 'none';

        // Create and append the created at span
        const updatedSpan = document.createElement('span');
        updatedSpan.classList.add('updated-at');
        updatedSpan.style.fontFamily = 'pixeloid';
        updatedSpan.style.fontSize = '9px';
        updatedSpan.textContent = updated;
        updatedSpan.style.pointerEvents = 'none';

        convoElement.appendChild(friendNameSpan);
        convoElement.appendChild(updatedSpan);
        convo_container.appendChild(convoElement);
    }
}


const setChat = async function (selectedConversation) {
    const selectedChat = conversations.find(entry => entry.chatId === selectedConversation.id);
    name_status_field.innerHTML = `<span>${selectedChat.friend}</span> <img src="assets/${selectedChat.status}.png" title="${selectedChat.status}" style="width: 7px; height: 7px; margin-top: auto; margin-bottom: auto; margin-left: 5px;"></img>`;
    const updated = new Date(selectedChat.updated).toLocaleString();
    updated_field.innerHTML = `<span>${updated}</span>`;
    socket.emit('getPublicKey', selectedChat.friend);
    selected_friend = selectedChat.friend;
    
    await set_messages();

    const publicKey = sessionStorage.getItem(selected_friend);
    const form = document.getElementById('message-form');
    const input = document.getElementById('message-input');
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        if (input.value) {
            const encryptedMessage = CryptoJS.AES.encrypt(input.value, publicKey).toString();
            const messageData = {
                chatId: selectedConversation.id,
                text: encryptedMessage
            }

            socket.emit('message', messageData);
            input.value = '';
        }
    })
}

async function set_messages() {
    const messages_container = document.querySelector('.chat-messages');
    const user = sessionStorage.getItem('user');
    await socket.emit('getPrivateKey');
    const private_key = sessionStorage.getItem('Private Key');
    
    messages_container.innerHTML = '';
    if (messages) {
        const selected_messages = messages[selectedConversation.id];
        if (selected_messages) {
            selected_messages.forEach(message => {
                if (user === message.sender) {
                    const publicKey = sessionStorage.getItem(selected_friend);
                    const decryptedText = CryptoJS.AES.decrypt(message.text, publicKey).toString(CryptoJS.enc.Utf8);
                    const message_bubble = document.createElement('div');
                    message_bubble.classList.add('bubble', 'right');
                    message_bubble.textContent = decryptedText;
                    messages_container.appendChild(message_bubble);
                } else {
                    const decryptedText = CryptoJS.AES.decrypt(message.text, private_key).toString(CryptoJS.enc.Utf8);
                    const message_bubble = document.createElement('div');
                    message_bubble.classList.add('bubble', 'left');
                    message_bubble.textContent = decryptedText;
                    messages_container.appendChild(message_bubble);
                }
            });
            messages_container.scrollTop = messages_container.scrollHeight;

        } else {
            messages_container.style.textAlign = "center";
            messages_container.innerHTML = `<span class="messages-messages" style="font-family: pixel; font-size: 15px; color: rgb(102, 102, 102);">No messages found for this conversation.</span>`;
        }
    }
}

