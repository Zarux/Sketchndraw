import React, {Component} from 'react';
import RoomInfo from './RoomInfo'
import UserInfo from './UserInfo'
import PageInfo from './PageInfo'

export default class LoginPage extends Component {
    constructor(props){
        super(props);
    }

    render(){
        return(
            <div style={{textAlign:"center", display:"inline-block", marginLeft:"40%", marginTop:"4%", width:"20%"}}>
                <PageInfo />
                <UserInfo />
                <RoomInfo />
            </div>
        )
    }
}