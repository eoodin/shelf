import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';

@Injectable()
export class PreferenceService {
    private _currentUser = {};
    private _preferences = [];

    constructor(private http: Http) {

    }

    get currentUser():Object {
        return this._currentUser;
    }

    set currentUser(user:Object) {
        var reloadNeeded = user.userId != this._currentUser.userId;
        this._currentUser = user;
        reloadNeeded && this.load();
    }

    get preferences(): Object {
        return this._preferences;
    }

    set preferences(p:Object) {
        this._preferences = p;
    }

    public load() {
        var that = this;
        this.http.get('/api/users/me')
            .subscribe(resp => {
                that.currentUser = resp.json();
                that.http.get('/api/users/' + that._currentUser.userId + '/preferences')
                    .subscribe(resp => that.preferences = resp.json());
            });
    }

    public setPreference(name, value) {
        this.http.put('/api/users/' + this._currentUser.userId + '/preferences?name=' + name + "&value=" + value)
            .subscribe(resp => console.log(resp.json()));
    }
}