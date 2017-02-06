import {Component} from '@angular/core';
import {PlanService} from '../plan.service';

@Component({
    selector: 'plans',
    template: `
    <md-sidenav-container class="workspace">
       <md-sidenav #sidenav class="sidenav">
          <plan-list (select)="sidenav.close()"></plan-list>
       </md-sidenav>
        <h3>
            <a (click)="sidenav.open()">{{current.name}}</a>
            <a class="add-sprint-button" (click)="showCreator = true"><span class="glyphicon glyphicon-plus"></span></a>
        </h3>
        <router-outlet></router-outlet>
    </md-sidenav-container>
    <plan-creator [(show)]="showCreator" ></plan-creator>
    `,
    styles: [`
    .workspace{height: 100%; padding-top: 10px;}
    .sidenav {background: #fff; padding: 10px;}
    .add-sprint-button{font-size: 14px;}
    .work-items-heading > div{float:right;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .alloc-table {width: 100%;}
    .alloc-table td {padding: 5px 0;}
    .alloc-table td input {width: 80px;}
    `]
})
export class Plans {
    private current = {};
    private showCreator = false;
    constructor(private planService: PlanService) {
        planService.current()
            .filter(plan => plan)
            .subscribe(plan => this.current = plan);
    }
}
