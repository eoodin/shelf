import {Component, ElementRef} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';
import moment from 'moment';

import {PlanList} from '../components/plan-list.ts';
import {Backlog} from '../components/backlog.ts';
import {ProjectService} from '../services/project-service.ts';
import {PreferenceService} from '../services/preference-service.ts';
import {ItemDetail} from '../components/item-detail.ts';
import {ModalDialog} from '../components/modal-dialog.ts';

@Component({
    selector: 'plans',
    directives: [PlanList, ItemDetail, ModalDialog, DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
    template: `
    <div class="row plan-page" *ngIf="project">
        <div class="col-sm-2">
            <plan-list [project]="project" (select)="onSelect($event)"></plan-list>
        </div>
    
        <div class="col-sm-offset-2 col-md-offset-2 right">
            <div class="plan-head" *ngIf="current.id">
                <h1>{{current.name}}</h1>
                <ul class="summary">
                    <li *ngIf="current.start">Start: <span>{{date(current.start)}}</span></li>
                    <li *ngIf="current.end">Deadline: <span>{{date(current.end)}}</span></li>
                    <li *ngIf="current.allocation">Time(remain/planned): <span>{{sumHours()}}/{{current.allocation.developerHours + current.allocation.testerHours}}</span></li>
                    <li *ngIf="current.allocation">Progress: <span> x/x </span></li>
                </ul>
            </div>
            <div class="project-info">
                <div class="project-operations">
                    <button class="btn btn-warning" (click)="showAddItem('Defect')">Report A Problem</button>
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
                                <label  >
                                    <input type="checkbox" [(ngModel)]="hideFinished"  (click)="loadWorkItems();" (click)="onHideFinishedCheck()"/>
                                    Hide Finished
                                </label>
                            </div>
                        </div>
                        <table *ngIf="workItems" class="table">
                            <tr>
                                <th>
                                    <a href="javascript:void(0);" (click)="sortResult('id')">ID
                                    <span *ngIf="sort.field=='id'">
                                        <span class="glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}"></span>
                                    </span>
                                    </a>
                                </th>
                                <th>
                                    <a href="javascript:void(0);" (click)="sortResult('title')">Title
                                    <span *ngIf="sort.field=='title'">
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
                            <tr *ngFor="let item of getShowingItems()">
                                <td class="type-and-id">
                                    <label>
                                        <input class="checkbox" [(ngModel)]="item.checked" type="checkbox">
                                        <span *ngIf="item.type=='UserStory'" class="us glyphicon glyphicon-edit"></span>
                                        <span *ngIf="item.type=='Defect'" class="defect glyphicon glyphicon-fire"></span>
                                        <span *ngIf="item.type=='Task'" class="task glyphicon glyphicon-check"></span>
                                        {{item.id}}
                                    </label>
                                </td>
                                <td><a (click)="showItem(item)">{{item.title}}</a></td>
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
                                    <a (click)="removingItem(item)"><span class="glyphicon glyphicon-remove"></span></a>
                                    <a (click)="putToBacklog(item)"><span class="glyphicon glyphicon-copy"></span></a>
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
                        <button class="btn btn-primary" (click)="showMoveToDialog();">Move To...</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <div class="row" *ngIf="project == null">
        <h1 class="no-content-notice">No project.</h1>
    </div>
    
    <item-detail [item]="ui.awd.item"
                 [show]="ui.awd.show"
                 [type]="ui.awd.type"
                 (closed)="ui.awd.show = false"
                 (saved)="onWorkSaved();">
    </item-detail>
    
    <div class="modal fade in awd" *ngIf="ui.mtd.show" [style.display]="ui.mtd.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" (click)="ui.mtd.show = false"
                            data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Move selected items to plan</h4>
                </div>
                <div class="modal-body">
                    <select #moveTo class="form-control" required>
                        <option *ngFor="let p of plans" [value]="p.id">{{p.name}}</option>
                    </select>
                </div>
                <div class="modal-footer">
                    <button (click)="ui.mtd.show=false;" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button (click)="moveItemsToPlan(moveTo.value)" class="btn btn-default" data-dismiss="modal">Move</button>
                </div>
            </div>
        </div>
    </div>
    
    <div class="modal fade in" *ngIf="ui.rwd.show" [style.display]="ui.rwd.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" (click)="ui.rwd.show = false"
                            data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">Confirm to remove work item</h4>
                </div>
                <div class="modal-body">
                    You are about to remove work item {{ui.rwd.item.id}}. Are you sure?
                </div>
                <div class="modal-footer">
                    <button (click)="ui.rwd.show =false;" class="btn btn-default" data-dismiss="modal">Cancel</button>
                    <button (click)="removeItem(ui.rwd.item)" class="btn btn-default" data-dismiss="modal">Remove</button>
                </div>
            </div>
        </div>
    </div>

    `,
    styles: [`
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    .plan-page {padding-bottom: 15px;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table{position:relative;}
    .checkbox{margin:0; width: 22px; height: 22px;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .type-and-id .glyphicon {margin-right: 8px;}
    .us.glyphicon{color: #050;}
    .defect.glyphicon{color: #500;}
    .task.glyphicon{color: #333;}
    .type-and-id input { display: inline-block; }
    `],
    styleUrls: ['../../deps/css/css-spinner.css']
})
export class Plans {
    private current = {};
    private workItems = [];
    private plans = null;
    private sort = {};
    private members;
    private ui;
    private hideFinished = false;
    private project = null;

    constructor(private ele: ElementRef,
                private http: Http,
                private prjs: ProjectService,
                private pref : PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'rwd': {'show': false}
        };

        prjs.current.subscribe(p => this.project = p);
        pref.values.subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();

            var current = this.project;
            if (!this.members && current && current.team) {
                this.http.get('/api/teams/' + current.team.id + '/members')
                    .subscribe(resp => this.members = resp.json());
            }
        }
    }

    showMoveToDialog() {
        this.ui.mtd.show = true;
        if (!this.plans) { // TODO: use plan service to manager plan list.
            this.http.get('/api/plans/?project=' + this.project.id)
                .subscribe(resp => {
                    this.plans = resp.json();
                });
        }
    }

    onHideFinishedCheck() {
        this.pref.setPreference('hideFinished',  !this.hideFinished);
    }

    moveItemsToPlan(planId) {
        var ids = this.getSelectedWorkItemIds();
        if ( ! ids.length) {
            alert("No selected work item.");
            return;
        }

        this.http.request(new Request(new RequestOptions(
            {
                url: '/api/plans/' + planId + '/move-in',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(ids)
            }))).subscribe(resp => this.onMoveToPlanResponse(resp));
    }

    onMoveToPlanResponse(response) {
        this.ui.mtd.show = false;
        this.loadWorkItems();
    }

    showAddItem(type) {
        this.ui.awd.item = {'planId': this.current.id};
        this.ui.awd.type = type;
        if (type) {
            this.ui.awd.item.type = type;
            this.ui.awd.item.severity =  'Major';
        }

        this.ui.awd.show = true;
    }

    saveWorkItem() {
        if (!this.current.id) {
            alert('No selected plan.');
            return;
        }

        var data = JSON.parse(JSON.stringify(this.ui.awd.item));
        data['description'] = this.descriptionEditor.getHTML();
        data['projectId'] = this.project.id;
        data['planId'] = this.current.id;
        if (!data['id']) {
            this.http.request(new Request(new RequestOptions(
                {url: '/api/work-items/',
                    method: RequestMethod.Post,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                }))).subscribe(resp => this.onWorkSaved(resp));
        }
        else {
            this.http.request(new Request(new RequestOptions(
                {url: '/api/work-items/' + data['id'],
                    method: RequestMethod.Put,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                }))).subscribe(resp => this.onWorkSaved(resp));
        }
    }

    showItem(item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        this.ui.awd.show = true;
    }

    removingItem(item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    }

    putToBacklog(item) {
        // TODO.
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp =>
            {
                this.loadWorkItems();
                this.ui.rwd.show =false;
            });
    }

    getShowingItems() {
        if (this.hideFinished)
            return this.workItems.filter(i=>i.status != 'Finished');
        else
            return this.workItems;
    }

    changeStatus(item, status) {
        this.ui.loading.show = true;

        var change = {'status': status};
        this.http.request(new Request(new RequestOptions(
            {
                url: 'api/work-items/' + item.id,
                method: RequestMethod.Put,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(change)
            }
        ))).subscribe(resp => this.onStatusUpdate(resp));
    }

    assignTo(item, member) {
        this.ui.loading.show = true;
        member = member || {userId: -1};
        var change = {'ownerId': member.userId};
        this.http.request(new Request(new RequestOptions(
            {
                url: 'api/work-items/' + item.id,
                method: RequestMethod.Put,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(change)
            }
        ))).subscribe(resp => this.onStatusUpdate(resp));
    }

    onWorkSaved(resp) {
        this.ui.awd.show = false;
        this.loadWorkItems();
    }

    onStatusUpdate(resp) {
        this.ui.loading.show = false;
        this.loadWorkItems();
    }

    sortResult(field) {
        if (field == this.sort.field)
            this.sort.order = this.sort.order == 'desc' ? 'asc' : 'desc';
        else
            this.sort.order = 'asc';

        this.sort.field = field;
        this.loadWorkItems();
    }

    detailClosed() {
        this.ui.awd.show = false;
    }

    loadWorkItems() {
        var fetchUrl = '/api/work-items/?planId=' + this.current.id;
        if (this.sort.field) {
            fetchUrl += '&sortBy=' + this.sort.field;
            this.sort.order == 'desc' && (fetchUrl += '&desc=true');
        }

        this.http.get(fetchUrl)
            .subscribe(resp => this.workItems = resp.json());
    }

    date(epoch) {
        if (!epoch && epoch !== 0)
            return '----------';

        return moment(epoch).format("YYYY-MM-DD");
    }

    sumHours() {
        var total = 0;
        this.workItems.forEach(i=>{ total += i.estimation; });
        return total;
    }


    private getSelectedWorkItemIds() {
        var selected = [];
        this.workItems.forEach( wi=> {
            if(wi.checked) {
                selected.push(wi.id);
            }
        });

        return selected;
    }
}
