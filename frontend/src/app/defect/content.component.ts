import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {MatDialog, MatDialogRef, Sort} from '@angular/material';
import {HttpService} from '../http.service';
import {DefectService} from '../defect.service';
import {TeamService} from '../team.service';
import {ProjectService} from '../project.service';
import {PlanService} from '../plan.service';
import {UserService} from '../user.service';
import {filter, finalize} from 'rxjs/operators';

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
                <mat-checkbox [ngModel]="source.filters.getValue().noclosed"
                    (change)="filterChange('noclosed', $event.checked)">Hide Closed</mat-checkbox>
                <mat-checkbox [ngModel]="source.filters.getValue().nodeclined"
                    (change)="filterChange('nodeclined', $event.checked)">Hide Declined</mat-checkbox>
                <mat-checkbox [ngModel]="source.filters.getValue().ownonly"
                    (change)="filterChange('ownonly', $event.checked)">Mine Only</mat-checkbox>
            </div>
            </div>
            <mat-table [dataSource]="source" matSort (matSortChange)="sort($event)"
                [matSortActive]="source.sorting.getValue().by">
                <ng-container matColumnDef="id">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> ID </mat-header-cell>
                    <mat-cell *matCellDef="let element"> {{element.id}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="status">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Status </mat-header-cell>
                    <mat-cell *matCellDef="let element">
                        <a [matMenuTriggerFor]="statusSel">{{element.status}}</a>
                        <mat-menu #statusSel="matMenu">
                            <button *ngFor="let st of settableStatus(element)"
                            (click)="changeStatus(element, st)"  mat-menu-item>{{st}}</button>
                        </mat-menu>
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="severity">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Severity </mat-header-cell>
                    <mat-cell *matCellDef="let element"> {{element.severity}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="title">
                    <mat-header-cell *matHeaderCellDef> Title </mat-header-cell>
                    <mat-cell *matCellDef="let element">
                        <a [routerLink]="['.', element.id]" title="{{element.title}}" > {{element.title}} </a>
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="owner">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Owner </mat-header-cell>
                    <mat-cell *matCellDef="let element">
                     <a *ngIf="element.ownerId" [matMenuTriggerFor]="ownerSel"> {{element.ownerId | username}} </a>
                     <a *ngIf="!element.ownerId" [matMenuTriggerFor]="ownerSel"> Unassigned </a>
                     <mat-menu #ownerSel="matMenu">
                         <button *ngFor="let member of members"
                            (click)="assignTo(element, member)"  mat-menu-item>{{member.name}}</button>
                         <button *ngIf="element.ownerId"
                            (click)="assignTo(element, null)" mat-menu-item>Unassigned</button>
                     </mat-menu>
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="creator">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Reporter </mat-header-cell>
                    <mat-cell *matCellDef="let element"> {{element.creatorId | username}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="createdAt">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Report date </mat-header-cell>
                    <mat-cell *matCellDef="let element"> {{element.createdAt | date: 'yyyy-MM-dd'}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="updatedAt">
                    <mat-header-cell *matHeaderCellDef mat-sort-header [disableClear]="true"> Last update </mat-header-cell>
                    <mat-cell *matCellDef="let element"> {{element.updatedAt | date: 'yyyy-MM-dd'}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="comment">
                    <mat-header-cell *matHeaderCellDef> Last comment </mat-header-cell>
                    <mat-cell *matCellDef="let d">
                        <span class="last-comment"
                            *ngIf="d.defectComments && d.defectComments.length"
                            title="{{d.defectComments[0].comment.userId | username}}: {{d.defectComments[0].comment.content}}" >
                            {{d.defectComments[0].comment.content}}
                        </span>
                    </mat-cell>
                </ng-container>
                <ng-container matColumnDef="operations">
                    <mat-header-cell *matHeaderCellDef> Operations </mat-header-cell>
                    <mat-cell *matCellDef="let element">
                        <a *ngIf="element.status == 'Open'" (click)="startFix(element)"  mat-button>Start Fix</a>
                        <a *ngIf="element.status == 'Fixed'" (click)="startTest(element)"  mat-button>Start Test</a>
                    </mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
            </mat-table>

            <mat-paginator [length]="totalDefects" [pageSize]="source.paging.getValue().pageSize"
                [pageIndex]="source.paging.getValue().pageIndex"
                [pageSizeOptions]="[10, 25, 50, 100]" (page)="source.paging.next($event)">
            </mat-paginator>
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
    .mat-column-creation {max-width: 80px;}
    .mat-column-update {max-width: 80px;}
    .mat-column-owner {max-width: 93px;}
    .mat-column-operations {max-width: 90px;}
    .mat-column-title {flex-grow: 5;  white-space: nowrap; overflow:hidden; text-overflow: ellipsis;}
    .mat-column-comment{ white-space: nowrap; overflow:hidden; text-overflow: ellipsis;}
  `]
})
export class ContentComponent implements OnInit, AfterViewInit {
    displayedColumns = ['id', 'status', 'severity', 'title', 'creator', 'createdAt', 'updatedAt', 'comment', 'owner', 'operations'];
    loading = false;
    user;
    members = [];
    summary = {total: 0, open: 0, closed: 0, declined: 0, failed: 0, fixing: 0, testing: 0};
    filters = {noclosed: true, nodeclined: true, ownonly: false};

    source;
    totalDefects;

    constructor(
        public dialog: MatDialog,
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
            .pipe(filter(p => p && p.id))
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
                    window.alert('Error occurred: ' + resp['error']);
                },
                () => this.loading = false);
        });
    }

    assignTo(item, member) {
        this.loading = true;
        const change = { 'ownerId': member ? member.id : null };
        this.defects.save(item.id, change)
            .pipe(finalize(() => this.loading = false))
            .subscribe(resp => this.loadItems());
    }

    startTest(item) {
        const dialogRef = this.dialog.open(SelectPlanDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (!result)
                return;

            this.loading = true;
            this.http.post('/api/defects/' + item.id + '/test', JSON.stringify({planId: result}))
                .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp['error']);
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
    <h1 mat-dialog-title>Create Task</h1>
    <div mat-dialog-content>
        You are about to create a task in following plan:
        <div>{{plan.name}}</div>
    </div>
    <div mat-dialog-actions>
    <button mat-button (click)="dialogRef.close(plan.id)">OK</button>
    <button mat-button (click)="dialogRef.close(null)">Cancel</button>
    </div>
    `
})
export class SelectPlanDialog {
    plan;
    constructor(
        public dialogRef: MatDialogRef<SelectPlanDialog>,
        private plans: PlanService) {
        this.plans.current
            .pipe(filter(plan => plan))
            .subscribe(p => this.plan = p);
    }
}
