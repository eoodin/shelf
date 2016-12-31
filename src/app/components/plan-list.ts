import {Component, Input, Output, EventEmitter} from '@angular/core';
import {Http} from '@angular/http';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';

import {PreferenceService} from '../services/preference-service';
import {ProjectService} from '../services/project-service';

@Component({
    selector: 'plan-list',
    template: `
    <div class="list-group">
      <a class="list-group-item" *ngFor="let plan of visiblePlans()" [class.active]="plan == selected" (click)="clickedPlan(plan)"> {{plan.name}} </a>
      <a class="list-group-item" *ngIf="_plans.length > 10" (click)="toggleAll();">{{showAll ? "Collapse" : "Show All"}}</a>
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
                            <div class="col-sm-3">Sprint name:</div>
                            <div class="col-sm-5"> 
                                <input type="text" [(ngModel)]="name" name="name">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Start from:</div>
                            <div class="col-sm-5">
                                <input type="date" [(ngModel)]="start" name="start">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Due date:</div>
                            <div class="col-sm-5">
                                <input type="date" [(ngModel)]="end" name="end">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Holiday:</div>
                            <div class="col-sm-5">
                                <input type="number" [(ngModel)]="holiday" name="holiday">
                            </div>
                        </div>
                        <div class="row"></div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Available effort:</div><div class="col-sm-5"> 
                                <!-- <input type="text" [disabled]="true" [(ngModel)]="availableHours" name="availableHours"> -->
                                <span>{{sumAvailableHours(f.value) | number: '1.0-0'}} hours</span>
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-12">
                            <table style="width: 100%">
                               <tr>
                                   <th>Name</th>
                                   <th>Allocation</th>
                                   <th>Leave(days)</th>
                                   <th>Available</th>
                               </tr>
                               <tr *ngFor="let member of members">
                                   <td>{{member.name}}</td>
                                   <td><input [(ngModel)]="member.alloc" [ngModelOptions]="{standalone:true}"/></td>
                                   <td><input [(ngModel)]="member.leave" [ngModelOptions]="{standalone:true}"/></td>
                                   <td>{{member.alloc * (calcWorkdays(f.value) - member.leave) * 8 | number: '1.0-1'}} hours</td>
                               </tr>
                            </table>
                            </div>
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
    private _plans: Array<any> = [];
    private ui: any;
    private members: {}[] = [];
    private showAll: boolean;

    private selected: any;
    @Output() public select: EventEmitter<PlanList> = new EventEmitter<PlanList>();

    constructor(private http: Http,
                private pref: PreferenceService,
                private prjs: ProjectService) {

        this.ui = {cpd: {show: false}};
        prjs.current
            .filter((id) => id)
            .do((p) => this.project = p)
            .subscribe((p) => {
                this.loadPlans(p.id);
                if (!p.team) return;

                this.http.get('/api/teams/' + p.team.id + '/members')
                    .map(resp => resp.json())
                    .subscribe(members => {
                        this.members = members;
                        for (let m of this.members) {
                            m['alloc'] = 0.8;
                            m['leave'] = 0;
                        }
                    });
            });

    }

    private loadPlans(pid) {
        this.http.get('/api/plans/?project=' + pid)
            .map(resp => resp.json())
            .subscribe(data => this.setPlans(data));
    }

    private toggleAll() {
        this.showAll = !this.showAll;
    }


    private visiblePlans() {
        return this.showAll ? this._plans : this._plans.slice(0, 10);
    }

    private setPlans(plans) {
        this._plans = plans;
        this.selected = null;
        if (plans && plans.length) {
            // Revert the order by end time.
            this._plans.sort((a, b) => {return b.end.localeCompare(a.end);});
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
        data['projectId'] = this.project['id'];
        data['availableHours'] = this.sumAvailableHours(data);
        this.http.post('/api/plans/', JSON.stringify(data))
            .subscribe(resp => this.loadPlans(this.project['id']));

        this.ui.cpd.show = false;
    }

    sumAvailableHours(data) {
        let sum = 0;
        let dayHours = 8;
        let days = this.calcWorkdays(data);
        if (days < 0)
            return 0;

        for (let m of this.members) {
            sum += m['alloc'] * (days - m['leave']) * dayHours;
        }

        return sum;
    }

    calcWorkdays(data) {
        var sd = new Date(data.start);
        var ed = new Date(data.end);

        if (sd.getTime() > ed.getTime())
            return -1;

        var workDays = 0;
        while (sd.getTime() <= ed.getTime()) {
            let weekend = (sd.getDay() == 0 || sd.getDay() == 6);
            sd.setHours(sd.getHours() + 24);
            if (weekend) continue;
            workDays++;
        }

        // TODO: add option to include start/end days
        let holidays  = data.holiday || 0;
        return workDays - holidays - 2;
    }

    clickedPlan(plan) {
        this.pref.values
            .filter(p => p['lastSelectedPlan'] != plan.id)
            .subscribe(() => this.pref.setPreference('lastSelectedPlan', plan.id));
        this.selectPlan(plan);
    }

    selectPlan(plan) {
        if (this.selected != plan) {
            this.selected = plan;
            this.select.next(plan);
        }
    }
}
