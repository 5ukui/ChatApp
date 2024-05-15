const friendsDropdownToggle = document.querySelector('.nav-link.dropdown-toggle.friends');
const friendsDropdown = document.querySelector('.dropdown-menu.friends');
const friendsContainer = document.querySelector('.friends-container');

friendsDropdownToggle.addEventListener('click', async function(e) {
    try {
        const res = await fetch(`/friends`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        const friendships = await res.json();
        if (friendships && res.status === 200) {
            const requests = [];
            const friends = [];
            friendships.allFriendships.forEach(entry => {
                if (entry.user !== friendships.message && entry.status === 'pending') {
                    requests.push(entry);
                }

                if (entry.status === 'accepted') {
                    friends.push(entry);
                }
            });
           


            set_requests_navlink(requests);
            set_friends(friends, friendships.message);
            display_requests(requests);

        } else {
            console.log("Something wrong happened");
        }
    } catch (err) {
        console.log(err);
    }
});


const set_requests_navlink = function(requests) {
    if (requests.length > 0) {
        const requestsContainer = document.querySelector('.requests-container');
        requestsContainer.innerHTML = `<a href="#" class="nav-link requests"> REQUESTS: ${requests.length} </a>`;
        friendsDropdown.appendChild(requestsContainer);
    }
}

const display_requests = function(requests) {
    const requestsButton = document.querySelector('.nav-link.requests');
    if (requestsButton) {
        requestsButton.addEventListener('click', (event) => {
            const requestsWindow = document.querySelector('.requests-table');
            const requestsTable = document.querySelector('.requests-list-container');
            requestsTable.innerHTML = '';

            requests.forEach(entry => {
                // Create <a> element
                const userLink = document.createElement('a');
                userLink.classList.add('user-link');
                userLink.href = `/${entry.user}`;
                userLink.style.fontFamily = 'pixeloid';
                userLink.style.display = 'block';
                userLink.textContent = entry.user;

                // Create accept <button>
                const acceptButton = document.createElement('button');
                acceptButton.classList.add('accept-button');

                // Create reject <button>
                const rejectButton = document.createElement('button');
                rejectButton.classList.add('reject-button');

                // Create accept <img>
                const acceptIcon = document.createElement('img');
                acceptIcon.classList.add('accept', 'request');
                acceptIcon.src = '/assets/accept.png';
                acceptIcon.style.width = '20px';
                acceptIcon.style.height = '20px';
                
                // Create reject <img>
                const rejectIcon = document.createElement('img');
                rejectIcon.classList.add('reject', 'request');
                rejectIcon.src = '/assets/reject.png';
                rejectIcon.style.width = '20px';
                rejectIcon.style.height = '20px';
                
                // Append the icon to the button
                acceptButton.appendChild(acceptIcon);
                rejectButton.appendChild(rejectIcon);

                // Create container for user link and button
                const listItemContainer = document.createElement('div');
                listItemContainer.classList.add('user-item-container');

                // Append <a> and <button> elements to container
                listItemContainer.style.display = 'flex';
                listItemContainer.appendChild(userLink);
                listItemContainer.appendChild(acceptButton);
                listItemContainer.appendChild(rejectButton);

                // Append container to requests container
                requestsTable.appendChild(listItemContainer);

            });   

            if (requestsWindow.style.display = 'none') {
                requestsWindow.style.display = 'block';
            } else {
                requestsWindow.style.display = 'none';
            }

            handle_user_input();

            
        });
    }
};


const set_friends = function(friends, user) {
    const friendsContainer = document.querySelector('.friends-container');


    const updateFriendsUI = async () => {
        friendsContainer.innerHTML = '';

        if (friends.length > 0) {
            // Sort friends alphabetically by user or friend name
            friends.sort((a, b) => a.user.localeCompare(b.user || a.friend.localeCompare(b.friend)));
            
            // Iterate over the sorted friends list
            for (const entry of friends) {
                const friendName = entry.user === user ? entry.friend : entry.user; // Determine friend's name
                const friend_status = await retrieve_user_status(friendName);

                const friendEntry = document.createElement('div');
                friendEntry.classList.add('friend-entry');


                // Add status img
                const statusIcon = document.createElement('img');
                statusIcon.src = `/assets/${friend_status}.png`;
                statusIcon.title = friend_status;
                statusIcon.style.width = '10px';
                statusIcon.style.height = '10px';
                statusIcon.style.marginTop = 'auto';
                statusIcon.style.marginBottom = 'auto';

                // Create the anchor element for the friend
                const friendLink = document.createElement('a');
                friendLink.classList.add('nav-link', 'friend');
                friendLink.href = `/${friendName}`;
                friendLink.textContent = friendName;

                const interactions = document.createElement('button');
                interactions.classList.add('chat-button');
                const sendMessage = document.createElement('img');
                sendMessage.classList.add('chat-img');
                sendMessage.src = '/assets/chat.png';
                sendMessage.title = 'Send message';
                sendMessage.style.height = '16px';
                interactions.appendChild(sendMessage);

                friendEntry.appendChild(statusIcon);
                friendEntry.appendChild(friendLink);
                friendEntry.appendChild(interactions);
                friendsContainer.appendChild(friendEntry);
            }
            
            friendsDropdown.appendChild(friendsContainer);
            

        } else {

            friendsContainer.innerHTML = `<a style="font-family: 'pixeloid'; font-size: 9px;"> NO FRIENDS ADDED </a>`;
            friendsDropdown.appendChild(friendsContainer);
        
        }
    };

    updateFriendsUI();
}


const retrieve_user_status = async function (user) {
    const res = await fetch('/check-user-status', {
        method: 'POST',
        body: JSON.stringify({username: user}),
        headers: {'Content-Type': 'application/json'}
    })
    const data = await res.json();

    if (data.message) {
        return data.message;
    } else {
        return 'offline';
    }
    
}


const handle_user_input = function() {
    const requestsTable = document.querySelector('.requests-table');
    requestsTable.addEventListener('click', async (event) => {
        if (event.target.matches('.accept-button')) {
            const userContainer = event.target.closest('.user-item-container');
            const userLink = userContainer.querySelector('.user-link');
            if (userLink) {
                const modify_friendship = await modify_friendship_status("accepted", userLink.textContent);
                if (modify_friendship === true) {
                    userContainer.style.display = 'none';
                }
            }
        } else if (event.target.matches('.reject-button')) {
            const userContainer = event.target.closest('.user-item-container');
            const userLink = userContainer.querySelector('.user-link');
            if (userLink) {
                const modify_friendship = await modify_friendship_status("rejected", userLink.textContent);
                if (modify_friendship === true) {
                    userContainer.style.display = 'none';
                }
            }

        } else if (event.target.matches('.close')) {
            requestsTable.style.display = 'none';
        }

    });
}


const modify_friendship_status = async function(status, target) {
    if (status === 'accepted' || status === 'rejected') {
        const res = await fetch('/modify-friendship-status', {
            method: 'POST', 
            body: JSON.stringify({status: status, target: target}),
            headers: {'Content-Type': 'application/json'}
        });
        const data = await res.json();
        if (data && res.status === 200) {
            return true;
        } else {
            return false;
        }

    } else {
        console.log("An error occured. Check modify_friendship_status()");
        return false;
    }
}