import { Injectable } from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {HttpService} from "./http.service";

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: HttpService) {
        http.get('api/app/info')
            .map(resp => resp.json())
            .subscribe(info => this._info.next(info));
    }

    public get info() {
        return this._info;
    }

}
