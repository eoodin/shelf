import { Injectable } from '@angular/core';
import {Subject, Observable} from 'rxjs';
import {HttpService} from './http.service';

@Injectable()
export class UserService {
    private usersCache;

    private _currentUser: Subject<any> = new Subject<any>();

    constructor(private http: HttpService) {
        this.refresh();
    }

    public refresh() {
         Observable.of(1).flatMap(() => this.http.get('/api/users/me'))
            .retry(1)
            .map(res => res.json())
            .subscribe(user => {
                user.super = user.roles && user.roles.map(u => u.id).includes(1);
                this._currentUser.next(user);
            });
    }

    public get currentUser(): Observable<any> {
        return this._currentUser;
    }

    public getUser(id) {
        if (!this.usersCache) {
            this.usersCache = {};
            return this.http.get('/api/users')
                .map(resp => resp.json())
                .do(users => users.forEach(u =>
                    this.usersCache[u.id] = u
                ))
                .map(users => this.usersCache[id]);
        }

        return Observable.of(this.usersCache[id]);
    }
}
