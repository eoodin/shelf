import {Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import {Http} from '@angular/http';
import {ModalDirective} from 'ng2-bootstrap';
import {ProjectService} from '../services/project-service';

declare var CKEDITOR;

@Component({
    selector: 'item-detail',
    template: `
    <div bsModal #detailDialog="bs-modal" (onHidden)="showChanged(false);" [config]="{backdrop: 'static'}" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="itemModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
        <div class="modal-header">
            <button type="button" class="close" (click)="dialog.hide();" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
            <h4 class="modal-title">Item details</h4>
        </div>
        <div class="modal-body">
          <div class="item-details">
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
                        <ckeditor [(ngModel)]="_item.description" [config]="editorConfig" [ngModelOptions]="{standalone: true}" debounce="400"></ckeditor>
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
        </div>
        </div>
      </div>
    </div>
    `,
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
export class ItemDetail implements OnInit {
    private initialized;
    private _item: Object = {};
    private _type: string = 'Task';
    private editorConfig = {
        extraPlugins: 'uploadimage',
        imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
        toolbar: [
            {
                name: 'styles',
                items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
            },
            {name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar']},
            {name: 'tools', items: ['Maximize']}
            ]
    };

    @ViewChild('detailDialog')
    public dialog: ModalDirective;

    @Output()
    public showChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    public saved: EventEmitter<Object> = new EventEmitter();

    constructor(private http: Http,
                private prjs: ProjectService) {
    }

    ngOnInit() {
        this.initialized = true;
    }
    
    @Input()
    public set show(p: boolean) {
        if (this.initialized) {
            if (p) this.dialog.show();
            else this.dialog.hide();
        }
    }

    @Input()
    public set item(i: Object) {
        this._item = i || {};
    }

    @Input()
    public set type(t: string) {
        this._type = t;
    }

    showChanged(e: boolean) {
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
        
        // close the dialog?
        this.showChange.emit(false);
    }
}
