import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import {MdDialog, MdDialogRef, MD_DIALOG_DATA} from '@angular/material';
import { PreferenceService } from "./preference.service";
import * as moment from "moment";
import { PlanService } from "./plan.service";
import { TeamService } from "./team.service";
import { TaskService } from './task.service';
import { ProjectService } from "./project.service";

@Component({
    selector: 'plan-content',
    template: `
       <div >
            <div class="plan-head" *ngIf="current.id">
                <ul class="summary">
                    <li *ngIf="current.start">Start: <span>{{date(current.start)}}</span></li>
                    <li *ngIf="current.end">Deadline: <span>{{date(current.end)}}</span></li>
                    <li *ngIf="current.allocation">Remains/Capacity: <span>{{sumHours()}} H/{{current.allocation.effort}} H</span></li>
                    <li *ngIf="current.allocation">Total estimation: <span>{{sumOriginalHours()}} H</span></li>
                </ul>
            </div>
            <div class="project-info">
                <div class="project-operations">
                    <iframe #downloader style="display:none;"></iframe>
                    <button md-button (click)="exportCsv()"><i class="glyphicon glyphicon-export" aria-hidden="true"></i>Export as CSV</button>
                    <button md-button (click)="showAddItem()">New Task...</button>
                    <button md-button (click)="showMoveToPlan()" [disabled]="!selectedIds().length">Move...</button>
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
                                <md-checkbox [(ngModel)]="hideFinished" (change)="loadWorkItems()">Hide Finished</md-checkbox>
                                <md-checkbox [(ngModel)]="onlyOwned" (change)="loadWorkItems()">Mine Only</md-checkbox>
                            </div>
                        </div>
                        <table *ngIf="workItems" class="table">
                            <tr>
                                <th>
                                    <label>
                                        <input type="checkbox" [checked]="allChecked()" (click)="onAllCheck($event.target.checked)" class="checkbox" title="Select/unselect all" />
                                        <a href="javascript:void(0);" (click)="sortResult('id')">ID
                                        <span *ngIf="sort.field=='id'">
                                            <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                        </span>
                                        </a>
                                    </label>
                                </th>
                                <th class="header-title">
                                    <a href="javascript:void(0);" (click)="sortResult('title')">Title
                                    <span *ngIf="sort.field=='title'">
                                        <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                    </span>
                                    </a>
                                </th>
                                <th class="header-title">
                                    <a (click)="sortResult('priority')">Priority
                                    <span *ngIf="sort.field=='priority'">
                                        <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                    </span>
                                    </a>
                                </th>
                                <th>
                                    <a href="javascript:void(0);" (click)="sortResult('status')">Status
                                    <span *ngIf="sort.field=='status'">
                                        <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                    </span>
                                    </a>
                                </th>
                                <th><a href="javascript:void(0);" (click)="sortResult('owner')">Owner
                                    <span *ngIf="sort.field=='owner'">
                                        <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                    </span>
                                </a>
                                </th>
                                <th>Remaining</th>
                                <th>Operations</th>
                            </tr>
                            <tr *ngFor="let item of workItems">
                                <td class="id">
                                    <label>
                                        <input class="checkbox" [(ngModel)]="item.checked" type="checkbox">
                                        {{item.id}}
                                    </label>
                                </td>
                                <td>
                                    <span  class="task glyphicon glyphicon-check"></span>
                                    <a (click)="showItem(item)">{{item.title}}</a>
                                </td>
                                <td>
                                    <div class="btn-group" dropdown keyboardNav>
                                        <button class="btn btn-default btn-sm dropdown-toggle" dropdownToggle type="button"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            {{PRI[item.priority]}} <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li role="menuitem"
                                                *ngFor="let pri of [0,1,2]"
                                                [class.hidden]="pri == item.priority">
                                                <a (click)="changePriority(item, pri)">{{PRI[pri]}}</a>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                                <td>
                                    <div class="btn-group" dropdown keyboardNav>
                                        <button class="btn btn-default btn-sm dropdown-toggle" dropdownToggle type="button"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            {{item.status}} <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu">
                                            <li role="menuitem"
                                                *ngFor="let st of ['New','InProgress','','Finished','Pending','Dropped']"
                                                [class.hidden]="st == item.status">
                                                <a (click)="changeStatus(item, st)">{{st}}</a>
                                            </li>
                                        </ul>
                                    </div>
                                </td>
                                <td>
                                    <div class="btn-group" dropdown keyboardNav>
                                        <button class="btn btn-default btn-sm dropdown-toggle" dropdownToggle type="button"
                                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                            <span *ngIf="item.owner">{{item.owner.name}}</span> 
                                            <span *ngIf="!item.owner">Unassigned</span> <span class="caret"></span>
                                        </button>
                                        <ul class="dropdown-menu" *ngIf="team && team.members">
                                            <li role="menuitem"><a (click)="assignTo(item, null)">Unassigned</a></li>
                                            <li role="menuitem"
                                                *ngFor="let member of team.members"
                                                [class.hidden]="member == item.owner"><a
                                                    (click)="assignTo(item, member)">{{member.name}}</a></li>
                                        </ul>
                                    </div>
                                </td>
                                <td>{{item.estimation}}</td>
                                <td>
                                    <a title="Remove this work item" (click)="removingItem(item)"><span class="glyphicon glyphicon-remove"></span></a>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    `,
    styles: [`
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .header-title {padding-left: 24px;}
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table label { margin: 0;}
    .item-table label input[type="checkbox"] { vertical-align: bottom;}
    .item-table table .checkbox{ display: inline-block; margin:0; width: 22px; height: 22px;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .id .glyphicon {margin-right: 8px;}
    .us.glyphicon{color: #050;}
    .defect.glyphicon{color: #500;}
    .task.glyphicon{color: #333;}
    .buttom-row:after {content: ''; height: 0; display: block; clear:both;}
    `]
})
export class PlanContentComponent {
    current;
    workItems = [];
    _plans = [];
    sort;
    team;
    ui;
    hideFinished = false;
    onlyOwned = false;
    PRI = ['High', 'Medium', 'Low'];

