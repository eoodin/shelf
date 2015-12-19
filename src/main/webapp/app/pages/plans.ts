import {Component} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {PlanList} from '../components/plan-list.ts';
import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'plans',
    directives: [PlanList],
    template: `
    <div class="row">
        <div class="col-sm-2"><plan-list [project]="projectService.current" (select)="onSelect($event)"></plan-list></div>
        <div class="col-sm-offset-2 right" >
            <div class="panel panel-default">
              <div class="panel-heading">
                <h3 class="panel-title">{{current.name}}</h3>
              </div>
              <div class="panel-body">
                <div class="row">
                 <div class="col-sm-4"><button  class="btn btn-primary" (click)="showAddWorkitemDlg()">Add Workitem...</button></div>
                </div>
                <div class="row">
                  <ul>
                    <li *ngFor="#item of worItems">{{item.title}}</li>
                  </ul>
                </div>
              </div>
            </div>
        </div>
    </div>
    
    <div class="modal fade in" *ngIf="ui.awd.show" [style.display]="ui.awd.show ? 'block' : 'block'" role="dialog">
            <div class="modal-dialog">
                <form #f="ngForm" (ngSubmit)="addWorkItem(f.value)">
                    <div class="modal-content">
                        <div class="modal-header">
                            <button type="button" class="close" (click)="ui.awd.show = false" data-dismiss="modal">&times;</button>
                            <h4 class="modal-title">Add Workitem to {{current.name}}</h4>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-sm-3">Title: </div><div class="col-sm-5"> <input type="text" ngControl="title"></div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    
    `,
    styles: [`.right{ padding: 0 15px; }`]
})
export class Plans {
    private current = {};
    private worItems = [];

    private ui;

    constructor(private http: Http, private projectService: ProjectService) {
        this.ui = {"awd": {"show": false}};
    }

    public onSelect(plan): void {
        this.current = plan;
    }

    showAddWorkitemDlg() {
        this.ui.awd.show = true;
    }

    addWorkItem(data) {
        if (!this.current.id) {
            alert('No selected plan.');
            return;
        }

        //data.plan = this.current.id;
        data.type = 'us';
        this.http.request(new Request(new RequestOptions(
            {url: '/api/work-items/add?plan=' + this.current.id,
                method: RequestMethod.Post,
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(data)
            }))).subscribe(resp => this.onWorkItemCreated(resp));
    }

    onWorkItemCreated(resp) {
        this.ui.awd.show = false;
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
