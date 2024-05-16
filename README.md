<div align="center">
  <a href="https://www.flaticon.com/free-icons/chat">
    <img src="/public/assets/logo.png" alt="Logo" width="100" height="90">
  </a>
  
  <h3 align="center" href="https://github.com/HuthaifaM/ChatApp">ChatApp</h3>
</div>

![Github](https://img.shields.io/github/followers/5ukui.svg?style=social&label=Follow&maxAge=2592000)

## About The Project
An end-to-end encrypted real-time communication webapp project developed using NodeJS and Express. This project was created for educational purposes and includes copyrighted assets along with several bugs.

## Architecture & Design
• Back-End Framework: Node.js & Express

• Communication Protocol: WebSocket (Socket.io)

• Database: MongoDB

• Security: Password hashing (bCrypt) & end-to-end encryption (CryptoJS).

• Encryption Type: Asymetrical encryption (Public-key encryption)

• Encryption Algorith: RSA

• Authentication: JWT

• Interface: EJS

![Node](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)


## Setting up the project
1. Clone the repository:
```
git clone https://github.com/5ukui/ChatApp
```
2. cd into the directory that the repositry was cloned to:
```
cd /chatapp
```
3. Install dependencies
```
npm install
```
4. Set your mongoDB URI and the JWT signature in the .env file.
5. Start the server
```
node app.js
```

## Features & Screenshots
### • User Signup/Login system and password hashing before storing it in the database
<div align="center" style="display: flex">
  <img src="/screenshots/signup.PNG">
</div>

### • User dropdown
<div align="center" style="display: flex">
  <img src="/screenshots/toolbarItem.PNG">
</div>

### • Search for and add friends
<div align="center">
  <img src="/screenshots/addFriend.PNG"> <br>
</div>

### • View, accept, reject friend requests
<div align="center">
  <img src="/screenshots/requests.PNG"> 
</div>

### • Friends drop-down list with functional chat button and realtime requests count
<div align="center">
  <img src="/screenshots/friends2.PNG"> 
</div>

### • Realtime end-to-end encrypted chat and conversation list
<div align="center">
  <img src="/screenshots/chats3.PNG"> 
</div>
