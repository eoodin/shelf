import {Component, Input, Output, EventEmitter, ElementRef} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import Quill from 'quill';

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
                                Title:
                                <input type="text" class="work-item-title" [(ngModel)]="_item.title">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">Description:</div>
                        </div>
                        <div class="row">
                            <div class="col-sm-12">
                                <div class="description-editor">
                                    <label class="toolbar-toggler" [style.background]="editorToggle?'gray':'white'"
                                           style="padding-left: 7px;font-size:18px;border: 1px solid #bbb; border-radius: 3px; overflow: hidden;display:inline-block;float:right;width: 28px; height:28px;background: gray;margin: 5px;">
                                        <input type="checkbox" [(ngModel)]="editorToggle" style="display:none;">
                                        T
                                    </label>
                                    <div [style.display]="editorToggle?'inherit':'none'" class="quill-toolbar toolbar">
                                        <span class="ql-format-group">
                                        <select title="Font" class="ql-font">
                                            <option value="sans-serif" selected="">Sans Serif</option>
                                            <option value="serif">Serif</option>
                                            <option value="monospace">Monospace</option>
                                        </select>
                                        <select title="Size" class="ql-size">
                                            <option value="10px">Small</option>
                                            <option value="13px" selected="">Normal</option>
                                            <option value="18px">Large</option>
                                            <option value="32px">Huge</option>
                                        </select>
                                        </span>
                                        <span class="ql-format-group">
                                        <span title="Bold" class="ql-format-button ql-bold"></span>
                                        <span class="ql-format-separator"></span>
                                        <span title="Italic" class="ql-format-button ql-italic"></span>
                                        <span class="ql-format-separator"></span>
                                        <span title="Underline" class="ql-format-button ql-underline"></span>
                                        <span class="ql-format-separator"></span>
                                        <span title="Strikethrough" class="ql-format-button ql-strike"></span>
                                        </span>
                                        <span class="ql-format-group">
                                        <select title="Text Color" class="ql-color">
                                            <option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)" selected=""></option>
                                            <option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option>
                                            <option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option>
                                            <option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option>
                                            <option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option>
                                            <option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option>
                                            <option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option>
                                            <option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)"></option>
                                            <option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option>
                                            <option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option>
                                            <option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option>
                                            <option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option>
                                            <option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option>
                                            <option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option>
                                            <option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option>
                                            <option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option>
                                            <option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option>
                                            <option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option>
                                            <option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option>
                                            <option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option>
                                            <option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option>
                                            <option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option>
                                            <option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option>
                                            <option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option>
                                            <option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option>
                                            <option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option>
                                            <option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option>
                                            <option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option>
                                            <option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option>
                                            <option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option>
                                            <option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option>
                                            <option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option>
                                            <option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option>
                                            <option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option>
                                            <option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option>
                                        </select>
                                        <span class="ql-format-separator"></span>
                                        <select title="Background Color" class="ql-background">
                                            <option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)"></option>
                                            <option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option>
                                            <option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option>
                                            <option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option>
                                            <option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option>
                                            <option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option>
                                            <option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option>
                                            <option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)" selected=""></option>
                                            <option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option>
                                            <option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option>
                                            <option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option>
                                            <option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option>
                                            <option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option>
                                            <option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option>
                                            <option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option>
                                            <option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option>
                                            <option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option>
                                            <option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option>
                                            <option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option>
                                            <option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option>
                                            <option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option>
                                            <option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option>
                                            <option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option>
                                            <option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option>
                                            <option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option>
                                            <option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option>
                                            <option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option>
                                            <option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option>
                                            <option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option>
                                            <option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option>
                                            <option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option>
                                            <option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option>
                                            <option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option>
                                            <option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option>
                                            <option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option>
                                        </select>
                                        </span>
                                        <span class="ql-format-group">
                                        <span title="List" class="ql-format-button ql-list"></span>
                                        <span class="ql-format-separator"></span>
                                        <span title="Bullet" class="ql-format-button ql-bullet"></span>
                                        <span class="ql-format-separator"></span>
                                        <select title="Text Alignment" class="ql-align">
                                            <option value="left" label="Left" selected=""></option>
                                            <option value="center" label="Center"></option>
                                            <option value="right" label="Right"></option>
                                            <option value="justify" label="Justify"></option>
                                        </select>
                                        </span>
                                        <span class="ql-format-group">
                                        <span title="Link" class="ql-format-button ql-link"></span>
                                        </span>
                                    </div>
                                    <div class="quill-editor"></div>
                                </div>
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
    styles: [`.work-item-details { padding-left: 0;}
    .work-item-details li { list-style:none; margin-bottom: 10px;}
    .work-item-details li:last-child { margin-bottom: 0;}
    .work-item-details li .title { font-weight: 700; }
    .work-item-details li .big-section { display: block;}
    .awd .modal-dialog {width: 720px;}
    .awd .modal-dialog form input.work-item-title { width: 100%; }
    .description-editor { width: 100%; border: 1px solid #ccc; height: 18em; }
    .quill-toolbar {border-bottom:  1px solid #ccc;}
     `]

})
export class ItemDetail {
    private _show: boolean = false;
    private _item: Object = {};
    private _type: string = 'Task';

    private descriptionEditor: any;

    @Output()
    public closed: EventEmitter<Object> = new EventEmitter();

    @Output()
    public saved: EventEmitter<Object> = new EventEmitter();

    constructor(private http: Http,
                private ele: ElementRef,
                private pService: ProjectService) {
    }

    @Input() set show(p: boolean){
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

        this._show = p;
        !p && this.closed.next();
    }

    @Output() get show(): boolean {
        return this._show;
    }

    @Input()
    public set item(i: Object) {
        this._item = i;
        var description = this._item.description || '';
        this.descriptionEditor && this.descriptionEditor.setHTML(description);
    }

    @Input()
    public set type(t: string) {
        this._type = t;
    }

    saveWorkItem() {
        var data = JSON.parse(JSON.stringify(this._item));
        data['description'] = this.descriptionEditor.getHTML();
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
