import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {HttpService} from './http.service';
import {PreferenceService} from './preference.service';


class Project {
    public id;
    public name;
    releases;
}

@Injectable()
export class ProjectService {
    private loading = false;
    private lastProjectId;
    private _current: BehaviorSubject<any> = new BehaviorSubject<any>({});
    private _projects = new BehaviorSubject<any>([]);
    private _plans = new BehaviorSubject<any>([]);

    constructor(private http: HttpService, private prf: PreferenceService) {
        this._current
            .pipe(
                filter(p => p != null),
                map(p => p.id),
                filter(p => !this.loading)
            ).subscribe(id => this.prf.setPreference('lastProjectId', id));

        this.prf.values
            .pipe(
                filter(prefs => prefs['lastProjectId'])
            )
            .subscribe(prefs => this.lastProjectId = prefs['lastProjectId']);

        this._projects
            .pipe(
                filter((projects) => this.loading)
            )
            .subscribe((projects) => {
                let select = projects[0];
                this.prf.values
                    .pipe(map(pref => pref['lastProjectId']))
                    .subscribe(lsp => {
                        if (lsp && lsp != select.id) {
                            select = projects.find(p => p.id == lsp);
                        }
                        this._current.next(select);
                    });
            });

        this.load();
    }

    public create(project) {
        return this.http.post('/api/projects/', JSON.stringify(project));
    }

    setCurrent(p) {
        this._current.next(p);
    }

    get current(): BehaviorSubject<any> {
        return this._current;
    }

    get projects() {
        return this._projects;
    }

    public load() {
        this.loading = true;
        this.http.get('/api/projects')
            .subscribe(
                (projects) => {
                    this._projects.next(projects);
                    this.loading = false;
                },
                () => this.loading = false,
                () => this.loading = false);
    }

    addRelease(p, release) {
        return this.http.post('/api/project/' + p.id + '/release', release);
    }

    details(pid) {
        return this.http.get<Project>('/api/project/' + pid + '/details');
    }
}
