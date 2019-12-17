export const USER_LOGIN = "USER_LOGIN";
export const USER_LOGGED_IN = "USER_LOGGED_IN";
export const USER_LOGOUT = "USER_LOGOUT";
export const USER_FETCHING = "USER_FETCHING";
export const USER_FETCHED = "USER_FETCHED";


export const userLogin = (credential) => {
    return function (dispatch) {
        return new Promise(function (resolve, reject) {
            setTimeout(() => resolve('one'), 2000);
        }).then(
            () => dispatch({type: USER_LOGGED_IN, data: {username: 'john'}}),
            (error) => dispatch({})
        );
    };
};

export const fetchUser = () => {
    return function(dispatch) {
        dispatch({type: USER_FETCHING});
        return fetch('/api/profile').then(
            (user) => dispatch({type: USER_FETCHED, user: user}),
            (error) => dispatch(console.log(error)),
        );
    };
};

export const userLogout = () => {
    return {
        type: USER_LOGOUT
    }
};

// function makeASandwichWithSecretSauce(forPerson) {
//     // We can invert control here by returning a function - the "thunk".
//     // When this function is passed to `dispatch`, the thunk middleware will intercept it,
//     // and call it with `dispatch` and `getState` as arguments.
//     // This gives the thunk function the ability to run some logic, and still interact with the store.
//     return function(dispatch) {
//         return fetchSecretSauce().then(
//             (sauce) => dispatch(makeASandwich(forPerson, sauce)),
//             (error) => dispatch(apologize('The Sandwich Shop', forPerson, error)),
//         );
//     };
// }
