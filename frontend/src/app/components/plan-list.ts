import {Component, EventEmitter, Output} from '@angular/core';
import {PreferenceService} from '../preference.service';
import {PlanService} from '../plan.service';
import {filter} from 'rxjs/operators';

@Component({
    selector: 'plan-list',
    template: `
<ul>
    <li *ngFor="let plan of visiblePlans()">
        <a [class.active]="plan == selected" (click)="clickedPlan(plan)"> {{plan.name}} </a>
    </li>
    <li *ngIf="_plans.length > 10" class="toggle">
        <a (click)="toggleAll()"> {{showAll ? "Collapse" : "Show All"}} </a>
    </li>
</ul>
    `,
    styles: [`
    ul {padding: 5px; }
    ul li { list-style: none; font-size: 1.2em; padding: 5px 0;}
    li:hover { background-color: #747474; color: #fff;}
    li>a {cursor: pointer;}
    li.toggle {background-color: #dfdfdf;}
    `]
})
export class PlanList {
    _plans: Array<any> = [];
    showAll: boolean;
    selected: any;

    @Output() public select: EventEmitter<PlanList> = new EventEmitter<PlanList>();

    constructor(private pref: PreferenceService,
                private plans: PlanService) {
        this.plans.all()
            .pipe(filter(plans => plans))
            .subscribe(plans => this._plans = plans);

        this.plans.current
            .subscribe(p => this.selectPlan(p));
    }

    toggleAll() {
        this.showAll = !this.showAll;
    }

    visiblePlans() {
        return this.showAll ? this._plans : this._plans.slice(0, 10);
    }

    clickedPlan(plan) {
        this.pref.values
            .pipe(filter(p => p['lastSelectedPlan'] != plan.id))
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

