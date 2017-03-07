import React, {Component} from 'react';
import {List, ListItem} from 'material-ui/List';
import Edit from 'material-ui/svg-icons/image/edit';
import Visibility from 'material-ui/svg-icons/action/visibility'
import FlatButton from 'material-ui/FlatButton';
import RaisedButton from 'material-ui/RaisedButton';
import ReactCountdownClock from 'react-countdown-clock';
import Paper from 'material-ui/Paper';
import socket from '../../../socket'
import store from '../../../store'

class GameStarter extends Component {
    constructor(props){
        super(props);
    }

    handleClick = (event) => {
      socket.emit("start-new-round", {newGame:true});
    };

    render(){
        return (
            <RaisedButton
                label="Start game"
                style={{
                    height:100,
                }}
                onClick={this.handleClick}
            />
        )
    }
}

class Timer extends Component {
    constructor(props){
        super(props);
        this.state =  {
            reload: false,
            seconds: parseInt(this.props.timer)
        }
    }


    componentDidUpdate(){
        if(this.state.reload){
            this.setState({...this.state, reload:false})
        }

    }

    handleComplete = () =>{
        if(store.getState().drawer.isDrawing){
            socket.emit("start-new-round");
            console.log("STARTING NEW ROUND", Date.now());
        }
        this.setState({...this.state, reload:true, seconds: 60})
    };

    render(){
        if(this.state.reload){
            return (<div></div>)
        }
        return (
            <div
            style={{
                height: 100,
                paddingLeft:"20%"
            }}
            >
            <ReactCountdownClock seconds={this.state.seconds}
                                 color="#000"
                                 alpha={0.9}
                                 size={80}
                                 onComplete={this.handleComplete}
            />
            </div>
        )
    }
}


class User extends Component {

    constructor(props){
        super(props);
    }


    render(){
        let avatar = <Visibility />;
        if(this.props.drawing){
            avatar = <Edit />
        }

        return(
            <ListItem
                primaryText={this.props.name}
                secondaryText={`Points: ${this.props.points}`}
                leftIcon={avatar}
                disabled={true}
            />
        )
    }
}

export default class Users extends Component {


    mapUsers(users){
        return Object.keys(users).map(id => {
            const user = users[id];
            user.drawing = id === store.getState().drawer.drawerId;
            return <User key={id} name={user.name} drawing={user.drawing} points={user.points}/>
        })
    }


    constructor(props){
        super(props);
        this.state = {
            users: {}
        }
    }


    componentDidMount() {

        socket.emit("get-users", {room: this.props.room});
        socket.on("get-users-return", data =>{
            this.setState({...this.state, users: data})
        });


        socket.on("user-joined", data => {
            const id = Object.keys(data)[0];
            const users = {...this.state.users, [id]:data[id]};
            this.state.users[id] = data[id];
            this.setState({...this.state, users});
        });


        socket.on("user-left", data => {
            const id = data.id;
            const users = this.state.users;
            delete users[id];
            this.setState({...this.state, users});
        });

    }

    render(){
        const style = {
            float:"left",
            height:"700px",
            width:"200px",
            display:"flex",
            flexDirection:"column",
            justifyContent:"space-between"
        };

        return (
            <Paper style={style} zDepth={3}>
                <div>
                    <FlatButton
                        style={{
                            width: "80%",
                            marginLeft:"10%",
                            marginRight:"10%"
                        }}
                        backgroundColor="#ff8080"
                        hoverColor="#ff9999"
                        label={<span style={{color:"black"}}>LEAVE</span>}
                        onClick={
                                ()=>{
                                    delete sessionStorage.room;
                                    location.href = '/'
                                }
                        }
                    />
                    <h2 style={{textAlign:"center"}}>Players</h2>
                    <List
                        style={{
                            maxHeight:450,
                            overflowY:"auto"
                        }}
                        children={this.mapUsers(this.state.users)}
                    />
                </div>
                {this.props.round === -1 ?
                    <GameStarter /> :
                    <Timer
                        timer={this.props.timer}
                    />
                }

            </Paper>
        )
    }
}