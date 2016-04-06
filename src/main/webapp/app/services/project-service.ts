import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {PreferenceService} from './preference-service.ts';

@Injectable()
export class ProjectService {
    private _current = null;
    private _projects = [];

    constructor(private http: Http, private prefService:PreferenceService) {
    }

    get current():Object {
        return this._current;
    }

    set current(project:Object) {
        this._current = project;
        this.prefService.setPreference('lastProjectId', this._current.id);
    }

    get projects():Object[] {
        return this._projects;
    }

    set projects(projects:Object[]) {
        this._projects = projects;
        var lastProjectId = this.prefService.preferences['lastProjectId'];
        if (lastProjectId) {
            for (var p of this._projects) {
                if (p.id==lastProjectId) {
                    this._current = p;
                    return;
                }
            }
        }

        if (!this._projects.length) {
            this._current = null;
        }
        else {
            var np = null;
            if (this._current) {
                for(var p of this._projects) {
                    if (p.id == this._current.id) {
                        np = p;
                        break;
                    }
                }
            }
            this._current = np ? np : this._projects[0];
        }
    }

    public load() {
        this.http.get('/api/projects/')
            .subscribe(resp => this.projects = resp.json());
    }

    public reload() {
        //TODO: update only changed/added/removed.
        this.load();
    }

}