import {Component, ViewContainerRef} from '@angular/core';
import {Router} from '@angular/router';
import {Location} from '@angular/common';
import {NotifyService} from './notify.service';
import {LoginService} from './login.service';
import {AppService} from './app.service';
import {UserService} from './user.service';
import {MatDialog, MatDialogRef} from '@angular/material';
import {interval} from 'rxjs';
import {filter, map} from 'rxjs/operators';

@Component({
    selector: 'shelf-app',
    template: `
    <div class="navbar">
        <nav>
            <a class="brand" href="javascript:void(0);"><img class="nav-logo" src="assets/images/icon-large.png" alt="logo"/></a>
            <button mat-button [class.active]="getLinkStyle('/backlog')" [routerLink]="['/backlog']">Backlog</button>
            <button mat-button [class.active]="getLinkStyle('/plans')" [routerLink]="['/plans']">Plans</button>
            <button mat-button [class.active]="getLinkStyle('/defects')" [routerLink]="['/defects']">Defects</button>
            <button mat-button *ngIf="user.super"
                [class.active]="getLinkStyle('/admin')" [routerLink]="['/admin']">Admin</button>
            <div style="flex-grow: 1;"></div>
            <button mat-button><a (click)="showAbout()">About</a></button>
            <button mat-button><a (click)="logoutApp()" >Logout</a></button>
        </nav>
    </div>
    <div class="workspace">
        <router-outlet></router-outlet>
    </div>`,
    styles: [`
    :host {position: absolute; top: 0; bottom: 0; left: 0; right: 0; display: flex; flex-direction: column;}
    .navbar {box-shadow: 0 3px 5px -1px rgba(0,0,0,.2), 0 6px 10px 0 rgba(0,0,0,.14), 0 1px 18px 0 rgba(0,0,0,.12);
        position: relative; z-index: 10;}
    nav { display: flex; flex-wrap: wrap; align-items: center;padding: 5px 16px;}
    button.mat-button.active { background: #ddd; }
    .workspace {flex: 1 1 auto; display: flex; overflow: auto;}
    .brand {padding-right: 16px;}
    .nav-logo {width: 32px; height:32px;}
    `]
})
export class ShelfAppComponent {
    user = {super: false};

    constructor(private dialog: MatDialog,
                private router: Router,
                private location: Location,
                private notify: NotifyService,
                private loginService: LoginService,
                private userService: UserService) {
        interval(1000 * 60)
            .pipe(map(() => new Date()))
            .pipe(filter(now => now.getMinutes() === 0))
            .pipe(filter(now => now.getHours() === 10 || now.getHours() === 17))
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
    <h1 mat-dialog-title>About Shelf</h1>
    <div mat-dialog-content>
        <div>Release channel: {{info.branch}}</div>
        <div>Last commit: </div>
        <div><pre>{{info.commit}}</pre></div>
    </div>
    <div mat-dialog-actions>
        <button mat-button (click)="dialogRef.close()">OK</button>
    </div>
    `
})
export class AboutDialog {
    info;
    constructor(
        public dialogRef: MatDialogRef<AboutDialog>,
        private apps: AppService) {
       this.apps.info.subscribe(info => this.info = info);
    }
}
