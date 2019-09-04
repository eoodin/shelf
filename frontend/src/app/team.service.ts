import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {UserService} from './user.service';
import {HttpService} from './http.service';
import {filter, map} from 'rxjs/operators';

@Injectable()
export class TeamService {
    private _teams: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private _ownTeam: BehaviorSubject<any> = new BehaviorSubject<any>({});

    constructor(private http: HttpService,
                private users: UserService
        ) {
        // TODO: there should be a good way to identify current team.
        this.users.currentUser.pipe(
            filter(user => user && user.teams && user.teams.length),
            map(user => user.teams[0])
            ).subscribe(team => this.updateTeam(team));
        this.load();
    }

    get ownTeam() {
        return this._ownTeam.pipe(filter(t => t.id));
    }

    get teams() {
        return this._teams.pipe(filter(ts => ts.length));
    }

    set teams(projects) {
        this._teams.next(projects);
    }

    public load() {
        this.http.get('/api/teams/')
            .subscribe(resp => this._teams.next(resp));
    }

    public createTeam(name: string, scrumMaster: string, users: string) {
        const data = {name, scrumMaster, users};
        this.http.post('/api/teams/', JSON.stringify(data))
            .subscribe(resp => this.load());
    }

    public deleteTeam(id: string) {
        this.http.delete('/api/teams/' + id)
            .subscribe(response => this.load());
    }

    private updateTeam(team) {
        if (team && team.id) {
            this.http.get('/api/team/' + team.id + '?members=1')
                .subscribe(t => this._ownTeam.next(t));
        }
    }
}
