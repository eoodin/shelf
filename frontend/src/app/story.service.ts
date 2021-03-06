import { Injectable } from '@angular/core';
import {HttpParams} from '@angular/common/http';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

import {BehaviorSubject, Observable} from 'rxjs';
import {switchMap, tap} from 'rxjs/operators';
import { HttpService } from './http.service';
import { UserService } from './user.service';


export interface UserStory {
  id: number;
  priority: string;
  status: string;
  title: string;
  creator: string;
  points: number;
  description: string;
}

@Injectable()
export class StoryService extends DataSource<any> {
  private criteria = new BehaviorSubject<Object>({});

  constructor(
    private http: HttpService,
    private users: UserService) {
      super();
    }

  public getStory(id) {
    return this.http.get<UserStory>('/api/stories/' + id)
        .pipe(tap(story => this.enrich(story)));
  }

  connect(collectionViewer: CollectionViewer): Observable<any[]> {
    return this.criteria.pipe(switchMap(search => this.load(search)));
  }
  disconnect(collectionViewer: CollectionViewer): void {
  }

  public create(data, params) {
    let d = JSON.parse(JSON.stringify(data));

    if (params && params.parent) {
      d.parentId = params.parent.id;
    }

    return this.http.post('/api/stories/', JSON.stringify(d));
  }

  public save(data) {
    return this.http.patch('/api/stories/' + data['id'], JSON.stringify(data));
  }

  public delete(id) {
    return this.http.delete('/api/stories/' + id);
  }

  public update(search) {
    this.criteria.next(search);
  }

  public load(search) {
    let params = new HttpParams();
    for(const key in search) {
        params = params.append(key, search[key]);
    }

    return this.http.get<UserStory[]>('/api/stories/', { params: params })
      .pipe(tap(stories => {
        stories.forEach(s => this.enrich(s));
      }));
  }

  private enrich(story) {
      this.users.getUser(story.creatorId).subscribe(u => story.creator = u || {});
      this.users.getUser(story.ownerId).subscribe(u => story.owner = u);
  }
}
