"use strict";

const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io').listen(server);
const redis = require("redis");
const config = require("./config");
const words = require("./words").words;
const client = redis.createClient({
    host: config.redisHost,
    password: config.redisPassword
});

const logColors = {
    FgBlack: "\x1b[30m",
    FgRed:"\x1b[31m",
    FgGreen: "\x1b[32m",
    FgYellow: "\x1b[33m",
    FgBlue: "\x1b[34m",
    FgMagenta: "\x1b[35m",
    FgCyan: "\x1b[36m",
    FgWhite: "\x1b[37m",
};

const ROUND_TIME = 60;

client.flushall();

io.sockets.on('connection', function (socket) {
    socket.mainRoom = Object.keys(socket.rooms)[0];

    socket.on("disconnecting", ()=>{
        Object.keys(socket.rooms).forEach(room => {
            const clients = io.sockets.adapter.rooms[room].sockets;
            const num_clients = Object.keys(clients).length - 1;
            if(room.length !== 20) {
                logMessage(
                    logColors.FgCyan, socket.nickname,
                    logColors.FgRed, "left   room",
                    logColors.FgYellow, room);
            }

            socket.broadcast.to(room).emit('user-left', {
                id: socket.id
            });

            if(num_clients === 0){
                if(room.length !== 20) {
                    logMessage(logColors.FgRed, 'Clearing room', logColors.FgYellow, room);
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

        valid.name = io.sockets.adapter.rooms[data.room].custom.usernames.indexOf(data.name) === -1;
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
                users: [],
                drawer: "",
                round: -1,
                timer: ROUND_TIME,
                drawerIndex: -1,
                usernames: [],
                ongoing: false
            };
            if(data.pass){
                io.sockets.adapter.rooms[data.room].custom.locked = true;
                io.sockets.adapter.rooms[data.room].custom.password = data.pass;
            }
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
        io.sockets.adapter.rooms[data.room].custom.users.push(socket.id);
        io.sockets.adapter.rooms[data.room].custom.usernames.push(data.user);
        logMessage(logColors.FgCyan, data.user, logColors.FgGreen, "joined room", logColors.FgYellow, data.room);
        socket.user = userData;
        socket.mainRoom = data.room;
        const ret_data = {};
        ret_data[socket.id] = {
            name: data.user,
            drawing: false,
            points: 0
        };
        socket.broadcast.to(data.room).emit('user-joined', ret_data);
        socket.emit("join-room-success",{
            id: socket.id,
            ongoing: io.sockets.adapter.rooms[data.room].custom.ongoing,
            round: io.sockets.adapter.rooms[data.room].custom.round,
            timer:  io.sockets.adapter.rooms[data.room].custom.timer
        });
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
        if(io.sockets.connected[drawer]) {
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
        if(socket.user.drawing) {
            socket.broadcast.to(room).emit('mouse-move-return', data);
        }
    });

    socket.on("mouse-up", data => {
        const room = socket.mainRoom;
        if(socket.user.drawing) {
            socket.broadcast.to(room).emit('mouse-up-return', data);
        }
    });

    socket.on("mouse-down", data => {
        const room = socket.mainRoom;
        if(socket.user.drawing) {
            socket.broadcast.to(room).emit('mouse-down-return', data);
        }
    });

    socket.on("clear-canvas", data =>{
        if(socket.user.drawing){
            socket.broadcast.to(socket.mainRoom).emit("clear-canvas");
        }
    });

    socket.on("start-new-round", data =>{
        const room = io.sockets.adapter.rooms[socket.mainRoom];
        if((data && data.newGame) || room.custom.drawer === socket.id){
            socket.user.drawing = false;
        }else{
            return
        }

        room.custom.drawerIndex = room.custom.drawerIndex + 1;
        if(room.custom.drawerIndex === room.custom.users.length){
            room.custom.drawerIndex = 0;
        }
        room.custom.round = room.custom.round + 1;
        room.custom.drawer = room.custom.users[room.custom.drawerIndex];

        room.custom.timer = ROUND_TIME;
        const drawer = room.custom.drawer;
        io.sockets.connected[drawer].user.drawing = true;
        io.to(socket.mainRoom).emit("new-round", {drawer: drawer});
        //room.custom.timerGoing = false;
        //doTimer(room);
    });

    socket.on("select-word", data => {
        const room = io.sockets.adapter.rooms[socket.mainRoom];
        room.custom.word = data.word;
    })

});

const doTimer = room => {
    if(room.custom.timerGoing){
        return
    }
    let seconds = room.custom.timer;
    room.custom.timerGoing = true;
    const timer = setInterval(()=>{
        console.log(seconds);
        if(seconds === 0){
            clearInterval(timer);
        }else{
            room.custom.timer = seconds;
        }
        seconds = seconds - 1;
    }, 1000);
};

const getNWords = (n) => {
    const not = [];
    const ret_words = [];
    for(let i=0; i<n; i++){
        const word1 = getRandomInt(0, words.length, not);
        not.push(word1);
        ret_words.push(words[word1])
    }
    return ret_words;
};

const getRandomInt = (min, max, not=[]) => {
    const i = Math.floor(Math.random() * (max - min + 1)) + min;
    if(not.indexOf(i) === -1){
        return i;
    }
    return getRandomInt(min, max, not);
};

const logMessage = (...msg) => {
    const message = msg.join(" ");
    const date = new Date().toLocaleString();
    console.log(logColors.FgWhite, `[${date}] : ${message}`);
};

server.listen(config.serverPort, ()=>{
    logMessage("Server running on", config.serverPort)
});

