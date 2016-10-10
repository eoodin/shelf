import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {HttpService} from "../http.service";
import {Observable} from "rxjs";

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: HttpService) {
        Observable.timer(200).subscribe(
            () => http.get('api/app/info')
                .map(resp => resp.json())
                .subscribe(info => this._info.next(info))
        );
    }

    public get info() {
        return this._info;
    }
}
