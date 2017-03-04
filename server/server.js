"use strict";

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
    socket.mainRoom = Object.keys(socket.rooms)[0];

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

            if(num_clients === 0){
                if(room.length !== 20) {
                    console.log('Clearing data for room', room, "\n");
                }
                socket.broadcast.emit("del-room", {room:room});
                client.del(`sk:room:${room}:chat`);
            }
        });
    });

    socket.on("check-info", data => {
        const valid =  {
            name: true,
            pass: true
        };

        if(!io.sockets.adapter.rooms[data.room]){
            socket.emit("check-info-return", {valid: valid});
            return
        }

        if(io.sockets.adapter.rooms[data.room]
            && io.sockets.adapter.rooms[data.room].custom.locked
            && io.sockets.adapter.rooms[data.room].custom.password !== data.pass){
            valid.pass = false;
        }

        valid.name = io.sockets.adapter.rooms[data.room].custom.users.indexOf(data.name) === -1;
        socket.emit("check-info-return", {valid: valid});

    });

    socket.on("get-users", data => {
        const ret_data = {};
        Object.keys(io.sockets.adapter.rooms[socket.mainRoom].sockets).forEach(sock => {
            ret_data[sock] = io.sockets.connected[sock].user;
        });
        socket.emit("get-users-return", ret_data);
    });


    socket.on("join-room", data => {
        if(Object.keys(socket.rooms).length > 2){
            socket.emit("join-room-failed", {reason: "Already in a room"});
        }
        let new_room = false;
        if(!io.sockets.adapter.rooms[data.room]){
            socket.broadcast.emit("new-room");
            new_room = true;
        }
        socket.join(data.room);
        socket.nickname = data.user;

        const userData = {
            id: socket.id,
            name: data.user,
            drawing: false,
            points: 0
        };

        if(new_room){
            io.sockets.adapter.rooms[data.room].custom = {
                locked: false,
                users: [data.user]
            };
            if(data.pass){
                io.sockets.adapter.rooms[data.room].custom.locked = true;
                io.sockets.adapter.rooms[data.room].custom.password = data.pass;
            }
            userData.drawing = true;
            io.sockets.adapter.rooms[data.room].custom.drawer = socket.id;
        }else{
            if(io.sockets.adapter.rooms[data.room].custom.locked){
                if(io.sockets.adapter.rooms[data.room].custom.password !== data.pass){
                    socket.leave(data.room);
                    socket.emit("join-room-failed", {reason: "Wrong password"});
                    return
                }
            }
        }
        io.sockets.adapter.rooms[data.room].custom.users.push(data.user);
        console.log(data.user, "joined room", data.room, "\n");
        socket.user = userData;
        socket.mainRoom = data.room;
        const ret_data = {};
        ret_data[socket.id] = {
            name: data.user,
            drawing: false,
            points: 0
        };
        socket.broadcast.to(data.room).emit('user-joined', ret_data);
        socket.emit("join-room-success",{ok: "ok"});
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

    socket.on("request-full-drawing", data => {
        const room = socket.mainRoom;
        const drawer = io.sockets.adapter.rooms[room].custom.drawer;
        if(drawer) {
            io.sockets.connected[drawer].emit('request-full-drawing', {id: socket.id});
        }
    });

    socket.on("send-full-drawing", data => {
        if(data) {
            socket.emit("full-drawing-return", data);
        }
    });

    socket.on("send-full-drawing1", data => {
        io.sockets.connected[data.id].emit("send-full-drawing", data)
    });


    socket.on('new-message', data => {
        if(data.message !== "" && data.room){
            io.to(data.room).emit("new-message", data);
            const chat_object = {m: data.message, u: data.user};
            client.rpush(`sk:room:${data.room}:chat`, JSON.stringify(chat_object));
        }
    });

    socket.on("get-rooms", data => {
        const ret_data = {};
        const rooms = io.sockets.adapter.rooms;
        Object.keys(rooms).map(room => {
            if(room.length > 0 && room.length !== 20) {
                const clients = io.sockets.adapter.rooms[room].sockets;
                const locked = io.sockets.adapter.rooms[room].custom.locked;
                ret_data[room] = {clients: Object.keys(clients).length, locked: locked}
            }
        });
        socket.emit("get-rooms-return", ret_data);
    });

    socket.on("mouse-move", data => {
        const room = socket.mainRoom;
        socket.broadcast.to(room).emit('mouse-move-return', data);
    });

    socket.on("mouse-up", data => {
        const room = socket.mainRoom;
        socket.broadcast.to(room).emit('mouse-up-return', data);
    });

    socket.on("mouse-down", data => {
        const room = socket.mainRoom;
        socket.broadcast.to(room).emit('mouse-down-return', data);
    });


});


server.listen(config.serverPort, ()=>{
    console.log("Server running on", config.serverPort)
});