import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from "rxjs";
import {HttpService} from "./http.service";

@Injectable()
export class UserService {
    private _currentUser: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: HttpService) {
        this.refresh();
    }

    public refresh() {
         this.http.get('/api/users/me')
            .map(res => res.json())
            .subscribe(user => this._currentUser.next(user));
    }

    public get currentUser(): Observable<any> {
        return this._currentUser.filter(u => u);
    }
}
