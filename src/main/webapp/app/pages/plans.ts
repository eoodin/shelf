import {Component} from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList],
    template: `
    <plan-list [project]="currentProject"></plan-list>
    `
})
export class Plans {
    private currentProject = {};

    constructor(private http: Http, private projectService: ProjectService) {

        projectService.listProjects()
            .subscribe(resp => this.setProjects(resp.json()));
    }

    setProjects(projects) {
        if (projects && projects.length > 0) {
            this.currentProject = projects[0];
        }
    }
}
