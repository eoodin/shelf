import {Component, OnInit, Input, Output, EventEmitter} from 'angular2/core';
import {Http, Request, Response, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

@Component({
    selector: 'work-item-detail',
    template: `
    <div class="modal fade in awd" *ngIf="_show" [style.display]="_show ? 'block' : 'block'" role="dialog">
        <div class="modal-dialog">
            <div class="modal-content">
                <form>
                    <div class="modal-header">
                        <button type="button" class="close" (click)="_show = false"
                                data-dismiss="modal">&times;</button>
                        <h4 class="modal-title">{{_item.title}}</h4>
                    </div>
                    <div class="modal-body">
                        <ul>
                            <li>Description:{{_item.description}}</li>
                            <li>Estimation:{{_item.estimation}} hours</li>
                        </ul>
                    </div>
                    <div class="modal-footer">
                        <button type="submit" class="btn btn-default" data-dismiss="modal">Save </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
    `,
    styles: [` `]
})
export class WorkItemDetail {
    private _show: boolean;
    private _item: Object;

    //@Output() public select: EventEmitter<PlanList> = new EventEmitter();

    constructor(private http: Http) {
        this._show = true;
        this._item = {};
    }

    set show(isShow) {
        console.log("Show status change to: " + isShow);
        this._show = isShow;
    }

    get show() {
        return this._show;
    }

    set item(i) {
        this._item = i;
    }
}
