import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import {MdDialog, MdDialogRef} from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
import { TeamService } from '../team.service';
import { ProjectService } from '../project.service';
import { PlanService } from '../plan.service';
import { UserService } from '../user.service'

@Component({
  selector: 'app-content',
  template: `
  <div class="plan-body">
      <div class="item-table">
          <div class="loading-mask" *ngIf="loading">
              <div class="spinner-loader"></div>
          </div>
          <div class="panel panel-default">
              <div class="panel-heading work-items-heading">
                <div class="heading-left">
                    <span >Total:</span><span class="value"> {{summary.total}}</span>
                    <span >Closed/Declined:</span><span class="value"> {{summary.closed + summary.declined}}</span>
                    <span >Open/Failed:</span><span class="value"> {{summary.open + summary.failed}}</span>
                    <span >Fixing/Testing:</span><span class="value"> {{summary.fixing + summary.testing}}</span>
                </div>
                <div class="heding-right">
                    <md-checkbox [(ngModel)]="hideClosed" (change)="filterChange($event)">Hide Closed</md-checkbox>
                    <md-checkbox [(ngModel)]="hideDeclined" (change)="filterChange($event)">Hide Declined</md-checkbox>
                    <md-checkbox [(ngModel)]="onlyOwned" (change)="filterChange($event)">Mine Only</md-checkbox>
                </div>
              </div>
              <table *ngIf="items" class="table">
                  <tr>
                      <th> ID </th>
                      <th>
                      <a (click)="sortResult('status')"> Status
                            <span *ngIf="sort.field=='status'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a>
                      </th>
                      <th> 
                        <a (click)="sortResult('severity')">Severity
                            <span *ngIf="sort.field=='severity'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a>
                      </th>
                      <th> 
                        <a (click)="sortResult('title')">Title
                            <span *ngIf="sort.field=='title'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a>
                      </th>
                      <th> <a (click)="sortResult('creator')">Reporter
                            <span *ngIf="sort.field=='creator'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a> 
                      </th>
                      <th> <a (click)="sortResult('createdAt')">Report Date
                            <span *ngIf="sort.field=='createdAt'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a> 
                      </th>
                      <th> <a (click)="sortResult('owner')">Owner
                            <span *ngIf="sort.field=='owner'">
                                <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                            </span>
                        </a> 
                      </th>
                      <th> Operations </th>
                  </tr>
                  <tr *ngFor="let item of items">
                      <td> {{item.id}} </td>
                      <td class="changeable">
                        <button md-button [mdMenuTriggerFor]="statusMenu">{{item.status}}</button>
                            <md-menu #statusMenu="mdMenu">
                            <button *ngFor="let st of settableStatus(item)" (click)="changeStatus(item, st)"  md-menu-item>{{st}}</button>
                        </md-menu>
                      </td>
                      <td> {{item.severity}} </td>
                      <td><a [routerLink]="['.', item.id]"> {{item.title}} </a></td>
                      <td><span *ngIf="item.creator">{{item.creator.name}}</span></td>
                      <td><span> {{item.createdAt | date: 'y-MM-dd'}} </span> </td>
                      <td class="changeable">
                        <button *ngIf="item.owner" md-button [mdMenuTriggerFor]="candidates">{{item.owner.name}}</button>
                        <button *ngIf="!item.owner" md-button [mdMenuTriggerFor]="candidates"> Unassigned </button>
                        <md-menu #candidates="mdMenu">
                            <button *ngFor="let member of members" (click)="assignTo(item, member)" md-menu-item>{{ member.name }}</button>
                            <button *ngIf="item.owner" md-menu-item>Unassigned</button>
                        </md-menu>
                      </td>
                      <td class="changeable">
                        <a *ngIf="item.status == 'Open'" (click)="startFix(item)"  md-button>Start Fix</a>
                        <a *ngIf="item.status == 'Fixed'" (click)="startTest(item)"  md-button>Start Test</a>
                      </td>
                  </tr>
              </table>
          </div>
      </div>
  </div>
  `,
    styles: [`
   .work-items-heading > .heading-left {float: left}
   .work-items-heading > .heding-right{float:right;}
    .work-items-heading { height: 38px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    .heading-left .value {font-weight: bold;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table{position:relative;}
    td.changeable button, td.changeable a {line-height: 1.4em;}
    .material-icons.button {cursor: pointer;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .type-and-id input { display: inline-block; }
  `]
})
export class ContentComponent implements OnInit, OnDestroy {
    total = 0;
    items = [];
    sort = {field: 'id', order: 'desc'};
    loading = false;
    user;
    members = [];
    summary = {total: 0, open: 0, closed: 0, declined: 0, failed: 0, fixing: 0, testing: 0};

