import {Component, OnInit} from '@angular/core';
import {HttpService} from "./http.service";
import {Http} from "@angular/http";
import {Location} from '@angular/common';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-login',
    template: `
    <div class="login-pannel">
        <form class="form-signin" #f="ngForm" (ngSubmit)="login(f.value)">
            <h2 class="form-signin-heading">Please sign in</h2>
            <div class="row">
                <input  name="username"  ngModel class="form-control" placeholder="ID" required autofocus>
            </div>
            <div class="row">
                <input type="password" name="password" ngModel class="form-control" placeholder="Password" required>
            </div>
            <!--
            <div class="checkbox">
                <label> <input type="checkbox" value="remember-me" name="remember"> Remember me </label>
            </div>
            -->
            <div class="row">
                <button class="btn btn-lg btn-primary btn-block" type="submit" [disabled]="proceeding">Sign in</button>
            </div>
        </form>
    </div>
  `,
    styles: [`
    .login-pannel {margin:0; padding:0;position: absolute; top:0; left:0;z-index:9999;width:100%;height:100%;background: white;}
    .form-signin { max-width: 330px;padding: 15px; margin: 0 auto;}
    .form-signin .form-control {width: 100%; font-size: 16px;}
    .form-signin .row {margin: 5px auto;}
    `]
})
export class LoginComponent {

    private goto;
    private proceeding;

    constructor(private http: HttpService,
                private router: Router,
                private route: ActivatedRoute,
                private rawHttp: Http) {
        route.params
            .filter(params => params['goto'])
            .subscribe(params => this.goto = params['goto']);
    }

    login(data) {
        this.proceeding = true;
        this.rawHttp.post('/passport/login', JSON.stringify(data))
            .subscribe(resp => {
                this.http.resume();
                this.router.navigate([this.goto ? this.goto : '/']);
            },
            err => {},
            () => {this.proceeding = false}
            );
    }
}
