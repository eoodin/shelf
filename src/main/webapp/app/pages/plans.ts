import {Component, ElementRef, NgModel, FORM_DIRECTIVES, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http, Response} from 'angular2/http';

import {ROUTER_DIRECTIVES,
    RouteConfig,
    Location,
    Route
    } from 'angular2/router';

import {PlanList} from '../components/plan-list.ts';

@Component({
    selector: 'plans',
    directives: [PlanList, ROUTER_DIRECTIVES, FORM_DIRECTIVES, CORE_DIRECTIVES],
    template: `
    <h1>Plans</h1>
    <router-outlet></router-outlet>
    `
})
@RouteConfig([
    new Route({path: 'list', component: PlanList, name: 'List'})
])
export class Plans {

    constructor(private http: Http, private location:Location) {
    }
}
