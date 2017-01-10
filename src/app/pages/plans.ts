import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {ProjectService} from "../project.service";
import {PreferenceService} from "../preference.service";
import {TeamService} from "../team.service";

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
                                <input type="text" [(ngModel)]="name" name="name" >
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
                                <input type="hidden" [ngModel]="calcWorkdays(start, end)" name="workdays">
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
                            <div class="col-sm-3">Available effort:</div>
                            <div class="col-sm-5"> 
                                <span>{{sumAvailableHours(f.value.workdays, members)}}</span>
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-12">
                                <table class="alloc-table">
                                   <tr>
                                       <th>Name</th>
                                       <th>Allocation</th>
                                       <th>Leave(days)</th>
                                       <th>Available</th>
                                   </tr>
                                   <tr *ngFor="let member of members">
                                       <td>{{member.name}}</td>
                                       <td><input [ngModel]="member.alloc ? member.alloc : 1" (ngModelChange)="calcHours(member, f.value.workdays, $event, member.leave)" [ngModelOptions]="{standalone:true}" /></td>
                                       <td><input [ngModel]="member.leave ? member.leave : 0" (ngModelChange)="calcHours(member, f.value.workdays, member.alloc, $event)" [ngModelOptions]="{standalone:true}" /></td>
                                       <td><input disabled [ngModel]="calcHours(member, f.value.workdays, member.alloc, member.leave)" [ngModelOptions]="{standalone:true}" /></td>
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
    private members = [];
    private ui;
    private hideFinished = false;
    project = null;

    constructor(private http: Http,
                private prjs: ProjectService,
                private teams: TeamService,
                private pref: PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'cpd': {'show': false},
            'rwd': {'show': false}
        };

        this.teams.ownTeam.subscribe(team => this.updateMembers(team));
        prjs.current.subscribe(p => this.project = p);
        pref.values.subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
        }
    }

    createPlan(data) {
        data['projectId'] = this.project['id'];
        data['availableHours'] = data.totalHours;
        this.ui.cpd.show = false;
    }

    sumAvailableHours(workdays, members) {
        let sum = 0;
        let days = workdays | 0;
        if (days < 0)
            return 0;

        for (let m of members) {
            sum += m.hours;
        }

        return sum;
    }

    calcHours(member, workdays, alloc, leave) {
        workdays = workdays | 0;
        if (workdays <= 0)
            return 0;

        alloc = alloc | 1;
        leave = leave | 0;
        member.alloc =  alloc;
        member.leave = leave;
        member.hours = alloc * (workdays - leave) * 8;
        return member.hours;
    }

    calcWorkdays(start, end) {
        var sd = new Date(start);
        var ed = new Date(end);

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
        return workDays - 2;
    }


    private updateMembers(team) {
        if (team) {
            this.http.get('/api/team/' + team.id + '/members')
                .map(resp => resp.json())
                .subscribe(members => this.members = members);
        }
    }
}
