import {Component} from '@angular/core';
import {PlanService} from '../plan.service';
import {TeamService} from '../team.service';

@Component({
    selector: 'plans',
    template: `
    <md-sidenav-container class="workspace">
       <md-sidenav #sidenav class="sidenav">
          <plan-list (select)="sidenav.close()"></plan-list>
       </md-sidenav>
        <div class="plan-content">
            <h3>
                <a (click)="sidenav.open()">{{current.name}}</a>
                <a class="add-sprint-button" (click)="showCreator = true"><span class="glyphicon glyphicon-plus"></span></a>
                <div class="team-switch">
                <form>
                    <md-select *ngIf="teams && teams.length" name="team">
                        <md-option *ngFor="let team of teams" [value]="team" (onSelect)="switchTeam(team)" >{{team.name}}</md-option>
                    </md-select>
                </form>
                </div>
            </h3>
            <router-outlet></router-outlet>
        </div>
    </md-sidenav-container>
    <plan-creator [(show)]="showCreator" ></plan-creator>
    `,
    styles: [`
    :host {width: 100%;}
    h3 > a {cursor: pointer;}
    .team-switch {float: right;}
    .workspace{height: 100%;}
    .sidenav {background: #fff; padding: 10px;}
    .add-sprint-button{font-size: 14px;}
    md-option {background-color: white;}
    .plan-content {padding: 0 10px 10px 10px;}
    `]
})
export class Plans {
    current;
    showCreator = false;
    teams = [];
    lastSelectTeamId;

    constructor(private planService: PlanService,
                private teamService: TeamService) {
        this.current = {};
        planService.current.subscribe(plan => this.current = plan);
        teamService.teams.subscribe(teams => this.setTeams(teams));
    }

    private setTeams(teams) {
        this.teams = teams;
        if (this.lastSelectTeamId) {
            //TODO
        }
    }

    private switchTeam(team) {
        this.planService.loadPlans(team);
    }
}