    project = null;

    @ViewChild('downloader') downloader;

    constructor(private plans: PlanService,
        private tasks: TaskService,
        private teams: TeamService,
        private pref: PreferenceService,
        public dialog: MdDialog,
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
                }
                else {
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
            .finally(() => { this.ui.rwd.show = false })
            .subscribe(() => this.loadWorkItems())
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

        this.tasks.fetch(search)
            .subscribe(tasks => this.setWorkItems(tasks));
    }

    setWorkItems(items) {
        items.filter(i => i.status == 'Finished').forEach(i => i.hidden = this.hideFinished);
        this.workItems = items;
    }

    date(epoch) {
        if (!epoch && epoch !== 0)
            return '----------';

        return moment(epoch).format("YYYY-MM-DD");
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
    <h2 md-dialog-title>Item Details</h2>
    <md-dialog-content class="item-details">
        <form (ngSubmit)="saveItem()">
            <div class="row">
                <div class="col-sm-12 field-row">
                    <span class="field-label">Title:</span> <input type="text" class="work-item-title" [(ngModel)]="data.title" [ngModelOptions]="{standalone: true}">
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">Description:</div>
            </div>
            <div class="row">
                <div class="col-sm-12">
                    <ckeditor [(ngModel)]="data.description" [config]="editorConfig" [ngModelOptions]="{standalone: true}" debounce="400"></ckeditor>
                </div>
            </div>
            <div class="row">
                <div class="col-sm-12">Effort Estimation: <input type="text" [(ngModel)]="data.estimation" [ngModelOptions]="{standalone: true}"></div>
            </div>
        </form>
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Close</button>
        <button md-button [md-dialog-close]="true">Save</button>
    </md-dialog-actions>
    `,
    styles: [`
    .item-details { padding-left: 0;}
    .item-details li { list-style:none; margin-bottom: 10px;}
    .item-details li:last-child { margin-bottom: 0;}
    .item-details li .title { font-weight: 700; }
    .item-details li .big-section { display: block;}
    .item-details .row {margin: 8px 0;}
    .field-row {display: flex; flex-direction: row; flex-wrap: nowrap;}
    .field-row .field-label { margin-right: 20px;}
    .field-row input,select {flex-grow: 1;}
    `]
})
export class ItemDetailDialog {
    private editorConfig = {
        extraPlugins: 'uploadimage,divarea',
        imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
        toolbar: [
            {
                name: 'styles',
                items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
            },
            { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
            { name: 'tools', items: ['Maximize'] }
        ]
    };
    constructor(
        public dialogRef: MdDialogRef<ItemDetailDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) {}
}

@Component({
    selector: 'move-items-diaolg',
    template: `
    <h2 md-dialog-title>Move selected items to plan</h2>
    <md-dialog-content class="item-details">
        <select #moveTo class="form-control" required>
            <option *ngFor="let p of data.plans" [value]="p.id">{{p.name}}</option>
        </select>
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Cancel</button>
        <button md-button [md-dialog-close]="moveTo.value">Move</button>
    </md-dialog-actions>`
})
export class MoveItemsDialog {
    constructor(
        public dialogRef: MdDialogRef<MoveItemsDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) { }
}

@Component({
    selector: 'confirm-remove-diaolg',
    template: `
    <h2 md-dialog-title>Are you sure?</h2>
    <md-dialog-content class="item-details">
        You are about to remove work item {{data.id}}. Are you sure?
    </md-dialog-content>
    <md-dialog-actions>
        <button md-button md-dialog-close>Cancel</button>
        <button md-button [md-dialog-close]="true">Remove</button>
    </md-dialog-actions>`
})
export class RemoveConfirmDialog {
    constructor(
        public dialogRef: MdDialogRef<RemoveConfirmDialog>, 
        @Inject(MD_DIALOG_DATA) public data: any
    ) { }
}
