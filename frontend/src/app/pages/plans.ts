import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PlanService } from '../plan.service';
import { TeamService } from '../team.service';
import { PreferenceService } from '../preference.service';
import { DataSource } from '@angular/cdk/collections';
import { Observable, Subject } from 'rxjs';

@Component({
    selector: 'plans',
    template: `
    <mat-sidenav-container class="workspace">
       <mat-sidenav #sidenav class="sidenav">
          <plan-list (select)="sidenav.close()"></plan-list>
       </mat-sidenav>
        <div class="plan-content">
            <h3>
                <a (click)="sidenav.open()">{{current.name}}</a>
                <button mat-icon-button (click)="showCreate()"><mat-icon>create</mat-icon></button>
                <a class="add-sprint-button" (click)="showCreator = true"><span class="glyphicon glyphicon-plus"></span></a>
                <div class="team-switch">
                <form>
                    <mat-select *ngIf="teams && teams.length" name="team">
                        <mat-option *ngFor="let team of teams" [value]="team" (onSelect)="switchTeam(team)" >{{team.name}}</mat-option>
                    </mat-select>
                </form>
                </div>
            </h3>
            <router-outlet></router-outlet>
        </div>
    </mat-sidenav-container>
    `,
    styles: [`
    :host {width: 100%;}
    h3 > a {cursor: pointer;}
    .team-switch {float: right;}
    .workspace{height: 100%;}
    .sidenav {background: #fff; padding: 10px;}
    .add-sprint-button{font-size: 14px;}
    mat-option {background-color: white;}
    .plan-content {padding: 0 10px 10px 10px;}
    `]
})
export class Plans {
    current;
    showCreator = false;
    teams = [];
    lastSelectTeamId;

    constructor(public dialog: MatDialog,
        private prefs: PreferenceService,
        private planService: PlanService,
        private teamService: TeamService) {
        this.current = {};
        planService.current.subscribe(plan => this.current = plan);
        teamService.teams.subscribe(teams => this.setTeams(teams));
    }

    private setTeams(teams) {
        this.teams = teams;
        if (this.lastSelectTeamId) {
            //TODO
        }
    }

    showCreate() {
        let data = {
            name: '',
            start: '',
            end: '',
            workdays: 0,
            holiday: 0,
            teamId: '',
            team: null,
            allocs: {},
            availableHours: 0
        };
        let dialogRef = this.dialog.open(CreatePlanDlg, {data: data});
        dialogRef.afterClosed().subscribe(result => {
            if (!result) return;

            data.teamId = data.team.id;
            this.saveMemberAllocations(data.team);
            this.planService.createPlan(data);
        });
    }

    private saveMemberAllocations(team) {
        let allocs = {};
        for (let m of team.members) {
            allocs[m.id] = m['alloc'];
        }

        this.prefs.setPreference('members.allocs', JSON.stringify(allocs));
    }

    private switchTeam(team) {
        this.planService.loadPlans(team);
    }
}

