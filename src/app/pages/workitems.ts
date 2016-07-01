import {Component} from '@angular/core';
import {Jsonp} from '@angular/http';

import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {ProjectService} from '../services/project-service';
//import {WorkItemDetail} from '../components/item-detail';
import {ModalDialog} from '../components/modal-dialog';

@Component({
    selector: 'work-items',
    //directives: [WorkItemDetail, ModalDialog, DROPDOWN_DIRECTIVES],
    template: `
    <h2> Under development... </h2>
    `,
    styles: [``]
})
export class WorkItems {
    constructor(private jsonp: Jsonp, private prjs: ProjectService) {
    }
}