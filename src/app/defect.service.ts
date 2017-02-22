import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { RequestOptions, URLSearchParams } from '@angular/http';

@Injectable()
export class DefectService {

  constructor(private http: HttpService) { }

  public load(search) {
    let params = new URLSearchParams();
    for(let key in search) {
        params.set(key, search[key]);
    }
    let options = new RequestOptions({ search: params });
    return this.http.get('/api/defects/', options).map(resp => resp.json());
  }

  public single(id) {
    return this.http.get('/api/defect/' + id).map(resp => resp.json());
  }

  public save(id, changes) {
    return this.http.patch('/api/defect/' + id, JSON.stringify(changes));
  }

  public create(data) {
    return this.http.post('/api/defects/', JSON.stringify(data)) .map(resp => resp.json());
  }
}
