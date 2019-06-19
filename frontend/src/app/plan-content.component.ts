import { Component, Inject, AfterViewInit, ViewChild } from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';

import { PreferenceService } from './preference.service';
import * as moment from 'moment';
import { PlanService } from './plan.service';
import { TeamService } from './team.service';
import { TaskService } from './task.service';
import { ProjectService } from './project.service';

@Component({
    selector: 'plan-content',
    template: `
    <div class="plan-head" *ngIf="current.id">
        <span *ngIf="current.start">Start: <span class="key-value">{{date(current.start)}}</span></span>
        <span *ngIf="current.end">Deadline: <span class="key-value">{{date(current.end)}}</span></span>
        <span *ngIf="current.allocation">Remains/Capacity: <span class="key-value">{{sumHours()}} H/{{current.allocation.effort}} H</span></span>
        <span *ngIf="current.allocation">Total estimation: <span class="key-value">{{sumOriginalHours()}} H</span></span>
    </div>
    <div class="project-info">
        <div class="project-operations">
            <iframe #downloader style="display:none;"></iframe>
            <button mat-button (click)="exportCsv()"><i class="glyphicon glyphicon-export" aria-hidden="true"></i>Export as CSV</button>
            <button mat-button (click)="showAddItem()">New Task...</button>
            <button mat-button (click)="showMoveToPlan()" [disabled]="!selectedIds().length">Move...</button>
        </div>
    </div>
    <div class="plan-body">
        <div class="item-table">
            <div class="loading-mask" *ngIf="ui.loading.show">
                <div class="spinner-loader"></div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading work-items-heading">
                    <div>
                        <mat-checkbox [(ngModel)]="hideFinished" (change)="loadWorkItems()">Hide Finished</mat-checkbox>
                        <mat-checkbox [(ngModel)]="onlyOwned" (change)="loadWorkItems()">Mine Only</mat-checkbox>
                    </div>
                </div>
                <mat-table [dataSource]="tasks">
                    <ng-container matColumnDef="id">
                        <mat-header-cell *matHeaderCellDef> ID </mat-header-cell>
                        <mat-cell *matCellDef="let task"> {{task.id}} </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="status">
                        <mat-header-cell *matHeaderCellDef> Status </mat-header-cell>
                        <mat-cell *matCellDef="let task">
                            <a [matMenuTriggerFor]="statusSel">{{task.status}}</a>
                            <mat-menu #statusSel="matMenu">
                                <button *ngFor="let st of STATES" [class.hidden]="st == task.status" (click)="changeStatus(task, st)" mat-menu-item>{{st}}</button>
                            </mat-menu>
                        </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="title">
                        <mat-header-cell *matHeaderCellDef> <span class="task glyphicon glyphicon-check"></span> Title </mat-header-cell>
                        <mat-cell *matCellDef="let task"> <a (click)="showItem(task)">{{task.title}}</a> </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="priority">
                        <mat-header-cell *matHeaderCellDef> Priority </mat-header-cell>
                        <mat-cell *matCellDef="let task"> {{PRI[task.priority]}} </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="owner">
                        <mat-header-cell *matHeaderCellDef> Owner </mat-header-cell>
                        <mat-cell *matCellDef="let task">
                        <a *ngIf="task.ownerId" [matMenuTriggerFor]="ownerSel"> {{task.ownerId | username}} </a>
                        <a *ngIf="!task.ownerId" [matMenuTriggerFor]="ownerSel"> Unassigned </a>
                        <mat-menu #ownerSel="matMenu">
                            <button *ngFor="let member of team.members" (click)="assignTo(task, member)"  mat-menu-item>{{member.name}}</button>
                            <button *ngIf="task.ownerId" (click)="assignTo(task, null)" mat-menu-item>Unassigned</button>
                        </mat-menu>
                        </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="remaining">
                        <mat-header-cell *matHeaderCellDef> Remaining </mat-header-cell>
                        <mat-cell *matCellDef="let task"> {{task.estimation}} </mat-cell>
                    </ng-container>
                    <ng-container matColumnDef="operations">
                        <mat-header-cell *matHeaderCellDef> Operations </mat-header-cell>
                        <mat-cell *matCellDef="let task"> 
                            <a title="Remove this work item" (click)="removingItem(task)" mat-button>Delete</a>
                        </mat-cell>
                    </ng-container>
                    <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                    <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
                </mat-table>
            </div>
        </div>
    </div>
    `,
    styles: [`
    :host{width: 100%; outline: 1px dotted red;}
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .header-title {padding-left: 24px;}
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .key-value {font-weight: 800;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .id .glyphicon {margin-right: 8px;}
    .us.glyphicon{color: #050;}
    .defect.glyphicon{color: #500;}
    .task.glyphicon{color: #333;}
    .buttom-row:after {content: ''; height: 0; display: block; clear:both;}
    .mat-column-title {flex-grow: 8;}
    `]
})
export class PlanContentComponent implements AfterViewInit {
    displayedColumns = ['id', 'title', 'priority', 'status', 'owner', 'remaining', 'operations'];
    current;
    workItems = [];
    _plans = [];
    sort;
    team;
    ui;
    hideFinished = false;
    onlyOwned = false;
    PRI = ['High', 'Medium', 'Low'];
    STATES = ['New', 'InProgress', 'Finished', 'Pending', 'Dropped'];

