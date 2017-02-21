import { Component } from '@angular/core';
import { Router } from "@angular/router";
import {MdDialog, MdDialogRef} from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
import { ProjectService } from '../project.service';
import { PlanService } from '../plan.service';


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
                      <th> Owner </th>
                      <th> Operations </th>
                  </tr>
                  <tr *ngFor="let item of visibleItems()">
                      <td> {{item.id}} </td>
                      <td> {{item.status}} </td>
                      <td> {{item.severity}} </td>
                      <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                      <td *ngIf="item.owner"> {{item.owner.name}} </td>
                      <td *ngIf="!item.owner"> Unassigned </td>
                      <td>
                          <button 
                              *ngIf="item.status == 'Created'"
                              [disabled]="requesting"
                              (click)="startFix(item)"
                                class="btn btn-default btn-sm">Start Fix</button>
                          <button 
                              *ngIf="item.status == 'Fixed'"
                              [disabled]="requesting"
                              (click)="startTest(item)"
                              class="btn btn-default btn-sm">Start Test</button>
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
    .material-icons.button {cursor: pointer;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .type-and-id input { display: inline-block; }
  `]
})
export class ContentComponent {
    private items = [];
    private sort = {field: 'id', order: 'desc'};
    private requesting = false;
    private loading = false;

    private project;
    private hideClosed = true;

    constructor(
        public dialog: MdDialog,
        private router: Router,
        private http: HttpService,
        private defects: DefectService,
        private projectSerivce: ProjectService) {
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
        this.defects.load(search)
            .finally(() => this.loading = false)
            .subscribe(stories => this.items = stories);
    }

    visibleItems() {
        if (this.hideClosed) {
            return this.items.filter(item => item.status != 'Tested');
        }
        return this.items;
    }

    startFix(item) {
        let dialogRef = this.dialog.open(SelectPlanDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (!result) 
                return;

            this.requesting = true;
            this.http.post('/api/defects/' + item.id + '/fix', JSON.stringify({planId: result}))
                .finally(() => this.requesting = false)
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                });
        });

        
    }

    startTest(item) {
        this.requesting = true;
        this.http.post('/api/defects/' + item.id + '/test', '{}')
            .finally(() => this.requesting = false)
            .subscribe(
            () => this.loadItems(),
            () => window.alert('Error occurred.')
            );
    }

    private showItem(item) {
        this.router.navigate(['/defects/' + item.id]);
    }

    private filterChange(e) {
        this.loadItems();
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
