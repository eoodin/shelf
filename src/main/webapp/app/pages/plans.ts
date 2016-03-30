import {Component, ElementRef} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';
import moment from 'moment';

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';
import {WorkItemDetail} from '../components/work-item-detail.ts';
import {ModalDialog} from '../components/modal-dialog.ts';
import Quill from 'quill';

@Component({
    selector: 'plans',
    directives: [PlanList, WorkItemDetail, ModalDialog, DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
    templateUrl: 'app/templates/plans.html',
    styles: [`
    .plan-page {padding-bottom: 15px;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .description-editor { width: 100%; border: 1px solid #ccc; height: 18em; }
    .quill-toolbar {border-bottom:  1px solid #ccc;}
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
    .work-item-details { padding-left: 0;}
    .work-item-details li { list-style:none; margin-bottom: 10px;}
    .work-item-details li:last-child { margin-bottom: 0;}
    .work-item-details li .title { font-weight: 700; }
    .work-item-details li .big-section { display: block;}
    .awd .modal-dialog {width: 720px;}
    .awd .modal-dialog form input.work-item-title { width: 100%; }
    `],
    styleUrls: ['../../deps/css/css-spinner.css']
})
export class Plans {
    private current = {};
    private workItems = [];
    private plans = null;
    private members;
    private ui;
    private descriptionEditor;
    private hideFinished = false;

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

    showAddItem() {
        this.ui.awd.item = {'description': ''};
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
        this.ui.awd.item = item;
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

    loadWorkItems() {
        this.http.get('/api/work-items/?planId=' + this.current.id)
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
