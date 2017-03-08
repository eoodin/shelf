import {Injectable} from '@angular/core';
import {RequestOptionsArgs, Response, Http} from "@angular/http";
import {Location} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import 'rxjs/operator/onErrorResumeNext'
import {Observable, Subject, ReplaySubject} from "rxjs";
import {LoginService } from './login.service';

@Injectable()
export class HttpService {
    private authenticated = false;
    private httpQueue: ReplaySubject<Object> = new ReplaySubject<Object>(20);
    private pausers = [];

    constructor(
        private http: Http, 
        private route: ActivatedRoute,
        private loginService: LoginService) {
        loginService.authenticated.subscribe(v => {
            if (v) this.resume();
            this.authenticated = v;
        });
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.get(url, options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.post(url, body, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.put(url, body, options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.delete(url, options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.patch(url, body, options));
    }

    go(operation) {
        const pauser = new ReplaySubject(1);
        let request = operation
            .do(() => {if (!this.authenticated) {this.loginService.authenticated.next(true);}},
                err => this.error(err),
                () => {
                    let p = this.pausers.indexOf(request);
                    if (p != -1) {
                        let removed = this.pausers.splice(p, 1);
                    }
                    pauser.complete();
            }).share();

        const pausable = pauser.switchMap(paused => paused ? Observable.never() : request);
        this.pausers.push(pauser);
        pauser.next(this.pausers.length > 1 && !this.authenticated);

        return pausable;
    }

    private error(err) {
        if (err.status == 403) {
            this.loginService.requireAuth.next(true);
        }
    }

    private resume() {
        while (this.pausers.length) {
            let p = this.pausers.pop();
            p.next(false);
        }
    }
}
