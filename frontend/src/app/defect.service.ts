import {Injectable} from '@angular/core';
import {HttpParams} from '@angular/common/http';
import {DataSource} from '@angular/cdk/collections';
import {BehaviorSubject, combineLatest, Observable, Subject} from 'rxjs';

import {HttpService} from './http.service';
import {UserService} from './user.service';
import {ProjectService} from './project.service';
import {filter, distinct, map, tap, debounceTime, switchMap} from 'rxjs/operators';

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
  public sorting = new BehaviorSubject<Sorting>({by: 'id', direction: 'desc'});
  public paging = new BehaviorSubject<Object>({pageSize: 10, pageIndex: 0});
  public filters = new BehaviorSubject<Object>({noclosed: true, nodeclined: true});

  private defects = new BehaviorSubject<Defect[]>([]);
  private defectsSub;

  constructor(private defectService: DefectService) {
    super();
  }

  connect(): Observable<Defect[]> {
    return this.defectsSub = combineLatest(
      this.project.pipe(filter(p => p['id']), distinct()),
      this.sorting.pipe(distinct()),
      this.paging.pipe(distinct()),
      this.filters)
        .pipe(
            debounceTime(50),
            switchMap(criteria => {
                let [proj, sort, page, f] = criteria;
                return this.defectService.loadDefects(proj['id'], f, sort, page)
                    .pipe(
                        tap(results => {
                            this.total.next(results.count);
                            this.defects.next(results.rows);
                        }),
                        map(results => this.defects.getValue()));
            })
        );
  }

  disconnect(): void { }
}

class DefectResponse {
    count: number;
    total: number;
    rows: Defect[];
}

class ProjectSummary {
    total: number;
    open: number;
    closed: number;
    declined: number;
    failed: number;
    fixing: number;
    testing: number;
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
    let params = new HttpParams();
    params = params.append('project', pid);

    for (let key in filter) {
      params = params.append(key, filter[key]);
    }

    if (sorting.by) {
      params = params.append('sortBy', sorting.by);
      if (sorting.direction == 'desc')
        params = params.append('desc', 'true');
    }

    params = params.append('offset',  '' + (paging.pageIndex * paging.pageSize));
    params = params.append('size', paging.pageSize);

    return this.http.get<DefectResponse>('/api/defects/', { params: params });
  }

  public summary(search) {
      let params = new HttpParams();
      for (let key in search) {
          params.append(key, search[key]);
      }
    return this.http.get<ProjectSummary>('/api/defects/summary', {params: search});
  }

  public single(id) {
    return this.http.get('/api/defects/' + id).pipe(tap(d => this.enrichDefect(d)));
  }

  public save(id, changes) {
    return this.http.patch('/api/defects/' + id, JSON.stringify(changes));
  }

  public loadComments(defect) {
    return this.http.get('/api/defects/' + defect.id + '/comments');
  }

  public addComment(defect, message) {
    return this.http.post('/api/defects/' + defect.id + '/comments', {message: message});
  }

  public create(data) {
    data['projectId'] = this.projects.current.getValue()['id'];
    return this.http.post('/api/defects/', JSON.stringify(data));
  }

  private enrichDefect(defect) {
    // creatorId => creator
    this.users.getUser(defect.creatorId).subscribe(u => defect.creator = u);
    // ownerId => owner
    this.users.getUser(defect.ownerId).subscribe(u => defect.owner = u);
    // projectId => project
    this.projects.projects.pipe(map(ps => ps[defect.projectId])).subscribe(p => defect.project = p);
    // ensuer description not null
    if (defect.description == null) defect.description = '';
  }
}
