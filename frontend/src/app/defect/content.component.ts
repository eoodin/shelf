import { Component, OnInit, ViewChild, AfterViewInit  } from '@angular/core';
import { Router } from '@angular/router';
import { MdDialog, MdDialogRef, MdSort, MdPaginator, Sort } from '@angular/material';
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
                <md-checkbox [ngModel]="source.filters.getValue().noclosed"
                    (change)="filterChange('noclosed', $event.checked)">Hide Closed</md-checkbox>
                <md-checkbox [ngModel]="source.filters.getValue().nodeclined"
                    (change)="filterChange('nodeclined', $event.checked)">Hide Declined</md-checkbox>
                <md-checkbox [ngModel]="source.filters.getValue().ownonly"
                    (change)="filterChange('ownonly', $event.checked)">Mine Only</md-checkbox>
            </div>
            </div>
            <md-table [dataSource]="source" mdSort (mdSortChange)="sort($event)"
                [mdSortActive]="source.sorting.getValue().by">
                <ng-container mdColumnDef="id">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> ID </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.id}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="status">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> Status </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <a [mdMenuTriggerFor]="statusSel">{{element.status}}</a>
                        <md-menu #statusSel="mdMenu">
                            <button *ngFor="let st of settableStatus(element)"
                            (click)="changeStatus(element, st)"  md-menu-item>{{st}}</button>
                        </md-menu>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="severity">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> Severity </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.severity}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="title">
                    <md-header-cell *mdHeaderCellDef> Title </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <a [routerLink]="['.', element.id]" title="{{element.title}}" > {{element.title}} </a>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="owner">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> Owner </md-header-cell>
                    <md-cell *mdCellDef="let element">
                     <a *ngIf="element.ownerId" [mdMenuTriggerFor]="ownerSel"> {{element.ownerId | username}} </a>
                     <a *ngIf="!element.ownerId" [mdMenuTriggerFor]="ownerSel"> Unassigned </a>
                     <md-menu #ownerSel="mdMenu">
                         <button *ngFor="let member of members"
                            (click)="assignTo(element, member)"  md-menu-item>{{member.name}}</button>
                         <button *ngIf="element.ownerId"
                            (click)="assignTo(element, null)" md-menu-item>Unassigned</button>
                     </md-menu>
                    </md-cell>
                </ng-container>
                <ng-container mdColumnDef="creator">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> Reporter </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.creatorId | username}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="createdAt">
                    <md-header-cell *mdHeaderCellDef md-sort-header [disableClear]="true"> Report date </md-header-cell>
                    <md-cell *mdCellDef="let element"> {{element.createdAt | date: 'yyyy-MM-dd'}} </md-cell>
                </ng-container>
                <ng-container mdColumnDef="comment">
                    <md-header-cell *mdHeaderCellDef> Last comment </md-header-cell>
                    <md-cell *mdCellDef="let element">
                        <span class="last-comment"
                            *ngIf="element.defectComments && element.defectComments.length"
                            title="{{element.defectComments[0].comment.userId | username}}: {{element.defectComments[0].comment.content}}" >
                            {{element.defectComments[0].comment.content}}
                        </span>
                    </md-cell>
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

            <md-paginator [length]="totalDefects" [pageSize]="source.paging.getValue().pageSize"
                [pageIndex]="source.paging.getValue().pageIndex"
                [pageSizeOptions]="[10, 25, 50, 100]" (page)="source.paging.next($event)">
            </md-paginator>
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
    .mat-column-id {max-width: 60px;}
    .mat-column-status {max-width: 90px;}
    .mat-column-sevrity {max-width: 70px;}
    .mat-column-creator {max-width: 90px;}
    .mat-column-createdAt {max-width: 80px;}
    .mat-column-owner {max-width: 93px;}
    .mat-column-operations {max-width: 90px;}
    .mat-column-title {flex-grow: 5;  white-space: nowrap; overflow:hidden; text-overflow: ellipsis;}
    .mat-column-comment{ white-space: nowrap; overflow:hidden; text-overflow: ellipsis;}
  `]
})
export class ContentComponent implements OnInit, AfterViewInit {
    @ViewChild(MdSort) sorter: MdSort;

    displayedColumns = ['id', 'status', 'severity', 'title', 'creator', 'createdAt', 'comment', 'owner', 'operations'];
    loading = false;
    user;
    members = [];
    summary = {total: 0, open: 0, closed: 0, declined: 0, failed: 0, fixing: 0, testing: 0};
    filters = {noclosed: true, nodeclined: true, ownonly: false};

    source;
    totalDefects;

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
        this.source = this.defects.getPage();
        this.source.total.subscribe(t => this.totalDefects = t);
    }

    sort(sort: Sort) {
        this.source.sorting.next({by: sort.active, direction: sort.direction});
    }

    ngOnInit(): void {
        let sv = this.source.sorting.getValue();
        this.sort({direction: sv.direction, active: sv.by});
    }

    ngAfterViewInit(): void {
        this.projectSerivce.current
            .filter(p => p && p.id)
            .subscribe(p => {
                this.defects.summary({project: p['id']})
                    .subscribe(s => this.summary = s);
            });
    }

    loadItems() {
        // TODO:
        let f = this.source.filters.getValue();
        this.source.filters.next(f);
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
                    window.alert('Error occurred: ' + resp.json()['error']);
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
                    window.alert('Error occurred: ' + resp.json()['error']);
                },
                () => this.loading = false);
        });
    }

    filterChange(fn, checked) {
        let f = this.source.filters.getValue();
        f[fn] = checked;
        this.source.filters.next(f);
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
