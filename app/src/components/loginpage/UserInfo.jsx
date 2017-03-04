import React, {Component} from 'react';
import TextField from "material-ui/TextField";
import Paper from 'material-ui/Paper';
import RaisedButton from "material-ui/RaisedButton";
import {red500, green500} from 'material-ui/styles/colors';
import socket from '../../socket';
import CircularProgress from "material-ui/CircularProgress";

export default class UserInfo extends Component{

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
            pass: "",
            buttonDisabled: false,
            loading: false
        }
    }

    handleClick = () => {
        if(this.state.room === "" || this.state.name === ""){
            return
        }

        this.setState({...this.state, loading: true});

        socket.emit("check-info",{
            room: this.state.room,
            name: this.state.name,
            pass: this.state.pass
        });

        socket.on("check-info-return", data => {
            let pass = this.state.pass;

            sessionStorage.setItem('room', this.state.room);
            sessionStorage.setItem('name', this.state.name);
            sessionStorage.setItem('pass', this.state.pass);

            if(data.valid.name && data.valid.pass){
                location.href = `/room/${this.state.room}`;
            }else{
                const error = {};

                if(!data.valid.pass){
                    sessionStorage.setItem('pass', "");
                    error.pass = "Wrong password";
                    pass = "";
                }

                if(!data.valid.name){
                    sessionStorage.setItem('name', "");
                    error.name = "Duplicate name";
                }

                sessionStorage.setItem("error", JSON.stringify(error));
            }
            this.setState({...this.state, loading: false, pass: pass});
        });
    };

    handleChange = (event) => {
        const value = event.target.value;
        const name = event.target.name;
        if(value.length <= this.maxLen[name]) {
            sessionStorage[name] = value;
            this.setState({...this.state, loading: false, [name]: value});
        }
    };

    componentDidMount(){
        let room = this.state.room;
        let name = this.state.name;
        if(sessionStorage.room !== undefined){
            room = sessionStorage.room;
        }
        if(sessionStorage.name !== undefined){
            name = sessionStorage.name;
        }
        this.setState({...this.state, name: name, room: room});
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
            name: "-",
            room: "-",
            pass: ""
        };

        const errorStyle = {
            name: {color: green500},
            room: {color: green500},
            pass: {color: red500},
        };

        this.required.map(field =>{
            if(this.state[field] === ""){
                errorText[field] = "This field is required."
                errorStyle[field].color = red500;
            }
        });
        for(const field in this.maxLen){
            if(this.state[field].length === this.maxLen[field]){
                errorText[field] = `Max length for ${field} is ${this.maxLen[field]}`;
                errorStyle[field].color = red500;
            }
        }

        if(sessionStorage.error){
            const error = JSON.parse(sessionStorage.error);
            Object.keys(error).forEach(field => {
                errorText[field] = error[field];
                errorStyle[field].color = red500;
            })
        }

        const buttonDisabled = (this.state.room === "" || this.state.name === "");

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
                        errorStyle={errorStyle.name}
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
                        errorStyle={errorStyle.room}
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
                    <JoinButton
                        handleClick={this.handleClick}
                        disabled={buttonDisabled}
                        loading={this.state.loading}
                    />
                </div>
            </Paper>
        )
    }
}

class JoinButton extends Component{
    constructor(props) {
        super(props);
    }

    render(){
        if(this.props.loading){
            return (
                <div>
                    <br />
                    <CircularProgress size={50} thickness={5} />
                </div>
            )
        }
        return (
            <RaisedButton
                label="Join Room"
                style={{
                    width: "80%",
                    margin: "10%"
                }}
                onClick={this.props.handleClick}
                disabled={this.props.disabled}
            />
        )
    }
}