import {Component} from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList],
    template: `
    <plan-list [project]="projectService.current"></plan-list>
    `
})
export class Plans {
    constructor(private http: Http, private projectService: ProjectService) {
    }
}
