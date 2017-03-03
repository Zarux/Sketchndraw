import React, {Component} from 'react';
import {List, ListItem} from 'material-ui/List';
import Edit from 'material-ui/svg-icons/image/edit';
import Visibility from 'material-ui/svg-icons/action/visibility'
import FlatButton from 'material-ui/FlatButton';
import Paper from 'material-ui/Paper';
import socket from '../../../socket'

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
            console.log(user);
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
            console.log("1", data);
            this.setState({users: data})
        });


        socket.on("user-joined", data => {
            console.log("2", data);
            const id = Object.keys(data)[0];
            console.log("2.1", id);
            this.state.users[id] = data[id];
            this.setState({users: this.state.users});
        });


        socket.on("user-left", data => {
            console.log("3", data);
            const id = data.id;
            delete this.state.users[id];
            this.setState({users: this.state.users});
        });

    }

    render(){
        const style = {
            float:"left",
            height:"700px",
            width:"200px"
        };

        return (
            <Paper style={style} zDepth={3}>
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
                <h2 style={{textAlign:"center"}}>Users</h2>
                <List children={this.mapUsers(this.state.users)} />
            </Paper>
        )
    }
}