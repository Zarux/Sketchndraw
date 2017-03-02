import React, {Component} from 'react';
import TextField from "material-ui/TextField";
import Paper from 'material-ui/Paper';
import RaisedButton from "material-ui/RaisedButton";
import socket from '../../socket';

export default

class UserInfo extends Component{

    maxLen = {
        room: 6,
        name: 10,
        pass: 8
    };
    required = ["room", "name"];

    constructor(props){
        super(props);
        this.state = {
            name: "",
            room: "",
            pass: ""
        }
    }

    handleClick = () => {
        if(this.state.room === "" || this.state.name === ""){
            return
        }
        socket.emit("check-password",{room: this.state.room, pass: this.state.pass});
        socket.on("check-password-return", data => {
            localStorage.setItem('room', this.state.room);
            localStorage.setItem('name', this.state.name);
            localStorage.setItem('pass', this.state.pass);
            if(data.valid){
                location.href = `/room/${this.state.room}`
            }else{
                localStorage.setItem('pass', "");
                localStorage.setItem("error", JSON.stringify({pass: "Wrong password"}));
                this.state.pass = "";
                this.setState(this.state);
            }
        });
    };

    handleChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;
        if(value.length <= this.maxLen[name]) {
            this.state[name] = value;
            localStorage[name] = value;
            this.setState(this.state);
        }
    };

    componentDidMount(){
        if(localStorage.room !== undefined){
            this.state.room = localStorage.room;
        }
        if(localStorage.name !== undefined){
            this.state.name = localStorage.name;
        }
        this.setState(this.state);
    };


    render(){

        const style = {
            height: "300px",
            width: "100%",
            textAlign: "center",
            display: "inline-block"
        };
        const textFieldStyle = {
            width: "80%"
        };
        const errorText = {
            name: "",
            room: "",
            pass: ""
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

        if(localStorage.error){
            console.log(localStorage);
            const error = JSON.parse(localStorage.error);
            if(error.pass){
                errorText.pass = error.pass;
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
                    <br />
                    <TextField
                        errorText={errorText.pass}
                        hintText="Password"
                        name="pass"
                        type="password"
                        onChange={this.handleChange}
                        style={textFieldStyle}
                        maxLength={this.maxLen.pass}
                        value={this.state.pass}
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