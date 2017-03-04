import React, {Component} from 'react';
import Chat from './chat/Chat';
import Users from "./users/Users";
import Board from './board/Board';
import socket from '../../socket';

export default class MainPage extends Component {
    constructor(props){
        super(props);
        this.state = {room: this.props.match.params.room.substr(0,6)};
        if(!this.state.room){
            this.state.room = 1;
        }
        const username = sessionStorage.name;
        const room = sessionStorage.room;
        this.state.shouldRender = false;
        if(!username){
            if(!room && this.state.room){
                sessionStorage.setItem("room", this.state.room);
            }
            this.state.shouldRender = false;
            location.href = "/";
        }else{
            this.state.user = username;
            history.replaceState("", `Sketchndraw - ${this.state.room}`, `/room/${this.state.room}`);
            socket.emit("join-room", {room: this.state.room, user: this.state.user, pass: sessionStorage.pass});
            socket.on("join-room-failed", data => {
               sessionStorage.setItem("error", JSON.stringify({pass: data.reason}));
               sessionStorage.setItem("room", this.state.room);
               sessionStorage.setItem("name", this.state.user);
               location.href = "/";
            });
            socket.on("join-room-success", data => {
                this.state.shouldRender = true;
                this.setState(this.state);
            });
            sessionStorage.clear();
        }
    }


    componentDidMount() {
        document.title = `Sketchndraw - ${this.state.room}`;
    }


    render() {
        if(!this.state.shouldRender){
            return (<div></div>)
        }
        return (
            <div>
                <div style={{marginRight:"15%", marginLeft:"15%", marginTop:"3%"}}>
                    <Users user={this.state.user} room={this.state.room}/>
                    <Board />
                    <Chat user={this.state.user} room={this.state.room}/>
                </div>
            </div>
        );
    }
}
