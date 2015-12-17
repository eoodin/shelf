import {Component, Input} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

@Component({
    selector: 'plan-list',
    template: `
    <h2>{{_project.name}}</h2>
    <ul>
        <li *ngFor="#plan of plans"> {{plan.name}}</li>
    </ul>

    <button class="btn btn-primary" (click)="ui.cpd.show = true;">New Plan</button>
    <div class="modal fade in" *ngIf="ui.cpd.show" [style.display]="ui.cpd.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="createPlan(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.cpd.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Add New Plan</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Project:</div><div class="col-sm-5"><span>{{_project.name}}</span></div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Plan name:</div><div class="col-sm-5"> <input type="text" ngControl="name"></div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Type:</div><div class="col-sm-5"> <input type="text" ngControl="type"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
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
    private plans: Array = [];
    private ui: {};

    constructor(private http: Http) {
        this.ui = {cpd: {show: false}};
    }

    @Input() set project(p: Object){
        this._project = p || this._project;
        this.loadPlans();
    }

    private loadPlans() {
        if (this._project.id) {
            this.http.get('/api/plans/?project=' + this._project.id)
                .subscribe(resp => this.setPlans(resp.json()));
        }
    }

    private setPlans(plans) {
        this.plans = plans;
    }

    createPlan(data) {
        // TODO: simpler  way to specify 'Content-Type'?
        //this.http.post('/api/plans/', JSON.stringify(data), options.merge({}))
        //    .subscribe(resp => this.planCreated(resp));
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
}
