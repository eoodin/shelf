import { Injectable } from '@angular/core';
import { RequestOptionsArgs, Response, Http } from "@angular/http";
import {Router} from "@angular/router";
import { Observable, ReplaySubject, Subject } from "rxjs";

@Injectable()
export class LoginService {
  private authed: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private _requireAuth: Subject<boolean> = new Subject();
  private _authenticated: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);
  private _authObs = null;

  constructor(
    private router: Router,
    private http: Http) {
      this._requireAuth
            .filter(required => required)
            .subscribe(() => {
                this.router.navigate(['/login', {goto: router.url}]);
            });
  }

  public authenticated() {
    return this._authenticated;
  }

  public login(data) {
    return this.http.post('/passport/login', JSON.stringify(data))
      .do(() => this._authenticated.next(true));
  }

  public logout() {
    return this.http.get('/passport/logout')
      .do(() => this._authenticated.next(false))
      .map(resp => resp.json());
  }

  public get requireAuth() {
    return this._requireAuth;
  }
}
