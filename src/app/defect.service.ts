import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { UserService } from './user.service';
import { ProjectService } from './project.service';
import { RequestOptions, URLSearchParams } from '@angular/http';

@Injectable()
export class DefectService {

  constructor(
    private http: HttpService,
    private users: UserService,
    private projects: ProjectService,
    ) {
  }

  public load(search) {
    let params = new URLSearchParams();
    for(let key in search) {
        params.set(key, search[key]);
    }
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/defects/', options)
      .map(resp => resp.json())
      .do(result => {
        result.rows.forEach(defect => {
          this.users.getUser(defect.creatorId).subscribe(u => defect.creator = u);
          this.users.getUser(defect.ownerId).subscribe(u => defect.owner = u);
        })
      });
  }
  public summary(search) {
    let params = new URLSearchParams();
    for(let key in search) {
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
    return this.http.post('/api/defects/', JSON.stringify(data)) .map(resp => resp.json());
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
