import {SET_APP_LOADING, CLEAR_APP_LOADING} from '../actions/app';

let init_state = {
    loading: false
};

export default function app(p = init_state, action) {
    switch (action.type) {
        case SET_APP_LOADING:
            return {...p, loading: true};
        case CLEAR_APP_LOADING:
            return {...p, loading: false};
        default:
            return p;
    }
}
