import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {NgForm} from 'angular2/common';
import {PreferenceService} from '../services/preference-service.ts';
import {ProjectService} from '../services/project-service.ts';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';

@Component({
    selector: 'plan-list',
    template: `
    <div class="list-group">
      <a class="list-group-item" *ngFor="let plan of _plans" [class.active]="plan == selected" (click)="clickedPlan(plan)"> {{plan.name}} </a>
    </div>

    <button class="btn btn-primary" (click)="ui.cpd.show = true;">New Sprint...</button>
    <div class="modal fade in" [style.display]="ui.cpd.show ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="createPlan(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.cpd.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">New Sprint</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Sprint name:</div><div class="col-sm-5"> <input type="text" ngControl="name"></div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Start from:</div><div class="col-sm-5"> <input type="date" ngControl="start"></div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Due date:</div><div class="col-sm-5"> <input type="date" ngControl="end"></div>
                        </div>
                        <div class="row"></div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Developer hours:</div><div class="col-sm-5"> <input type="text" ngControl="devHours"></div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Tester hours:</div><div class="col-sm-5"> <input type="text" ngControl="tstHours"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Add</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    `,
    styles: [`
    ul li { list-style: none; font-size: 1.4em;}
    .plan-field-row {padding: 5px 0;}
    `]
})
export class PlanList {
    private project: Object = {};
    private _plans: Array = [];
    private ui: {};

    @Output() public select: EventEmitter<PlanList> = new EventEmitter();

    private selected: any;

    constructor(private http: Http,
                private pref : PreferenceService,
                private prjs: ProjectService) {
        this.ui = {cpd: {show: false}};
        prjs.current
            .filter((id) => id)
            .do((p) => this.project = p)
            .map((p) => p.id)
            .subscribe((id) => {this.loadPlans(id)});
    }

    private loadPlans(pid) {
        this.http.get('/api/plans/?project=' + pid)
            .subscribe(resp => this.setPlans(resp.json()));
    }

    @Output public get plans() {
        return this._plans;
    }

    private setPlans(plans) {
        this._plans = plans;
        this.selected = null;
        if (plans && plans.length) {
            var list = this;
            this.pref.values.subscribe(_ => {
                var selectPlan = plans[0];
                if (_['lastSelectedPlan']) {
                    for (var p of plans) {
                        if (p.id == _['lastSelectedPlan']) {
                            selectPlan = p;
                            break;
                        }
                    }
                }
                list.selectPlan(selectPlan);
            });
        }
    }

    createPlan(data) {
        data['projectId'] = this.project.id;
        this.http.request(new Request(new RequestOptions(
            {url: '/api/plans/',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })))
            .subscribe(resp => this.loadPlans(this.project.id));

        this.ui.cpd.show = false;
    }

    clickedPlan(plan) {
        this.pref.values
            .filter(p => p['lastSelectedPlan'] != plan.id)
            .subscribe(() => this.pref.setPreference('lastSelectedPlan', plan.id));
        this.selectPlan(plan);
    }

    selectPlan(plan) {
        this.selected = plan;
        this.select.next(plan);
    }
}
