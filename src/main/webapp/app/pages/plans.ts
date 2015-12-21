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
            <div class="row">
                <div class="panel panel-default">
                  <div class="panel-heading">{{current.name}}</div>
                  <table class="table">
                    <tr><th>ID</th><th>title</th></tr>
                    <tr *ngFor="#item of worItems">
                      <td>{{item.id}}</td><td><a (click)="showItem(item)">{{item.title}}</a></td>
                    </tr>
                  </table>
                </div>
            </div>
            <div class="row">
                 <div class="col-sm-4"><button  class="btn btn-primary" (click)="showAddWorkitemDlg()">Add Workitem...</button></div>
            </div>
        </div>
    </div>
    
    <div class="modal fade in awd" *ngIf="ui.awd.show" [style.display]="ui.awd.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <form #f="ngForm" (ngSubmit)="addWorkItem(f.value)">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="ui.awd.show = false" data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">Add Workitem to {{current.name}}</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-sm-3">Type: </div>
                            <div class="col-sm-8">
                             <select name="type">
                              <option value="US">User Story</option>
                              <option value="TA">Task</option>
                              <option value="DE">Defect</option>
                             </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-3">Title: </div><div class="col-sm-8"> <input type="text" class="title" ngControl="title"></div>
                        </div>
                        <div class="row">
                            <div class="col-sm-3">Description: </div>
                            <div class="col-sm-8">
                             <textarea class="description" ngControl="description"></textarea>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-3">Effort Estimation: </div>
                            <div class="col-sm-8">
                             <input type="text" ngControl="estimation">
                            </div>
                        </div>

                        <div class="row"> <!-- TODO: ngIf type='us' -->
                            <div class="col-sm-3">Story Points </div>
                            <div class="col-sm-8">
                             <input type="text" ngControl="points" value="0">
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    <div class="modal fade in awd" *ngIf="ui.showDetailDlg.show" [style.display]="ui.showDetailDlg.show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <button type="button" class="close" (click)="ui.showDetailDlg.show = false" data-dismiss="modal">&times;</button>
                    <h4 class="modal-title">{{ui.showDetailDlg.item.title}}</h4>
                </div>
                <div class="modal-body">
                    <ul>
                      <li>Description:{{ui.showDetailDlg.item.description}}</li>
                      <li>Estimation:{{ui.showDetailDlg.item.estimation}} hours</li>
                    </ul>
                </div>
                <div class="modal-footer">
                    <button (click)="ui.showDetailDlg.show=false;" class="btn btn-default" data-dismiss="modal">Close</button>
                </div>
            </div>
        </div>
    </div>
    `,
    styles: [`.right{ padding: 0 15px; }
    .awd .modal-body .row {padding: 5px 0;}
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
        this.current = plan;
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

        data.type = 'us';
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
