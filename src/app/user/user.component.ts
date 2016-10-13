import {Component, OnInit} from "@angular/core";
import {HttpService} from "../http.service";

@Component({
    selector: 'app-user',
    templateUrl: './user.component.html',
    styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
    private users : {}[] = [];
    private sort = {};

    constructor(
        private http: HttpService
    ) {
    }

    ngOnInit() {
        this.load();
    }

    private load() {
        this.http.get('/api/users')
            .map(resp => resp.json())
            .subscribe(users => this.users = users);
    }

    sortResult(field) {}
}
