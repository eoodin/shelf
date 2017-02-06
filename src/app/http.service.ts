import {Injectable} from '@angular/core';
import {RequestOptionsArgs, Response, Http} from "@angular/http";
import 'rxjs/operator/onErrorResumeNext'
import {Observable, BehaviorSubject} from "rxjs";

@Injectable()
export class HttpService {

    private unauth: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    constructor(private http: Http) { }

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
        let shared = operation.share();
        if (this.unauth.getValue()) {
            return Observable.empty<Response>();
        }

        shared.subscribe(() => {}, err => this.error(err));
        return shared;
    }

    error(err) {
        if (err.status == 403 && !this.unauth.getValue()) {
            this.unauth.next(true);
        }
    }

    public authFail() {
        return this.unauth;
    }

    resume() {
        this.unauth.next(false);
    }
}
