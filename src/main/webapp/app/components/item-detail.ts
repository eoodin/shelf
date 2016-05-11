import {Component, Input, Output, EventEmitter, ElementRef} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {RichEditor} from './rich-editor.ts';

import {ProjectService} from '../services/project-service.ts';

@Component({
    selector: 'item-detail',
    template: `
    <div class="modal fade in awd" [style.display]="_show ? 'block' : 'none'" role="dialog">
        <div class="modal-dialog">
            <form (ngSubmit)="saveWorkItem()">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" (click)="show = false"
                                data-dismiss="modal">&times;</button>
                        <h4 class="modal-title" *ngIf="!_item.id">Add Work Item</h4>
                        <h4 class="modal-title" *ngIf="_item.id">Work Item Detail</h4>
                    </div>
                    <div class="modal-body">
                        <div class="row" >
                            <div class="col-sm-12">
                                Type:
                                <select *ngIf="!_item.id" [(ngModel)]="_item.type" [disabled]="_type">
                                    <option value="UserStory" selected="selected">User Story</option>
                                    <option value="Task">Task</option>
                                    <option value="Defect">Defect</option>
                                </select>
                                <span *ngIf="_item.id">{{_item.type}}</span>
                            </div>
                        </div>
                        <div *ngIf="_item.type == 'Defect'" class="row">
                            <div class="col-sm-12">Severity:
                                <label><input #s1 type="radio" [checked]="_item.severity==s1.value" (click)="_item.severity=s1.value" value="Blocker">Blocker</label>
                                <label><input #s2 type="radio" [checked]="_item.severity==s2.value" (click)="_item.severity=s2.value" value="Critical">Critical</label>
                                <label><input #s3 type="radio" [checked]="_item.severity==s3.value" (click)="_item.severity=s3.value" value="Major">Major</label>
                                <label><input #s4 type="radio" [checked]="_item.severity==s4.value" (click)="_item.severity=s4.value" value="Minor">Minor</label>
                            </div>
                        </div>
                        <div *ngIf="_item.type == 'Defect'" class="row">
                            <div class="col-sm-12">Found in:
                                <input [(ngModel)]="_item.version">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                Title: <input type="text" class="work-item-title" [(ngModel)]="_item.title">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">Description:</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <rich-editor [content]="_item.description" (update)="_item.description = $event"></rich-editor>
                            </div>
                        </div>
                        <div *ngIf="_item.type == 'Task'" class="row">
                            <div class="col-sm-12">Effort Estimation: <input type="text" [(ngModel)]="_item.estimation"></div>
                        </div>
                        <div class="row" *ngIf="_item.type == 'UserStory'">
                            <div class="col-sm-12">Story Points: <input type="text" [(ngModel)]="_item.points" value="0"></div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button *ngIf="!_item.id" type="submit" class="btn btn-default" data-dismiss="modal">Create</button>
                        <button *ngIf="_item.id" type="submit" class="btn btn-default" data-dismiss="modal">Save</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
    `,
    directives: [RichEditor],
    styles: [`.work-item-details { padding-left: 0;}
    .work-item-details li { list-style:none; margin-bottom: 10px;}
    .work-item-details li:last-child { margin-bottom: 0;}
    .work-item-details li .title { font-weight: 700; }
    .work-item-details li .big-section { display: block;}
    .awd .modal-dialog {width: 720px;}
    .awd .modal-dialog form input.work-item-title { width: 100%; }
     `]

})
export class ItemDetail {
    private _show: boolean = false;
    private _item: Object = {};
    private _type: string = 'Task';

    @Output()
    public closed: EventEmitter<Object> = new EventEmitter();

    @Output()
    public saved: EventEmitter<Object> = new EventEmitter();

    constructor(private http: Http,
                private ele: ElementRef,
                private pService: ProjectService) {
    }

    @Input() set show(p: boolean){
        this._show = p;
        !p && this.closed.next();
    }

    @Output() get show(): boolean {
        return this._show;
    }

    @Input()
    public set item(i: Object) {
        this._item = i;
    }

    @Input()
    public set type(t: string) {
        this._type = t;
    }

    saveWorkItem() {
        var data = JSON.parse(JSON.stringify(this._item));
        data['projectId'] = this.pService.current.id;
        if (!data['id']) {
            this.http.request(new Request(new RequestOptions(
                {url: '/api/work-items/',
                    method: RequestMethod.Post,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                }))).subscribe(resp => this.saved.next(resp));
        }
        else {
            this.http.request(new Request(new RequestOptions(
                {url: '/api/work-items/' + data['id'],
                    method: RequestMethod.Put,
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(data)
                }))).subscribe(resp => this.saved.next(resp));
        }

        this.show = false;
    }
}
