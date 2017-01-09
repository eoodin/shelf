import {Component, ElementRef} from '@angular/core';
import {Http} from '@angular/http';
import {ProjectService} from "../project.service";
import {PreferenceService} from "../preference.service";

@Component({
    selector: 'backlog',
    template: `
    <div class="backlog-page" *ngIf="project">
        <div class="project-info">
           <div class="dropdown project-select" dropdown keyboard-nav>
               <a href="javascript:void(0);" class="dropdown-toggle" dropdownToggle>
                   <h5 style="display:inline-block;" *ngIf="project">{{project.name}}</h5><span class="caret"></span>
               </a>
               <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
                 <li *ngFor="let p of projects" role="menuitem">
                   <a (click)="prs.setCurrent(p)">{{p.name}}</a>
                 </li>
               </ul>
            </div>
            <div class="project-operations">
                <button class="btn btn-primary" (click)="showAddItem('UserStory')">Write User Story...</button>
                <button class="btn btn-warning" (click)="showAddItem('Defect')">Report Problem...</button>
            </div>
        </div>
        <div class="plan-body">
            <div class="item-table">
                <div class="loading-mask" *ngIf="ui.loading.show">
                    <div class="spinner-loader"></div>
                </div>
                <div class="panel panel-default">
                    <div class="panel-heading work-items-heading">
                        <div>
                            <label>
                                <input type="checkbox" [ngModel]="showTasks"  (ngModelChange)="showTasks = $event; loadItems();"/>
                                Show tasks
                            </label>

                            <label>
                                <input type="checkbox" [ngModel]="hideFinished" [disabled]="!showTasks" (ngModelChange)="hideFinished = $event; loadItems();"/>
                                Hide finished
                            </label>
                        </div>
                    </div>
                    <table *ngIf="items" class="table">
                        <tr>
                            <th> ID </th>
                            <th> Type </th>
                            <th> State </th>
                            <th> Title </th>
                            <th> Owner </th>
                            <th> Operations </th>
                        </tr>
                        <tr *ngFor="let item of items">
                            <td> {{item.id}} </td>
                            <td> {{item.type}} </td>
                            <td *ngIf="item.type != 'Defect'"> {{item.status}} </td>
                            <td *ngIf="item.type == 'Defect'"> {{item.state}} </td>
                            <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                            <td *ngIf="item.owner"> {{item.owner.name}} </td>
                            <td *ngIf="!item.owner"> Unassigned </td>
                            <td>
                                <button 
                                    *ngIf="item.type == 'Defect' && item.state == 'Created'"
                                    [disabled]="requesting"
                                    (click)="startFix(item)"
                                     class="btn btn-default btn-sm">Start Fix</button>
                                <button 
                                    *ngIf="item.type == 'Defect' && item.state == 'Fixed'"
                                    [disabled]="requesting"
                                    (click)="startTest(item)"
                                    class="btn btn-default btn-sm">Start Test</button>
                                <!--
                                <button 
                                    *ngIf="item.type == 'Defect' && item.state == 'Testing'"
                                    [disabled]="requesting"
                                    (click)="markTestResult(true)"
                                    class="btn btn-default btn-sm">Pass</button>
                                <button 
                                    *ngIf="item.type == 'Defect' && item.state == 'Testing'"
                                    [disabled]="requesting"
                                    (click)="markTestResult(false)"
                                    class="btn btn-default btn-sm">Fail</button>
                                -->
                            </td>
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
                 [(show)]="ui.awd.show"
                 [type]="ui.awd.type"
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
    .backlog-page {padding: 15px 0;}
    .project-info { height:40px; padding: 2px 0;}
    .project-info .project-select{ display: inline-block;}
    .project-operations { float: right;}
    .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table{position:relative;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .type-and-id input { display: inline-block; }
    `]
})
export class Backlog {
    private project = null;
    private projects = [];
    private items = [];
    private ui;
    private sort: any;
    private requesting = false;
    private showTasks: boolean;
    private hideFinished: boolean;

    constructor(private ele: ElementRef,
                private http: Http,
                private prs: ProjectService,
                private pref: PreferenceService) {
        this.showTasks = false; // TODO: save to preference
        this.hideFinished = false; // TODO: save to preference
        this.ui = {
            'loading': {'show': false},
            'awd': {'show': false, 'loading': false, 'item': {}},
            'mtd': {'show': false},
            'rwd': {'show': false}
        };

        prs.projects.subscribe(ps => this.projects = ps);
        prs.current
            .filter(p => p != this.project)
            .do(p => this.project = p)
            .subscribe(p => this.loadItems());
    }

    loadItems() {
        let q = 'projectId=' + this.project.id;
        let types = 'UserStory,Defect';
        if (this.showTasks) {
            types += ',Task'
        }
        q += '&types=' + types;
        if (this.showTasks && this.hideFinished) {
            q += '&status=New,InProgress,Pending,Dropped'
        }

        this.http.get('/api/work-items/?' + q)
            .subscribe(b => this.items = b.json());
    }

    showAddItem(type) {
        this.ui.awd.type = type;
        this.ui.awd.item = {type: type};
        if (this.project)
            this.ui.awd.item.projectId = this.project.id;

        if (type == 'Defect')
            this.ui.awd.item.severity = 'Major';

        this.ui.awd.show = true;
    }

    startFix(item) {
        this.requesting = true;
        this.http.post('/api/defects/' + item.id + '/fix', '{}')
            .finally(() => this.requesting = false)
            .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                }
            );
    }

    startTest(item) {
        this.requesting = true;
        this.http.post('/api/defects/' + item.id + '/test', '{}')
            .finally(() => this.requesting = false)
            .subscribe(
                () => this.loadItems(),
                () => window.alert('Error occurred.')
            );
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
            .subscribe(resp => {
                this.loadItems();
                this.ui.rwd.show = false;
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
