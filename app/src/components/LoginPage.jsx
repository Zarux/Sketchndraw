import React, {Component} from 'react';
import TextField from "material-ui/TextField";
import Paper from 'material-ui/Paper';
import RaisedButton from "material-ui/RaisedButton";
import Avatar from 'material-ui/Avatar'
import { browserHistory } from 'react-router'

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
            width: "20%",
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
            <div style={{textAlign:"center", marginTop: "10%"}}>
                <PageInfo />
                <UserInfo />
            </div>
        )
    }
}