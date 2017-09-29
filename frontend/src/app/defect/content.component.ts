import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef, MdSort } from '@angular/material';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';
import { TeamService } from '../team.service';
import { ProjectService } from '../project.service';
import { PlanService } from '../plan.service';
import { UserService } from '../user.service';

@Component({
  selector: 'defect-content',
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
            <md-table #table [dataSource]="defects" mdSort>
                <ng-container mdColumnDef="id">
                    <md-header-cell *mdHeaderCellDef md-sort-header> ID </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.id}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="status">
                    <md-header-cell *mdHeaderCellDef md-sort-header> Status </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <a [mdMenuTriggerFor]="statusSel">{{element.status}}</a>
                        <md-menu #statusSel="mdMenu">
                            <button *ngFor="let st of settableStatus(element)"
                            (click)="changeStatus(element, st)"  md-menu-item>{{st}}</button>
                        </md-menu>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="severity">
                    <md-header-cell *mdHeaderCellDef md-sort-header> Severity </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.severity}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="title">
                    <md-header-cell *mdHeaderCellDef> Title </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <a [routerLink]="['.', element.id]" title="{{element.title}}" > {{element.title}} </a>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="owner">
                    <md-header-cell *mdHeaderCellDef md-sort-header> Owner </md-header-cell>
                    <md-cell *mdCellDef="let element">
                     <a *ngIf="element.owner" [mdMenuTriggerFor]="ownerSel"> {{element.owner.name}} </a>
                     <a *ngIf="!element.owner" [mdMenuTriggerFor]="ownerSel"> Unassigned </a>
                     <md-menu #ownerSel="mdMenu">
                         <button *ngFor="let member of members"
                            (click)="assignTo(element, member)"  md-menu-item>{{member.name}}</button>
                         <button *ngIf="element.owner"
                            (click)="assignTo(element, null)" md-menu-item>Unassigned</button>
                     </md-menu>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="creator">
                    <md-header-cell *mdHeaderCellDef md-sort-header> Reporter </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.creator.name}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="createdAt">
                    <md-header-cell *mdHeaderCellDef md-sort-header> Date </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.createdAt | date: 'yyyy-MM-dd'}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="operations">
                    <md-header-cell *mdHeaderCellDef> Operations </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <a *ngIf="element.status == 'Open'" (click)="startFix(element)"  md-button>Start Fix</a>
                        <a *ngIf="element.status == 'Fixed'" (click)="startTest(element)"  md-button>Start Test</a>
                    </md-cell>
                </ng-container>
                <md-header-row *mdHeaderRowDef="displayedColumns"></md-header-row>
                <md-row *mdRowDef="let row; columns: displayedColumns;"></md-row>
            </md-table>
          </div>
      </div>
  </div>
  `,
    styles: [`
    :host {flex-grow: 1;}
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
    td.changeable button, td.changeable a {line-height: 1.4em;}
    .material-icons.button {cursor: pointer;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; opacity: 0.07;}
    .type-and-id input { display: inline-block; }
    .mat-column-title {flex-grow: 8;  white-space: nowrap; overflow:hidden; text-overflow: ellipsis;}
  `]
})
export class ContentComponent implements OnInit, AfterViewInit {
    @ViewChild(MdSort) sorts: MdSort;
    total = 0;
    items = [];
    displayedColumns = ['id', 'status', 'severity', 'title', 'creator', 'createdAt', 'owner', 'operations'];
    loading = false;
    user;
    members = [];
    summary = {total: 0, open: 0, closed: 0, declined: 0, failed: 0, fixing: 0, testing: 0};

    project;
    hideClosed = true;
    hideDeclined = true;
    onlyOwned = false;
    constructor(
        public dialog: MdDialog,
        private router: Router,
        private http: HttpService,
        private teams: TeamService,
        public defects: DefectService,
        private userService: UserService,
        private projectSerivce: ProjectService) {
        this.teams.ownTeam.subscribe(t => this.members = t.members);
        this.userService.currentUser.subscribe(u => this.user = u);
        this.projectSerivce.current
            .filter(p => p && p.id)
            .do(p => this.project = p)
            .subscribe(() => this.loadItems());
    }

    ngOnInit(): void {
        this.defects.setSorter(this.sorts);
    }

    ngAfterViewInit(): void {
        this.loadItems();
    }

    loadItems() {
        let search = {};
        if (this.project) search['project'] = this.project.id;
        if (this.hideClosed) search['noclosed'] = 'true';
        if (this.onlyOwned) search['ownonly'] = 'true';
        if (this.hideDeclined) search['nodeclined'] = 'true';

        this.defects.summary({project: search['project']})
            .subscribe(s => this.summary = s);
        this.defects.update(search);
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
            if (!result) return;

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
