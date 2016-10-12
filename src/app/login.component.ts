import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpService} from "./http.service";
import {Http} from "@angular/http";
import {Location} from '@angular/common';
import {Router, ActivatedRoute} from "@angular/router";

@Component({
    selector: 'app-login',
    template: `
    <div class="login-pannel">
        <md-card class="login-form">
            <form #loginForm="ngForm" (ngSubmit)="login(loginForm.value)">
                <div>
                    <md-input #username name="username" ngModel placeholder="ID"></md-input>
                </div>
                <div>
                    <md-input name="password" ngModel type="password" placeholder="Password"></md-input>
                </div>
                <div class="buttons">
                    <button md-button>Login</button>
                </div>
            </form>
        </md-card>
    </div>
  `,
    styles: [`
    .login-pannel {margin:0; padding:0;position: absolute; top:0; left:0;z-index:9999;width:100%;height:100%;background:#88B;}
    .login-form {width: 420px; margin: 100px auto; background-color: white;}
    .login-form md-input {width: 100%;}
    .login-form .buttons { text-align: right; }
    `]
})
export class LoginComponent implements OnInit {

    private goto;

    @ViewChild("username")
    private userNameInput;

    constructor(private http: HttpService,
                private router: Router,
                private route: ActivatedRoute,
                private rawHttp: Http) {
        route.params
            .filter(params => params['goto'])
            .subscribe(params => {console.log('Login page', params['goto']); this.goto = params['goto']; });
    }

    ngOnInit() {
        this.userNameInput.focus();
    }

    login(data) {
        this.rawHttp.post('/passport/login', JSON.stringify(data))
            .subscribe(resp => {
                this.http.resume();
                this.router.navigate([this.goto ? this.goto : '/']);
            });
    }
}
