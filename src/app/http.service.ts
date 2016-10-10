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
        return this.go(this.http.post(url, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.put(url, options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.delete(url, options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        return this.go(this.http.patch(url, options));
    }

    go(operation) {
        if (this.unauth.getValue()) {
            return Observable.empty<Response>();
        }

        operation.share();
        operation.subscribe(() => {}, err => this.error(err));
        return operation;
    }

    error(err) {
        if (err.status == 403 && !this.unauth.getValue()) {
            this.unauth.next(true);
        }
    }

    public authFail() {
        return this.unauth;
    }
}
