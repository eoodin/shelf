import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {PreferenceService} from "./preference.service";
import {TeamService} from "./team.service";
import {HttpService} from "./http.service";

@Injectable()
export class PlanService {

    private _plans: BehaviorSubject<any> = new BehaviorSubject<any>(null);
    private _current: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private pref: PreferenceService,
                private http: HttpService,
                private teams: TeamService) {
        this._plans
            .filter(plans => plans && plans.length)
            .subscribe(plans => this.planUpdated(plans));

        this.teams.ownTeam
            .filter(team => team)
            .subscribe(team => this.loadPlans(team));
    }

    public all(): BehaviorSubject<any> {
        return this._plans;
    }

    public current(): BehaviorSubject<any> {
        return this._current;
    }

    public setCurrent(plan) {
        this._current.next(plan);
    }

    public createPlan(data) {
        this.http.post('/api/plans', JSON.stringify(data))
            .subscribe(resp => {
                this.teams.ownTeam.subscribe(team => this.loadPlans(team));
            });
    }

    public loadPlans(team: any) {
        this.http.get('/api/plans/?team=' + team.id)
            .map(resp => resp.json())
            .subscribe(plans => this._plans.next(plans));
    }

    private planUpdated(plans: any) {
        plans.sort((a, b) => {return b.end.localeCompare(a.end);});
        this.pref.values
            .filter(prefs => prefs['lastSelectedPlan'])
            .map(prefs => prefs['lastSelectedPlan'])
            .subscribe(lsp => {
            var selectPlan = plans[0];
            for (var p of plans) {
                if (p.id == lsp) {
                    selectPlan = p;
                    break;
                }
            }

            this._current.next(selectPlan);
        });
    }
}