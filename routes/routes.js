// Create a new instance of the router.
const {Router} = require('express');
const router = Router();

// Import controllers
const auth_controller = require('../controllers/auth_controller');
const search_controller = require('../controllers/search_controller');
const status_controller = require('../controllers/status_controller'); // Fix this
const friends_controller = require('../controllers/friends_controller');
const chats_controller = require('../controllers/chats_controller');
const message_controller = require('../controllers/message_controller');
const encryption_controller = require('../controllers/encryption_controller');

// Check if user is logged in for all routes
const {checkUser} = require('../middleware/checkUser');
router.get('*', checkUser);

// Home
router.get('/', auth_controller.home);

// About
router.get('/about', auth_controller.about);

// Signup route
router.get('/signup', auth_controller.signup_get);
router.post('/signup', auth_controller.signup_post);

// Login route
router.get('/login', auth_controller.login_get);
router.post('/login', auth_controller.login_post);

// Logout route
router.get('/logout', auth_controller.logout_get);

// Chats route
const {requireAuth} = require('../middleware/checkToken');
router.get('/chats', requireAuth, auth_controller.chats_get);

// Search route
router.get('/search', requireAuth, search_controller.search_username);

// Check user status
router.post('/check-user-status', search_controller.check_user_status);

// Send friend request route
router.post('/send-friend-request', friends_controller.send_request);

// Check friendship status route
router.post('/check-friendship-status', friends_controller.check_friendship_status);

// Fetch friends list
router.get('/friends', friends_controller.check_friends);

// Modify friendship status
router.post('/modify-friendship-status', friends_controller.modify_status);

// Create conversation
router.post('/chat', chats_controller.chat);

// Get all user chats
router.get('/chat', chats_controller.get_chats);

// Get private key
router.get('/chat/private-key/:token', encryption_controller.get_private_key);

// Get public key
router.get('/chat/public-key/:token/:username', encryption_controller.get_public_key);

// Create message
router.post('/create-message', message_controller.create_message);

// Get messages
router.post('/messages/', message_controller.get_messages);

// Export
module.exports = router;



