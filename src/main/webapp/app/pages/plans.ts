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
    directives: [PlanList, ItemDetail, ModalDialog, Backlog, DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
    templateUrl: 'app/templates/plans.html',
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

    constructor(private ele: ElementRef,
                private http: Http,
                private projectService: ProjectService,
                private pref : PreferenceService) {
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'rwd': {'show': false}
        };

        this.hideFinished  = eval(pref.preferences['hideFinished']);
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
        if (!this.plans) { // TODO: use plan service to manager plan list.
            var projectId = this.projectService.current.id;
            this.http.get('/api/plans/?project=' + projectId)
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
        console.log("Detail dialog closed.");
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
