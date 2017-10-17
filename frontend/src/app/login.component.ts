import {Component, OnInit} from '@angular/core';
import {Http} from '@angular/http';
import {Location} from '@angular/common';
import {Router, ActivatedRoute} from '@angular/router';
import {UserService} from './user.service';
import {LoginService} from './login.service';

@Component({
    selector: 'app-login',
    template: `
    <div class="login-pannel">
        <form class="form-signin" #f="ngForm" (ngSubmit)="login(f.value)">
            <h2>Sign in</h2>
            <h3 *ngIf="failedMessage" class="fail-message">{{failedMessage}}</h3>
            <md-form-field>
                <input name="username" ngModel mdInput placeholder="ID" required autofocus>
            </md-form-field>
            <md-form-field>
                <input type="password" name="password" ngModel mdInput placeholder="Password" required>
            </md-form-field>
            <!--
            <div class="checkbox">
                <label> <input type="checkbox" value="remember-me" name="remember"> Remember me </label>
            </div>
            -->
            <div class="row">
                <button md-raised-button type="submit" [disabled]="!f.valid || proceeding">Sign in</button>
            </div>
        </form>
    </div>
  `,
    styles: [`
    .login-pannel {width: 100%;height:100%; position: absolute; top:0; left:0; z-index:9999; background-color: white;}
    .form-signin { max-width: 330px;padding: 15px; margin: 0 auto;}
    .form-signin .form-control {width: 100%; font-size: 16px;}
    .form-signin .row {margin: 5px auto;}
    .fail-message {font-size: 1.5 em; color: #A33;}
    `]
})
export class LoginComponent {
    proceeding;
    failedMessage;

    private goto;

    constructor(private router: Router,
                private route: ActivatedRoute,
                private users: UserService,
                private loginService: LoginService) {
        route.params.subscribe(params => this.goto = params['goto']);
    }

    login(data) {
        this.proceeding = true;
        this.loginService.login(data)
            .finally(() => { this.proceeding = false; })
            .map(resp => resp.json())
            .subscribe(r => {
                if (r.result == 'loggedin') {
                    this.router.navigate([(this.goto ? this.goto : '/')]);
                } else {
                    this.failedMessage = r.result;
                }
            },
            err => { this.failedMessage = err.text(); }
            );
    }
}
