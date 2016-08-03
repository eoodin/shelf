import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from '@angular/http';

import {RichEditor} from './rich-editor';
import {ModalDialog} from './modal-dialog';
import {ProjectService} from '../services/project-service';


@Component({
    selector: 'item-detail',
    template: `
    <modal-dialog [show]="_show" (showChange)="showChanged($event)" [title]="(_item.id ? 'Item Details' : 'Add Item')">
        <div dialog-body class="item-details">
            <form (ngSubmit)="saveItem()">
                <div class="row" >
                    <div class="col-sm-12">
                        Type:
                        <select *ngIf="!_item.id" [(ngModel)]="_item.type" [ngModelOptions]="{standalone: true}" [disabled]="_type">
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
                    <div class="col-sm-12 field-row">
                        <span class="field-label">Found in:</span>
                        <input [(ngModel)]="_item.version" [ngModelOptions]="{standalone: true}">
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12 field-row">
                        <span class="field-label">Title:</span> <input type="text" class="work-item-title" [(ngModel)]="_item.title" [ngModelOptions]="{standalone: true}">
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
                    <div class="col-sm-12">Effort Estimation: <input type="text" [(ngModel)]="_item.estimation" [ngModelOptions]="{standalone: true}"></div>
                </div>
                <div class="row" *ngIf="_item.type == 'UserStory'">
                    <div class="col-sm-12">Story Points: <input type="text" [(ngModel)]="_item.points" [ngModelOptions]="{standalone: true}" value="0"></div>
                </div>
            </form>
        </div>
        <div dialog-footer>
            <button (click)="saveItem()" class="btn btn-default">{{(_item.id ? 'Save' : 'Add')}}</button>
        </div>
    </modal-dialog>
    `,
    directives: [RichEditor, ModalDialog],
    styles: [`
    .item-details { padding-left: 0;}
    .item-details li { list-style:none; margin-bottom: 10px;}
    .item-details li:last-child { margin-bottom: 0;}
    .item-details li .title { font-weight: 700; }
    .item-details li .big-section { display: block;}
    .item-details .row {margin: 8px 0;}
    .field-row {display: flex; flex-direction: row; flex-wrap: nowrap;}
    .field-row .field-label { margin-right: 20px;}
    .field-row input,select {flex-grow: 1;}
     `]

})
export class ItemDetail {
    private _show: boolean = false;
    private _item: Object = {};
    private _type: string = 'Task';

    @Output()
    public showChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    public saved: EventEmitter<Object> = new EventEmitter();

    constructor(private http: Http,
                private ele: ElementRef,
                private prjs: ProjectService) {
    }

    @Input()
    public set show(p: boolean){
        this._show = p;
    }

    @Input()
    public set item(i: Object) {
        this._item = i;
    }

    @Input()
    public set type(t: string) {
        this._type = t;
    }

    showChanged(e: boolean) {
        this._show = e;
        this.showChange.emit(e);
    }

    saveItem() {
        var data = JSON.parse(JSON.stringify(this._item));
        data.projectId = this.prjs.current.getValue()['id'];
        if (!data['id']) {
            this.http.post('/api/work-items/', JSON.stringify(data))
              .subscribe(resp => this.saved.emit(resp));
        }
        else {
            this.http.put('/api/work-items/' + data['id'], JSON.stringify(data))
              .subscribe(resp => this.saved.emit(resp));
        }

        this._show = false;
        this.showChange.emit(false);
    }
}
