import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';

@Injectable()
export class ProjectService {
    private _current = {};
    private _projects = [];

    constructor(private http: Http) {
    }

    get current():Object {
        return this._current;
    }

    set current(project:Object) {
        this._current = project;
    }

    get projects():Object[] {
        return this._projects;
    }

    set projects(projects:Object[]) {
        this._projects = projects;
        if (this._projects && this._projects.length)
            this._current =this._projects[0];
    }

    public load() {
        this.http.get('/api/projects/')
            .subscribe(resp => this.receiveProjects(resp.json()));
    }

    private receiveProjects(ps) {
        this.projects = ps;
    }
}