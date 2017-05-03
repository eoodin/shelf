import {Component, ViewContainerRef} from "@angular/core";
import {Router} from "@angular/router";
import {Http} from "@angular/http";
import {Location} from "@angular/common";
import {NotifyService} from "./notify.service";
import {Observable} from "rxjs/Rx";
import {LoginService} from "./login.service";
import {ProjectService} from "./project.service";
import {AppService} from "./app.service";
import {MdDialog, MdDialogRef} from '@angular/material';

@Component({
    selector: '[shelf-app]',
    template: `
    <div class="app-page">
        <nav class="navbar navbar-default navbar-fixed-top">
          <div class="container-fluid ">
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
                <li [class.active]="getLinkStyle('/defects')"><a [routerLink]="['/defects']" class="link">Defects</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                <li [class.active]="getLinkStyle('/settings')"><a [routerLink]="['/settings']">Settings</a></li>
                <li><a (click)="showAbout()">About</a></li>
                <li><a (click)="logoutApp()" >Logout</a></li>
              </ul>
            </div><!--/.nav-collapse -->
          </div>
        </nav>

        <div class="container-fluid workspace">
            <router-outlet></router-outlet>
        </div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page {padding-top: 50px; height: 100%;}
    .workspace {height: 100%; margin: 0; padding: 0;}
    .nav-logo {width: 32px; height:32px;}
    `]
})
export class ShelfAppComponent {
    private viewContainerRef: ViewContainerRef;
    private app = {};
    private ui;

    constructor(private dialog: MdDialog,
                private router: Router,
                private location: Location,
                private notify: NotifyService,
                private loginService: LoginService,
                rootView: ViewContainerRef) {
        this.viewContainerRef = rootView;
        Observable.interval(1000 * 60)
            .map(() => new Date())
            .filter(now => now.getMinutes() == 0)
            .filter(now => now.getHours() == 10 || now.getHours() == 17)
            .subscribe(() => this.notify.notify('Update task status', 'Please contentChange task status.'));
    }

    getLinkStyle(path) {
        if (path === this.location.path()) {
            return true;
        }
        else if (path.length > 0) {
            return this.location.path().indexOf(path) > -1;
        }
    }

    logoutApp() {
        this.loginService.logout()
            .subscribe(status => this.router.navigate(['/login']));
    }

    showAbout() {
        this.dialog.open(AboutDialog);
    }
}


@Component({
    selector: 'shelf-about-dialog',
    template: `
    <h1 md-dialog-title>About Shelf</h1>
    <div md-dialog-content>
        <div>Release channel: {{info.branch}}</div>
        <div>Last commit: </div>
        <div><pre>{{info.commit}}</pre></div>
    </div>
    <div md-dialog-actions>
        <button md-button (click)="dialogRef.close()">OK</button>
    </div>
    `
})
export class AboutDialog {
    info;
    constructor(
        public dialogRef: MdDialogRef<AboutDialog>,
        private apps: AppService) {
       this.apps.info.subscribe(info => this.info = info);
    }
}
