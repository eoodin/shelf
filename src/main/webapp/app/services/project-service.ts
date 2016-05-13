import {Injectable, EventEmitter} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';
import {BehaviorSubject} from 'rxjs/BehaviorSubject';
import {PreferenceService} from './preference-service.ts';

@Injectable()
export class ProjectService {
    private _current :BehaviorSubject<any> = new BehaviorSubject<any>(null);

    private _projects = [];

    constructor(private http: Http, private prf:PreferenceService) {
        this._current
            .filter(p => p != null)
            .map(p => p.id)
            .subscribe(id => this.prf.setPreference("lastProjectId", id))
    }

    setCurrent(p) {
        this._current.next(p);
    }

    get current(): Observable {
        return this._current;
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
            var currentProject = this._current.getValue();
            if (currentProject) {
                for(var p of this._projects) {
                    if (p.id == currentProject.id) {
                        np = p;
                        break;
                    }
                }
            }
            select = np ? np : this._projects[0];
        }

        this.setCurrent(select);
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