import {Injectable, EventEmitter} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

import {PreferenceService} from './preference-service.ts';

@Injectable()
export class ProjectService {
    private _current = null;
    private _projects = [];

    public currentChanges = new EventEmitter();

    constructor(private http: Http, private prf:PreferenceService) {
    }

    get current():Object {
        return this._current;
    }

    set current(project:Object) {
        this._current = project;
        this.currentChanges.next(project);
        this.prf.setPreference('lastProjectId', this._current.id);
    }

    get projects():Object[] {
        return this._projects;
    }

    set projects(projects:Object[]) {
        this._projects = projects;

        var select = null;
        var lastProjectId = this.prf.preferences['lastProjectId'];
        if (lastProjectId) {
            for (var p of this._projects) {
                if (p.id == lastProjectId) {
                    select = p;
                }
            }
        }
        else if (this._projects.length) {
            var np = null;
            if (this._current) {
                for(var p of this._projects) {
                    if (p.id == this._current.id) {
                        np = p;
                        break;
                    }
                }
                this._current = np ? np : this._projects[0];
            }
            select = np ? np : this._projects[0];
        }

        this.current = select;
    }

    public load() {
        return new Observable(observer => {
            var projects = this.http.get('/api/projects/');
            projects.subscribe(resp => {
                this.projects = resp.json();
                observer.next(this.projects);
            });
        });
    }
    
    public reload() {
        //TODO: update only changed/added/removed.
        return this.load();
    }

}