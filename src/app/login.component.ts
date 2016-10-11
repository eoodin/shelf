import {Component, OnInit} from '@angular/core';
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
                    <md-input name="username" ngModel placeholder="ID"></md-input>
                </div>
                <div>
                    <md-input name="password" ngModel type="password" placeholder="Password"></md-input>
                </div>
                <div>
                    <button md-button>Login</button>
                </div>
            </form>
        </md-card>
    </div>
  `,
    styles: [`
    .login-form {width: 420px; margin: 100px auto;}
    `]
})
export class LoginComponent implements OnInit {

    private goto;

    constructor(private http: HttpService,
                private router: Router,
                private route: ActivatedRoute,
                private rawHttp: Http) {
        route.params
            .filter(params => params['goto'])
            .subscribe(params => {console.log('Login page', params['goto']); this.goto = params['goto']; });
    }

    ngOnInit() {
    }

    login(data) {
        this.rawHttp.post('/passport/login', JSON.stringify(data))
            .subscribe(resp => {
                this.http.resume();
                this.router.navigate([this.goto]);
            });
    }
}
