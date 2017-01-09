import {Component, ViewContainerRef} from "@angular/core";
import {Router} from "@angular/router";
import {Http} from "@angular/http";
import {Location} from "@angular/common";
import {NotifyService} from "./notify.service";
import {Observable} from "rxjs/Rx";
import {HttpService} from "./http.service";
import {ProjectService} from "./project.service";
import {AppService} from "./app.service";

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
              </ul>
              <ul class="nav navbar-nav navbar-right">
                <li [class.active]="getLinkStyle('/settings')"><a [routerLink]="['/settings']">Settings</a></li>
                <li><a href="javascript:void(0);" title="{{app.version}}({{app.commit}} at {{app.update}})">About</a></li>
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
    .workspace {height: 100%; margin: 0;}
    .nav-logo {width: 32px; height:32px;}
    `]
})
export class ShelfAppComponent {
    private viewContainerRef: ViewContainerRef;
    private app = {};
    private ui;

    constructor(private router: Router,
                private location: Location,
                private prjs: ProjectService,
                private notify: NotifyService,
                private rawHttp: Http,
                private http: HttpService,
                private apps: AppService,
                rootView: ViewContainerRef) {
        this.viewContainerRef = rootView;
        http.authFail()
            .filter(failed => failed)
            .subscribe(() => {
                this.router.navigate(['/login', {goto: router.url}]);
            });
        http.authFail()
            .filter(failed => !failed)
            .subscribe( _ => prjs.load());

        apps.info.subscribe(app => this.app = app);

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
        this.rawHttp.get('/passport/logout')
            .map(resp => resp.json())
            .subscribe(
                status => this.router.navigate(['/login']),
                err => {alert("Logout error!")}
            );
    }
}
