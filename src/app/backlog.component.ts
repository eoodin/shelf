import { Component, OnInit, ElementRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {ProjectService} from "./project.service";
import {Router} from '@angular/router';
import {PreferenceService} from "./preference.service";
import {HttpService} from "./http.service";

@Component({
  selector: 'backlog',
  template: `
  <div class="plan-body">
      <div class="item-table">
          <div class="loading-mask" *ngIf="loading">
              <div class="spinner-loader"></div>
          </div>
          <div class="panel panel-default">
              <!--div class="panel-heading work-items-heading">
                  <span>Backlog</span>
              </div-->
              <table *ngIf="items" class="table">
                  <tr>
                      <th> ID </th>
                      <th> Type </th>
                      <th> State </th>
                      <th> Title </th>
                      <th> Owner </th>
                      <th> Operations </th>
                  </tr>
                  <tr *ngFor="let item of items">
                      <td> {{item.id}} </td>
                      <td> {{item.type}} </td>
                      <td *ngIf="item.type != 'Defect'"> {{item.status}} </td>
                      <td *ngIf="item.type == 'Defect'"> {{item.state}} </td>
                      <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                      <td *ngIf="item.owner"> {{item.owner.name}} </td>
                      <td *ngIf="!item.owner"> Unassigned </td>
                      <td>
                          <button 
                              *ngIf="item.type == 'Defect' && item.state == 'Created'"
                              [disabled]="requesting"
                              (click)="startFix(item)"
                                class="btn btn-default btn-sm">Start Fix</button>
                          <button 
                              *ngIf="item.type == 'Defect' && item.state == 'Fixed'"
                              [disabled]="requesting"
                              (click)="startTest(item)"
                              class="btn btn-default btn-sm">Start Test</button>
                          <i *ngIf="item.type == 'UserStory'" (click)="addChild(item)" class="material-icons button">add</i>
                      </td>
                  </tr>
              </table>
          </div>
      </div>
  </div>
  `,
  styles: [`
  .work-items-heading > div{float:right;}
    .work-items-heading { height: 38px; }
    .awd .modal-body .row {padding: 5px 0;}
    a:hover {cursor: pointer;}
    [ngcontrol='title'] { width: 100%; }
    .plan-head h1 {font-size: 18px; margin: 0;}
    .plan-head ul {padding-left: 0;}
    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}
    .plan-head ul li span {font-weight: normal}
    .item-table{position:relative;}
    .material-icons.button {cursor: pointer;}
    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}
    .type-and-id input { display: inline-block; }
  `],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class BacklogComponent implements OnInit {
    private project = null;
    private projects = [];
    private items = [];
    private sort: any;
    private requesting = false;
    private loading = false;

  ngOnInit() {
  }
  constructor(private ele: ElementRef,
                private http: HttpService,
                private prs: ProjectService,
                private router: Router,
                private pref: PreferenceService) {
        prs.projects.subscribe(ps => this.projects = ps);
        prs.current
            .filter(p => p != this.project)
            .do(p => this.project = p)
            .subscribe(p => this.loadItems());
    }

    loadItems() {
        let q = 'projectId=' + this.project.id;
        let types = 'UserStory,Defect';
        q += '&types=' + types;
        this.loading = true;
        this.http.get('/api/work-items/?' + q)
            .finally(() => this.loading = false)
            .subscribe(b => this.items = b.json());
    }

    startFix(item) {
        this.requesting = true;
        this.http.post('/api/defects/' + item.id + '/fix', '{}')
            .finally(() => this.requesting = false)
            .subscribe(
                () => this.loadItems(),
                (resp) => {
                    window.alert('Error occurred: ' + resp.json()['error'])
                }
            );
    }

    startTest(item) {
        this.requesting = true;
        this.http.post('/api/defects/' + item.id + '/test', '{}')
            .finally(() => this.requesting = false)
            .subscribe(
                () => this.loadItems(),
                () => window.alert('Error occurred.')
            );
    }

    private showItem(item) {
        this.router.navigate(['/backlog/story/' + item.id]);
    }

    private addChild(us) {
        console.log('adding child user story', us);
    }

    private sortResult(field) {
        if (field == this.sort.field)
            this.sort.order = this.sort.order == 'desc' ? 'asc' : 'desc';
        else
            this.sort.order = 'asc';

        this.sort.field = field;
        this.loadItems();
    }
}
