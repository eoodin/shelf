import { Component, ElementRef } from '@angular/core';
import { ProjectService } from './project.service';
import { Router, ActivatedRoute } from '@angular/router';
import { PreferenceService } from './preference.service';
import { StoryService } from './story.service';
import {MatDialog, MatDialogRef} from '@angular/material';

@Component({
    selector: 'backlog',
    template: `
    <div class="item-table">
        <div class="panel panel-default">
            <div class="panel-heading work-items-heading">
            <div class="heding-right">
                <mat-checkbox [(ngModel)]="hideFinished" (change)="filterChange($event)">Hide Finished</mat-checkbox>
            </div>
            </div>
            <mat-table #table [dataSource]="stories" matSort>
                <ng-container matColumnDef="id">
                    <mat-header-cell *matHeaderCellDef mat-sort-header> ID </mat-header-cell>
                    <mat-cell *matCellDef="let us"> {{us.id}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="priority">
                    <mat-header-cell *matHeaderCellDef> Priority </mat-header-cell>
                    <mat-cell *matCellDef="let us"> {{PRI[us.priority]}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="status">
                    <mat-header-cell *matHeaderCellDef> Status </mat-header-cell>
                    <mat-cell *matCellDef="let us">
                        <a [matMenuTriggerFor]="statusSel">{{us.status}}</a>
                        <mat-menu #statusSel="matMenu">
                            <button *ngFor="let st of STATES" [class.hidden]="st == us.status" (click)="changeStatus(us, st)" mat-menu-item>{{st}}</button>
                        </mat-menu>
                    </mat-cell>
                </ng-container>

                <ng-container matColumnDef="title">
                    <mat-header-cell *matHeaderCellDef> Title </mat-header-cell>
                    <mat-cell *matCellDef="let us"><a (click)="showItem(us)"> {{us.title}} </a>  </mat-cell>
                </ng-container>
                <ng-container matColumnDef="creator">
                    <mat-header-cell *matHeaderCellDef mat-sort-header> Creator </mat-header-cell>
                    <mat-cell *matCellDef="let us"> {{us.creatorId | username}} </mat-cell>
                </ng-container>
                <ng-container matColumnDef="operations">
                    <mat-header-cell *matHeaderCellDef> Operations </mat-header-cell>
                    <mat-cell *matCellDef="let us">
                        <i (click)="confirmDelete(us)" class="material-icons button">remove</i>
                    </mat-cell>
                </ng-container>
                <mat-header-row *matHeaderRowDef="displayedColumns"></mat-header-row>
                <mat-row *matRowDef="let row; columns: displayedColumns;"></mat-row>
            </mat-table>
        </div>
    </div>
  `,
    styles: [`
    :host{flex: 1 1;}
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
    .tree-control { height: 100%; position: relative; padding: 0; overflow: hidden; min-width: 24px;}
    .tree {height: 100%; display: block;}
    .tree .v-line {height: 100%;width: 1px; border: 1px solid; position: absolute;top:8px; left: calc(50% - 1px);}
    .tree .icon {position: absolute;width: 16px;height: 16px;top: 8px;left: calc(50% - 8px);outline: 1px dotted red;background-color: white;outline: 2px solid black; cursor: pointer;}
    .tree.na .v-line,.tree.collapse .v-line, .tree.na .icon {display: none;}
    .tree .h-cross {position: absolute;top: calc(50% - 1px);left: 10%;border: 1px solid black;width: 80%;}
    .tree .v-cross {position: absolute;height: 80%;width: 1px;border: 1px solid black;left: calc(50% - 1px);top: 10%;}
    .tree.expand .v-cross {display:none;}
    .tree.child .child-h-line {position: absolute;top: 16px;left: 50%;border: 1px solid black;width: 50%;}
    .tree.child .v-line {top: 0;}
    .tree.child.last .v-line {height: 16px;}
    .material-icons.button {cursor: pointer;}
    .type-and-id input { display: inline-block; }
  `]
})
export class BacklogComponent {
    displayedColumns = ['id', 'priority', 'status', 'title', 'creator', 'operations'];
    project = null;
    projects = [];
    items = [];
    sort = {field: 'id', order: 'desc'};
    requesting = false;
    PRI = ['High', 'Medium', 'Low'];

    hideFinished = true;

    constructor(
        public dialog: MatDialog,
        private ele: ElementRef,
        public stories: StoryService,
        private prs: ProjectService,
        private router: Router,
        private route: ActivatedRoute,
        private pref: PreferenceService) {
        prs.projects.subscribe(ps => this.projects = ps);
        prs.current
            .filter(p => p != this.project)
            .do(p => this.project = p)
            .subscribe(p => this.loadItems());
    }

    loadItems() {
        this.stories.update({projectId: this.project.id, parent: 'null'});
    }

    visibleItems() {
        if (this.hideFinished) {
            return this.items.filter(item => item.status != 'Finished');
        }
        return this.items;
    }

    private changePriority(item, pr) {
        if (item.priority == pr) return;
        let change = {id: item.id, priority: pr};
        this.stories.save(change).subscribe(() => this.loadItems());
    }

    private showItem(item) {
        this.router.navigate(['/backlog/story/' + item.id]);
    }

    private confirmDelete(item) {
        let dialogRef = this.dialog.open(DeleteConfirmDialog);
        dialogRef.afterClosed().subscribe(result => {
            if (result != 'yes')
                return;
            this.stories.delete(item.id)
                .subscribe(() => this.loadItems());
        });
    }

    filterChange(e) {
        this.loadItems();
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
    selector: 'delete-confirm-dialog',
    template: `
    <h1 mat-dialog-title>Deleting User Story</h1>
    <div mat-dialog-content>Do you want to delete the user story?</div>
    <div mat-dialog-actions>
    <button mat-button (click)="dialogRef.close('yes')">Yes</button>
    <button mat-button (click)="dialogRef.close('no')">Cancel</button>
    </div>
    `
})
export class DeleteConfirmDialog {
    constructor(public dialogRef: MatDialogRef<DeleteConfirmDialog>) {
    }
}
