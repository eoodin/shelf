import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { DataSource, CollectionViewer } from '@angular/cdk/collections';

import { HttpService } from './http.service';
import { UserService } from './user.service';
import { RequestOptions, URLSearchParams } from '@angular/http';

export interface Task {
  id: number;
  title: string;
  priority: string;
  status: string;
  owner: string;
}

@Injectable()
export class TaskService extends DataSource<Task> {
  private criteria: Subject<Object> = new Subject<Object>();

  constructor(private http: HttpService, private users: UserService) {
    super();
  }

  connect(collectionViewer: CollectionViewer): Observable<Task[]> {
    return this.criteria.switchMap(criteria => this.fetch(criteria));
  }

  disconnect(collectionViewer: CollectionViewer): void { }

  public update(criteria) {
    // optimize: check if it is the same?
    this.criteria.next(criteria);
  }

  public delete(id) {
    return this.http.delete('/api/task/' + id);
  }

  public save(id, changes) {
    return this.http.patch('/api/task/' + id, JSON.stringify(changes));
  }

  public create(data) {
    return this.http.post('/api/tasks/', JSON.stringify(data)).map(resp => resp.json());
  }

  public fetch(search) {
    let params = new URLSearchParams();
    for (let key in search) {
        params.set(key, search[key]);
    }

    let options = new RequestOptions({ search: params });
    return this.http.get('/api/tasks/', options)
      .map(resp => resp.json());
  }

  public moveToPlan(ids, planId) {
    let change = {'ids': ids, 'changes': {'planId': planId}};
    return this.http.patch('/api/tasks/', JSON.stringify(change));
  }
}
