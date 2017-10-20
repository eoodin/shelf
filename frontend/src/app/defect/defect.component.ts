import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from '../http.service';
import { ProjectService } from '../project.service';
import { DefectService } from '../defect.service';
import { Defect } from '../model/defect';

@Component({
  selector: '[defect-details]',
  template: `
  <div class="defect-edit">
    <div>
      <button md-icon-button (click)="location.back()"> <md-icon>arrow_back</md-icon> </button>
      <div class="actions">
        <a md-button [disabled]="!dataValid()" routerLink=".." (click)="save()">Save</a>
        <a md-button *ngIf="!defect.id" [disabled]="!dataValid() || saving" (click)="save()">Save and New</a>
      </div>
    </div>
    <div class="title-row">
      <input type="text" #title [(ngModel)]="defect.title" placeholder="Title" required>
    </div>
    <div>
      <label>Severity:</label>
      <md-radio-group [(ngModel)]="defect.severity">
        <md-radio-button *ngFor="let s of SEVERITIES" [value]="s"> {{s}} </md-radio-button>
      </md-radio-group>
      <label>Releases:</label>
      <md-checkbox *ngFor="let release of releases;let i = index"
        [(ngModel)]="releases[i].checked">{{release.name}}</md-checkbox>
    </div>
    <div class="description">
      <rich-editor [(model)]="defect.description"
        uploadUrl="/api/file?type=image&api=ckeditor-uploadimage"></rich-editor>
    </div>
    <div *ngIf="defect.id" class="comments">
      <h4>Comments</h4>
      <ul *ngIf="!defect.comments || !defect.comments.length">
        <li >No comment</li>
      </ul>
      <ul *ngIf="defect.comments && defect.comments.length">
        <li *ngFor="let c of defect.comments">
          {{c.createdAt | date: 'y-MM-dd HH:mm'}} {{c.userId | username}}: {{c.content}}
        </li>
      </ul>
      <form (ngSubmit)="comment(message.value); message.value = '';">
        <div class="comment-field">
          <md-form-field >
            <input mdInput name="message" #message maxlength="256" placeholder="Comment" required>
            <md-hint align="end">{{message.value.length}} / 256</md-hint>
          </md-form-field>
          <button md-icon-button type="submit" [disabled]="!message.value.length"><md-icon>check</md-icon></button>
        </div>
      </form>
    </div>
  </div>

  <div *ngIf="defect.id" class="side-info">
    <div> <label>Status</label><span>{{defect.status}}</span></div>
    <div> <label>Reported by</label><span *ngIf="defect.creator">{{defect.creatorId | username}}</span></div>
    <div> <label>Reported at</label><span>{{defect.createdAt | date: 'y-MM-dd HH:mm'}}</span></div>
    <div class="history">
      <h4>History</h4>
      <p *ngIf="!defect.histories.length">No history</p>
      <ul>
        <li *ngFor="let h of defect.histories" >
          <span class="hist-time"> {{h.history.createdAt | date: 'y-MM-dd HH:mm'}}</span>
          <span class="user"> {{h.history.userId | username }} </span>
          <ul>
            <li *ngFor="let c of h.history.changes" >
              <strong> {{c.field}}</strong> =>
              <i title="{{c.value | htmltext | slice:0:400}}">{{c.value | htmltext}}</i>
            </li>
          </ul>
        </li>
      </ul>
    </div>
  </div>
  `,
  styles: [`
  :host {flex-grow: 1; display: flex;}
  .defect-edit {flex-grow: 1; display: flex; flex-direction: column; padding-right: 5px;}
  .defect-edit .actions {display: inline-block; float: right;}
  .defect-edit>div{margin-bottom: 10px;}
  .title-row {margin-right: 3px;}
  .title-row input {padding-left: 8px; width: 100%; font-size: 16px; min-height: 26px;}
  .description{flex-grow: 1; display: flex; min-height: 300px;}
  md-radio-button,md-checkbox {margin: 0 7px;}
  .comment-field {display: flex;}
  .comment-field md-form-field {flex-grow: 1;}
  .side-info { padding: 10px; width: 300px; }
  .side-info>div:after {content: '.'; display: none; clear: both;}
  .side-info>div>label{margin-right: 10px; font-weight: 800;}
  .side-info>div>label:after {content: ':';}
  h4 {margin: 5px 0;}
  .history > ul { padding: 0; }
  .history > ul > li { margin-bottom: 8px; }
  .history > ul > li > ul { padding-left: 1em; }
  .history > ul > li > ul li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .history li { list-style: none; }
  `]
})
export class DefectComponent {
  SEVERITIES = ['Blocker', 'Critical', 'Major', 'Minor'];
  releases = [];

  defect;
  saving;

  constructor(private http: HttpService,
    public location: Location,
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
      this.prjs.current.filter(p => p.id).subscribe(p => {
        this.prjs.details(p.id).subscribe( detail => this.releases = detail.releases);
      });
  }

  dataValid() {
    return this.defect.title && this.defect.title.length > 0;
     // && (this.releases.length == 0 || (this.releases.filter(r => r.checked).length));
  }

  save() {
    var data = JSON.parse(JSON.stringify(this.defect));
    delete data['comments']; // TODO: filter out other fields as well.
    delete data['owner'];
    data.releases = this.releases.filter( r => r.checked);
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

  descriptionChange(d) {
    this.defect.description = d;
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
