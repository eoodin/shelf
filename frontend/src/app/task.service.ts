import {Injectable} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {switchMap} from 'rxjs/operators';
import {CollectionViewer, DataSource} from '@angular/cdk/collections';

import {HttpService} from './http.service';
import {UserService} from './user.service';
import {HttpParams} from '@angular/common/http';

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
    return this.criteria.pipe(switchMap(criteria => this.fetch(criteria)));
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
    return this.http.post('/api/tasks/', JSON.stringify(data));
  }

  public fetch(search) {
    let params = new HttpParams();
    for (let key in search) {
        params = params.append(key, search[key]);
    }

    return this.http.get<Task[]>('/api/tasks/', { params: params });
  }

  public moveToPlan(ids, planId) {
    let change = {'ids': ids, 'changes': {'planId': planId}};
    return this.http.patch('/api/tasks/', JSON.stringify(change));
  }
}
