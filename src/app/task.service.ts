import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { RequestOptions, URLSearchParams } from '@angular/http';

@Injectable()
export class TaskService {

  constructor(private http: HttpService) { }

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
    for(let key in search) {
        params.set(key, search[key]);
    }
    
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/tasks/', options).map(resp => resp.json());
  }

  public moveToPlan(ids, planId) {
    let change = {'ids': ids, 'changes': {'planId': planId}};
    return this.http.patch('/api/tasks/', JSON.stringify(change));
  }
}
