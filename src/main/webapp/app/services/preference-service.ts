import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {UserService} from './user-service.ts';

@Injectable()
export class PreferenceService {
    private _currentUser = null;

    private _values :BehaviorSubject<any> = new BehaviorSubject<any>([]);

    constructor(private http: Http, private us: UserService) {
        us.currentUser
            .do(u => this._currentUser = u)
            .subscribe(u => this.load(u));
    }

    get values(): Observable {
        return this._values;
    }
    
    private load(user) {
        this.http.get('/api/users/' + user.userId + '/preferences')
            .map(resp => resp.json())
            .subscribe(prefs => {
                this._values.next(prefs);
            });
    }

    public setPreference(name, value) {
        this.us.currentUser.subscribe(u => {
            if (!u.userId)
                console && console.log('userId not loaded.');

            this.http.put('/api/users/' + u.userId + '/preferences?name=' + name + "&value=" + value)
                .subscribe(_ => {
                });
        });
    }
}