import {Component, ElementRef} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';
import moment from 'moment';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';
import {PreferenceService} from '../services/preference-service.ts';
import {ItemDetail} from '../components/item-detail.ts';
import {ModalDialog} from '../components/modal-dialog.ts';

@Component({
    selector: 'plans',
    directives: [PlanList, ItemDetail, ModalDialog, DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
    template: `
    <div class="plan-page" *ngIf="prs.current">
        <div class="project-info">
            <div class="project-operations">
                <button class="btn btn-primary" (click)="ui.awd.show = true">Add Item...</button>
                <button class="btn btn-warning" (click)="showAddItem('Defect')">Report Problem...</button>
            </div>
        </div>
        <div class="plan-body">
            <div class="item-table">
                <div class="loading-mask" *ngIf="ui.loading.show">
                    <div class="spinner-loader"></div>
                </div>
                <div class="panel panel-default">
                    <table *ngIf="items" class="table">
                        <tr>
                            <th> ID </th>
                            <th> Type </th>
                            <th> Status </th>
                            <th> Title </th>
                            <th> Owner </th>
                            <th> Operations </th>
                        </tr>
                        <tr *ngFor="let item of items">
                            <td> {{item.id}} </td>
                            <td> {{item.type}} </td>
                            <td> {{item.status}} </td>
                            <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                            <td> {{item.owner.name}} </td>
                            <td> </td>
                        </tr>
                    </table>
                </div>
            </div>
            <div>
                <div class="col-sm-2">
                    
                </div>
            </div>
        </div>
    </div>
    
    <item-detail [item]="ui.awd.item"
                 [show]="ui.awd.show"
                 [type]="ui.awd.type"
                 (closed)="ui.awd.show = false"
                 (saved)="loadItems();">
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
    .us.glyphicon{color: #050;}
    .defect.glyphicon{color: #500;}
    .task.glyphicon{color: #333;}
    .type-and-id input { display: inline-block; }
    `],
    styleUrls: ['../../deps/css/css-spinner.css']
})
export class Backlog {
    private project;
    private items = [];
    private ui;

    constructor(private ele: ElementRef,
                private http: Http,
                private prs: ProjectService,
                private pref : PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'rwd': {'show': false}
        };

        prs.currentChanges.subscribe(p => this.switchProject(p));
    }

    switchProject(p) {
        if (p == this.project)
            return;

        this.project = p;
        this.loadItems();
        
    }

    loadItems() {
        this.http.get('/api/projects/' + this.project.id + '/backlog')
            .subscribe(b => this.items = b.json());
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
            }))).subscribe(resp => this.loadItems());
        this.ui.mtd.show = false;
    }


    showItem(item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        this.ui.awd.show = true;
    }

    removingItem(item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp =>
            {
                this.loadItems();
                this.ui.rwd.show =false;
            });
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
