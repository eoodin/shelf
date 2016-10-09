import {Injectable} from '@angular/core';
import {Location} from '@angular/common';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import 'rxjs/Rx';

declare var window;

@Injectable()
export class UserService {
    private _currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: Http, private location: Location) {
        this.http.get('/api/users/me')
            .map(res => res.json())
            .subscribe(
                user => this._currentUser.next(user),
                err => this.onError(err)
            );
    }

    public get currentUser(): Observable<any> {
        return this._currentUser.filter(u => u);
    }

    private onError(err) {
        if (err.status == 403) {
            if (window) {
                window.location.href = '/login.html';
            }
        }
    }
}
