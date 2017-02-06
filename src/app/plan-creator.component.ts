import {Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {TeamService} from "./team.service";
import {PlanService} from "./plan.service";
import {PreferenceService} from "./preference.service";

@Component({
    selector: 'plan-creator',
    template: `
    <div class="modal fade in" [style.display]="_visible ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form>
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="close()" data-dismiss="modal">&times;</button>
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
                                <input type="date" [(ngModel)]="start" (change)="calcWorkdays()" name="start">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Due date:</div>
                            <div class="col-sm-5">
                                <input type="date" [(ngModel)]="end" (change)="calcWorkdays()" name="end">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Holiday:</div>
                            <div class="col-sm-5">
                                <input type="number" [(ngModel)]="holiday" (change)="calcWorkdays()" name="holiday">
                            </div>
                        </div>
                        <div class="row"></div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Available effort:</div>
                            <div class="col-sm-5"> 
                                <span>{{sumAvailableHours() | number: '1.1-1'}} ({{ workdays - holiday }} workdays)</span>
                            </div>
                        </div>
                        <div class="row plan-field-row" *ngIf="team">
                            <div class="col-sm-12">
                                <table class="alloc-table">
                                   <tr>
                                       <th>Name</th>
                                       <th>Allocation</th>
                                       <th>Leave(days)</th>
                                       <th>Available</th>
                                   </tr>
                                   <tr *ngFor="let member of team.members">
                                       <td>{{member.name}}</td>
                                       <td><input [(ngModel)]="member.alloc" [ngModelOptions]="{standalone:true}" /></td>
                                       <td><input [(ngModel)]="member.leave" [ngModelOptions]="{standalone:true}" /></td>
                                       <td><span >{{calcHours(member) | number: '1.1-1'}}</span></td>
                                   </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal" (click)="createPlan()" >Add</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
  `,
    styles: [],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PlanCreatorComponent {
    private _visible = false;
    private name;
    private start;
    private end;
    private workdays = 0;
    private holiday = 0;
    private availableHours = 0;
    private team;

    private allocs;

    @Input()
    public set show(p:boolean) {
        if (p) {
            this.calcWorkdays();
            for (let m of this.team.members) {
                this.calcHours(m);
            }
            this.sumAvailableHours();
        }

        this._visible = p;
    }

    @Output()
    public showChange:EventEmitter<boolean> = new EventEmitter<boolean>();

    constructor(private teams: TeamService,
                private prefs: PreferenceService,
                private planService:PlanService) {
        this.teams.ownTeam
            .filter(team => team)
            .subscribe(team => this.updateTeam(team));
        this.prefs.values
            .map(values => values['members.allocs'])
            .filter(values => values)
            .map(values => JSON.parse(values))
            .subscribe(allocs => this.allocs = allocs);

        let time = new Date();
        this.start = time.toISOString().substr(0,10);
        time.setDate(time.getDate() + 13); // 2 weeks per sprint.
        let se = time.toISOString();
        this.end = se.substr(0, 10);

        // sprint naming
        this.name = se.substr(2, 2) + se.substr(5, 2) + (time.getDate() < 15 ? '2' : '4');
    }

    sumAvailableHours() {
        if (this.workdays < 0 || !this.team || !this.team.members) {
            this.availableHours = 0;
            return 0;
        }
        
        let sum = 0;
        for (let m of this.team.members) {
            sum += m.hours;
        }

        this.availableHours = (Math.round(sum * 10) / 10.0);

        return this.availableHours;
    }

    calcHours(member) {
        if (this.workdays <= 0)
            return 0;

        member.hours = member.alloc * (this.workdays - this.holiday - member.leave) * 8;
        return member.hours;
    }

    calcWorkdays() {
        var sd = new Date(this.start);
        var ed = new Date(this.end);

        if (sd.getTime() > ed.getTime()) {
            this.workdays = 0;
            return;
        }

        var workDays = 0;
        while (sd.getTime() <= ed.getTime()) {
            let weekend = (sd.getDay() == 0 || sd.getDay() == 6);
            sd.setHours(sd.getHours() + 24);
            if (weekend) continue;
            workDays++;
        }

        this.workdays = workDays - 2;
    }

    createPlan() {
        let data = {
            name: this.name,
            start: this.start,
            end: this.end,
            workdays: this.workdays,
            holiday:this.holiday,
            teamId: this.team.id,
            availableHours: this.availableHours
        };
        this.saveMemberAllocations();
        this.planService.createPlan(data);
        this.close();
    }

    private close() {
        this._visible = false;
        this.showChange.next(false);
    }

    private updateTeam(team) {
        for (let m of team.members) {
            m['alloc'] = this.allocs[m.id] || 1;
            m['leave'] = 0;
        }

        this.team = team;
    }

    private saveMemberAllocations() {
        let allocs = {};
        for (let m of this.team.members) {
            allocs[m.id] = m['alloc'];
        }

        this.prefs.setPreference('members.allocs', JSON.stringify(allocs));
    }
}
