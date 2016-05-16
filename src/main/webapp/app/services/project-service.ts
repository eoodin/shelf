import {Injectable, EventEmitter} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {PreferenceService} from './preference-service.ts';

@Injectable()
export class ProjectService {
    private loading: boolean = false;
    private _current :BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private _projects = new BehaviorSubject<any>([]);

    constructor(private http: Http, private prf:PreferenceService) {
        this._current
            .filter(p => p != null)
            .map(p => p.id)
            .subscribe(id => this.prf.setPreference("lastProjectId", id));
        this._projects
            .subscribe((projects) => {
                if (projects.length == 0) {
                    this._current.next(null);
                }
                if (this.loading && projects.length) {
                    this.prf.values
                        .filter(p => p.lastProjectId)
                        .map(pref => {
                            let found = projects.filter(p => p.id == pref.lastProjectId)[0];
                            found = found || projects[0];
                            return found;
                        }).filter(p => p != this._current.getValue())
                        .subscribe(p => this.setCurrent(p));
                }
            });
    }

    setCurrent(p) {
        this._current.next(p);
    }

    get current(): Observable {
        return this._current;
    }

    get projects(): Observable {
        return this._projects;
    }

    public load() {
        this.loading = true;
        this.http.get('/api/projects/')
            .map(resp => resp.json())
            .subscribe(
                (projects) => {
                    this._projects.next(projects);
                    this.loading = false;
                },
                () => this.loading = false,
                () => this.loading = false);
    }
    
    public reload() {
        return this.load();
    }
}