import {Injectable} from 'angular2/core';
import {Http, Response} from 'angular2/http';
import {Observable} from 'rxjs/Observable';

import ProjectService from './project-service.ts';

@Injectable()
export class BacklogService {
    constructor(private http: Http, private prjs:ProjectService) {
    }

    public currentBacklog() {
        this.prjs.loaded().subscribe();
        return new Observable(observer => {
            var projects = this.http.get('/api/projects/');
            projects.subscribe(resp => {
                this.projects = resp.json();
                observer.next(this.projects);
            });
        });

    }
}