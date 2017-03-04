import React, {Component} from 'react';
import {Grid, Row, Col} from 'react-flexbox-grid'
import Chat from './chat/Chat';
import Users from "./users/Users";
import Board from './board/Board';
import socket from '../../socket';

export default class MainPage extends Component {
    constructor(props){
        super(props);

        const username = sessionStorage.name;
        const room = sessionStorage.room;

        this.state = {
            room: this.props.match.params.room.substr(0,6),
            shouldRender: false,
            user: username
        };

        if(!username){
            if(!room && this.state.room){
                sessionStorage.setItem("room", this.state.room);
            }
            location.href = "/";
        }else{
            history.replaceState("", `Sketchndraw - ${this.state.room}`, `/room/${this.state.room}`);
            socket.emit("join-room", {
                room: this.state.room,
                user: this.state.user,
                pass: sessionStorage.pass
            });

            socket.on("join-room-failed", data => {
               sessionStorage.setItem("error", JSON.stringify({pass: data.reason}));
               sessionStorage.setItem("room", this.state.room);
               sessionStorage.setItem("name", this.state.user);
               location.href = "/";
            });

            socket.on("join-room-success", data => {
                this.setState({...this.state, shouldRender: true});
            });

            //sessionStorage.clear();
        }
    }


    componentDidMount() {
        document.title = `Sketchndraw - ${this.state.room}`;
    }


    render() {
        const style = {
            marginRight:"15%",
            marginLeft:"15%",
            marginTop:"3%"
        };
        if(!this.state.shouldRender){
            return (<div></div>)
        }
        return (
            <div style={style}>
                <Users user={this.state.user} room={this.state.room}/>
                <Board />
                <Chat user={this.state.user} room={this.state.room}/>
            </div>
        );
    }
}
