import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpClient, HttpHeaders } from "@angular/common/http";
import { Router, ActivatedRoute } from "@angular/router";
import { Observable, ReplaySubject, Subject } from "rxjs";

const defaultHeaders: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

class LoginStatus {
    result: string;
}

@Injectable()
export class LoginService {
  private _requireAuth: Subject<boolean> = new Subject();
  private _authenticated: ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient) {
      let redirecting = false;
      this._requireAuth
          .filter(required => required && !redirecting)
          .subscribe(() => {
              redirecting = true;
              route.params
                .subscribe(params => {
                   let gotoUrl = params['goto'] || '/plans';
                   this.router.navigate(['/login'], {queryParams: {goto: gotoUrl}});
                });
          });
    }

  public get authenticated() {
    return this._authenticated;
  }

  public login(data) {
    return this.http.post<LoginStatus>('/passport/login', JSON.stringify(data), {headers: defaultHeaders})
      .do((resp) => {
        this._authenticated.next((resp.result == 'loggedin'));
      });
  }

  public logout() {
    return this.http.get('/passport/logout', {headers: defaultHeaders})
      .do(() => this._authenticated.next(false));
  }

  public get requireAuth() {
    return this._requireAuth;
  }
}
