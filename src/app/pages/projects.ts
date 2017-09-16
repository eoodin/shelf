import {Component, Inject} from '@angular/core';
import {Http} from '@angular/http';
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import {ProjectService} from "../project.service";
import {TeamService} from "../team.service";
import {UserService} from "../user.service";

class Project {
    public id;
    public name;
}

@Component({
    selector: 'projects',
    template: `
    <div class="row">
     <div class="col-sm-3">
      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">Projects</h3>
       </div>
       <div class="panel-body">
        <ul class="sidebar-item-list">
            <li *ngFor="let project of projects" >
                <a href="#/plans?pid={{project.id}}"><span class="main-title">{{project.name}}</span></a>
                <button *ngIf="permitSA" class="btn btn-danger btn-sm" (click)="deleteProject(project)">Delete</button>
            </li>
        </ul>

        <button *ngIf="permitSA" class="btn btn-primary" (click)="showCreateProject()">New Project</button>
       </div>
      </div>

      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">Teams</h3>
       </div>
       <div class="panel-body">
        <ul class="sidebar-item-list">
            <li *ngFor="let team of teams" >
                <span class="main-title">{{team.name}}</span>
                <button *ngIf="permitSA" class="btn btn-danger btn-sm" (click)="deleteTeam(team)">Delete</button>
            </li>
        </ul>
        <button *ngIf="permitSA" class="btn btn-primary" (click)="showCreateTeam()">Add Team...</button>
       </div>
      </div>

      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">References</h3>
       </div>
       <div class="panel-body">
        <ul class="project-list">
            <li *ngFor="let ref of [1,2,3,4]" > Reference #{{ref}}</li>
        </ul>
       </div>
      </div>
     </div> <!-- col-sm-3 -->

     <div class="col-sm-offset-3">
      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">Project description</h3>
       </div>
       <div class="panel-body" class="project-description">
        <p>This is description for the project TODO: add more meaningful description here.</p>
       </div>
      </div>

      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">Plans</h3>
       </div>
       <div class="panel-body project-plans">
        <ul class="project-list">
            <li *ngFor="let plan of ['Product backlog', 'Sprint 1', 'Sprint 2', 'Sprint 3']" > &gt;&gt; {{plan}}</li>
        </ul>
       </div>
      </div>

     </div>
    </div>
    `,
    styles: [`
    h1 {font-color: #aaa;}
    .sidebar-item-list {padding: 0;}
    .sidebar-item-list li { list-style: none; margin: 5px 0;}
    .sidebar-item-list li button {float: right; }
    .main-title { font-size: 1.6em; }
    `]
})
export class Projects {
    ui;
    permitSA: boolean = false;
    projects: any[];
    teams = [];

    constructor(private http: Http,
                public dialog: MdDialog,
                private prjs: ProjectService,
                private teamService: TeamService,
                private us: UserService) {
        this.ui = {
            createProjectDialog: {show: false, projectName: ''},
            createTeamDialog: {show: false}
        };

        teamService.teams.subscribe(teams => this.teams = teams);

        this.prjs.projects.subscribe((ps) => {
            this.projects = ps;
        });

        us.currentUser
            .subscribe(user => {
                this.permitSA = user.roles && user.roles.map(i => i.id).includes(1);
            });
    }

    deleteProject(p: Project) {
        this.http.delete('/api/projects/' + p.id)
            .subscribe(() => this.prjs.load());
    }

    showCreateProject() {
        let options = {teams: this.teams, projectName: '', teamId: 0};
        let dlgRef = this.dialog.open(CreateProjectDialog, {data: options});
        dlgRef.afterClosed().filter(isCreate => isCreate).subscribe(() => {
            let project = {projectName: options.projectName, teamId: options.teamId}
            this.http.post('/api/projects/', JSON.stringify(project))
                .subscribe(() => this.prjs.load());
        });
    }

    showCreateTeam() {
        let options:any = {};
        let dlgRef = this.dialog.open(CreateTeamDialog, {data: options});
        dlgRef.afterClosed().filter(isCreate => isCreate).subscribe(() => {
            options.users = options.users.split(',');
            this.teamService.createTeam(options.name, options.scrumMaster, options.users);
            let project = {projectName: options.projectName, teamId: options.teamId}
            this.http.post('/api/projects/', JSON.stringify(project))
                .subscribe(() => this.prjs.load());
        });
    }

    deleteTeam(team) {
        this.teamService.deleteTeam(team.id);
    }
}

@Component({
    selector: 'confirm-remove-diaolg',
    template: `
    <h2 md-dialog-title>Add New Team</h2>
    <md-dialog-content class="item-details">
        <div class="row">
            <div class="col-sm-3">Team name:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.name"></div>
        </div>
        <div class="row">
            <div class="col-sm-3">Scrum master:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.scrumMaster"></div>
        </div>
        <div class="row">
            <div class="col-sm-3">Members:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.users"></div>
        </div>
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Cancel</button>
        <button md-button [md-dialog-close]="true">Add</button>
    </md-dialog-actions>`
})
export class CreateTeamDialog {
    constructor(
        public dialogRef: MdDialogRef<CreateTeamDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) { console.log(data); }
}

@Component({
    selector: 'confirm-remove-diaolg',
    template: `
    <h2 md-dialog-title>Add New Project</h2>
    <md-dialog-content class="item-details">
        <div class="row">
            <div class="col-sm-3">Project name:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.projectName"></div>
        </div>
        <div class="row">
            <div class="col-sm-3">Team:</div>
            <div class="col-sm-5">
            <select class="form-control" required [(ngModel)]="data.teamId">
                <option *ngFor="let t of data.teams" [value]="t.id">{{t.name}}</option>
            </select>
            </div>
        </div>
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Cancel</button>
        <button md-button [md-dialog-close]="true">Create</button>
    </md-dialog-actions>`
})
export class
CreateProjectDialog {
    constructor(
        public dialogRef: MdDialogRef<CreateProjectDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) { console.log(data); }
}