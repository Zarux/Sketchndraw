
const SET_USER = 'SET_USER';
const SET_DRAWER ='SET_DRAWER';

const initialState = {
    id: "",
    isDrawing: false,
    drawerId: ""
};

export default function userReducer(state=initialState, action){

    switch(action.type){
        case SET_USER:
            return {
                id: action.id,
                isDrawing: false,
                drawerId: state.drawerId
            };
        case SET_DRAWER:
            return {
                id: state.id,
                isDrawing: action.id === state.id,
                drawerId: action.id
            };

        default:
            return state;

    }

};