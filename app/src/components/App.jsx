import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import { browserHistory } from 'react-router'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import {cyan500} from 'material-ui/styles/colors';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import MainPage from './mainpage/MainPage'
import LoginPage from './loginpage/LoginPage'


import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

const theme = getMuiTheme({
    palette: {
        textColor: cyan500,
    },
    appBar: {
        height: 100,
    },
});

const footerStyle ={
    position:"fixed",
    left:0,
    bottom:0,
    height:50,
    width:"100%",
    background:"#272727"
};


export default class App extends Component{

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <Router history={browserHistory}>
                    <div className="app">
                        <Route exact path="/" component={LoginPage}/>
                        <Route path="/room/:room" component={MainPage}/>
                        <Toolbar style={footerStyle} >
                            <ToolbarGroup style={{float:"right"}} firstChild={true}>
                                <ToolbarTitle text="PLAAAAAAAAAAAAAAACEEEEEEEEEEEEEEEEEHOOOOOOOOOOOLDDEEEEEEEEEEEEER" />
                            </ToolbarGroup>
                        </Toolbar>
                    </div>
                </Router>
            </MuiThemeProvider>
        );
    }
}
