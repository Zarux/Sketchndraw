import React, {Component} from 'react';
import {List, ListItem} from 'material-ui/List';
import Paper from 'material-ui/Paper';
import GuessBox from './GuessBox'
import socket from '../../../socket'

class ChatMessage extends Component{
    constructor(props){
        super(props);
    }

    render(){
        const message = this.props.message;
        const user = this.props.user;
        const displayed = (<span><strong style={{color: "#000000"}}>{user}</strong> : {message}</span>);
        return (
            <ListItem
                disabled={true}
                style={{padding:"5px"}}
                secondaryText={displayed}
            />
        )
    }
}


export default class Chat extends Component {

    mapMessages(msgs) {
        return msgs.map((msg, i) => (<ChatMessage key={btoa(i+msg.user)} message={msg.message} user={msg.user} />))
    }


    constructor(props){
        super(props);
        this.state = {};
        this.state.messages = [];

        socket.on("new-message", data => {
            this.addMessage(data);
        });
    }


    addMessage = (msg) => {
        this.state.messages.push(msg);
        this.setState({messages: this.state.messages})
    };

    componentDidMount() {
        socket.emit("full-chat", {room: this.props.room});
        socket.on("full-chat-return", data =>{
            this.setState({messages: data})
        });
    }

    render(){
        const style = {
            height:"500px",
            width:"250px",
            overflowY:"scroll",
            overflowX:"hidden",
            display: 'inline-block',
        };

        const style2 = {
            height: "700px",
            width: style.width,
            display: style.display,
            float: "right"
        };

        return (
            <Paper style={style2} zDepth={3}>
                <h2 style={{textAlign:"center"}}>Chat</h2>
                <div style={style}>
                    <List children={this.mapMessages(this.state.messages)} />
                </div>
                <GuessBox user={this.props.user} room={this.props.room}/>
            </Paper>
        )
    }
}