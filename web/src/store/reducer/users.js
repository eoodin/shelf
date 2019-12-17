import {USER_LOGGED_IN, USER_LOGOUT} from "../actions/users";

export default function user(u = null, action) {
    switch (action.type) {
        case USER_LOGOUT:
            return '';
        case USER_LOGGED_IN:
            return action.data;
        default:
            return u;
    }
}
