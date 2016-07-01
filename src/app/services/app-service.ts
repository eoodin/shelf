import {Injectable} from '@angular/core';
import {Jsonp, Response} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private jsonp: Jsonp) {
        jsonp.get('api/app/info')
            .map(resp => resp.json())
            .subscribe(info => this._info.next(info));
    }

    public get info() {
        return this._info;
    }
}
