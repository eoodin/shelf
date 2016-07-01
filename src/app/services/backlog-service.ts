import {Injectable} from '@angular/core';
import {Jsonp} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {ProjectService} from './project-service';

@Injectable()
export class BacklogService {
    constructor(private jsonp:Jsonp, private prjs: ProjectService) {
    }
}
