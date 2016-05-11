import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class PreferenceService {
    private _currentUser = null;
    private _preferences = null;

    constructor(private http: Http) {
    }

    get currentUser():Object {
        return this._currentUser;
    }

    set currentUser(user:Object) {
        var reloadNeeded = (!this._currentUser || user.userId != this._currentUser.userId);
        this._currentUser = user;
        reloadNeeded && this.load();
    }

    get preferences(): Object {
        return this._preferences;
    }

    public load() : Observable {
        var that = this;
        return new Observable(observer => {
            if (!that._preferences) {
                that.http.get('/api/users/me')
                    .subscribe(resp => {
                        that.currentUser = resp.json();
                        that.http.get('/api/users/' + that._currentUser.userId + '/preferences')
                            .subscribe(resp => {
                                that._preferences = resp.json()
                                observer.next();
                                observer.complete();
                            });
                    });
            }
            else {
                observer.next();
                observer.complete();
            }
        });
    }

    public fetchUserInfo() : Observable {
        return new Observable(observer => {
            if (this._currentUser) {
                observer.next(this._currentUser);
                observer.complete();
                return;
            }

            this.http.get('/api/users/me')
                .subscribe(resp => {
                    this._currentUser = resp.json();
                    observer.next(this._currentUser);
                    observer.complete();
                });
        });
    }

    public setPreference(name, value) {
        this.fetchUserInfo().subscribe(u => {
            if (!u.userId)
                console && console.log('userId not loaded.');

            this.http.put('/api/users/' + u.userId + '/preferences?name=' + name + "&value=" + value)
                .subscribe(_ => {});
        });
    }
}