    project = null;

    @ViewChild(Component, {static: false, read: 'downloader'}) downloader;

    constructor(private plans: PlanService,
        public tasks: TaskService,
        private teams: TeamService,
        private pref: PreferenceService,
        public dialog: MatDialog,
        private prjs: ProjectService) {
        prjs.current.subscribe(p => this.project = p);
        this.ui = {
            'loading': { 'show': false },
            'awd': { 'show': false, 'loading': false, 'item': {} },
            'mtd': { 'show': false },
            'cpd': { 'show': false },
            'rwd': { 'show': false }
        };
        this.current = this.sort =  this.team = {};
        this.teams.ownTeam
            .filter(team => team)
            .subscribe(team => this.team = team);

        this.plans.current
            .subscribe(plan => this.switchPlan(plan));

        this.plans.all().subscribe(plans => this._plans = plans);

        pref.values
            .filter(prefs => typeof (prefs['hideFinished']) != 'undefined')
            .subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    ngAfterViewInit(): void {
        // TODO: other data loading should be removed and use this one..
        // this.loadWorkItems();
    }

    showMoveToPlan() {
        let dlgRef = this.dialog.open(MoveItemsDialog, {data: {plans: this._plans}});
        let ids = this.selectedIds();
        dlgRef.afterClosed().subscribe(pid => {
            if (pid) {
                this.tasks.moveToPlan(ids, pid).subscribe(() => this.loadWorkItems());
            }
        });
    }

    showAddItem() {
        this.showItem({ 'planId': this.current['id'] });
    }

    showItem(item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        let dlgRef = this.dialog.open(ItemDetailDialog, {data: this.ui.awd.item});
        dlgRef.afterClosed().subscribe(save => {
            if (save) {
                let data = this.ui.awd.item;
                if (!data['id']) {
                    data.projectId = this.project['id'];
                    this.tasks.create(data).subscribe(result => this.loadWorkItems());
                } else {
                    let id = data['id'];
                    delete data['id'];
                    this.tasks.save(id, data).subscribe(result => this.loadWorkItems());
                }
            }
        });
    }

    removingItem(item) {
        let dlgRef = this.dialog.open(RemoveConfirmDialog, {data: item});
        dlgRef.afterClosed().filter(confirmed => confirmed).subscribe(confirmed => {
            this.tasks.delete(item.id)
            .finally(() => this.ui.rwd.show = false)
            .subscribe(() => this.loadWorkItems());
        });
    }

    changeStatus(item, status) {
        this.ui.loading.show = true;
        var change = { 'status': status };
        this.tasks.save(item.id, change)
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    changePriority(item, priority) {
        this.ui.loading.show = true;
        var change = { 'priority': priority };
        this.tasks.save(item.id, change)
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    assignTo(item, member) {
        this.ui.loading.show = true;
        var change = { 'ownerId': member ? member.id : null };
        this.tasks.save(item.id, change)
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    onWorkSaved() {
        this.ui.awd.show = false;
        this.loadWorkItems();
    }

    sortResult(field) {
        if (field == this.sort['field'])
            this.sort['order'] = this.sort['order'] == 'desc' ? 'asc' : 'desc';
        else
            this.sort['order'] = 'asc';

        this.sort['field'] = field;
        this.loadWorkItems();
    }

    loadWorkItems() {
        let search = { planId: this.current['id'], exclude: 'description' };
        if (this.sort['field']) {
            search['sortBy'] = this.sort['field'];
            if (this.sort['order'] == 'desc')
                search['desc'] = 'true';
        }

        if (this.hideFinished) search['nofinished'] = 'true';
        if (this.onlyOwned) search['ownonly'] = 'true';

        this.tasks.update(search);
        // this.tasks.fetch(search)
        //     .subscribe(tasks => this.setWorkItems(tasks));
    }

    setWorkItems(items) {
        items.filter(i => i.status == 'Finished').forEach(i => i.hidden = this.hideFinished);
        this.workItems = items;
    }

    date(epoch) {
        if (!epoch && epoch !== 0)
            return '----------';

        return moment(epoch).format('YYYY-MM-DD');
    }

    sumHours() {
        return this.workItems.reduce((a, b) => a + b.estimation, 0);
    }

    sumOriginalHours() {
        return this.workItems.reduce((a, b) => a + b.originalEstimation, 0);
    }

    onAllCheck(checked) {
        this.workItems.forEach(item => item.checked = checked);
    }

    allChecked(): boolean {
        return this.workItems.every(item => item.checked);
    }

    exportCsv() {
        this.downloader.nativeElement.src = '/api/tasks/?format=csv&planId=' + this.current['id']
    }

    selectedIds() {
        return this.workItems.filter(i => i.checked).map(i => i.id);
    }

    switchPlan(plan) {
        this.current = plan;
        this.loadWorkItems();
    }
}

@Component({
    selector: 'item-detail-diaolg',
    template: `
    <h2 mat-dialog-title>Item Details</h2>
    <mat-dialog-content class="item-details">
        <div class="row">
            <span class="field-label">Title:</span>
            <input type="text" class="work-item-title" [(ngModel)]="data.title">
        </div>
        <div class="row">
            <div class="col-sm-12">Description:</div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                <rich-editor [(model)]="data.description" ></rich-editor>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">
            Effort Estimation: <input type="text" [(ngModel)]="data.estimation">
            </div>
        </div>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close>Close</button>
        <button mat-button [mat-dialog-close]="true">Save</button>
    </mat-dialog-actions>
    `,
    styles: [`
    .row {margin: 5px; auto; display: flex;}
    .work-item-title {flex-grow: 1;}
    `]
})
export class ItemDetailDialog {
    constructor(
        public dialogRef: MatDialogRef<ItemDetailDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}
}

@Component({
    selector: 'move-items-diaolg',
    template: `
    <h2 mat-dialog-title>Move selected items to plan</h2>
    <mat-dialog-content class="item-details">
        <select #moveTo class="form-control" required>
            <option *ngFor="let p of data.plans" [value]="p.id">{{p.name}}</option>
        </select>
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="moveTo.value">Move</button>
    </mat-dialog-actions>`
})
export class MoveItemsDialog {
    constructor(
        public dialogRef: MatDialogRef<MoveItemsDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }
}

@Component({
    selector: 'confirm-remove-diaolg',
    template: `
    <h2 mat-dialog-title>Are you sure?</h2>
    <mat-dialog-content class="item-details">
        You are about to remove work item {{data.id}}. Are you sure?
    </mat-dialog-content>
    <mat-dialog-actions>
        <button mat-button mat-dialog-close>Cancel</button>
        <button mat-button [mat-dialog-close]="true">Remove</button>
    </mat-dialog-actions>`
})
export class RemoveConfirmDialog {
    constructor(
        public dialogRef: MatDialogRef<RemoveConfirmDialog>,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }
}
