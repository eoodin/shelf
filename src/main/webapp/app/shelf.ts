import {Component, View, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';

import {HTTP_PROVIDERS} from 'angular2/http';

import {Alert, DROPDOWN_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';

import {ROUTER_DIRECTIVES,
    ROUTER_PROVIDERS,
    RouteConfig,
    Location,
    LocationStrategy,
    HashLocationStrategy,
    Route,
    Router} from 'angular2/router';

import {ProjectService} from './services/project-service.ts';
import {Projects} from './pages/projects.ts';
import {Plans} from './pages/plans.ts';

@Component({
    selector: '[shelf-app]',
    template: `
    <div class="app-page">
        <nav class="navbar navbar-default navbar-fixed-top">
          <div class="container-fluid">
            <div class="navbar-header">
              <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
                <span class="sr-only">Toggle navigation</span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
                <span class="icon-bar"></span>
              </button>
              <a class="navbar-brand" href="javascript:void(0);">Shelf</a>
            </div>
            <div class="collapse navbar-collapse">
              <ul class="nav navbar-nav">
                <li [class.active]="getLinkStyle('/projects')"><a [routerLink]="['/Projects']" class="link">Dashboard</a></li>
                <li [class.active]="getLinkStyle('/plans')"><a [routerLink]="['/Plans']" class="link">Plans</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">My Tasks</a></li>

                <li class="dropdown" dropdown keyboard-nav>
                    <a href="javascript:void(0);" class="dropdown-toggle" dropdown-toggle>
                        {{projectService.current.name}} <span *ngIf="!projectService.current.id">No Project </span><span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
                      <li *ngFor="#p of projectService.projects" role="menuitem">
                        <a (click)="projectService.current=p;">{{p.name}}</a>
                      </li>
                    </ul>
                 </li>
              </ul>

              <form class="navbar-form navbar-right">
                <div class="form-group">
                  <input type="text" placeholder="Email" class="form-control">
                </div>
                <div class="form-group">
                  <input type="password" placeholder="Password" class="form-control">
                </div>
                <button type="submit" class="btn btn-success">Sign in</button>
              </form>
            </div><!--/.nav-collapse -->
          </div>
        </nav>
        <alert [type]="'warning'" dismissible="true">
            <p>Notice: This tool is under development.</p>
        </alert>
        <div class="container-fluid"><router-outlet></router-outlet></div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page { padding-top: 70px; }
    `],
    directives: [Alert, ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES]
})
@RouteConfig([
    new Route({path: '/projects', component: Projects, name: 'Projects'}),
    new Route({path: '/plans', component: Plans, name: 'Plans'})
])
class ShelfApp {
    router:Router;
    location:Location;
    private projectService : ProjectService;
    private ui;

    constructor(router:Router, location:Location, projectService: ProjectService) {
        this.router = router;
        this.location = location;
        this.projectService = projectService;
        this.ui = {"nav" : {"projectList" : {"show": false}}};
        this.projectService.load();
    }

    getLinkStyle(path) {
        if (path === this.location.path()) {
            return true;
        }
        else if (path.length > 0) {
            return this.location.path().indexOf(path) > -1;
        }
    }
}


import {ProjectService} from './services/project-service.ts'

bootstrap(ShelfApp, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy}),
    ProjectService,
]);