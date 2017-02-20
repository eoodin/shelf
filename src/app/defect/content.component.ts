import { Component } from '@angular/core';
import { HttpService } from '../http.service';
import { DefectService } from '../defect.service';

@Component({
  selector: 'app-content',
  template: `
  <div class="plan-body">
      <div class="item-table">
          <div class="loading-mask" *ngIf="loading">
              <div class="spinner-loader"></div>
          </div>
          <div class="panel panel-default">
              <div class="panel-heading work-items-heading">
                <div class="heding-right">
                    <md-checkbox [(ngModel)]="hideFinished" (change)="filterChange($event)">Hide Finished</md-checkbox>
                </div>
              </div>
              <table *ngIf="items" class="table">
                  <tr>
                      <th> ID </th>
                      <th> Type </th>
                      <th> State </th>
                      <th> Title </th>
                      <th> Owner </th>
                      <th> Operations </th>
                  </tr>
                  <tr *ngFor="let item of visibleItems()">
                      <td> {{item.id}} </td>
                      <td> {{item.type}} </td>
                      <td> {{item.state}} </td>
                      <td><a (click)="showItem(item)"> {{item.title}} </a></td>
                      <td *ngIf="item.owner"> {{item.owner.name}} </td>
                      <td *ngIf="!item.owner"> Unassigned </td>
                      <td>
                          <button 
                              *ngIf="item.state == 'Created'"
                              [disabled]="requesting"
                              (click)="startFix(item)"
                                class="btn btn-default btn-sm">Start Fix</button>
                          <button 
                              *ngIf="item.state == 'Fixed'"
                              [disabled]="requesting"
                              (click)="startTest(item)"
                              class="btn btn-default btn-sm">Start Test</button>
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
  `]
})
export class ContentComponent {

  private project = null;
    private projects = [];
    private items = [];
    private sort: any;
    private requesting = false;
    private loading = false;

    private hideFinished = true;

    constructor(
        private http: HttpService,
        private defects: DefectService) {
    }

    loadItems() {
        this.loading = true;
        this.defects.load({project: this.project.id})
            .finally(() => this.loading = false)
            .subscribe(stories => this.items = stories);
    }

    visibleItems() {
        if (this.hideFinished) {
            return this.items.filter(item => item.status != 'Finished');
        }
        return this.items;
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

    // private showItem(item) {
    //     this.router.navigate(['/backlog/story/' + item.id]);
    // }

    // private addChild(us) {
    //     this.router.navigate(['story', 'new'], 
    //         {relativeTo: this.route,  queryParams: { type: 'UserStory', parent: us.id }});
    // }

    private filterChange(e) {
        this.loadItems();
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
