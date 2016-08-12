import {Injectable} from '@angular/core';
import {Http} from '@angular/http';

@Injectable()
export class TeamService {
    private _teams = [];

    constructor(private http: Http) {
    }

    get teams(): Object[] {
        return this._teams;
    }

    set teams(projects: Object[]) {
        this._teams = projects;
    }

    public load() {
        this.http.get('/api/teams/')
            .subscribe(resp => this.teams = resp.json());
    }

    public reload() {
        //TODO: update only changed/added/removed.
        this.load();
    }

}
