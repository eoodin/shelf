import {Component} from 'angular2/core';
import {Http, Response, Request, RequestMethod, RequestOptions} from 'angular2/http';
import {FormBuilder, Validators, ControlGroup, FORM_DIRECTIVES} from 'angular2/common'

import {DROPDOWN_DIRECTIVES} from 'deps/ng2-bs/ng2-bootstrap.ts';

import {ProjectService} from '../services/project-service.ts';
import {WorkItemDetail} from '../components/work-item-detail.ts';
import {ModalDialog} from '../components/modal-dialog.ts';

@Component({
    selector: 'work-items',
    directives: [WorkItemDetail, ModalDialog, DROPDOWN_DIRECTIVES],
    template: `<div>work items</div>`,
    styles: [``]
})
export class WorkItems {
    constructor(private http: Http, private projectService: ProjectService) {
    }
}
