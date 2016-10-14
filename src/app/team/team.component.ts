import { Component, OnInit } from '@angular/core';
import {HttpService} from "../http.service";

@Component({
  selector: 'app-team',
  templateUrl: './team.component.html',
  styleUrls: ['./team.component.css']
})
export class TeamComponent implements OnInit {
    private teams : {}[] = [];
    private sort = {};

    constructor(
        private http: HttpService
    ) {
    }

    ngOnInit() {
        this.load();
    }

    private load() {
        this.http.get('/api/teams')
            .map(resp => resp.json())
            .subscribe(teams => this.teams = teams);
    }

    sortResult(field) {}
}
