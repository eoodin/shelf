import {Component, provide} from 'angular2/core';
import {bootstrap} from 'angular2/platform/browser';
import {HTTP_PROVIDERS} from 'angular2/http';
import {Location, LocationStrategy, HashLocationStrategy} from 'angular2/platform/common';
import {ROUTER_DIRECTIVES, ROUTER_PROVIDERS, RouteConfig, Route, Router} from 'angular2/router';

import {Alert, DROPDOWN_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';

import {ProjectService} from './services/project-service.ts';
import {PreferenceService} from './services/preference-service.ts';
import {TeamService} from './services/team-service.ts';
import {Projects} from './pages/projects.ts';
import {Plans} from './pages/plans.ts';
import {WorkItems} from './pages/workitems.ts';

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
              <a class="navbar-brand" href="javascript:void(0);"><img class="nav-logo" src="/app/images/icon-large.png"/></a>
            </div>
            <div class="collapse navbar-collapse">
              <ul class="nav navbar-nav">
                <li [class.active]="getLinkStyle('/projects')"><a [routerLink]="['/Projects']" class="link">Dashboard</a></li>
                <li [class.active]="getLinkStyle('/plans')"><a [routerLink]="['/Plans']" class="link">Plans</a></li>
                <li [class.active]="getLinkStyle('/workitems')"><a [routerLink]="['/WorkItems']" class="link">Work Items</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">CI Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Promotion Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Reports</a></li>

                <li class="dropdown" dropdown keyboard-nav>
                    <a href="javascript:void(0);" class="dropdown-toggle" dropdownToggle>
                        <span *ngIf="projectService.current">{{projectService.current.name}}</span>
                        <span *ngIf="!projectService.current">No Project </span><span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
                      <li *ngFor="let p of projectService.projects" role="menuitem">
                        <a (click)="projectService.current=p;">{{p.name}}</a>
                      </li>
                    </ul>
                 </li>
              </ul>
<!-- TODO: show user name/user settings entry here
              <form class="navbar-form navbar-right">
                <div class="form-group">
                  <input type="text" placeholder="Email" class="form-control">
                </div>
                <div class="form-group">
                  <input type="password" placeholder="Password" class="form-control">
                </div>
                <button type="submit" class="btn btn-success">Sign in</button>
              </form>
              -->
            </div><!--/.nav-collapse -->
          </div>
        </nav>

        <div class="container-fluid">
            <alert [type]="'warning'" dismissible="true">
                <p>Notice: This tool is under development.</p>
            </alert>
            <router-outlet></router-outlet>
        </div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page { padding-top: 70px; }
    .nav-logo {width: 32px; height:32px;}
    `],
    directives: [Alert, ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES],
    providers: [ProjectService, PreferenceService, TeamService]
})
@RouteConfig([
    {path: '/projects', component: Projects, name: 'Projects'},
    {path: '/plans', component: Plans, name: 'Plans'},
    {path: '/workitems', component: WorkItems, name: 'WorkItems'}
])
export class ShelfApp {
    router:Router;
    location:Location;
    private projectService : ProjectService;
    private prefService : PreferenceService;
    private ui;

    constructor(router:Router, location:Location, projectService: ProjectService, pfs: PreferenceService) {
        this.router = router;
        this.location = location;
        this.prefService = pfs;
        this.projectService = projectService;
        this.prefService.load().subscribe( () => this.projectService.load() );

        this.ui = {"nav" : {"projectList" : {"show": false}}};
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

bootstrap(ShelfApp, [
    ROUTER_PROVIDERS,
    HTTP_PROVIDERS,
    provide(LocationStrategy, {useClass: HashLocationStrategy})
]);