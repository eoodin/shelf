import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {Location} from '@angular/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {ProjectService} from './services/project-service';
import {PreferenceService} from './services/preference-service';
import {TeamService} from './services/team-service';
import {Projects} from './pages/projects';
import {Backlog} from './pages/backlog';
import {Plans} from './pages/plans';
import {WorkItems} from './pages/workitems';
import {AppService} from "./services/app-service";
import {UserService} from "./services/user-service";

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
                <li [class.active]="getLinkStyle('/backlog')"><a [routerLink]="['/Backlog']" class="link">Backlog</a></li>
                <li [class.active]="getLinkStyle('/plans')"><a [routerLink]="['/Plans']" class="link">Plans</a></li>
                <li [class.active]="getLinkStyle('/workitems')"><a [routerLink]="['/WorkItems']" class="link">Work Items</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">CI Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Promotion Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Reports</a></li>

                <li *ngIf="!projects.length"><a href="javascript:void(0);">No Project</a></li>
                <li *ngIf="projects.length" class="dropdown" dropdown keyboard-nav>
                    <a href="javascript:void(0);" class="dropdown-toggle" dropdownToggle>
                        <span *ngIf="project">{{project.name}}</span><span class="caret"></span>
                    </a>
                    <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
                      <li *ngFor="let p of projects" role="menuitem">
                        <a (click)="switchProject(p)">{{p.name}}</a>
                      </li>
                    </ul>
                 </li>
              </ul>
              <form class="navbar-form navbar-right">
                <div ><a href="javascript:void(0);" title="{{app.commit}} at {{app.update}}">{{app.version}}</a></div>
                <!-- TODO: show user name/user settings entry here
                <div class="form-group">
                  <input type="text" placeholder="Email" class="form-control">
                </div>
                <div class="form-group">
                  <input type="password" placeholder="Password" class="form-control">
                </div>
                <button type="submit" class="btn btn-success">Sign in</button>
                -->
              </form>
            </div><!--/.nav-collapse -->
          </div>
        </nav>

        <div class="container-fluid">
        <!--
            <alert [type]="'warning'" dismissible="true">
                <p>Notice: This tool is under development. Help us by submitting idea to "Shelf" project.</p>
            </alert>
          -->
            <router-outlet></router-outlet>
        </div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page { padding-top: 70px; }
    .nav-logo {width: 32px; height:32px;}
    `],
    directives: [/*Alert, */ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES],
    providers: [ProjectService, PreferenceService, TeamService, AppService, UserService]
})
// @RouterConfig([
//     {path: '/projects', component: Projects, name: 'Projects'},
//     {path: '/backlog', component: Backlog, name: 'Backlog'},
//     {path: '/plans', component: Plans, name: 'Plans'},
//     {path: '/workitems', component: WorkItems, name: 'WorkItems'}
// ])
export class ShelfAppComponent {
    private projects: any[];
    private project = null;
    private app = {};
    private ui;

    constructor(private router:Router,
                private location:Location,
                private prjs: ProjectService,
                private pfs: PreferenceService,
                private apps: AppService) {
        prjs.projects.subscribe(ps => this.projects = ps);
        prjs.current.subscribe(p => this.project = p);

        pfs.values.subscribe(() => this.prjs.load());
        apps.info.subscribe(app => this.app = app);

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

    switchProject(p) {
        this.prjs.setCurrent(p);
    }
}
