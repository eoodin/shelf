import { Injectable } from '@angular/core';
import { RequestOptions, URLSearchParams } from '@angular/http';
import { HttpService } from './http.service';
import { UserService } from './user.service';

@Injectable()
export class StoryService {

  constructor(
    private http: HttpService,
    private users: UserService) { }

  public getStory(id) {
    return this.http.get('/api/stories/' + id)
        .map(resp => resp.json())
        .do(story => this.enrich(story));
  }

  public create(data, params) {
    let d = JSON.parse(JSON.stringify(data));

    if (params && params.parent) {
      d.parentId = params.parent.id;
    }

    return this.http.post('/api/stories/', JSON.stringify(d));
  }

  public save(data) {
    return this.http.patch('/api/stories/' + data['id'], JSON.stringify(data))
      .map(resp => resp.json());
  }

  public delete(id) {
    return this.http.delete('/api/stories/' + id)
      .map(resp => resp.json());
  }

  public load(search) {
    let params = new URLSearchParams();
    for(let key in search) {
        params.set(key, search[key]);
    }
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/stories/', options)
      .map(resp => resp.json())
      .do(stories => {
        stories.forEach(s => this.enrich(s));
      });
  }

  private enrich(story) {
      this.users.getUser(story.creatorId).subscribe(u => story.creator = u);
      this.users.getUser(story.ownerId).subscribe(u => story.owner = u);
  }
}
