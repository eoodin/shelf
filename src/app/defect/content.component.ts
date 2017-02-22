import { Component } from '@angular/core';
import { Router } from "@angular/router";
import {MdDialog, MdDialogRef} from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
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
                      <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                      <td *ngIf="item.owner"> {{item.owner.name}} </td>
                      <td *ngIf="!item.owner"> Unassigned </td>
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
   .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
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
export class ContentComponent {
    private items = [];
    private sort = {field: 'id', order: 'desc'};
    private loading = false;
    private user;

    private project;
    private hideClosed = true;
    private hideDeclined = true;
    private onlyOwned = false;

    constructor(
        public dialog: MdDialog,
        private router: Router,
        private http: HttpService,
        private defects: DefectService,
        private userService: UserService,
        private projectSerivce: ProjectService) {

        this.userService.currentUser.subscribe(u => this.user = u);
        this.projectSerivce.current
            .do(p => this.project = p)
            .subscribe(() => this.loadItems());
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

        this.defects.load(search)
            .finally(() => this.loading = false)
            .subscribe(stories => this.items = stories);
    }

    private settableStatus(item) {
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
            this.http.post('/api/defect/' + item.id + '/fix', JSON.stringify({planId: result}))
                .finally(() => this.loading = false)
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                });
        });
    }

    startTest(item) {
        let dialogRef = this.dialog.open(SelectPlanDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (!result) 
                return;

            this.loading = true;
            this.http.post('/api/defect/' + item.id + '/test', JSON.stringify({planId: result}))
                .finally(() => this.loading = false)
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                });
        });
    }

    private showItem(item) {
        this.router.navigate(['/defects/' + item.id]);
    }

    private filterChange(e) {
        this.loadItems();
    }

    private changeStatus(item, status) {
        if (item.status == status) return;
        this.defects.save(item.id, {status: status})
            .subscribe(() => this.loadItems());
    }

    private sortResult(field) {
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
    private plan = {};

    constructor(
        public dialogRef: MdDialogRef<SelectPlanDialog>,
        private plans: PlanService) {
        this.plans.current()
            .filter(plan => plan)
            .subscribe(p => this.plan = p);
    }
}
