import {Component} from '@angular/core';
import {Http} from '@angular/http';
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

        <button *ngIf="permitSA" class="btn btn-primary" (click)="ui.createProjectDialog.show = true;">New Project</button>
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
        <button *ngIf="permitSA" class="btn btn-primary" (click)="ui.createTeamDialog.show = true;">Add Team...</button>

        <modal-dialog [(show)]="ui.createTeamDialog.show" [title]="'Add New Team'">
            <div dialog-body>
                <form #f="ngForm" (ngSubmit)="onCreateTeamSubmit(f.value)">
                    <div class="row">
                        <div class="col-sm-3">Team name:</div><div class="col-sm-5"> <input type="text" ngControl="name"></div>
                    </div>
    
                    <div class="row">
                        <div class="col-sm-3">Scrum master:</div><div class="col-sm-5"> <input type="text" ngControl="scrumMaster"></div>
                    </div>
    
                    <div class="row">
                        <div class="col-sm-3">Members:</div><div class="col-sm-5"> <input type="text" ngControl="users"></div>
                    </div>
                </form>
            </div>
            <div dialog-footer>
                <button (click)="f.onSubmit()" class="btn btn-default" data-dismiss="modal">Add</button>
            </div>
        </modal-dialog>
        
        <modal-dialog [(show)]="ui.createProjectDialog.show" [title]="'Add New Project'">
            <div dialog-body>
                <form #f="ngForm" (ngSubmit)="onCreateProjectSubmit(f.value)">
                    <div class="row">
                        <div class="col-sm-3">Project name:</div><div class="col-sm-5"> <input type="text" ngControl="projectName"></div>
                    </div>
                    <div class="row">
                        <div class="col-sm-3">Team:</div>
                        <div class="col-sm-5">
                           <select class="form-control" required ngControl="teamId">
                              <option *ngFor="let t of teams" [value]="t.id">{{t.name}}</option>
                           </select>
                        </div>
                    </div>
                </form>
            </div>
            <div dialog-footer>
                <button (click)="f.onSubmit()" class="btn btn-default" data-dismiss="modal">Add</button>
            </div>
        </modal-dialog>
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

    onCreateProjectSubmit(data) {
        this.http.post('/api/projects/', JSON.stringify(data))
            .subscribe(() => this.prjs.load());

        this.ui.createProjectDialog.show = false;
    }

    onCreateTeamSubmit(data) {
        data.users = data.users.split(',');
        this.teamService.createTeam(data.name, data.scrumMaster, data.users);
        this.ui.createTeamDialog.show = false;
    }

    deleteTeam(team) {
        this.teamService.deleteTeam(team.id);
    }
}
