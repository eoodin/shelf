import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../http.service';
import { ProjectService } from '../project.service';
import { DefectService } from '../defect.service';
import { Defect } from '../model/defect';

@Component({
  selector: '[app-defect]',
  template: `
    <div class="defect-edit">
      <div>
        <a routerLink=".."> <i class="material-icons">arrow_back</i></a>
        <div class="actions">
          <a md-button routerLink=".." (click)="save(false)">Save</a>
          <a md-button *ngIf="!defect.id" [disabled]="saving" (click)="save(true)">Save and New</a>
        </div>
      </div>
      <div>
          <md-radio-group [(ngModel)]="defect.severity">
            <md-radio-button *ngFor="let s of ['Blocker', 'Critical', 'Major', 'Minor']" [value]="s"> {{s}} </md-radio-button>
          </md-radio-group>
      </div>
      <div class="title-row">
          <input type="text" [(ngModel)]="defect.title">
      </div>
      <div *ngIf="defect.id"><label>Status</label><span class="status">{{defect.status}}</span></div>
      <div *ngIf="defect.id"><label>Reporter</label><span *ngIf="defect.creator">{{defect.creator.name}}</span></div>
      <div *ngIf="defect.id"><label>Reported Time</label><span>{{defect.createdAt | date: 'y-MM-dd HH:mm:ss'}}</span></div>
      <div class="description">
          <ckeditor [(ngModel)]="defect.description" [config]="editorConfig" debounce="200"></ckeditor>
      </div>
      <div *ngIf="defect.id" class="history">
        <h4>History</h4>
        <p *ngIf="!defect.histories.length">No history</p>
        <ul>
          <li *ngFor="let h of defect.histories" >
            <span class="hist-time"> {{h.history.createdAt | date: 'y-MM-dd HH:mm:ss'}}</span>
            <span class="user"> <strong>{{h.history.userId}}</strong></span>
            <ul>
              <li *ngFor="let c of h.history.changes" >
                <strong> {{c.field}}</strong> => <i>{{c.value | slice:0:20}}</i>
              </li>
            </ul>
          </li>
        </ul>
      </div>
  </div>
  `,
  styles: [`
  :host {flex-grow: 1; display: flex; flex-direction: column;}
  .defect-edit {flex-grow: 1; display: flex; flex-direction: column; }
  .defect-edit .actions {display: inline-block; float: right;}
  .defect-edit>div{margin: 7px 0;}
  .defect-edit>div>label{padding-right: 20px;}
  .defect-edit>div>label:after {content: ':';}
  .defect-edit>div>span {display: inline-block;}
  .status {font-weight: 700;}
  .title-row input {width: 100%; font-size: 16px; min-height: 26px;}
  md-radio-button {margin: 0 7px;}
  ckeditor {flex-grow: 1; display: flex; flex-direction: column;}
  `]
})
export class DefectComponent {
  defect;
  saving;

  editorConfig = {
    extraPlugins: 'uploadimage,divarea',
    imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
    autoGrow_onStartup: true,
    toolbar: [
      {
        name: 'styles',
        items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format',
            '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
      },
      { name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar'] },
      { name: 'tools', items: ['Maximize'] }
    ],
    toolbarCanCollapse: true
  };

  constructor(private http: HttpService,
    private route: ActivatedRoute,
    private defects: DefectService,
    private prjs: ProjectService) {
      this.defect = new Defect();
      this.route.params
        .filter(params => params['id'] && params['id'] != 'new')
        .switchMap((params: Params) => this.defects.single(params['id']))
        .subscribe(item => this.defect = item);
      this.route.params.filter(params => params['id'] && params['id'] == 'new')
        .subscribe(() => {
          this.defect = new Defect();
        });
  }

  save(another) {
    var data = JSON.parse(JSON.stringify(this.defect));
    data.projectId = this.prjs.current.getValue()['id'];
    delete data['owner'];
    this.saving = true;
    if (data['id']) {
      this.defects.save([data['id']], data)
        .finally(() => this.saving = false)
        .subscribe(() => this.defect = {});
    } else {
      this.defects.create(data)
        .finally(() => this.saving = false)
        .subscribe(() => this.defect = {});
    }
  }
}
