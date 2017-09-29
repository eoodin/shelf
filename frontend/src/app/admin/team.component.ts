import { Component, OnInit, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA, MdSort } from '@angular/material';
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
            <button md-icon-button (click)="deleteTeam(team)">
                <md-icon class="md-24" aria-label="Delete team">delete</md-icon>
            </button>
            -->
        </li>
    </ul>
    <div>
        <button md-raised-button color="primary" (click)="onCreate()">New Team</button>
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
        public dialog: MdDialog,
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
    <h2 md-dialog-title>New Team</h2>
    <md-dialog-content class="item-details">
        <div class="row">
            Team name:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.name">
        </div>
        <div class="row">
            Scrum master:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.scrumMaster">
        </div>
        <div class="row">
            Members:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.users">
        </div>
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Cancel</button>
        <button md-button [md-dialog-close]="true">Add</button>
    </md-dialog-actions>
`
})
export class CreateTeamDialog {
    constructor(
        public dialogRef: MdDialogRef<CreateTeamDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) {}
}
