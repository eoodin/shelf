import {Injectable} from '@angular/core';
import {BehaviorSubject, of} from 'rxjs';
import {HttpService} from './http.service';
import {flatMap, retry} from "rxjs/operators";

@Injectable()
export class AppService {
    private _info: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: HttpService) {
        of(1).pipe(
            flatMap(() => http.get('api/app/info')),
            retry(1)
        ).subscribe(info => this._info.next(info));
    }

    public get info() {
        return this._info;
    }
}
