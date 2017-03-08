import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject, BehaviorSubject} from 'rxjs';
import {HttpService} from "./http.service";
import {PreferenceService} from "./preference.service";

@Injectable()
export class ProjectService {
    private loading: boolean = false;
    private lastProjectId;
    private _current: BehaviorSubject<any> = new BehaviorSubject<any>({});
    private _projects = new Subject<any>();
    private _plans = new BehaviorSubject<any>([]);

    constructor(private http: HttpService, private prf: PreferenceService) {
        this._current
            .filter(p => p != null)
            .map(p => p.id)
            .filter(p => !this.loading)
            .subscribe(id => this.prf.setPreference("lastProjectId", id));

        this.prf.values
            .filter(prefs => prefs['lastProjectId'])
            .subscribe(prefs => this.lastProjectId = prefs['lastProjectId']);

        this._projects
            .filter((projects) => this.loading)
            .subscribe((projects) => {
                let select = projects[0];
                let pref = this.prf.values
                    .map(pref => pref['lastProjectId'])
                    .subscribe(lsp => {
                        if (lsp && lsp != select.id) {
                            select = projects.find(p => p.id == lsp);
                        }
                        this._current.next(select);
                    });
            });

        this.load();
    }

    setCurrent(p) {
        this._current.next(p);
    }

    get current(): BehaviorSubject<any> {
        return this._current;
    }

    get projects(): Observable<any> {
        return this._projects;
    }

    public get plans(): Observable<any> {
        return this._plans;
    }

    public load() {
        this.loading = true;
        this.http.get('/api/projects')
            .map(resp => resp.json())
            .subscribe(
                (projects) => {
                    this._projects.next(projects);
                    this.loading = false;
                },
                () => this.loading = false,
                () => this.loading = false);
    }
}
