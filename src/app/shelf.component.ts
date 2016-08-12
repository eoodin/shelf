import {Component} from '@angular/core';
import {ROUTER_DIRECTIVES, Router} from '@angular/router';
import {Location} from '@angular/common';
import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {ProjectService} from './services/project-service';
import {PreferenceService} from './services/preference-service';
import {TeamService} from './services/team-service';
import {AppService} from "./services/app-service";
import {UserService} from "./services/user-service";
import {NotifyService} from "./notify.service";

import {Observable} from 'rxjs/Rx';

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
                <li [class.active]="getLinkStyle('/projects')"><a [routerLink]="['/projects']" class="link">Dashboard</a></li>
                <li [class.active]="getLinkStyle('/backlog')"><a [routerLink]="['/backlog']" class="link">Backlog</a></li>
                <li [class.active]="getLinkStyle('/plans')"><a [routerLink]="['/plans']" class="link">Plans</a></li>
                <!--
                <li [class.active]="getLinkStyle('/workitems')"><a [routerLink]="['/items']" class="link">Work Items</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">CI Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Promotion Status</a></li>
                <li [class.active]="getLinkStyle('/my-task')"><a href="javascript:void(0);" class="link">Reports</a></li>
                -->
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
              <ul class="nav navbar-nav navbar-right">
                <li [class.active]="getLinkStyle('/settings')"><a [routerLink]="['/settings']">Settings</a></li>
                <li><a href="javascript:void(0);" title="{{app.version}}({{app.commit}} at {{app.update}})">About</a></li>
              </ul>
            </div><!--/.nav-collapse -->
          </div>
        </nav>

        <div class="container-fluid">
            <router-outlet></router-outlet>
        </div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page { padding-top: 70px; }
    .nav-logo {width: 32px; height:32px;}
    `],
    directives: [ROUTER_DIRECTIVES, DROPDOWN_DIRECTIVES],
    providers: [ProjectService, PreferenceService, TeamService, AppService, UserService]
})
export class ShelfAppComponent {
    private projects: any[];
    private project = null;
    private app = {};
    private ui;

    constructor(private router: Router,
                private location: Location,
                private prjs: ProjectService,
                private notify: NotifyService,
                private apps: AppService) {
        prjs.projects.subscribe(ps => this.projects = ps);
        prjs.current.subscribe(p => this.project = p);
        apps.info.subscribe(app => this.app = app);
        prjs.load();
        this.ui = {"nav": {"projectList": {"show": false}}};

        Observable.interval(1000 * 60)
            .map(() => new Date())
            .filter(now => now.getMinutes() == 0)
            .filter(now => now.getHours() == 10 || now.getHours() == 17)
            .subscribe(() => this.notify.notify('Update task status', 'Please update task status.'));
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

