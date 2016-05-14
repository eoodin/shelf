import {Component} from 'angular2/core';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {ProjectService} from '../services/project-service.ts';
import {TeamService} from '../services/team-service.ts';

class Project {
    public id;
    public name;
}

@Component({
    selector: 'projects',
    directives: [FORM_DIRECTIVES],
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
                <button class="btn btn-danger btn-sm" (click)="deleteProject(project)">Delete</button>
            </li>
        </ul>

        <button class="btn btn-primary" (click)="ui.createProjectDialog.show = true;">New Project</button>

        <div class="modal fade in" *ngIf="ui.createProjectDialog.show" [style.display]="ui.createProjectDialog.show ? 'block' : 'block'" role="dialog">
            <div class="modal-dialog">
                <form #f="ngForm" (ngSubmit)="onCreateProjectSubmit(f.value)">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" (click)="ui.createProjectDialog.show = false" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">Add New Project</h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-sm-3">Project name:</div><div class="col-sm-5"> <input type="text" ngControl="projectName"></div>
                            </div>
                            <div class="row">
                                <div class="col-sm-3">Team:</div>
                                <div class="col-sm-5">
                                   <select class="form-control" required ngControl="teamId">
                                      <option *ngFor="let t of teamService.teams" [value]="t.id">{{t.name}}</option>
                                   </select>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
       </div>
      </div>


      <div class="panel panel-default">
       <div class="panel-heading">
         <h3 class="panel-title">Teams</h3>
       </div>
       <div class="panel-body">
        <ul class="sidebar-item-list">
            <li *ngFor="let team of teamService.teams" >
                <span class="main-title">{{team.name}}</span>
                <button class="btn btn-danger btn-sm" (click)="deleteTeam(team)">Delete</button>
            </li>
        </ul>
        <button class="btn btn-primary" (click)="ui.createTeamDialog.show = true;">Add Team...</button>

        <div class="modal fade in" *ngIf="ui.createTeamDialog.show" [style.display]="ui.createTeamDialog.show ? 'block' : 'block'" role="dialog">
            <div class="modal-dialog">
                <form #f="ngForm" (ngSubmit)="onCreateTeamSubmit(f.value)">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" (click)="ui.createTeamDialog.show = false" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">Add New Team</h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-sm-3">Team name:</div><div class="col-sm-5"> <input type="text" ngControl="name"></div>
                            </div>

                            <div class="row">
                                <div class="col-sm-3">Scrum master:</div><div class="col-sm-5"> <input type="text" ngControl="scrumMaster"></div>
                            </div>

                            <div class="row">
                                <div class="col-sm-3">Members:</div><div class="col-sm-5"> <input type="text" ngControl="users"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-default" data-dismiss="modal">Add</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
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
    .sidebar-item-description {height: 120px;}
    .sidebar-item-plans {height: 120px;}
    `]
})
export class Projects {
    private ui;
    private user;
    private projects: any[];

    constructor(private http:Http,
                private prjs: ProjectService,
                private teamService: TeamService) {
        this.ui = {
            createProjectDialog: {show: false, projectName: ''},
            createTeamDialog: {show: false}
        };

        this.teamService.reload();
        this.prjs.projects.subscribe((ps) => {
            this.projects = ps;
        });
        this.http.get('/api/users/me').subscribe(response => this.user = response.json());
        
    }

    deleteProject(p:Project) {
        this.http.delete('/api/projects/' + p.id)
            .subscribe(() => this.prjs.reload());
    }

    onCreateProjectSubmit(data) {
        this.http.request(new Request(new RequestOptions(
            {url: '/api/projects/',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })))
            .subscribe(() => this.prjs.reload());

        this.ui.createProjectDialog.show = false;
    }
    
    onCreateTeamSubmit(data) {
        data.users = data.users.split(',');

        this.http.request(new Request(new RequestOptions(
            {url: '/api/teams/',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            })))
            .subscribe(resp => this.teamService.reload());

        this.ui.createTeamDialog.show = false;
    }

    deleteTeam(team) {
        this.http.delete('/api/teams/' + team.id)
            .subscribe(response => this.teamService.reload());
    }
}