@Component({
    selector: 'create-plan-dialog',
    template: `
    <h1 mat-dialog-title>Create sprint</h1>
    <div mat-dialog-content>
        <p>
        <mat-form-field>
            <input matInput type="text" [(ngModel)]="data.name" placeholder="Name">
        </mat-form-field>
        </p>

        <table cellspacing="0" style="width: 100%;"><tr>
        <td><mat-form-field>
            <input matInput [matDatepicker]="startPicker" [(ngModel)]="data.start" (change)="calcWorkdays()" name="start" placeholder="Start from">
            <mat-datepicker-toggle matSuffix [for]="startPicker"></mat-datepicker-toggle>
            <mat-datepicker #startPicker></mat-datepicker>
        </mat-form-field></td>
        <td><mat-form-field>
            <input matInput [matDatepicker]="duePicker" [(ngModel)]="data.end" (change)="calcWorkdays()" name="end" placeholder="Due date">
            <mat-datepicker-toggle matSuffix [for]="duePicker"></mat-datepicker-toggle>
            <mat-datepicker #duePicker></mat-datepicker>
        </mat-form-field></td>
      </tr></table>
        <p>
        <mat-form-field>
            <input matInput type="number" [(ngModel)]="data.holiday" (change)="calcWorkdays()" placeholder="Holidays">
        </mat-form-field>
        </p>
        <p>
        Available effort {{sumAvailableHours() | number: '1.1-1'}} ({{ data.workdays - data.holiday }} days)
        </p>
        <p *ngIf="data.team">
            <mat-table #table [dataSource]="this" matSort>
                <ng-container matColumnDef="name">
                    <mat-header-cell *matHeaderCellDef> Name </mat-header-cell>
                    <mat-cell *matCellDef="let member"> {{member.name}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="alloc">
                    <mat-header-cell *matHeaderCellDef> Allocation </mat-header-cell>
                    <mat-cell *matCellDef="let member">
                        <input matInput [(ngModel)]="member.alloc" >
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="leave">
                    <mat-header-cell *matHeaderCellDef> Leave(days) </mat-header-cell>
                    <mat-cell *matCellDef="let member">
                        <input matInput [(ngModel)]="member.leave">
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="avail">
                    <mat-header-cell *matHeaderCellDef> Hours </mat-header-cell>
                    <mat-cell *matCellDef="let member"> {{calcHours(member) | number: '1.1-1'}} </mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="['name', 'alloc', 'leave', 'avail']"></mat-header-row>
                <mat-row *matRowDef="let row; columns: ['name', 'alloc', 'leave', 'avail'];"></mat-row>
            </mat-table>
        </p>
    </div>
    <div mat-dialog-actions>
    <button mat-button (click)="dialogRef.close(true)">OK</button>
    <button mat-button (click)="dialogRef.close(false)">Cancel</button>
    </div>
  `,
    styles: [`
    [mat-dialog-content]{max-height: 500px; overflow-y: auto; }
    mat-form-field {width: 100%;}`]
})
export class CreatePlanDlg extends DataSource<any> {
    constructor(
        public dialogRef: MatDialogRef<CreatePlanDlg>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private teams: TeamService,
        private prefs: PreferenceService,
        private planService: PlanService) {
        super();

        this.data.start = new Date();
        let et = new Date();
        et.setDate(et.getDate() + 13); // 2 weeks per sprint by default.
        this.data.end = et;

        let se = et.toISOString();
        this.data.name = se.substr(2, 2) + se.substr(5, 2) + (et.getDate() < 15 ? '2' : '4');


        this.prefs.values
            .map(values => values['members.allocs'])
            .filter(values => values)
            .map(values => JSON.parse(values))
            .subscribe(allocs => 
                this.data.allocs = allocs
            );

        this.teams.ownTeam
            .filter(team => team)
            .subscribe(team => this.updateTeam(team));
    }

    connect(): Observable<any[]> {
        return Observable.of(this.data.team.members);
    }
    
    disconnect(): void { }

    sumAvailableHours() {
        if (this.data.workdays < 0 || !this.data.team || !this.data.team.members) {
            this.data.availableHours = 0;
            return 0;
        }

        let sum = 0;
        for (let m of this.data.team.members) {
            sum += m.hours;
        }

        this.data.availableHours = (Math.round(sum * 10) / 10.0);

        return this.data.availableHours;
    }

    calcHours(member) {
        if (this.data.workdays <= 0)
            return 0;

        member.hours = member.alloc * (this.data.workdays - this.data.holiday - member.leave) * 8;
        return member.hours;
    }

    calcWorkdays() {
        var sd = new Date(this.data.start);
        var ed = new Date(this.data.end);

        if (sd.getTime() > ed.getTime()) {
            this.data.workdays = 0;
            return;
        }

        var workDays = 0;
        while (sd.getTime() <= ed.getTime()) {
            let weekend = (sd.getDay() == 0 || sd.getDay() == 6);
            sd.setHours(sd.getHours() + 24);
            if (weekend) continue;
            workDays++;
        }

        this.data.workdays = workDays - 2;
    }


    private updateTeam(team) {
        for (let m of team.members) {
            m['alloc'] = this.data.allocs[m.id] || 1;
            m['leave'] = 0;
        }

        this.data.team = team;
        this.calcWorkdays();
    }
}
