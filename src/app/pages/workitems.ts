import {Component} from '@angular/core';
import {Http} from '@angular/http';

import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {ProjectService} from '../services/project-service';
//import {ItemDetail} from '../components/item-detail';
import {ModalDialog} from '../components/modal-dialog';

@Component({
    selector: 'work-items',
    //directives: ['ItemDetail, ModalDialog, DROPDOWN_DIRECTIVES],
    template: `
    <h2> Under development... </h2>
    `,
    styles: [``]
})
export class WorkItems {
    constructor(private http: Http, private prjs: ProjectService) {
    }
}
