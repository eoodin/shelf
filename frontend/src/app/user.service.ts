import { Injectable } from '@angular/core';
import {Subject, Observable, BehaviorSubject, of} from 'rxjs';
import {map, mergeMap, retry} from 'rxjs/operators';
import {HttpService} from './http.service';

class Role {
    id: number;
}

class User {
    id: string;
    super: boolean;
    roles: Role[];
}

@Injectable()
export class UserService {
    private usersCache = new BehaviorSubject<{}>({});
    private userCacheLoaded = false;

    private _currentUser: Subject<any> = new Subject<any>();

    constructor(private http: HttpService) {
        this.refresh();
    }

    public refresh() {
         of(1).pipe(mergeMap(() => this.http.get<User>('/api/users/me')), retry(1))
            .subscribe(user => {
                user.super = user.roles && user.roles.map(u => u.id).includes(1);
                this._currentUser.next(user);
            });
    }

    public get currentUser(): Observable<any> {
        return this._currentUser;
    }

    public getUser(id) {
        if ( !this.userCacheLoaded) {
            this.http.get<User[]>('/api/users').subscribe(users => {
                const cache = {};
                for (const u of users) {
                    cache[u.id] = u;
                }
                this.usersCache.next(cache);
            });
            this.userCacheLoaded = true;
        }

        return this.usersCache.pipe(map(users => users[id]));
    }
}
