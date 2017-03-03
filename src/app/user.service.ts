import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpService} from "./http.service";

@Injectable()
export class UserService {
    private usersCache;

    private _currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: HttpService) {
        this.refresh();
    }

    public refresh() {
         this.http.get('/api/users/me')
            .map(res => res.json())
            .subscribe(user => this._currentUser.next(user));
        this.usersCache = {};
        this.http.get('/api/users')
            .map(resp => resp.json())
            .subscribe(users => users.forEach(u => this.usersCache[u.id] = u));
    }

    public get currentUser(): Observable<any> {
        return this._currentUser.filter(u => u);
    }

    public getUser(id) {
        if (!this.usersCache) return Observable.of(null);
        return Observable.of(this.usersCache[id]);
    }
}
