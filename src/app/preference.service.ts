import {Injectable} from "@angular/core";
import {BehaviorSubject} from "rxjs";
import {Http} from "@angular/http";
import {UserService} from "./user.service";

@Injectable()
export class PreferenceService {

    private _values: BehaviorSubject<any> = new BehaviorSubject<any>([]);

    constructor(private http: Http, private us: UserService) {
        us.currentUser.subscribe(u => this.load(u));
    }

    get values(): BehaviorSubject<any> {
        return this._values;
    }

    private load(user) {
        this.http.get('/api/preferences')
            .map(resp => resp.json())
            .subscribe(prefs => {
                this._values.next(prefs);
            });
    }

    public setPreference(name, value) {
        this.http.put('/api/preferences/' + name, JSON.stringify({'value': value})).subscribe();
    }
}