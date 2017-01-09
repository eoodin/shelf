import {Component, ViewChild} from "@angular/core";
import {Http} from "@angular/http";
import {PreferenceService} from "./preference.service";
import * as moment from "moment";
import {PlanService} from "./plan.service";

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
                    <button (click)="exportCsv()" class="btn btn-primary">
                        <i class="glyphicon glyphicon-export" aria-hidden="true"></i> Export as CSV
                    </button>
                    <button class="btn btn-warning" (click)="showAddItem('Defect')">Report Problem</button>
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
                                <label>
                                    <input type="checkbox" [(ngModel)]="hideFinished"  (click)="onHideFinishedCheck()"/>
                                    Hide Finished
                                </label>
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
                            <tr *ngFor="let item of visibleItems()">
                                <td class="id">
                                    <label>
                                        <input class="checkbox" [(ngModel)]="item.checked" type="checkbox">
                                        {{item.id}}
                                    </label>
                                </td>
                                <td>
                                    <span *ngIf="item.type=='UserStory'" class="us glyphicon glyphicon-edit"></span>
                                    <span *ngIf="item.type=='Defect'" class="defect glyphicon glyphicon-fire"></span>
                                    <span *ngIf="item.type=='Task'" class="task glyphicon glyphicon-check"></span>
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
                                        <ul class="dropdown-menu">
                                            <li role="menuitem"><a (click)="assignTo(item, null)">Unassigned</a></li>
                                            <li role="menuitem"
                                                *ngFor="let member of members"
                                                [class.hidden]="member == item.owner"><a
                                                    (click)="assignTo(item, member)">{{member.name}}</a></li>
                                        </ul>
                                    </div>
                                </td>
                                <td>{{item.estimation}}</td>
                                <td>
                                    <a title="Remove this work item" (click)="removingItem(item)"><span class="glyphicon glyphicon-remove"></span></a>
                                    <a title="Put back to backlog" (click)="moveToBacklog(item)"><span class="glyphicon glyphicon-level-up"></span></a>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div>
                    <div class="col-sm-2">
                        <button class="btn btn-primary" (click)="showAddItem()">Add Work Item...</button>
                    </div>
                    <div class="col-sm-6">
                        <button class="btn btn-primary" (click)="ui.mtd.show = true">Move To...</button>
                    </div>
                </div>
            </div>
        </div>
  
  <modal-dialog [(show)]="ui.mtd.show" [title]="'Move selected items to plan'">
        <div dialog-body>
            <select #moveTo class="form-control" required>
                <option *ngFor="let p of _plans" [value]="p.id">{{p.name}}</option>
            </select>
        </div>
        <div dialog-footer class="modal-footer">
            <button (click)="ui.mtd.show=false;" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button (click)="moveItemsToPlan(moveTo.value)" class="btn btn-default" data-dismiss="modal">Move</button>
        </div>
    </modal-dialog>

    <modal-dialog [(show)]="ui.rwd.show" [title]="'Confirm to remove work item'">
        <div dialog-body>
            You are about to remove work item <span *ngIf="ui.rwd.item">{{ui.rwd.item.id}}</span>. Are you sure?
        </div>
        <div dialog-footer class="modal-footer">
            <button (click)="ui.rwd.show =false;" class="btn btn-default" data-dismiss="modal">Cancel</button>
            <button (click)="removeItem(ui.rwd.item)" class="btn btn-default" data-dismiss="modal">Remove</button>
        </div>
    </modal-dialog>

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
    `]
})
export class PlanContentComponent {
    private current = {};
    private workItems = [];
    private _plans = [];
    private sort = {};
    private members;
    private ui;
    private hideFinished = false;
    private PRI = ['High', 'Medium', 'Low'];

    project = null;

    @ViewChild('downloader') downloader;

    constructor(private http: Http,
                private plans: PlanService,
                private pref: PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'cpd': {'show': false},
            'rwd': {'show': false}
        };

        this.plans.current()
            .filter(plan => plan)
            .subscribe(plan => this.switchPlan(plan));
        pref.values
            .filter(prefs => typeof(prefs['hideFinished']) != 'undefined')
            .subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    onHideFinishedCheck() {
        let hidden = !this.hideFinished;
        this.workItems
            .filter(i => i.status == 'Finished')
            .forEach(i => i.hidden = hidden);
        this.pref.setPreference('hideFinished', hidden);
    }

    moveItemsToPlan(planId) {
        var ids = this.getSelectedWorkItemIds();
        if (!ids.length) {
            alert("No selected work item.");
            return;
        }

        this.http.patch('/api/work-item/bunch', JSON.stringify({'ids': ids, 'changes': {'planId': planId}}))
            .subscribe(resp => this.onMoveToPlanResponse(resp));
    }

    onMoveToPlanResponse(response) {
        this.ui.mtd.show = false;
        this.loadWorkItems();
    }

    showAddItem(type) {
        this.ui.awd.item = {'planId': this.current['id']};
        this.ui.awd.type = type;
        if (type) {
            this.ui.awd.item.type = type;
            this.ui.awd.item.severity = 'Major';
        }

        this.ui.awd.show = true;
    }

    showItem(item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        this.ui.awd.show = true;
    }

    removingItem(item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    }

    moveToBacklog(item) {
        this.ui.loading.show = true;
        var change = {'planId': null};
        this.http.put('api/work-items/' + item.id, JSON.stringify(change))
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp => {
                this.loadWorkItems();
                this.ui.rwd.show = false;
            });
    }

    visibleItems() {
        return this.workItems.filter(i => (!i.hidden));
    }

    changeStatus(item, status) {
        this.ui.loading.show = true;

        var change = {'status': status};
        this.http.put('api/work-items/' + item.id, JSON.stringify(change))
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    changePriority(item, priority) {
        this.ui.loading.show = true;

        var change = {'priority': priority};
        this.http.put('api/work-items/' + item.id, JSON.stringify(change))
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    assignTo(item, member) {
        this.ui.loading.show = true;
        var change = {'ownerId': member ? member.id : null};
        this.http.put('api/work-items/' + item.id, JSON.stringify(change))
            .finally(() => this.ui.loading.show = false)
            .subscribe(resp => this.loadWorkItems());
    }

    onWorkSaved(resp) {
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

    detailClosed() {
        this.ui.awd.show = false;
    }

    loadWorkItems() {
        var fetchUrl = '/api/work-items/?planId=' + this.current['id'];
        if (this.sort['field']) {
            fetchUrl += '&sortBy=' + this.sort['field'];
            this.sort['order'] == 'desc' && (fetchUrl += '&desc=true');
        }

        this.http.get(fetchUrl)
            .subscribe(resp => this.setWorkItems(resp.json()));
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
        this.visibleItems().forEach(item => item.checked = checked);
    }

    allChecked(): boolean {
        return this.visibleItems().every(item => item.checked);
    }

    exportCsv() {
        this.downloader.nativeElement.src = '/api/work-items/?format=csv&planId=' + this.current['id']
    }

    private getSelectedWorkItemIds() {
        return this.visibleItems().filter(i => i.checked).map(i => i.id);
    }

    private switchPlan(plan) {
        this.current = plan;
        this.loadWorkItems();
    }
}
