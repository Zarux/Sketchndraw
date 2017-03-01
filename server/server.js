const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const redis = require("redis");
const config = require("./config");
const client = redis.createClient({
    host: config.redisHost,
    password: config.redisPassword
});

client.flushall();

io.sockets.on('connection', function (socket) {

    socket.on("disconnecting", ()=>{
        Object.keys(socket.rooms).forEach(room => {
            const clients = io.sockets.adapter.rooms[room].sockets;
            const num_clients = Object.keys(clients).length - 1;
            if(room.length !== 20) {
                console.log(socket.nickname, "disconnecting from", room, "\n");
            }

            socket.broadcast.to(room).emit('user-left', {
                id: socket.id
            });

            client.lrange(`sk:room:${room}:users`, 0, -1, (err, message) => {
                client.del(`sk:room:${room}:users`);
                message.forEach(x => {
                    const obj = JSON.parse(x);
                    const id = obj.i;
                    if(socket.id !== id){
                        client.rpush(`sk:room:${room}:users`, JSON.stringify(obj));
                    }
                });
            });

            if(num_clients === 0){
                if(room.length !== 20) {
                    console.log('Clearing data for room', room, "\n");
                }
                socket.broadcast.emit("del-room", {room:room});
                client.del(`sk:room:${room}:chat`);
                client.del(`sk:room:${room}:users`);
            }
        });
    });


    socket.on("get-users", data => {
        const room = data.room;
        if(Object.keys(socket.rooms).find(x => x === room)){
            client.lrange(`sk:room:${room}:users`, 0, -1, (err, message) => {
                const ret_data = {};
                const data = message.map(x => {
                    const obj = JSON.parse(x);
                    const id = obj.i;
                    ret_data[id] = {
                            name: obj.n,
                            drawing: obj.d,
                            points: obj.p
                        };
                    return ret_data;
                });
                socket.emit("get-users-return", ret_data);
            })
        }
    });


    socket.on("join-room", data => {
        if(!io.sockets.adapter.rooms[data.room]){
            socket.broadcast.emit("new-room");
        }
        console.log(data.user, "joined room", data.room, "\n");
        socket.join(data.room);
        socket.nickname = data.user;
        const user = {
            i: socket.id,
            n: data.user,
            d: false,
            p: 0
        };
        const ret_data = {};
        ret_data[socket.id] = {
            name: data.user,
            drawing: false,
            points: 0
        };
        socket.broadcast.to(data.room).emit('user-joined', ret_data);
        client.rpush(`sk:room:${data.room}:users`, JSON.stringify(user));
    });


    socket.on("full-chat", data => {
        const room = data.room;
        if(Object.keys(socket.rooms).find(x => x === room)){
            client.lrange(`sk:room:${room}:chat`, 0, -1, (err, message) => {
                const data = message.map(x => {
                    const obj = JSON.parse(x);
                    return {
                        message: obj.m,
                        user: obj.u
                    };
                });
                socket.emit("full-chat-return", data);
            })
        }
    });


    socket.on('new-message', data => {
        if(data.message !== "" && data.room){
            io.to(data.room).emit("new-message", data);
            const chat_object = {m: data.message, u: data.user};
            client.rpush(`sk:room:${data.room}:chat`, JSON.stringify(chat_object));
        }
    });

    socket.on("get-rooms", data => {
        const ret_data = {"test13":33, "test14":33};
        const rooms = io.sockets.adapter.rooms;
        Object.keys(rooms).map(room => {
            if(room.length > 0 && room.length !== 20) {
                const clients = io.sockets.adapter.rooms[room].sockets;
                ret_data[room] = Object.keys(clients).length;
            }
        });
        socket.emit("get-rooms-return", ret_data);
    })
});


server.listen(config.serverPort, ()=>{
    console.log("Server running on", config.serverPort)
});