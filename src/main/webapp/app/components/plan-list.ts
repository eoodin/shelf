import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {NgForm} from 'angular2/common';
import {PreferenceService} from '../services/preference-service.ts';

@Component({
    selector: 'plan-list',
    template: `
    <div class="list-group" *ngIf="_backlog">
      <a class="list-group-item" [class.active]="_backlog == selected" (click)="selectBacklog()"> {{_backlog.name}} </a>
    </div>
    <div class="list-group">
      <a class="list-group-item" *ngFor="let plan of _plans" [class.active]="plan == selected" (click)="selectPlan(plan)"> {{plan.name}} </a>
    </div>

    <button class="btn btn-primary" (click)="ui.cpd.show = true;">New Sprint...</button>
    <div class="modal fade in" [style.display]="ui.cpd.show ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="createPlan(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.cpd.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Add New Sprint</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Project:</div><div class="col-sm-5"><span>{{_project.name}}</span></div>
                        </div>
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
    private _project: Object = {};
    private _plans: Array = [];
    private _backlog;
    private ui: {};
    @Output() public select: EventEmitter<PlanList> = new EventEmitter();

    private selected: any;

    constructor(private http: Http, private pref : PreferenceService) {
        this.ui = {cpd: {show: false}};
    }

    @Input() set project(p: Object){
        this._project = p || this._project;
        this.loadPlans();
    }

    private loadPlans() {
        if (this._project.id) {
            this.http.get('/api/backlogs/' + this._project.backlog.id)
                .subscribe(resp => this._backlog = resp.json());

            this.http.get('/api/plans/?project=' + this._project.id)
                .subscribe(resp => this.setPlans(resp.json()));
        }
    }

    @Output public get plans() {
        return this._plans;
    }

    @Output public get backlog() {
        return this._backlog;
    }

    private setPlans(plans) {
        this._plans = plans;
        this.selected = null;
        if (plans && plans.length) {
            var lastSelectedPlan = this.pref.preferences['lastSelectedPlan'];
            if (lastSelectedPlan) {
                for (var p of plans) {
                    if (p.id == lastSelectedPlan) {
                        this.selectPlan(p);
                        return;
                    }
                }
            }
            else {
                this.selectPlan(plans[0]);
            }
        }
    }

    createPlan(data) {
        data['projectId'] = this._project.id;
        this.http.request(new Request(new RequestOptions(
            {url: '/api/plans/',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })))
            .subscribe(resp => this.planCreated(resp));

        this.ui.cpd.show = false;
    }

    planCreated(resp) {
        this.loadPlans();
    }

    selectPlan(plan) {
        var lastSelectedPlan = this.pref.preferences['lastSelectedPlan'];
        if (plan.id != lastSelectedPlan) {
            this.pref.setPreference('lastSelectedPlan', plan.id);
        }

        this.selected = plan;
        this.select.next(plan);
    }

    selectBacklog() {
        this.selected = this._backlog;
        this.select.next(this._backlog)
    }
}
