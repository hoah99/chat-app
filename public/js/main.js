document.addEventListener('DOMContentLoaded', function() {
    const socket = io()
    const formMessage = $('form[name="form-message"]')
    const inputMessage = $('input[name="message"]')
    const chatMessage = $('.chat-message')
    const chatView = document.querySelector('.chat-view')
    const roomName = document.querySelector('#room-name')
    const userList = document.querySelector('#users-list')
    const userCount = document.querySelector('#user-count')

    // Get username and room from URL
    const { username, room } = Qs.parse(location.search, {
        ignoreQueryPrefix: true,
    })

    // Join chat room
    socket.emit('joinRoom', { username, room })

    // Get room and users
    socket.on('roomUsers', ({ room, users }) => {
        outputRoomName(room)
        outputUsers(users)
    })

    // Message from server
    socket.on('message', message => {
        console.log(message)
        outputMessage(message)
        chatView.scrollTop = chatView.scrollHeight
    })
    
    formMessage.on('submit', function(e) {
        e.preventDefault()
        const message = inputMessage.val()

        // Emit message to server
        socket.emit('chatMessage', message)
        inputMessage.val('')
        inputMessage.focus()
    })

    // Ouput message to DOM
    const outputMessage = (message) => {
        const div = document.createElement('div')
        div.classList.add('mb-2')
        if(message.username === username) {
            div.innerHTML = `
                <div class='my-message d-flex align-items-end flex-column'>
                    <p class='message-text'>${message.text}</p>
                    <span class='time-message'>${message.time}</span>
                </div>
            `
        } else {
            div.innerHTML = `
                <span style="display: inline-block; font-weight: bold; font-size: 14px;">${message.username}</span>
                <div class='message d-flex align-items-start'>
                    <div class='user-message'>
                        <img class='user-avatar' src='https://cdn.dribbble.com/users/1355613/screenshots/15252730/media/28f348daf9654c440f5dcf398d8e097a.jpg?compress=1&resize=1000x750&vertical=top' />
                        <span class='time-message'>${message.time}</span>
                    </div>
                    <p class='message-text'>${message.text}</p>
                </div>
            `
        }
        $('.chat-message').append(div)
    }

    // Add room name to DOM
    const outputRoomName = (room) => {
        roomName.innerText = room
    }

    // Add users to DOM
    const outputUsers = (users) => {
        userList.innerHTML = `
            ${users.map(user => `
                <li class='user-item'>
                    <div class='d-flex align-items-center'>
                        <img class='user-avatar' src='https://cdn.dribbble.com/users/1355613/screenshots/15252730/media/28f348daf9654c440f5dcf398d8e097a.jpg?compress=1&resize=1000x750&vertical=top' />
                        <div class='user-info'>
                            <span class='user-name'>${user.username}</span>
                        </div>
                    </div>
                </li>
            `).join('')}
        `
        userCount.innerText = `USERS (${users.length})`
    }

})
  