import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';

@Injectable()
export class UserService {
    private _currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: Http) {
        this.http.get('/api/users/me')
            .map(res => res.json())
            .subscribe(user => this._currentUser.next(user));
    }

    public get currentUser(): Observable<any> {
        return this._currentUser.filter(u => u);
    }
}
