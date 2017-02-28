import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import BrowserHistory from 'react-router/lib/BrowserHistory';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import {cyan500} from 'material-ui/styles/colors';
import IndexPage from './IndexPage'

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


export default class App extends Component{

    render() {
        return (
            <MuiThemeProvider muiTheme={theme}>
                <Router history={BrowserHistory}>
                    <div className="app">
                        <Route exact path="/" component={IndexPage}/>
                        <Route path="/room/:room" component={IndexPage}/>
                    </div>
                </Router>
            </MuiThemeProvider>
        );
    }
}
