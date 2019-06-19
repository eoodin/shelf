import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort } from '@angular/material';
import { TeamService } from '../team.service';

@Component({
  selector: 'admin-team',
  template: `
<div class="teams">
    <h3> Teams </h3>
    <ul>
        <li *ngFor="let team of teams" >
            <span>{{team.name}}</span>
            <!--
            <button mat-icon-button (click)="deleteTeam(team)">
                <mat-icon class="mat-24" aria-label="Delete team">delete</mat-icon>
            </button>
            -->
        </li>
    </ul>
    <div>
        <button mat-raised-button color="primary" (click)="onCreate()">New Team</button>
    </div>
</div>
  `,
    styles: [`
    .teams {padding: 10px 40px;}
  `]
})
export class AdminTeamComponent {
    teams: any[];

    constructor(
        public dialog: MatDialog,
        private teamService: TeamService) {
        teamService.teams.subscribe(teams => this.teams = teams);
    }

    onCreate() {
        let options: any = {};
        let dlgRef = this.dialog.open(CreateTeamDialog, {data: options});
        dlgRef.afterClosed().filter(isCreate => isCreate).subscribe(() => {
            options.users = options.users.split(',');
            this.teamService.createTeam(options.name, options.scrumMaster, options.users);
        });
    }

    deleteTeam(team) {
        this.teamService.deleteTeam(team.id);
    }
}

@Component({
    selector: 'create-team-dialog',
    template: `
    <h2 mat-dialog-title>New Team</h2>
    <mat-dialog-content class="item-details">
        <div class="row">
            Team name:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.name">
        </div>
        <div class="row">
            Scrum master:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.scrumMaster">
        </div>
        <div class="row">
            Members:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.users">
        </div>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="true">Add</button>
    </mat-dialog-actions>
`
})
export class CreateTeamDialog {
    constructor(
        public dialogRef: MatDialogRef<CreateTeamDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
}
