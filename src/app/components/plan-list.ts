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
    `,
    styles: [`
    ul li { list-style: none; font-size: 1.4em;}
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
