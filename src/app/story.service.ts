import { Injectable } from '@angular/core';
import { HttpService } from './http.service';

@Injectable()
export class StoryService {

  constructor(private http: HttpService) { }

  public getStory(id) {
    return this.http.get('/api/work-items/' + id)
        .map(resp => resp.json());
  }
}
