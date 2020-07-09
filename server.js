var express = require('express');
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);
var port = 3000;

http.listen(port, function() {
    console.log('Started WebSocket on port ' + port);
})

app.use(express.static('./public'));

var allUsers = [];

io.on('connection', (socket) => {
    var clientId = socket.id;

    socket.on('new-user', (data) => {
        var userExists = false;
        for (let i = 0; i < allUsers.length; i++) {
            if (allUsers[i].name == data.name) {
                userExists = true;
                socket.emit('username-taken', data.name)
            }
        }
        if (!userExists) {
            console.log('A new user joined - ' + data.name);
            allUsers.push({
                name: data.name,
                status: data.status,
                id: clientId
            });
            io.emit('new-user-online', allUsers);
        }
    })

    socket.on('chat-message', (data) => {
        console.log(data);
        io.emit('send-message-all', data);
    })

    socket.on('disconnect', (socket) => {
        for (let i = 0; i < allUsers.length; i++) {
            if (allUsers[i].id == clientId) {
                allUsers.splice(i, 1);
                io.emit('new-user-online', allUsers);
            }
        }
    })
});