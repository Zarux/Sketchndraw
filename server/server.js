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
                client.del(`sk:room:${room}:drawing`);
            }
        });
    });

    socket.on("check-password", data => {
        let valid = true;
        if(io.sockets.adapter.rooms[data.room]
            && io.sockets.adapter.rooms[data.room].custom.locked
            && io.sockets.adapter.rooms[data.room].custom.password !== data.pass){
            valid = false;
        }
       socket.emit("check-password-return", {valid: valid});
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

        if(new_room){
            io.sockets.adapter.rooms[data.room].custom = {};
            io.sockets.adapter.rooms[data.room].custom.locked = false;
            if(data.pass){
                io.sockets.adapter.rooms[data.room].custom.locked = true;
                io.sockets.adapter.rooms[data.room].custom.password = data.pass;
            }
        }else{
            if(io.sockets.adapter.rooms[data.room].custom.locked){
                if(io.sockets.adapter.rooms[data.room].custom.password !== data.pass){
                    socket.leave(data.room);
                    socket.emit("join-room-failed", {reason: "Wrong password"});
                    return
                }
            }
        }

        console.log(data.user, "joined room", data.room, "\n");
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
        socket.emit("join-room-success",{ok: "ok"});
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

    socket.on("full-drawing", data => {
        const room = Object.keys(socket.rooms).find(x => x.length !== 20);
        client.get(`sk:room:${room}:drawing`, (err, message) => {
            socket.emit("full-drawing-return", JSON.parse(message));
        });
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
        const room = Object.keys(socket.rooms).find(x => x.length !== 20);
        //client.rpush(`sk:room:${room}:drawing`, JSON.stringify(data));
        socket.broadcast.to(room).emit('mouse-move-return', data);
    });

    socket.on("mouse-up", data => {
        const room = Object.keys(socket.rooms).find(x => x.length !== 20);
        client.set(`sk:room:${room}:drawing`, JSON.stringify(data), (err, msg) => {console.log(err)});
        socket.broadcast.to(room).emit('mouse-up-return', "");
    })
});


server.listen(config.serverPort, ()=>{
    console.log("Server running on", config.serverPort)
});