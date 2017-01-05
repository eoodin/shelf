import {Component, ElementRef, ViewChild, OnInit, OnDestroy} from '@angular/core';
import {Http} from '@angular/http';

import * as moment from 'moment';

import {ProjectService} from '../services/project-service';
import {PreferenceService} from '../services/preference-service';

@Component({
    selector: 'plans',
    template: `
    <md-sidenav-container class="workspace">
       <md-sidenav #sidenav class="sidenav">
          <plan-list (select)="onSelect($event);sidenav.close()"></plan-list>
       </md-sidenav>
        <h3>
            <a (click)="sidenav.open()">{{current.name}}</a>
            <a class="add-sprint-button" (click)="ui.cpd.show = true;"><span class="glyphicon glyphicon-plus"></span></a>
        </h3>
        <router-outlet></router-outlet>
    </md-sidenav-container>

    <div class="modal fade in" [style.display]="ui.cpd.show ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="createPlan(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.cpd.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">New Sprint</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Sprint name:</div>
                            <div class="col-sm-5"> 
                                <input type="text" [(ngModel)]="name" name="name">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Start from:</div>
                            <div class="col-sm-5">
                                <input type="date" [(ngModel)]="start" name="start">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Due date:</div>
                            <div class="col-sm-5">
                                <input type="date" [(ngModel)]="end" name="end">
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Holiday:</div>
                            <div class="col-sm-5">
                                <input type="number" [(ngModel)]="holiday" name="holiday">
                            </div>
                        </div>
                        <div class="row"></div>
                        <div class="row plan-field-row">
                            <div class="col-sm-3">Available effort:</div><div class="col-sm-5"> 
                                <!-- <input type="text" [disabled]="true" [(ngModel)]="availableHours" name="availableHours"> -->
                                <span>{{sumAvailableHours(f.value) | number: '1.0-0'}} hours</span>
                            </div>
                        </div>
                        <div class="row plan-field-row">
                            <div class="col-sm-12">
                            <table style="width: 100%">
                               <tr>
                                   <th>Name</th>
                                   <th>Allocation</th>
                                   <th>Leave(days)</th>
                                   <th>Available</th>
                               </tr>
                               <tr *ngFor="let member of members">
                                   <td>{{member.name}}</td>
                                   <td><input [(ngModel)]="member.alloc" [ngModelOptions]="{standalone:true}"/></td>
                                   <td><input [(ngModel)]="member.leave" [ngModelOptions]="{standalone:true}"/></td>
                                   <td>{{member.alloc * (calcWorkdays(f.value) - member.leave) * 8 | number: '1.0-1'}} hours</td>
                               </tr>
                            </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Add</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="row" *ngIf="project == null">
        <h1 class="no-content-notice">No project.</h1>
    </div>
    
    <item-detail [item]="ui.awd.item"
                 [(show)]="ui.awd.show"
                 [type]="ui.awd.type"
                 (saved)="onWorkSaved();">
    </item-detail>
    
    <modal-dialog [(show)]="ui.mtd.show" [title]="'Move selected items to plan'">
        <div dialog-body>
            <select #moveTo class="form-control" required>
                <option *ngFor="let p of plans" [value]="p.id">{{p.name}}</option>
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
    </modal-dialog>`,
    styles: [`
    .workspace{height: 100%; padding-top: 10px;}
    .sidenav {background: #fff; padding: 10px;}
    .add-sprint-button{font-size: 14px;}
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    .plan-page {padding-bottom: 15px;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .right{ padding: 0 15px; }
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
    .month{width: 100%;}
    `]
})
export class Plans {
    private current = {};
    private workItems = [];
    private plans = [];
    private sort = {};
    private members;
    private ui;
    private hideFinished = false;
    private PRI = ['High', 'Medium', 'Low'];

    project = null;

    @ViewChild('downloader') downloader;

    constructor(private ele: ElementRef,
                private http: Http,
                private prjs: ProjectService,
                private pref: PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'cpd': {'show': false},
            'rwd': {'show': false}
        };

        prjs.current.subscribe(p => this.project = p);
        prjs.plans.subscribe(plans => this.plans = plans);
        pref.values.subscribe(ps => this.hideFinished = ps.hideFinished);
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();

            var current = this.project;
            if (!this.members && current && current.team) {
                this.http.get('/api/teams/' + current.team['id'] + '/members')
                    .subscribe(resp => this.members = resp.json());
            }
        }
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

    createPlan(data) {
        data['projectId'] = this.project['id'];
        data['availableHours'] = this.sumAvailableHours(data);
        this.ui.cpd.show = false;
        this.prjs.reloadPlans();
    }

    sumAvailableHours(data) {
        let sum = 0;
        let dayHours = 8;
        let days = this.calcWorkdays(data);
        if (days < 0)
            return 0;

        for (let m of this.members) {
            sum += m['alloc'] * (days - m['leave']) * dayHours;
        }

        return sum;
    }

    calcWorkdays(data) {
        var sd = new Date(data.start);
        var ed = new Date(data.end);

        if (sd.getTime() > ed.getTime())
            return -1;

        var workDays = 0;
        while (sd.getTime() <= ed.getTime()) {
            let weekend = (sd.getDay() == 0 || sd.getDay() == 6);
            sd.setHours(sd.getHours() + 24);
            if (weekend) continue;
            workDays++;
        }

        // TODO: add option to include start/end days
        let holidays  = data.holiday || 0;
        return workDays - holidays - 2;
    }

    private getSelectedWorkItemIds() {
        return this.visibleItems().filter(i => i.checked).map(i => i.id);
    }
}
