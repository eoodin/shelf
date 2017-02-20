import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable()
export class DefectService {

  constructor(private http: HttpService) { }

  public load(option) {
        let q = 'projectId=' + option.project;
        return this.http.get('/api/stories//?' + q).map(resp => resp.json());
  }

}
