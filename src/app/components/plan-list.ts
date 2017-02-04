import {Component, Output, EventEmitter} from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/filter';
import {PreferenceService} from "../preference.service";
import {PlanService} from "../plan.service";


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
    private _plans: Array<any> = [];
    private showAll: boolean;

    private selected: any;
    @Output() public select: EventEmitter<PlanList> = new EventEmitter<PlanList>();

    constructor(private pref: PreferenceService,
                private plans: PlanService) {
        
        this.plans.all()
            .filter(plans => plans)
            .subscribe(plans => this._plans = plans);

        this.plans.current()
            .subscribe(p => this.selectPlan(p));
    }

    private toggleAll() {
        this.showAll = !this.showAll;
    }

    private visiblePlans() {
        return this.showAll ? this._plans : this._plans.slice(0, 10);
    }

    clickedPlan(plan) {
        this.pref.values
            .filter(p => p['lastSelectedPlan'] != plan.id)
            .subscribe(() => this.pref.setPreference('lastSelectedPlan', plan.id));
        this.plans.setCurrent(plan);
    }

    selectPlan(plan) {
        if (this.selected != plan) {
            this.selected = plan;
            this.select.next(plan);
        }
    }
}
