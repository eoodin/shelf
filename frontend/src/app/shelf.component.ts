import { Component, ViewContainerRef } from '@angular/core';
import { Router } from '@angular/router';
import { Http } from '@angular/http';
import { Location } from '@angular/common';
import { NotifyService } from './notify.service';
import { Observable } from 'rxjs/Rx';
import { LoginService } from './login.service';
import { ProjectService } from './project.service';
import { AppService } from './app.service';
import { UserService } from './user.service';
import { MdDialog, MdDialogRef } from '@angular/material';

@Component({
    selector: 'shelf-app',
    template: `
    <div class="navbar">
        <nav>
            <a class="brand" href="javascript:void(0);"><img class="nav-logo" src="/app/images/icon-large.png"/></a>
            <button md-button [class.active]="getLinkStyle('/backlog')" [routerLink]="['/backlog']">Backlog</button>
            <button md-button [class.active]="getLinkStyle('/plans')" [routerLink]="['/plans']">Plans</button>
            <button md-button [class.active]="getLinkStyle('/defects')" [routerLink]="['/defects']">Defects</button>
            <button md-button *ngIf="user.super"
                [class.active]="getLinkStyle('/admin')" [routerLink]="['/admin']">Admin</button>
            <div style="flex-grow: 1;"></div>
            <button md-button><a (click)="showAbout()">About</a></button>
            <button md-button><a (click)="logoutApp()" >Logout</a></button>
        </nav>
    </div>
    <div class="workspace">
        <router-outlet></router-outlet>
    </div>`,
    styles: [`
    :host {position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; flex-direction: column;}
    .navbar {box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
        position: relative; z-index: 10;}
    nav { display: flex; flex-wrap: wrap; align-items: center;padding: 8px 16px;}
    button.mat-button.active { background: #ddd; }
    .workspace {flex: 1 1 auto; display: flex; overflow: auto;}
    .brand {padding-right: 16px;}
    .nav-logo {width: 32px; height:32px;}
    `]
})
export class ShelfAppComponent {
    private viewContainerRef: ViewContainerRef;
    private app = {};
    private ui;
    user = {super: false};

    constructor(private dialog: MdDialog,
                private router: Router,
                private location: Location,
                private notify: NotifyService,
                private loginService: LoginService,
                public userService: UserService,
                rootView: ViewContainerRef) {
        this.viewContainerRef = rootView;
        Observable.interval(1000 * 60)
            .map(() => new Date())
            .filter(now => now.getMinutes() == 0)
            .filter(now => now.getHours() == 10 || now.getHours() == 17)
            .subscribe(() => this.notify.notify('Update task status', 'Please contentChange task status.'));
        userService.currentUser.subscribe(u => this.user = u);
    }

    getLinkStyle(path) {
        if (path === this.location.path()) {
            return true;
        } else if (path.length > 0) {
            return this.location.path().indexOf(path) > -1;
        }
    }

    logoutApp() {
        this.loginService.logout()
            .subscribe(status => this.router.navigate(['login']));
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
