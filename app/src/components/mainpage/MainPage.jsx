import React, {Component} from 'react';
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
            user: username,
            words: [],
            isGame: false,
            isDrawer: false,
            round: -1,
            timer: 60
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
                this.setState({
                    ...this.state,
                    shouldRender: true,
                    isGame: data.ongoing,
                    round: data.round,
                    timer: data.timer
                });
            });

            socket.on("new-round-drawer", data => {
                const words = data.words;
                this.setState({
                    ...this.state,
                    words: words,
                    isGame: true,
                    isDrawer: true,
                    drawer: data.drawer,
                    round: this.state.round + 1
                });
            });

            socket.on("new-round", data => {
                this.setState({
                    ...this.state,
                    isGame: true,
                    drawer: data.drawer,
                    round: this.state.round + 1,
                });
            })

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
            marginTop:"3%",
            display:"flex",
            flexDirection:"row",
            justifyContent: "space-around"
        };
        if(!this.state.shouldRender){
            return (<div></div>)
        }
        return (
            <div style={style}>
                <Users
                    user={this.state.user}
                    room={this.state.room}
                    round={this.state.round}
                    drawer={this.state.drawer}
                    timer={this.state.timer}
                />

                <Board
                    round={this.state.round}
                    words={this.state.words}
                    isGame={this.state.isGame}
                    isDrawer={this.state.isDrawer}
                />

                <Chat
                    user={this.state.user}
                    room={this.state.room}
                    round={this.state.round}
                />
            </div>
        );
    }
}
