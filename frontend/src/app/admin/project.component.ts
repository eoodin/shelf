import { Component, OnInit, Inject, ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA, MdSort } from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
import { TeamService } from '../team.service';
import { ProjectService } from '../project.service';
import { PlanService } from '../plan.service';
import { UserService } from '../user.service';

class Project {
    public id;
    public name;
}

@Component({
  selector: 'admin-project',
  template: `
  <div class="projects">
    <h3> projects </h3>
    <div class="projects-operation">
        <button md-raised-button color="primary" (click)="onCreate()">New Project</button>
    </div>
    <md-select placeholder="Manage project" class="project-selector" [(ngModel)]="project">
        <md-option *ngFor="let p of projects" [value]="p"> {{ p.name }} </md-option>
    </md-select>

      <dl *ngIf="project.id">
        <dt>Team</dt> <dd> {{ project.team.name }} </dd>
        <dt>Releases</dt>
        <dd>
            <ul>
              <li *ngFor="let release of project.releases">{{release.name}}</li>
            </ul>
        </dd>
      </dl>
    </div>
  `,
    styles: [`
    .projects {padding: 10px 40px;}
    .projects-operation button { float: right; }
    .projects-operation:after {content: '', width: 0: height: 0; clear: both;}
    .project-selector {width: 220px;}
  `]
})
export class AdminProjectComponent {
    projects: any[];
    project = {};
    teams;

    constructor(
        public dialog: MdDialog,
        private prjs: ProjectService,
        private teamService: TeamService) {
            teamService.teams.subscribe(teams => this.teams = teams);
            prjs.projects.subscribe((ps) => {
            this.projects = ps;
            this.project = ps.length ? ps[0] : {};
         });
    }

    onCreate() {
        let options = {teams: this.teams, projectName: '', teamId: 0};
        let dlgRef = this.dialog.open(CreateProjectDialog, {data: options});
        dlgRef.afterClosed().filter(isCreate => isCreate).subscribe(() => {
            this.prjs.create({projectName: options.projectName, teamId: options.teamId})
                .subscribe(() => this.prjs.load());
        });
    }
}

@Component({
    selector: 'create-project-dialog',
    template: `
    <h2 md-dialog-title>Add New Project</h2>
    <md-dialog-content class="item-details">
        <div class="row">
            Project name:</div><div class="col-sm-5"> <input type="text" [(ngModel)]="data.projectName">
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
export class CreateProjectDialog {
    constructor(public dialogRef: MdDialogRef<CreateProjectDialog>,
        @Inject(MD_DIALOG_DATA) public data: any
    ) {}
}
