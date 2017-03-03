import {Injectable} from '@angular/core';
import {RequestOptionsArgs, Response, Http} from "@angular/http";
import {Location} from '@angular/common';
import {ActivatedRoute} from "@angular/router";
import 'rxjs/operator/onErrorResumeNext'
import {Observable, ReplaySubject} from "rxjs";
import {LoginService } from './login.service';

@Injectable()
export class HttpService {
    private authenticated = false;
    private httpQueue: ReplaySubject<Object> = new ReplaySubject<Object>(1);

    constructor(
        private http: Http, 
        private route: ActivatedRoute,
        private loginService: LoginService) {
        
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
        return operation.do(() => {}, err => this.error(err), () => {});
    }

    private error(err) {
        if (err.status == 403) {
            this.loginService.requireAuth.next(true);
        }
    }

    private resume() {
        // this.authenticated = true;
    }
}
