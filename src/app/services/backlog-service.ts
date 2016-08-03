import {Injectable} from '@angular/core';
import {Http} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {ProjectService} from './project-service';

@Injectable()
export class BacklogService {
    constructor(private http: Http, private prjs: ProjectService) {
    }
}
