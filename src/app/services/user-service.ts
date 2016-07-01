import {Injectable} from '@angular/core';
import {Jsonp} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class UserService {
    private _currentUser :BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private jsonp: Jsonp) {
        this.jsonp.get('/api/users/me')
            .map(resp => resp.json())
            .subscribe(user => this._currentUser.next(user));
    }

    public get currentUser(): Observable<any> {
        return this._currentUser.filter(u => u);
    }
}
