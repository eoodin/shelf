import {Component, ElementRef, Input} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';
import moment from 'moment';

import {ProjectService} from '../services/project-service.ts';
import {ItemDetail} from './item-detail.ts';
import {ModalDialog} from './modal-dialog.ts';
import Quill from 'quill';


@Component({
    selector: 'backlog',
    directives: [ItemDetail, ModalDialog, DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
    template: `
    <div class="plan-body">
        <div class="item-table">
            <div class="loading-mask" *ngIf="ui.loading.show">
                <div class="spinner-loader"></div>
            </div>
            <div class="panel panel-default">
                <div class="panel-heading work-items-heading">
                    <div>
                        <label  >
                            <input type="checkbox" [(ngModel)]="hideFinished"  (click)="loadWorkItems();" />
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
                        <th>Operations</th>
                    </tr>
                    <tr *ngFor="#item of getShowingItems()">
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
                                        *ngFor="#st of ['New','InProgress','','Finished','Pending','Dropped']"
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
                                    <span *ngIf="item.owner">{{item.owner.userId}}</span> <span class="caret"></span>
                                </button>
                                <ul class="dropdown-menu">
                                    <li role="menuitem"
                                        *ngFor="#member of members"
                                        [class.hidden]="member == item.owner"><a
                                            (click)="assignTo(item, member)">{{member.userId}}</a></li>
                                </ul>
                            </div>
                        </td>
                        <td>
                            <a (click)="removingItem(item)"><span class="glyphicon glyphicon-remove"></span></a>
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
    `,
    styles: [``]
})
export class Backlog {
    private current = {};
    private workItems = [];
    private plans = null;
    private sort = {};
    private members;
    private ui;
    private descriptionEditor;
    private hideFinished = false;
    private creatingType;

    private _data;

    constructor(private ele: ElementRef,
                private http: Http, private projectService: ProjectService) {
        this.descriptionEditor = null;
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'rwd': {'show': false}
        };
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();

            var current = this.projectService.current;
            if (!this.members && current && current.team) {
                this.http.get('/api/teams/' + current.team.id + '/members')
                    .subscribe(resp => this.members = resp.json());
            }
        }
    }

    showMoveToDialog() {
        this.ui.mtd.show = true;
        if (!this.plans) {
            var projectId = this.projectService.current.id;
            this.http.get('/api/plans/?project=' + projectId)
                .subscribe(resp => {
                    this.plans = resp.json();
                });
        }
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
        this.ui.awd.item = {'description': ''};
        this.creatingType = type;
        if (type) {
            this.ui.awd.item.type = type;
            this.ui.awd.item.severity =  'Major';
        }

        this.showWorkItemDlg();
    }

    showWorkItemDlg() {
        this.ui.awd.show = true;
        if (!this.descriptionEditor) {
            var el = this.ele.nativeElement;
            var editorEle = el.getElementsByClassName("quill-editor")[0];
            var toolbarEle = el.getElementsByClassName('quill-toolbar')[0];
            this.descriptionEditor = new Quill(editorEle, {
                'modules': {
                    'authorship': {authorId: 'galadriel', enabled: true},
                    'multi-cursor': true,
                    'link-tooltip': true,
                    'toolbar': {'container': toolbarEle}
                },
                'theme': 'snow'
            });
        }

        var description = this.ui.awd.item.description || '';
        this.descriptionEditor.setHTML(description);
    }

    saveWorkItem() {
        if (!this.current.id) {
            alert('No selected plan.');
            return;
        }

        var data = JSON.parse(JSON.stringify(this.ui.awd.item));
        data['description'] = this.descriptionEditor.getHTML();
        data['projectId'] = this.projectService.current.id;
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
        this.showWorkItemDlg();
    }

    removingItem(item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp => this.loadWorkItems());
        ui.rwd.show =false;
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

    @Input()
    public set data(data: Object) {
        this._data = data;
        console.log('data set', data);
    }
}
