import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable()
export class StoryService {

  constructor(private http: HttpService) { }

  public getStory(id) {
    return this.http.get('/api/work-items/' + id)
        .map(resp => resp.json());
  }

  public create(data, params) {
    let d = JSON.parse(JSON.stringify(data));

    if (params && params.parent) {
      d.parentId = params.parent.id;
    }

    return this.http.post('/api/work-items/', JSON.stringify(d));
  }
}
