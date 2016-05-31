import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class UserService {
    private _currentUser :Subject<any> = new Subject<any>();

    constructor(private http: Http) {
        this.http.get('/api/users/me')
            .map(resp => resp.json())
            .subscribe(user => this._currentUser.next(user));
    }

    public get currentUser(): Observable {
        return this._currentUser;
    }
}