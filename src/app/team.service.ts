import {Injectable} from "@angular/core";
import {Subject} from "rxjs";
import {UserService} from "./user.service";
import {HttpService} from "./http.service";

@Injectable()
export class TeamService {
    private _teams: Subject<any> = new Subject<any>();
    private _ownTeam: Subject<any> = new Subject<any>();

    constructor(private http: HttpService,
                private users: UserService
        ) {
        this.users.currentUser
            .filter(user => user && user.teams && user.teams.length)
            // TODO: there should be a good way to identify current team.
            .map(user => user.teams[0])
            .subscribe(team => this.updateTeam(team));
        this.load();
    }

    get ownTeam(): Subject<any> {
        return this._ownTeam;
    }

    get teams(): Subject<any> {
        return this._teams;
    }

    set teams(projects) {
        this._teams.next(projects);
    }

    public load() {
        this.http.get('/api/teams/')
            .subscribe(resp => this._teams.next(resp.json()));
    }

    public createTeam(name:string, scrumMaster:string, users:string) {
        let data = {name: name, scrumMaster: scrumMaster, users: users};
        this.http.post('/api/teams/', JSON.stringify(data))
            .subscribe(resp => this.load());
    }

    public deleteTeam(id:string) {
        this.http.delete('/api/teams/' + id)
            .subscribe(response => this.load());
    }
    
    private updateTeam(team) {
        if (team && team.id) {
            this.http.get('/api/team/' + team.id +'?members=1')
                .map(response => response.json())
                .subscribe(team => this._ownTeam.next(team));
        }
    }
}
