import {Component} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList, DROPDOWN_DIRECTIVES],
    templateUrl: 'app/templates/plans.html',
    styles: [`.right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    [ngcontrol='description'] { width: 100%; height: 8em; }
    .item-table{position:relative;}
    .checkbox{margin:0; width: 22px; height: 22px;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    `],
    styleUrls: ['../../deps/css/css-spinner.css']
})
export class Plans {
    private current = {};
    private worItems = [];
    private plans = null;
    private ui;

    constructor(private http: Http, private projectService: ProjectService) {
        this.ui = {
            "awd": {"show": false},
            "mtd": {"show": false},
            "showDetailDlg": {"show": false}, "loading": {"show": false}};
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();
        }
    }

    showMoveToDialog() {
        this.ui.mtd.show = true;
        if (!this.plans) {
            this.http.get('/api/plans/?project=' + this.projectService.current.id)
                .subscribe(resp => this.setPlans(resp.json()));
        }
    }

    listPlans() {
        this.http.get('/api/plans/?project=' + this.projectService.current.id)
            .subscribe(resp => this.setPlans(resp.json()));
    }

    setPlans(plans) {
        this.plans = plans;
    }

    moveItemsToPlan(planId) {
        // TODO: compose selected ids
        //var ids = {"workItemIds": ["1"]};
        var ids = ["1"];
        this.http.post('/api/plans/' + planId + '/move-in', JSON.stringify(ids))
            .subscribe(resp => this.onMoveToPlanResponse(resp.json()));
    }

    onMoveToPlanResponse(response) {
        this.ui.mtd.show = false;
        this.loadWorkItems();
    }

    showAddWorkitemDlg() {
        this.ui.awd.show = true;
    }

    addWorkItem(data) {
        if (!this.current.id) {
            alert('No selected plan.');
            return;
        }

        this.http.request(new Request(new RequestOptions(
            {url: '/api/work-items/add?plan=' + this.current.id,
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }))).subscribe(resp => this.onWorkItemCreated(resp));
    }

    showItem(item) {
        this.ui.showDetailDlg.item = item;
        this.ui.showDetailDlg.show = true;
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp => this.onWorkItemRemoved(resp));
    }

    changeStatus(item, status) {
        console.log("TODO: change status not implemented");
        this.ui.loading.show = true;
        this.http.put('api/work-items/' + item.id + '/status', status)
            .subscribe(resp => this.onStatusUpdate(resp));
    }

    onWorkItemCreated(resp) {
        this.ui.awd.show = false;
        this.loadWorkItems();
    }

    onWorkItemRemoved(resp) {
        this.loadWorkItems();
    }

    onStatusUpdate(resp) {
        this.ui.loading.show = false;
        this.loadWorkItems();
    }

    loadWorkItems() {
        this.http.get('/api/work-items/list?planId=' + this.current.id)
            .subscribe(resp => this.setWorkItems(resp.json()));
    }

    setWorkItems(items) {
        this.worItems = items;
    }
}
