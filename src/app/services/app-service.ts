import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: Http) {
        http.get('api/app/info')
            .map(resp => resp.json())
            .subscribe(info => this._info.next(info));
    }

    public get info() {
        return this._info;
    }
}
