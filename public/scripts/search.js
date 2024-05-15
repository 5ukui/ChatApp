const searchUserForm = document.querySelector('.search.username.form');
const searchResults = document.getElementById('searchResults');
// const searchResults = document.querySelector('.search.results');


searchUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = searchUserForm.username.value;
    
    if (username.length > 4) {
        try {
            const res = await fetch(`/search?q=${username}`, {
                method: 'GET',
                headers: {'Content-Type': 'application/json'},
            });
            const data = await res.json();

            if (data.usernames) {
                const promises = data.usernames.map(async result => {
                    const friendshipStatus = await fetch('/check-friendship-status', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ id: result.id })
                    });
                    const friendshipData = await friendshipStatus.json();

                    if (friendshipData.message === "Friend request pending") {
                        return `<li class="username-result">${result.username} <button class="add friend button" disabled></button></li>`;
                    } else if (friendshipData.message === "Already friends") {
                        return `<li class="username-result">${result.username} <button class="add friend button" disabled><img class="add friend img" src="/assets/sent.png" alt="Image"></button></li>`;
                    } else if (friendshipData.message === "Not friends") {
                        return `<li class="username-result">${result.username} <button class="add friend button"><img class="add friend img" src="/assets/addFriend.png" alt="Image"></button></li>`;
                    } else if (friendshipData.message === "Same account") {
                        return `<li class="username-result">${result.username}</li>`;
                    } else {
                        console.log("Error: Check client-side search.js or the friends_controller.js");
                    }
                });
                
                Promise.all(promises).then(results => {
                    const resultList = results.join('');
                    searchResults.innerHTML = `<ul>${resultList}</ul>`;
                    searchResults.style.display = 'block';
                });

                
            } else {
                searchResults.innerHTML = `<ul> <li>No users found.</li> </ul>`;
                searchResults.style.display = 'block';
            }

        } catch (err) {
            console.log(err);
        }
    }
})

document.addEventListener('click', async (e) => {
    if (e.target.matches(".add.friend.button")) {
        e.preventDefault();
        const addFriendButton = document.querySelector('.add.friend.button');
        const addFriendImg = document.querySelector('.add.friend.img');
        const usernameResult = e.target.closest('.username-result');
        const username = usernameResult.textContent.trim();
        console.log(username);

        try {
            const res = await fetch('/send-friend-request', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ username })
            });
            const data = await res.json();
            if (res.status = 201) {
                addFriendButton.style.display = 'none';
                addFriendImg.style.display = 'none';
            }
        } catch (err) {
            console.log(err);
        }
        
    } else if (!searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
    }
});
