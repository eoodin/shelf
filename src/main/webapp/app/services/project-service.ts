import {Http, Response} from 'angular2/http';

export class ProjectService {
    private projects: Array;

    constructor(private http: Http) {
    }

    public listProjects() {
        return this.projects;
    }
}