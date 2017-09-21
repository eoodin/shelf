import { Injectable } from '@angular/core';
import { RequestOptions, URLSearchParams } from '@angular/http';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { BehaviorSubject } from "rxjs";

import { HttpService } from './http.service';
import { UserService } from './user.service';
import { ProjectService } from './project.service';

export interface Defect {
  id: number;
  status: string;
  severity: string;
  title: string;
  creator: string;
  createdAt; string;
  owner: string
}

@Injectable()
export class DefectService extends DataSource<any> {
  private query: BehaviorSubject<Object> = new BehaviorSubject<Object>({});
  private sortter;

  constructor(
    private http: HttpService,
    private users: UserService,
    private projects: ProjectService,
  ) {
    super();
  }

  connect(): Observable<Defect[]> {
    var c = {};
    return Observable.merge(this.query.do(search => c = search), this.sortter.mdSortChange)
      .switchMap(() => this.load())
  }

  disconnect() {
  }

  public setSorter(sortter) {
    this.sortter = sortter;
  }

  public update(search) {
    this.query.next(search);
  }

  private load() {
    let search = this.query.getValue();
    let params = new URLSearchParams();
    for (let key in search) {
      params.set(key, search[key]);
    }
    if (this.sortter.active && this.sortter.direction) {
      params.set('sortBy', this.sortter.active);
      if(this.sortter.direction == 'desc')
        params.set('desc', 'true');
    }
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/defects/', options)
      .map(resp => resp.json())
      .map(result => result.rows)
      .do(rows => {
        rows.forEach(defect => {
          this.users.getUser(defect.creatorId).subscribe(u => defect.creator = u || {});
          this.users.getUser(defect.ownerId).subscribe(u => defect.owner = u);
        })
      });
  }

  public summary(search) {
    let params = new URLSearchParams();
    for (let key in search) {
      params.set(key, search[key]);
    }
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/defects/summary', options)
      .map(resp => resp.json());
  }

  public single(id) {
    return this.http.get('/api/defects/' + id).map(resp => resp.json()).do(d => this.enrichDefect(d));
  }

  public save(id, changes) {
    return this.http.patch('/api/defects/' + id, JSON.stringify(changes));
  }

  public create(data) {
    return this.http.post('/api/defects/', JSON.stringify(data)).map(resp => resp.json());
  }

  private enrichDefect(defect) {
    // creatorId => creator
    this.users.getUser(defect.creatorId).subscribe(u => defect.creator = u);
    // ownerId => owner
    this.users.getUser(defect.ownerId).subscribe(u => defect.owner = u);
    // projectId => project
    this.projects.projects.map(ps => ps[defect.projectId]).subscribe(p => defect.project = p);
    // ensuer description not null
    if (defect.description == null) defect.description = '';
  }
}
