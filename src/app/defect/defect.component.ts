import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../http.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ProjectService } from "../project.service";
import { DefectService } from '../defect.service';
import { Defect } from '../model/defect';

@Component({
  selector: 'app-defect',
  template: `
    <div class="defect-edit">
      <div>
          <a routerLink=".."> <i class="material-icons">arrow_back</i></a>
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
      <div>
          <ckeditor [(ngModel)]="defect.description" [config]="editorConfig" debounce="400"></ckeditor>
      </div>
      <div>
          <a md-button routerLink=".." (click)="save(false)">Save</a>
          <a md-button *ngIf="!defect.id" [disabled]="saving" (click)="save(true)">Save and New</a>
      </div>
  </div>
  `,
  styles: [`
  .defect-edit>div{margin: 7px 0;}
  .defect-edit>div>label{padding-right: 20px;}
  .defect-edit>div>label:after {content: ':';}
  .defect-edit>div>span {display: inline-block;}
  .status {font-weight: 700;}
  .title-row {display:flex; flex-direction: row;}
  .title-row input {flex-grow: 1; font-weight: 700;}
  md-radio-button {margin: 0 7px;}
  `]
})
export class DefectComponent {
  defect;
  saving;

  editorConfig = {
    extraPlugins: 'uploadimage,divarea',
    imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
    toolbar: [
      {
        name: 'styles',
        items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
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
      // this.defect['severity'] = 'Major';
      this.route.params
        .filter(params => params['id'] && params['id'] != 'new')
        .switchMap((params: Params) => this.defects.single(params['id']))
        .subscribe(item => this.defect = item);
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
    }
    else {
      this.defects.create(data)
        .finally(() => this.saving = false)
        .subscribe(() => this.defect = {});
    }
  }
}
