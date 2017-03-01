import { Component, Input, Output, EventEmitter, ViewChild, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import { ModalDirective } from 'ng2-bootstrap';
import { ProjectService } from "../project.service";
import { TaskService } from '../task.service';

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
            <h4 class="modal-title">{{(_item.id ? 'Task Details' : 'Adding Task...') }}</h4>
        </div>
        <div class="modal-body">
          <div class="item-details">
            <form (ngSubmit)="saveItem()">
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
                        <rich-editor rich-editor [(content)]="_item.description"> </rich-editor>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">Effort Estimation: <input type="text" [(ngModel)]="_item.estimation" [ngModelOptions]="{standalone: true}"></div>
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
    private project = {};
    private editorConfig = {
        extraPlugins: 'uploadimage',
        imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
        toolbar: [
            {
                name: 'styles',
                items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
            },
            { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
            { name: 'tools', items: ['Maximize'] }
        ]
    };

    @ViewChild('detailDialog')
    public dialog: ModalDirective;

    @Output()
    public showChange: EventEmitter<boolean> = new EventEmitter<boolean>();

    @Output()
    public saved: EventEmitter<Object> = new EventEmitter();

    constructor(private http: Http,
        private tasks: TaskService,
        private prjs: ProjectService) {
        prjs.current.subscribe(p => this.project = p);
    }

    ngOnInit() {
        this.initialized = true;
    }

    @Input()
    public set show(p: boolean) {
        if (this.initialized) {
            if (p) {
                this.dialog.config.backdrop = false; // Workaround of modal bug
                this.dialog.show();
            }
            else this.dialog.hide();
        }
    }

    @Input()
    public set item(i: Object) {
        this._item = i || {};
    }

    showChanged(e: boolean) {
        this.showChange.emit(e);
    }

    saveItem() {
        var data = JSON.parse(JSON.stringify(this._item));
        if (!data['id']) {
            data.projectId = this.project['id'];
            this.tasks.create(data)
                .subscribe(result => this.saved.emit(result));
        }
        else {
            let id = data['id'];
            delete data['id'];
            this.tasks.save(id, data)
                .subscribe(result => this.saved.emit(result));
        }

        this.showChange.emit(false);
    }
}
