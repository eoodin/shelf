import {Injectable} from '@angular/core';
import {Jsonp} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

import {UserService} from './user-service.ts';

@Injectable()
export class PreferenceService {
    private _currentUser = null;

    private _values :BehaviorSubject<any> = new BehaviorSubject<any>([]);

    constructor(private jsonp: Jsonp, private us: UserService) {
        us.currentUser
            .do(u => this._currentUser = u)
            .subscribe(u => this.load(u));
    }

    get values(): Observable<any> {
        return this._values;
    }

    private load(user) {
        this.jsonp.get('/api/users/' + user.userId + '/preferences')
            .map(resp => resp.json())
            .subscribe(prefs => {
                this._values.next(prefs);
            });
    }

    public setPreference(name, value) {
        this.us.currentUser.subscribe(user => {
            this.jsonp.put('/api/users/' + user.userId + '/preferences?name=' + name + "&value=" + value, '{}')
                .subscribe();
        });
    }
}
