import {Component} from 'angular2/core';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'
import {Http, Response} from 'angular2/http';

class Project {
    public id;
    public name;
}
var oldTemplate = `

`;

@Component({
    selector: 'projects',
    directives: [FORM_DIRECTIVES],
    template: `
    <h1>Projects</h1>
    <ul>
        <li *ngFor="#project of projects" >
            <a href="#/plans/list?pid={{project.id}}"><span class="project-title">{{project.name}}</span></a>
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
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    `,
    styles: [`
    h1 {font-color: #aaa;}
    ul {padding: 0;}
    ul li { list-style: none; margin: 5px 0;}
    .project-title { font-size: 1.6em; }
    `],
})
export class Projects {
    private projects: Array;
    private ui;

    constructor(private http:Http) {
        this.ui = {createProjectDialog: {show: false, projectName: ''}};
        this.refreshProjectList();
    }

    refreshProjectList() {
        this.http.get('/api/projects/').subscribe(res => this.projects = res.json());
    }

    deleteProject(p:Project) {
        this.http.delete('/api/projects/' + p.id)
            .subscribe(response => this.projectDeleted(response));
    }

    projectDeleted(resp) {
        this.refreshProjectList();
    }

    onCreateProjectSubmit(data) {
        this.http.post('/api/projects/', data.projectName)
            .subscribe(resp => this.onProjectCreated(resp));

        this.ui.createProjectDialog.show = false;
    }

    onProjectCreated(resp) {
        this.refreshProjectList();
    }
}
