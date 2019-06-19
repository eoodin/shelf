import {Injectable} from '@angular/core';
import { HttpResponse, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import {Location} from '@angular/common';
import {ActivatedRoute} from '@angular/router';
import {Observable, Subject, ReplaySubject} from 'rxjs';
import {map} from 'rxjs/operators';
import {LoginService } from './login.service';

const defaultHeaders: HttpHeaders = new HttpHeaders({'Content-Type': 'application/json'});

@Injectable()
export class HttpService {
    private authenticated = false;
    private pausers = [];

    constructor(
        private http: HttpClient,
        private route: ActivatedRoute,
        private loginService: LoginService) {
        loginService.authenticated.subscribe(v => {
            if (v) this.resume();
            this.authenticated = v;
        });
    }

    get<T>(url: string, options?: {headers?: HttpHeaders, params?: HttpParams | {
            [param: string]: string | string[];
        }}): Observable<T> {
        options = options || {};
        options.headers = options.headers || defaultHeaders;
        return this.go<T>(this.http.get<T>(url, options));
    }

    post<T>(url: string, body: any, options?: {headers?: HttpHeaders, params?: HttpParams | {
            [param: string]: string | string[];
        }}): Observable<T> {
        options = options || {};
        options.headers = options.headers || defaultHeaders;
        return this.go<T>(this.http.post<T>(url, body, options));
    }

    put<T>(url: string, body: any, options?: {headers?: HttpHeaders, params?: HttpParams | {
            [param: string]: string | string[];
        }}): Observable<T> {
        options = options || {};
        options.headers = options.headers || defaultHeaders;
        return this.go<T>(this.http.put<T>(url, body, options));
    }

    delete<T>(url: string, options?: {headers?: HttpHeaders, params?: HttpParams | {
            [param: string]: string | string[];
        }}): Observable<T> {
        options = options || {};
        options.headers = options.headers || defaultHeaders;
        return this.go<T>(this.http.delete<T>(url, options));
    }

    patch<T>(url: string, body: any, options?: {headers?: HttpHeaders, params?: HttpParams | {
            [param: string]: string | string[];
        }}): Observable<T> {
        options = options || {};
        options.headers = options.headers || defaultHeaders;
        return this.go<T>(this.http.patch<T>(url, body, options));
    }

    go<T>(operation: Observable<T>): Observable<T> {
        const pauser = new ReplaySubject<boolean>(1);
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

        const pausable = pauser.switchMap<boolean, T>(paused => paused ? Observable.never() : request);
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
