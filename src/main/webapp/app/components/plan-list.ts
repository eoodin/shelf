import {Component} from 'angular2/core';
import {Http, Response} from 'angular2/http';

@Component({
    selector: 'plan-list',
    template: `
    <ul>
        <li *ngFor="#plan of plans"> {{plan.name}}</li>
    </ul>
    `
})
export class PlanList {
    private plans;

    constructor(private http: Http) {
        this.plans = [];
        this.http.get('data/plans.json')
            .subscribe(resp => this.setPlans(resp.json()));
    }

    private setPlans(plans) {
        this.plans = plans;
    }
}
