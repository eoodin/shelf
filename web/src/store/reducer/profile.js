import {PROFILE_FETCHED, USER_LOGGED_IN, USER_LOGGED_OUT} from "../actions/profile";

let init_state = {
    server: {},
    user: null
};

export default function profile(p = init_state, action) {
    switch (action.type) {
        case PROFILE_FETCHED:
            let {user} = action.data;
            return {...p, user: user};
        case USER_LOGGED_OUT:
            return {...p, user: null};
        case USER_LOGGED_IN:
            return p;
        default:
            return p;
    }
}
