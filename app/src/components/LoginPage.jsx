import React, {Component} from 'react';
import TextField from "material-ui/TextField";
import Paper from 'material-ui/Paper';
import RaisedButton from "material-ui/RaisedButton";
import {List, ListItem} from 'material-ui/List';
import LockOutline from 'material-ui/svg-icons/action/lock-outline'
import LockOpen from 'material-ui/svg-icons/action/lock-open'
import PlayArrow from 'material-ui/svg-icons/av/play-arrow'
import socket from '../socket';

class PageInfo extends Component{
    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <h1>LOGO</h1>
            </div>
        )
    }
}

class RoomInfo extends Component{
    constructor(props){
        super(props);
        this.state = {rooms: {}, search:""}
    }


    mapRooms(rooms){
        return Object.keys(rooms).map((room_name, i) => {
            const num_clients = rooms[room_name];
            const iconStyle = {
                width: 48,
                height: 48,
                cursor: "pointer",
                paddingBottom: "50px"
            };
            if(!room_name.startsWith(this.state.search, 0)){
                return (<span> </span>);
            }
            return (
                <ListItem
                    disabled={true}
                    key={room_name+i}
                    primaryText={room_name}
                    secondaryText={`Users: ${num_clients}`}
                    leftIcon={<LockOpen />}
                    rightIcon={
                            <PlayArrow
                                onClick={()=>{
                                    localStorage.room = room_name;
                                    location.href = `/room/${room_name}`;
                                }}
                               style={iconStyle}
                            />
                    }
                />
            )
        })
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
            height: "350px",
            width: "100%",
            textAlign: "center",
            display: "inline-block",
            marginTop:"10%",
            overflowY:"scroll",
            overflowX:"hidden"
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

class UserInfo extends Component{

    maxLen = {
        room: 6,
        name: 10
    };
    required = ["room", "name"];

    constructor(props){
        super(props);
        this.state = {
            name: "",
            room: ""
        }
    }

    handleClick = (event) => {
        if(this.state.room === "" || this.state.name === ""){
            return
        }
        localStorage.setItem('room', this.state.room);
        localStorage.setItem('name', this.state.name);
        location.href = `/room/${this.state.room}`
    };

    handleChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;
        if(value.length <= this.maxLen[name]) {
            this.state[name] = value;
            localStorage.name = value;
            this.setState(this.state);
        }
    };

    componentDidMount(){
        console.log(localStorage);
        if(localStorage.room !== undefined){
            this.state.room = localStorage.room;
            this.setState(this.state);
        }
    };


    render(){

        const style = {
            height: "250px",
            width: "100%",
            textAlign: "center",
            display: "inline-block"
        };
        const textFieldStyle = {
            width: "80%"
        };
        const errorText = {
            name: "",
            room: ""
        };

        this.required.map(field =>{
            if(this.state[field] === ""){
                errorText[field] = "This field is required."
            }
        });
        for(const field in this.maxLen){
            if(this.state[field].length === this.maxLen[field]){
                errorText[field] = `Max length for ${field} is ${this.maxLen[field]}`
            }
        }

        return (
            <Paper zDepth={3} style={style}>
                <div style={{
                    display:"inline-block",
                    marginLeft: "10%",
                    marginRight: "10%",
                    marginTop: "10%",
                    height: "100%",
                    width: "80%",
                }}>
                    <TextField
                        errorText={errorText.name}
                        hintText="Name"
                        name="name"
                        onChange={this.handleChange}
                        style={textFieldStyle}
                        maxLength={this.maxLen.name}
                        value={this.state.name}
                    />
                    <br />
                    <TextField
                        errorText={errorText.room}
                        hintText="Room"
                        name="room"
                        onChange={this.handleChange}
                        style={textFieldStyle}
                        maxLength={this.maxLen.room}
                        value={this.state.room}
                    />
                    <RaisedButton
                        label="Join Room"
                        style={{
                            width: "80%",
                            margin: "10%"
                        }}
                        onClick = {this.handleClick}
                    />
                </div>
            </Paper>
        )
    }
}

export default class LoginPage extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div style={{textAlign:"center", display:"inline-block", marginLeft:"40%", marginTop:"5%", width:"20%"}}>
                <PageInfo />
                <UserInfo />
                <RoomInfo />
            </div>
        )
    }
}