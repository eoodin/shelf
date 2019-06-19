import {Injectable} from '@angular/core';
import {Subject, BehaviorSubject, Observable} from "rxjs";
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

import {PreferenceService} from "./preference.service";
import {TeamService} from "./team.service";
import {HttpService} from "./http.service";

export interface Plan {
}

@Injectable()
export class PlanService extends DataSource<Plan> {
    private _plans: BehaviorSubject<any> = new BehaviorSubject<any>([]);
    private _current: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private pref: PreferenceService,
                private http: HttpService,
                private teams: TeamService) {
        super();
        this._plans
            .subscribe(plans => this.planUpdated(plans));

        this.teams.ownTeam
            .subscribe(team => this.loadPlans(team));
    }

    connect(collectionViewer: CollectionViewer): Observable<Plan[]> {
        throw new Error("Method not implemented.");
    }
    disconnect(collectionViewer: CollectionViewer): void {
        throw new Error("Method not implemented.");
    }

    public all() {
        return this._plans.filter(ps => ps.length);
    }

    public get current() {
        return this._current.filter(v => v != null);
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
            .subscribe(plans => this._plans.next(plans));
    }

    private planUpdated(plans: any) {
        plans.sort((a, b) => {return b.end.localeCompare(a.end);});
        this.pref.values
            .map(prefs => prefs['lastSelectedPlan'])
            .subscribe(lsp => {
                var selectPlan = plans[0];
                for (var p of plans) {
                    if (p.id == lsp) {
                        selectPlan = p;
                        break;
                    }
                }

                if (this._current.getValue() != selectPlan) {
                    this._current.next(selectPlan);
                }
        });
    }
}
