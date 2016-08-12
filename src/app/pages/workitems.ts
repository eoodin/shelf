import {Component} from '@angular/core';
import {Http} from '@angular/http';

import {DROPDOWN_DIRECTIVES} from 'ng2-bootstrap/ng2-bootstrap';

import {ProjectService} from '../services/project-service';

@Component({
    selector: 'work-items',
    template: `
    <h2> Under development... </h2>
    `,
    styles: [``]
})
export class WorkItems {
    constructor(private http: Http, private prjs: ProjectService) {
    }
}
