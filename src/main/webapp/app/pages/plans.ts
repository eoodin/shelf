import {Component} from 'angular2/core';
import {Http, Response} from 'angular2/http';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList],
    template: `
    <div class="row">
        <div class="col-sm-2"><plan-list [project]="projectService.current"></plan-list></div>
        <div class="col-sm-offset-2 right" >
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">Product backlog</h3>
              </div>
              <div class="panel-body">
                ...
              </div>
            </div>
        </div>
    </div>
    `,
    styles: [`.right{ padding: 0 15px; }`]
})
export class Plans {
    constructor(private http: Http, private projectService: ProjectService) {
    }
}
