import {USER_LOGGED_IN, USER_LOGOUT, USER_FETCHING} from "../actions/users";

export default function user(u = {}, action) {
    switch (action.type) {
        case USER_FETCHING:
            return '';
        case USER_LOGOUT:
            return '';
        case USER_LOGGED_IN:
            return action.data;
        default:
            return u;
    }
}