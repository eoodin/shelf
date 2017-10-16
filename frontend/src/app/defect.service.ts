import { Injectable } from '@angular/core';
import { RequestOptions, URLSearchParams } from '@angular/http';
import { DataSource } from '@angular/cdk/collections';
import { Observable } from 'rxjs';
import { BehaviorSubject, Subject } from 'rxjs';

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
  owner: string;
}

interface Sorting {
  by: string;
  direction: string;
}

export class DefectPage  extends DataSource<Defect> {
  public total  = new BehaviorSubject<number>(0);
  public project = new BehaviorSubject<Object>({});
  public sorting = new BehaviorSubject<Object>({});
  public paging = new BehaviorSubject<Object>({pageSize: 10, pageIndex: 0});
  public filters = new BehaviorSubject<Object>({noclosed: true, nodeclined: true});

  private defects = new BehaviorSubject<Defect[]>([]);
  private defectsSub;

  constructor(private defectService: DefectService) {
    super();
  }

  connect(): Observable<Defect[]> {
    return this.defectsSub = Observable.combineLatest(
      this.project.filter(p => p['id']).distinct(),
      this.sorting.distinct(),
      this.paging.distinct(),
      this.filters)
    .debounceTime(50)
    .switchMap(criteria => {
      let [proj, sort, page, f] = criteria;
      return this.defectService.loadDefects(proj['id'], f, sort, page)
        .do(results => {
          this.total.next(results.count);
          this.defects.next(results.rows);
        })
        .map(results => this.defects.getValue());
    });
  }

  disconnect(): void { }
}

@Injectable()
export class DefectService {
  private query = new Subject<Object>();
  private sorting = new Subject<Sorting>();
  private page;

  constructor(
    private http: HttpService,
    private users: UserService,
    public projects: ProjectService,
  ) { }

  disconnect() {
  }

  public sort(sorting) {
    this.sorting.next(sorting);
  }

  public search(search) {
    this.query.next(search);
  }

  public getPage(): DefectPage {
    if (!this.page) {
      this.page = new DefectPage(this);
      this.projects.current.subscribe(p => this.page.project.next(p));
    }

    return this.page;
  }

  public loadDefects(pid, filter, sorting, paging) {
    let params = new URLSearchParams();

    params.set('project', pid);

    for (let key in filter) {
      params.set(key, filter[key]);
    }

    if (sorting.by) {
      params.set('sortBy', sorting.by);
      if (sorting.direction != 'desc') // TODO: why?
        params.set('desc', 'true');
    }

    params.set('offset',  '' + (paging.pageIndex * paging.pageSize));
    params.set('size', paging.pageSize);

    let options = new RequestOptions({ search: params });
    return this.http.get('/api/defects/', options)
      .map(resp => resp.json())
      .do(result => {
        result.rows.forEach(defect => {
          this.users.getUser(defect.creatorId).subscribe(u => defect.creator = u || {});
          this.users.getUser(defect.ownerId).subscribe(u => defect.owner = u);
        });
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

  public loadComments(defect) {
    return this.http.get('/api/defects/' + defect.id + '/comments').map(resp => resp.json());
  }

  public addComment(defect, message) {
    return this.http.post('/api/defects/' + defect.id + '/comments', {message: message}).map(resp => resp.json());
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
