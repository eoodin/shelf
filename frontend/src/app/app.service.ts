import { Injectable } from '@angular/core';
import {Observable, BehaviorSubject} from "rxjs";
import {HttpService} from "./http.service";

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: HttpService) {
        Observable.of(1).flatMap(() => http.get('api/app/info'))
        .retry(1)
        .map(resp => resp.json())
        .subscribe(info => this._info.next(info));;
    }

    public get info() {
        return this._info;
    }
}
