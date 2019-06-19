import { Component, OnInit, Inject, ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA, MatSort } from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
import { TeamService } from '../team.service';
import { ProjectService } from '../project.service';
import { PlanService } from '../plan.service';
import { UserService } from '../user.service';
import { BehaviorSubject } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'admin-project',
  template: `
  <div class="projects">
    <h3> projects </h3>
    <div class="projects-operation">
        <button mat-raised-button color="primary" (click)="onCreate()">New Project</button>
    </div>
    <mat-select placeholder="Manage project"
        (change)="switchProject($event.value)" class="project-selector">
        <mat-option *ngFor="let p of projects" [value]="p"> {{ p.name }} </mat-option>
    </mat-select>

      <dl *ngIf="project && project.id">
        <dt>Team</dt> <dd> {{ project.team.name }} </dd>
        <dt>Releases</dt>
        <dd>
            <ul>
              <li *ngFor="let release of project.releases">{{release.name}}</li>
            </ul>
        </dd>
      </dl>
      <button mat-icon-button>
        <mat-icon (click)="showCreateRelease = !showCreateRelease" aria-label="Create a release">create</mat-icon>
      </button>
      <form *ngIf="showCreateRelease" #f="ngForm"
        (ngSubmit)="addRelease(name.value, target.value); showCreateRelease = false">
        <mat-form-field>
            <input #name matInput required placeholder="Release name">
        </mat-form-field>

        <mat-form-field>
            <input #target matInput [matDatepicker]="picker" placeholder="Choose a date">
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>
        <button type="submit" mat-icon-button> <mat-icon aria-label="Add">check</mat-icon> </button>
      </form>
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
    showCreateRelease;
    projects: any[];
    project: any = {};
    teams;

    private po = new BehaviorSubject({});

    constructor(
        public dialog: MatDialog,
        private prjs: ProjectService,
        private teamService: TeamService) {
            teamService.teams.subscribe(teams => this.teams = teams);
            this.po.subscribe(p => {
                this.prjs.details(p['id']).subscribe(prj => this.project = prj );
            });
            prjs.projects.subscribe((ps) => {
                this.projects = ps;
                if (ps.length && !this.po.getValue()['id']) {
                    this.po.next(ps[0]);
                }
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

    switchProject(p) {
        this.po.next(p);
    }

    addRelease(name, targetDate) {
        let value = {name: name, targetDate: new Date(targetDate)};
        this.prjs.addRelease(this.project, value).subscribe(() => {
            this.prjs.details(this.project['id']).subscribe(p => this.project = p);
        });
    }
}

@Component({
    selector: 'create-project-dialog',
    template: `
    <h2 mat-dialog-title>Add New Project</h2>
    <mat-dialog-content class="item-details">
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
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="true">Create</button>
    </mat-dialog-actions>`
})
export class CreateProjectDialog {
    constructor(public dialogRef: MatDialogRef<CreateProjectDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
}
