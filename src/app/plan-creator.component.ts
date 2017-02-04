import {Component, ViewEncapsulation, ChangeDetectionStrategy, Input, Output, EventEmitter} from '@angular/core';
import {TeamService} from "./team.service";
import {PlanService} from "./plan.service";

@Component({
    selector: 'plan-creator',
    template: `
    <div class="modal fade in" [style.display]="_visible ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="createPlan(f.value)">
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
                                <span>{{sumAvailableHours(f.value.workdays)}}</span>
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
    styles: [],
    encapsulation: ViewEncapsulation.Emulated,
    changeDetection: ChangeDetectionStrategy.Default
})
export class PlanCreatorComponent {
    private _visible = false;

    @Input()
    public set show(p:boolean) {
        this._visible = p;
    }

    @Output()
    public showChange:EventEmitter<boolean> = new EventEmitter<boolean>();

    private team;
    constructor(private teams:TeamService,
                private planService:PlanService) {

        this.teams.ownTeam
            .filter(team => team)
            .subscribe(team => this.team = team);
        /*
         prjs.current
         .filter((id) => id)
         .do((p) => this.project = p)
         .subscribe((p) => {
         if (!p.team) return;

         this.http.get('/api/team/' + p.team.id + '/members')
         .map(resp => resp.json())
         .subscribe(members => {
         this.members = members;
         for (let m of this.members) {
         m['alloc'] = 0.8;
         m['leave'] = 0;
         }
         });
         });
         */
    }


    sumAvailableHours(workdays) {
        let days = workdays | 0;
        if (days < 0 || !this.team || this.team.members)
            return 0;

        let sum = 0;
        for (let m of this.team.members) {
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
        member.alloc = alloc;
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

    createPlan(data) {
        data['teamId'] = this.team['id'];
        data['availableHours'] = data.totalHours;
        this.planService.createPlan(data);
        this.close();
    }

    private close() {
        this._visible = false;
        this.showChange.next(false);
    }
}
