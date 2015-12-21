import {Component} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList],
    templateUrl: 'app/templates/plans.html',
    styles: [`.right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    [ngcontrol='description'] { width: 100%; height: 8em; }
    `]
})
export class Plans {
    private current = {};
    private worItems = [];

    private ui;

    constructor(private http: Http, private projectService: ProjectService) {
        this.ui = {"awd": {"show": false}, "showDetailDlg": {"show": false}};
    }

    public onSelect(plan): void {
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();
        }
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
        console.log("Deleting item", item);
        this.http.delete('/api/work-items/' + item.id)
            .subscribe(resp => this.onWorkItemRemoved(resp));
    }

    onWorkItemCreated(resp) {
        this.ui.awd.show = false;
        this.loadWorkItems();
    }

    onWorkItemRemoved(resp) {
        console.log("Item deleted.", resp);
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
