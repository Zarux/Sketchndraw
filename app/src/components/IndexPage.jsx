import React, {Component} from 'react';
import AppBar from 'material-ui/AppBar';
import Chat from './Chat';
import socket from '../socket';
import Users from "./Users";
import Board from './Board';


export default class IndexPage extends Component {
    constructor(props){
        super(props);
        this.state = {room: this.props.match.params.room};
        if(!this.state.room){
            this.state.room = 1;
        }
        this.state.user = Math.random().toString(36).substr(2, 5);
        socket.emit("join-room", {room: this.state.room, user: this.state.user});
    }


    componentDidMount() {
        document.title = `Sketchndraw - ${this.state.room}`;
    }


    render() {
        return (
            <div style={{marginRight:"15%", marginLeft:"15%"}}>
                <AppBar
                    title="Sketchndraw or some shit"
                    iconClassNameRight="muidocs-icon-navigation-expand-more"
                />
                <Users user={this.state.user} room={this.state.room}/>
                <Board />
                <Chat user={this.state.user} room={this.state.room}/>
            </div>
        );
    }
}
