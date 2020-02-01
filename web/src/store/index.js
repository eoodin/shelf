import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { createLogger } from 'redux-logger';

import app from './reducer/app';
import profile from './reducer/profile';

const appReducer = combineReducers({
    app,
    profile
});

let enhancers = [applyMiddleware(thunk, createLogger())];

if (process.env.NODE_ENV === 'development') {
    const devToolsExtension = window.__REDUX_DEVTOOLS_EXTENSION__;

    if (typeof devToolsExtension === 'function') {
        enhancers.push(devToolsExtension());
    }
}

const store = createStore(appReducer, ...enhancers);

export default store;
