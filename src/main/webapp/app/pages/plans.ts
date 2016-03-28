import {Component} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';
import moment from 'moment';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';
import {WorkItemDetail} from '../components/work-item-detail.ts';
import {ModalDialog} from '../components/modal-dialog.ts';

@Component({
    selector: 'plans',
    directives: [PlanList, WorkItemDetail, ModalDialog, DROPDOWN_DIRECTIVES],
    templateUrl: 'app/templates/plans.html',
    styles: [`.right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    [ngcontrol='description'] { width: 100%; height: 8em; }
    .plan-head h1 {font-size: 18px;}
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
    private members;
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

            if (!this.members) {
                this.http.get('/api/teams/' + this.projectService.current.team.id + '/members')
                    .subscribe(resp => this.members = resp.json());
            }
        }
    }

    showMoveToDialog() {
        this.ui.mtd.show = true;
        if (!this.plans) {
            this.http.get('/api/plans/?project=' + this.projectService.current.id)
                .subscribe(resp => this.plans = resp.json());
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

    showAddWorkitemDlg() {
        this.ui.awd.show = true;
    }

    addWorkItem(data) {
        if (!this.current.id) {
            alert('No selected plan.');
            return;
        }

        data['projectId'] = this.projectService.current.id;
        data['planId'] = this.current.id;
        this.http.request(new Request(new RequestOptions(
            {url: '/api/work-items/',
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }))).subscribe(resp => this.onWorkItemCreated(resp));
    }

    showItem(item) {
        this.ui.showDetailDlg.item = item;
        this.ui.showDetailDlg.show = true;
        console.log(this.ui.showDetailDlg);
    }

    removeItem(item) {
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp => this.onWorkItemRemoved(resp));
    }

    moveItems() {
        console.log("TODO: not implemented.");
        console.log(this.workItems);
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
        this.http.get('/api/work-items/?planId=' + this.current.id)
            .subscribe(resp => this.setWorkItems(resp.json()));
    }

    setWorkItems(items) {
        this.workItems = items;
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
