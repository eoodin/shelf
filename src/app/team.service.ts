import {Injectable} from "@angular/core";
import {Http} from "@angular/http";
import {BehaviorSubject} from "rxjs";
import {UserService} from "./user.service";

@Injectable()
export class TeamService {
    private _teams: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private _ownTeam: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private http: Http,
                private users: UserService
        ) {
        this.users.currentUser
            .filter(user => user && user.teams)
            .map(user => user.teams[0])
            .subscribe(team => this._ownTeam.next(team));
        this.load();
    }

    get ownTeam(): BehaviorSubject<any> {
        return this._ownTeam;
    }

    get teams(): BehaviorSubject<any> {
        return this._teams;
    }

    set teams(projects) {
        this._teams.next(projects);
    }

    public load() {
        this.http.get('/api/teams/')
            .subscribe(resp => this._teams.next(resp.json()));
    }
}
