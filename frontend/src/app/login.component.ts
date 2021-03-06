import {Component} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import {UserService} from './user.service';
import {LoginService} from './login.service';
import {finalize} from 'rxjs/operators';

@Component({
    selector: 'app-login',
    template: `
    <div class="login-pannel">
        <form class="form-signin" #f="ngForm" (ngSubmit)="login(f.value)">
            <h2>Sign in</h2>
            <section class="row fail-message">{{failedMessage}}</section>
            <mat-form-field>
                <input name="username" ngModel matInput placeholder="ID" required autofocus>
            </mat-form-field>
            <mat-form-field>
                <input type="password" name="password" ngModel matInput placeholder="Password" required>
            </mat-form-field>
            <!--
            <div class="checkbox">
                <label> <input type="checkbox" value="remember-me" name="remember"> Remember me </label>
            </div>
            -->
            <div class="row">
                <button mat-raised-button type="submit" [disabled]="!f.valid || proceeding">Sign in</button>
            </div>
        </form>
    </div>
  `,
    styles: [`
    .login-pannel {width: 100%;height:100%; position: absolute; top:0; left:0; z-index:9999; background-color: white;}
    .form-signin { max-width: 330px;padding: 15px; margin: 0 auto;}
    .form-signin .form-control {width: 100%; font-size: 16px;}
    .form-signin .row {margin: 5px auto;}
    .fail-message {font-weight: bold; color: #A33;}
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
        route.queryParamMap.subscribe(map => this.goto = map.get('goto'));
    }

    login(data) {
        this.proceeding = true;
        this.loginService.login(data)
            .pipe(finalize(() => { this.proceeding = false; }))
            .subscribe(r => {
                if (r.result === 'loggedin') {
                    this.router.navigate([(this.goto ? this.goto : '/')]);
                } else {
                    this.failedMessage = r.result;
                }
            },
            err => { this.failedMessage = err.error.error; console.log('error', err.error.error); }
            );
    }
}
