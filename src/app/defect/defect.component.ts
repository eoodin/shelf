import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../http.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ProjectService } from "../project.service";
import { DefectService } from '../defect.service';

@Component({
  selector: 'app-defect',
  template: `
    <div class="defect-edit">
      <div>
          <a routerLink=".."> <i class="material-icons">arrow_back</i></a>
      </div>
      <div>
          <span>Severity:</span> 
          <md-radio-group [(ngModel)]="defect.severity">
            <md-radio-button *ngFor="let s of ['Blocker', 'Critical', 'Major', 'Minor']" [value]="s"> {{s}} </md-radio-button>
          </md-radio-group>
      </div>
      <div class="title-row">
          <span>Title:</span> <input type="text" [(ngModel)]="defect.title"> 
      </div>
      <div>
          <ckeditor [(ngModel)]="defect.description" [config]="editorConfig" debounce="400"></ckeditor>
      </div>
      <div>
          <a md-button routerLink=".." (click)="save()">Save</a>
          <a md-button *ngIf="!defect.id" [disabled]="saving" (click)="save(true)">Save and New</a>
      </div>
  </div>
  `,
  styles: [`
  .defect-edit>div{margin: 5px 0;}
  .defect-edit>div>span {display: inline-block; width: 50px;}
  .title-row {display:flex; flex-direction: row;}
  .title-row input {flex-grow: 1; font-weight: 800;}
  `]
})
export class DefectComponent {
  private defect = {};
  private saving;

  private editorConfig = {
    extraPlugins: 'uploadimage',
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
    this.route.params
      .filter(params => params['id'] && params['id'] != 'new')
      .switchMap((params: Params) => this.defects.single(params['id']))
      .subscribe(item => this.defect = item);
  }

  private save(another) {
    var data = JSON.parse(JSON.stringify(this.defect));
    data.projectId = this.prjs.current.getValue()['id'];
    this.saving = true;
    this.defects.save(data)
      .finally(() => this.saving = false)
      .subscribe(() => this.defect = {});
  }
}
