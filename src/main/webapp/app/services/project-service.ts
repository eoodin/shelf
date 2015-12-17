import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';

@Injectable()
export class ProjectService {
    constructor(private http: Http) {
    }

    public listProjects() {
        return  this.http.get('/api/projects/');
    }
}