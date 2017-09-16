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
        <nav class="navbar">
            <a class="navbar-brand" href="javascript:void(0);"><img class="nav-logo" src="/app/images/icon-large.png"/></a>
            <a class="mat-button" [class.active]="getLinkStyle('/projects')" [routerLink]="['/projects']">Dashboard</a>
            <a class="mat-button" [class.active]="getLinkStyle('/backlog')" [routerLink]="['/backlog']">Backlog</a>
            <a class="mat-button" [class.active]="getLinkStyle('/plans')" [routerLink]="['/plans']">Plans</a>
            <a class="mat-button" [class.active]="getLinkStyle('/defects')" [routerLink]="['/defects']">Defects</a>
            <div class="flex-spacer"></div>
            <a class="mat-button" (click)="showAbout()">About</a>
            <a class="mat-button" (click)="logoutApp()" >Logout</a>
        </nav>

        <div class="workspace">
            <router-outlet></router-outlet>
        </div>
    </div>
`,
    styles: [`
    a:hover {cursor: pointer;}
    .app-page {padding-top: 50px; height: 100%;}
    .workspace {height: 100%; margin: 0; padding: 0; display:flex; flex-direction: column;}
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
