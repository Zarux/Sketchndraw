import React, {Component} from 'react';
import TextField from 'material-ui/TextField';
import RaisedButton from 'material-ui/RaisedButton';
import socket from '../../../socket'

class GuessButton extends Component{
    constructor(props){
        super(props);
    }

    render(){
        const style = {
            marginLeft: "8%",
        };

        return (
            <RaisedButton
                label="Guess"
                style={style}
                onClick={()=>{this.props.addMessage({user: this.props.user, message: this.props.value})}}
            />
        )
    }
}

export default class GuessBox extends Component{


    constructor(props){
        super(props);
        this.state = {
            value:""
        }
    }


    handleChange = (event) => {
        this.setState({
            value: event.target.value,
        });
    };


    handleKeyDown = (event) => {
        if(event.key === "Enter"){
            //this.props.addMessage({user: this.props.user, message: this.state.value});
            //socket.emit("new-message", {user: this.props.user, message: this.state.value});
            //this.setState({value:""})
            this.addMessage()
        }
    };


    addMessage = () => {
        this.setState({value:""});
        socket.emit("new-message", {room: this.props.room, user: this.props.user, message: this.state.value});
        //this.props.addMessage(msg)
    };


    render(){
        return (
            <div>
                <TextField
                    style={{
                        marginLeft:"8%",
                        width:"210px",
                    }}
                    /*hintText="Word here"*/
                    name="guess_input"
                    onChange={this.handleChange}
                    onKeyDown={this.handleKeyDown}
                    value={this.state.value}
                />
                <GuessButton value={this.state.value} user={this.props.user} addMessage={this.addMessage}/>
            </div>
        )
    }
}