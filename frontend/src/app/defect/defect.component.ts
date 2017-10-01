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
    <div class="description">
        <ckeditor [(ngModel)]="defect.description" [config]="editorConfig" debounce="200"></ckeditor>
    </div>
    <div *ngIf="defect.id" class="comments">
      <h4>Comments</h4>
      <ul *ngIf="!defect.comments || !defect.comments.length">
        <li >No comment</li>
      </ul>
      <ul *ngIf="defect.comments && defect.comments.length">
        <li *ngFor="let c of defect.comments"> {{c.createdAt | date: 'y-MM-dd HH:mm:ss'}} {{c.userId}}: {{c.content}}</li>
      </ul>
      <form (ngSubmit)="comment(message.value); message.value = '';">
        <div class="comment-field">
          <md-form-field >
            <input mdInput #message maxlength="256" placeholder="Comment">
            <md-hint align="end">{{message.value.length}} / 256</md-hint>
          </md-form-field>
          <button md-icon-button type="submit"><md-icon>check</md-icon></button>
        </div>
      </form>
    </div>
  </div>

  <div *ngIf="defect.id" class="side-info">
    <div> <label>Status</label><span>{{defect.status}}</span></div>
    <div> <label>Reported by</label><span *ngIf="defect.creator">{{defect.creator.name}}</span></div>
    <div> <label>Reported at</label><span>{{defect.createdAt | date: 'y-MM-dd HH:mm:ss'}}</span></div>
    <div class="history">
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
  :host {flex-grow: 1; display: flex;}
  .defect-edit {flex-grow: 1; display: flex; flex-direction: column; padding: 10px;}
  .defect-edit .actions {display: inline-block; float: right;}
  .defect-edit>div{margin: 7px 0;}
  .title-row input {width: 100%; font-size: 16px; min-height: 26px;}
  md-radio-button {margin: 0 7px;}
  ckeditor {flex-grow: 1; display: flex; flex-direction: column;}
  .comment-field {display: flex;}
  .comment-field md-form-field {flex-grow: 1;}
  .side-info { padding: 10px; width: 300px; }
  .side-info>div:after {content: '.'; display: none; clear: both;}
  .side-info>div>label{margin-right: 10px; font-weight: 800;}
  .side-info>div>label:after {content: ':';}
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
            '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent',]
      },
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
        .subscribe(item => { this.defect = item; this.loadComments(); });
      this.route.params.filter(params => params['id'] && params['id'] == 'new')
        .subscribe(() => {
          this.defect = new Defect();
        });
  }

  save(another) {
    var data = JSON.parse(JSON.stringify(this.defect));
    delete data['comments']; // TODO: filter out other fields as well.
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

  comment(message) {
    this.defects.addComment(this.defect, message)
      .subscribe(() => this.loadComments());
  }

  loadComments() {
    this.defects.loadComments(this.defect)
      .subscribe(cs => this.defect.comments = cs);
  }
}
