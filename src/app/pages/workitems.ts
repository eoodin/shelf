import {Component} from '@angular/core';
import {Http} from '@angular/http';
import {ProjectService} from "../project.service";

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
