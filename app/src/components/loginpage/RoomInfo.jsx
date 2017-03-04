import React, {Component} from 'react';
import TextField from "material-ui/TextField";
import Paper from 'material-ui/Paper';
import {List, ListItem} from 'material-ui/List';
import LockOutline from 'material-ui/svg-icons/action/lock-outline'
import Public from 'material-ui/svg-icons/social/public'
import PlayArrow from 'material-ui/svg-icons/av/play-arrow'
import socket from '../../socket';

export default class RoomInfo extends Component{
    constructor(props){
        super(props);
        this.state = {rooms: {}, search:""}
    }


    mapRooms(rooms){
        const ret_data = [];
        if(Object.keys(rooms).length === 0){
            ret_data.push(
                <ListItem
                    disabled={true}
                    key="no_rooms"
                    primaryText={`No rooms in progress`}
                    style={{color:"red"}}
                />
            );
            return ret_data;
        }
        Object.keys(rooms).forEach((room_name, i) => {
            const num_clients = rooms[room_name].clients;
            const locked = rooms[room_name].locked;
            const iconStyle = {
                width: 48,
                height: 48,
                cursor: "pointer",
                top: "0px"
            };
            let iconLocked = <Public />;
            if(locked){
                iconLocked = <LockOutline />;
            }
            if(room_name.startsWith(this.state.search, 0)) {
                ret_data.push(
                    <ListItem
                        disabled={true}
                        key={room_name + i}
                        primaryText={room_name}
                        secondaryText={`Users: ${num_clients}`}
                        rightIcon={iconLocked}
                        leftIcon={
                            <PlayArrow
                                onClick={() => {
                                    sessionStorage.room = room_name;
                                    location.href = `/room/${room_name}`;
                                }}
                                style={iconStyle}
                            />
                        }
                    />
                )
            }
        });

        if(ret_data.length === 0){
            ret_data.push(
                <ListItem
                    key="not_found"
                    disabled={true}
                    primaryText={`No rooms matching '${this.state.search}' found`}
                    style={{color:"red"}}
                />
            )
        }
        return ret_data;
    }

    handleChange = (event) => {
        this.state.search = event.target.value;
        this.setState(this.state);
    };

    componentDidMount(){
        socket.emit("get-rooms");
        socket.on("new-room",() => {
            socket.emit("get-rooms");
        });
        socket.on("del-room", data => {
            delete this.state.rooms[data.room];
            this.setState(this.state);
        });
        socket.on("get-rooms-return", data => {
            this.state.rooms = data;
            this.setState(this.state);
        })
    }

    render(){
        const style = {
            height: "auto",
            width: "100%",
            textAlign: "center",
            display: "inline-block",
            marginTop:"10%",
            overflowY:"auto",
            overflowX:"hidden",
            maxHeight:"350px",
            minHeight:"200px"
        };

        return (
            <Paper style={style}>
                <h4>Ongoing rooms</h4>
                <TextField
                    maxLength={6}
                    hintText={"Search for room"}
                    onChange={this.handleChange}
                />
                <List style={{width:"90%"}} children={this.mapRooms(this.state.rooms)} />
            </Paper>
        )
    }
}