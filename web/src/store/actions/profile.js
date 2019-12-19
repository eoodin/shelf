import {setAppLoading, clearAppLoading} from './app';

export const USER_LOGGED_IN = "USER_LOGGED_IN";
export const USER_LOGGED_OUT = "USER_LOGGED_OUT";
export const PROFILE_FETCHED = "PROFILE_FETCHED";

export const userLogin = (form) => {
    return function (dispatch) {
        let fd = new FormData();
        fd.append('username', form.username);
        fd.append('password', form.password);
        // fd.append('rememberme', form.rememberme);
        return fetch('/api/login', {method: 'POST', body: fd})
            .then(response => response.json())
            .then(() => {
                dispatch({type: USER_LOGGED_IN, data: {}});
                dispatch(fetchProfile());
            }, error => console.log('error: ', error));
    };
};

export const fetchProfile = () => {
    return function(dispatch) {
        dispatch(setAppLoading());

        return fetch('/api/accessor')
            .then(resp => resp.json())
            .then(acc => dispatch({type: PROFILE_FETCHED, data: acc}))
            .catch(e => {console.log(e)})
            .finally(() => dispatch(clearAppLoading()))
    };
};

export const userLogout = () => {
    return function (dispatch) {
        return fetch('/api/logout', {method: 'POST'})
            .then(() => {
                dispatch({type: USER_LOGGED_OUT});
            }, error => console.log('error: ', error));
    };
};
