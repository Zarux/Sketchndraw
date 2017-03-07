import { createStore, combineReducers } from 'redux';
import drawerReducer from './reducers/drawerReducer';

const reducer = combineReducers({
    drawer: drawerReducer,
});

export default createStore(reducer);