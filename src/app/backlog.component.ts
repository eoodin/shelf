import { Component, OnInit, ElementRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { ProjectService } from "./project.service";
import { Router, ActivatedRoute } from '@angular/router';
import { PreferenceService } from "./preference.service";
import { HttpService } from "./http.service";

@Component({
    selector: 'backlog',
    template: `
  <div class="plan-body">
      <div class="item-table">
          <div class="loading-mask" *ngIf="loading">
              <div class="spinner-loader"></div>
          </div>
          <div class="panel panel-default">
              <div class="panel-heading work-items-heading">
              </div>
              <table *ngIf="items" class="table">
                  <tr>
                      <th>  </th>
                      <th> ID </th>
                      <th> Type </th>
                      <th> State </th>
                      <th> Title </th>
                      <th> Owner </th>
                      <th> Operations </th>
                  </tr>
                  <tr *ngFor="let item of items">
                      <td class="tree-control">
                        <div class="tree" [ngClass]="{
                                collapse: item.children.length && item.treeState != 'expand',
                                expand: item.children.length && item.treeState == 'expand',
                                child: item.parentId,
                                last: item.treeState == 'last',
                                na: item.children.length == 0 && !item.parentId}">
                            <div class="v-line"></div>
                            <div (click)="toggleExpand(item)" *ngIf="!item.parentId" class="icon">
                                <div class="h-cross"></div>
                                <div class="v-cross"></div>
                            </div>
                            <div class="child-h-line"></div>
                        </div>
                      </td>
                      <!--
                      <td class="tree-control">
                        <div [ngClass]="item.treeState" >
                            <a (click)="expand(item)" *ngIf="item.children.length && item.treeState != 'expand'">
                               <span class="glyphicon glyphicon-chevron-right" ></span>
                            </a>
                            <a (click)="collapse(item)" *ngIf="item.treeState == 'expand'">
                               <span class="glyphicon glyphicon-chevron-down" ></span>
                            </a>
                            <span *ngIf="item.treeState=='middle'" style="line-height: 100%;">├</span>
                            <span *ngIf="item.treeState=='last'" style="line-height: 100%;">└</span>
                        </div>
                      </td>
                      -->
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
                          <i *ngIf="item.type == 'UserStory' && !item.parentId" (click)="addChild(item)" class="material-icons button">add</i>
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
    .tree-control { height: 100%; position: relative; padding: 0; overflow: hidden; min-width: 24px;}
    .tree {height: 100%; display: block;}
    .tree .v-line {height: 100%;width: 1px; border: 1px solid; position: absolute;top:8px; left: calc(50% - 1px);}
    .tree .icon {position: absolute;width: 16px;height: 16px;top: 8px;left: calc(50% - 8px);outline: 1px dotted red;background-color: white;outline: 2px solid black; cursor: pointer;}
    .tree.na .v-line,.tree.collapse .v-line, .tree.na .icon {display: none;}
    .tree .h-cross {position: absolute;top: calc(50% - 1px);left: 10%;border: 1px solid black;width: 80%;}
    .tree .v-cross {position: absolute;height: 80%;width: 1px;border: 1px solid black;left: calc(50% - 1px);top: 10%;}
    .tree.expand .v-cross {display:none;}
    .tree.child .child-h-line {position: absolute;top: 16px;left: 50%;border: 1px solid black;width: 50%;}
    .tree.child .v-line {top: 0;}
    .tree.child.last .v-line {height: 16px;}
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
        private route: ActivatedRoute,
        private pref: PreferenceService) {
        prs.projects.subscribe(ps => this.projects = ps);
        prs.current
            .filter(p => p != this.project)
            .do(p => this.project = p)
            .subscribe(p => this.loadItems());
    }

    loadItems() {
        let q = 'projectId=' + this.project.id;
        let types = ['UserStory', 'Defect'];
        q += '&types=' + types.join(',') + '&parent=null';
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
        this.router.navigate(['story', 'new'], 
            {relativeTo: this.route,  queryParams: { type: 'UserStory', parent: us.id }});
    }

    private toggleExpand(item) {
        if (item.treeState != 'expand')
            this.expand(item);
        else 
            this.collapse(item);
    }

    private expand(item) {
        let q = 'types=UserStory&parent=' + item.id;
        this.loading = true;
        this.http.get('/api/work-items/?' + q)
            .finally(() => this.loading = false)
            .map(resp => resp.json())
            .filter(children => children.length > 0)
            .subscribe(children => {
                let i = this.items.indexOf(item);
                if (i != -1) {
                    let last;
                    for (let it of children) {
                        it.treeState = 'middle';
                        this.items.splice(++i, 0, it);
                        last = it;
                    }
                    if (last) {
                        last.treeState = 'last';
                    }
                    item.treeState = 'expand';
                }
            });
    }
    private collapse(item) {
        let i = this.items.indexOf(item);
        while(i >= 0 && i + 1 < this.items.length) {
            if (this.items[i+1].parentId != item.id) break;
            this.items.splice(i + 1, 1);
        }

        item.treeState = '';
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
