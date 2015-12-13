import {Component, ElementRef, bootstrap, NgModel ,FormBuilder, Validators, FORM_DIRECTIVES, CORE_DIRECTIVES} from 'angular2/angular2';
import {Http, Response, HTTP_PROVIDERS} from 'angular2/http';
import {Alert} from 'deps/ng2-bootstrap/ng2-bootstrap.ts'

class Project {
    public id;
    public name;
}

@Component({
    selector: '[shelf-app]',
    directives: [Alert, FORM_DIRECTIVES, CORE_DIRECTIVES],
    template: `
    <h1>Welcome to Shelf</h1>

    <alert [type]="'warning'" dismissible="true">
        <p>Notice: This tool is under development.</p>
    </alert>

    <ul>
        <li *ng-for="#project of projects" >
            <span class="project-title">{{project.name}}</span> <button class="btn btn-danger" (click)="deleteProject(project)">Delete</button>
        </li>
    </ul>

    <button class="btn btn-primary" (click)="ui.createProjectDialog.show = true;">New Project</button>

    <div class="modal fade in" *ng-if="ui.createProjectDialog.show" [style.display]="ui.createProjectDialog.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <form #f="form" (ng-submit)="onCreateProjectSubmit(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.createProjectDialog.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Add New Project</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-3">Project name:</div><div class="col-sm-5"> <input type="text" ng-control="projectName"></div>
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
    .project-title { font-size: 2.4em; }
    `],
})
class ShelfApp{
    private projects: Project[];
    private ui;

    constructor(private http: Http) {
        this.ui = {createProjectDialog : { show : false, projectName: '' }};
        this.refreshProjectList();
    }

    refreshProjectList() {
        this.http.get('/api/projects/').subscribe(res => this.projects = res.json());
    }

    deleteProject(p: Project) {
        this.http.delete('/api/projects/' + p.id)
            .subscribe(response => this.projectDeleted(response));
    }

    projectDeleted(resp) {
        console.log(resp);
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

bootstrap(ShelfApp, HTTP_PROVIDERS);