    project;
    hideClosed = true;
    hideDeclined = true;
    onlyOwned = false;

    psubscription;

    constructor(
        public dialog: MdDialog,
        private router: Router,
        private http: HttpService,
        private teams: TeamService,
        private defects: DefectService,
        private userService: UserService,
        private projectSerivce: ProjectService) {
        this.teams.ownTeam.subscribe(t => this.members = t.members);
    }

    ngOnInit(): void {
        this.userService.currentUser.subscribe(u => this.user = u);
        this.psubscription = this.projectSerivce.current
            .filter(p => p && p.id)
            .do(p => this.project = p)
            .subscribe(() => this.loadItems());
    }

    ngOnDestroy(): void {
        this.psubscription.unsubscribe();
    }

    loadItems() {
        this.loading = true;
        let search = {};
        if (this.project) search['project'] = this.project.id;
        if (this.sort['field']) {
            search['sortBy'] = this.sort.field;
            if (this.sort.order == 'desc') 
                search['desc'] = 'true';
        }
        if (this.hideClosed) search['noclosed'] = 'true';
        if (this.onlyOwned) search['ownonly'] = 'true';        
        if (this.hideDeclined) search['nodeclined'] = 'true';

        this.defects.summary({project: search['project']})
            .subscribe(s => this.summary = s);
        this.defects.load(search)
            .subscribe(result => {this.items = result.rows; this.total = result.count;},
                 err => {},
                 () => this.loading = false);
    }

    settableStatus(item) {
        let allStatus = ['Open', 'Declined', 'Fixing', 'Fixed', 'Testing', 'Failed', 'Closed'];
        let i = allStatus.indexOf(item.status);

        // Make reopen possible
        if (item.status == 'Declined' || item.status == 'Failed' || item.status == 'Closed')
            return ['Open'];

        return allStatus.splice(i + 1, 2);
    }

    startFix(item) {
        let dialogRef = this.dialog.open(SelectPlanDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (!result) 
                return;

            this.loading = true;
            this.http.post('/api/defects/' + item.id + '/fix', JSON.stringify({planId: result}))
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                },
                () => this.loading = false);
        });
    }

    assignTo(item, member) {
        this.loading = true;
        var change = { 'ownerId': member ? member.id : null };
        this.defects.save(item.id, change)
            .finally(() => this.loading = false)
            .subscribe(resp => this.loadItems());
    }
    
    startTest(item) {
        let dialogRef = this.dialog.open(SelectPlanDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (!result) 
                return;

            this.loading = true;
            this.http.post('/api/defects/' + item.id + '/test', JSON.stringify({planId: result}))
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                },
                () => this.loading = false);
        });
    }

    filterChange(e) {
        this.loadItems();
    }

    changeStatus(item, status) {
        if (item.status == status) return;
        this.defects.save(item.id, {status: status})
            .subscribe(() => this.loadItems());
    }

    sortResult(field) {
        if (field == this.sort.field)
            this.sort.order = this.sort.order == 'desc' ? 'asc' : 'desc';
        else
            this.sort.order = 'asc';

        this.sort.field = field;
        this.loadItems();
    }
}

@Component({
    selector: 'select-plan-dialog',
    template: `
    <h1 md-dialog-title>Create Task</h1>
    <div md-dialog-content>
        You are about to create a task in following plan:
        <div>{{plan.name}}</div>
    </div>
    <div md-dialog-actions>
    <button md-button (click)="dialogRef.close(plan.id)">OK</button>
    <button md-button (click)="dialogRef.close(null)">Cancel</button>
    </div>
    `
})
export class SelectPlanDialog {
    plan;
    constructor(
        public dialogRef: MdDialogRef<SelectPlanDialog>,
        private plans: PlanService) {
        this.plans.current
            .filter(plan => plan)
            .subscribe(p => this.plan = p);
    }
}
