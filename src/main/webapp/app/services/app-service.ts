import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: Http) {
        http.get('api/app/info')
            .map(resp => resp.json())
            .subscribe(info => this._info.next(info));
    }

    public get info() : Observable {
        return this._info;
    }
}