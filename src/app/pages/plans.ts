import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Http} from '@angular/http';
import {ProjectService} from "../project.service";
import {PreferenceService} from "../preference.service";

@Component({
    selector: 'plans',
    template: `
    <md-sidenav-container class="workspace">
       <md-sidenav #sidenav class="sidenav">
          <plan-list (select)="onSelect($event);sidenav.close()"></plan-list>
       </md-sidenav>
        <h3>
            <a (click)="sidenav.open()">{{current.name}}</a>
            <a class="add-sprint-button" (click)="ui.cpd.show = true;"><span class="glyphicon glyphicon-plus"></span></a>
        </h3>
        <router-outlet></router-outlet>
    </md-sidenav-container>

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
    <div class="row" *ngIf="project == null">
        <h1 class="no-content-notice">No project.</h1>
    </div>
    <!---->
    <!--<item-detail [item]="ui.awd.item"-->
                 <!--[(show)]="ui.awd.show"-->
                 <!--[type]="ui.awd.type"-->
                 <!--(saved)="onWorkSaved();">-->
    <!--</item-detail>-->
    
    `,
    styles: [`
    .workspace{height: 100%; padding-top: 10px;}
    .sidenav {background: #fff; padding: 10px;}
    .add-sprint-button{font-size: 14px;}
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    .plan-page {padding-bottom: 15px;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .right{ padding: 0 15px; }
    .header-title {padding-left: 24px;}
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table label { margin: 0;}
    .item-table label input[type="checkbox"] { vertical-align: bottom;}
    .item-table table .checkbox{ display: inline-block; margin:0; width: 22px; height: 22px;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .id .glyphicon {margin-right: 8px;}
    .us.glyphicon{color: #050;}
    .defect.glyphicon{color: #500;}
    .task.glyphicon{color: #333;}
    .month{width: 100%;}
    `]
})
export class Plans {
    private current = {};
    private members;
    private ui;
    private hideFinished = false;

    project = null;

    constructor(private ele: ElementRef,
                private http: Http,
                private prjs: ProjectService,
                private pref: PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'cpd': {'show': false},
            'rwd': {'show': false}
        };
        prjs.current.subscribe(p => this.project = p);
        pref.values.subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            var current = this.project;
            if (!this.members && current && current.team) {
                this.http.get('/api/teams/' + current.team['id'] + '/members')
                    .subscribe(resp => this.members = resp.json());
            }
        }
    }


    createPlan(data) {
        data['projectId'] = this.project['id'];
        data['availableHours'] = this.sumAvailableHours(data);
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
}
