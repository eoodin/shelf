import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import { HttpService } from './http.service';
import { ModalDirective } from 'ng2-bootstrap';
import { ProjectService } from "./project.service";
import {StoryService} from './story.service';

declare var CKEDITOR;

@Component({
  selector: 'story',
  template: `
  <div class="item-details">
    <form (ngSubmit)="save()">
        <div class="row" >
            <div class="col-sm-12">
                Type:
                <select [(ngModel)]="_item.type" [ngModelOptions]="{standalone: true}" [disabled]="_item.id">
                    <option value="UserStory" selected="selected">User Story</option>
                    <option value="Task">Task</option>
                    <option value="Defect">Defect</option>
                </select>
            </div>
        </div>
        <div *ngIf="_item.type == 'Defect'" class="row">
            <div class="col-sm-12">Severity:
                <label><input #s1 type="radio" [checked]="_item.severity==s1.value" (click)="_item.severity=s1.value" value="Blocker">Blocker</label>
                <label><input #s2 type="radio" [checked]="_item.severity==s2.value" (click)="_item.severity=s2.value" value="Critical">Critical</label>
                <label><input #s3 type="radio" [checked]="_item.severity==s3.value" (click)="_item.severity=s3.value" value="Major">Major</label>
                <label><input #s4 type="radio" [checked]="_item.severity==s4.value" (click)="_item.severity=s4.value" value="Minor">Minor</label>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 field-row">
                <span class="field-label">Title:</span> <input type="text" class="work-item-title" [(ngModel)]="_item.title" [ngModelOptions]="{standalone: true}">
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12">Description:</div>
        </div>
        <div class="row">
            <div class="col-sm-12">
                <ckeditor [(ngModel)]="_item.description" [config]="editorConfig" [ngModelOptions]="{standalone: true}" debounce="400"></ckeditor>
            </div>
        </div>
        <div class="row" *ngIf="_item.type == 'UserStory'">
            <div class="col-sm-12">Story Points: <input type="text" [(ngModel)]="_item.points" [ngModelOptions]="{standalone: true}" value="0"></div>
        </div>
        <button class="btn btn-default">Save</button>
    </form>
  </div>
  `,
  styles: [`
    .item-details { padding-left: 0;}
    .item-details li { list-style:none; margin-bottom: 10px;}
    .item-details li:last-child { margin-bottom: 0;}
    .item-details li .title { font-weight: 700; }
    .item-details li .big-section { display: block;}
    .item-details .row {margin: 8px 0;}
    .field-row {display: flex; flex-direction: row; flex-wrap: nowrap;}
    .field-row .field-label { margin-right: 20px;}
    .field-row input,select {flex-grow: 1;}
     `],
  encapsulation: ViewEncapsulation.Emulated,
  changeDetection: ChangeDetectionStrategy.Default
})
export class StoryComponent implements OnDestroy {
  private _item: Object = {};
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
    ]
  };

  constructor(private http: HttpService,
    private route: ActivatedRoute,
    private storyService: StoryService,
    private prjs: ProjectService) {
         this.route.params
    .switchMap((params: Params) => this.storyService.getStory(+params['id']))
    .subscribe(item => this._item = item);
  }

  ngOnDestroy() {
    // TODO: destory editor instance?
  }

  save() {
    var data = JSON.parse(JSON.stringify(this._item));
    data.projectId = this.prjs.current.getValue()['id'];
    if (!data['id']) {
      this.http.post('/api/work-items/', JSON.stringify(data))
        .filter(resp => resp.json())
        .subscribe(data => this.onSaved(data));
    }
    else {
      this.http.put('/api/work-items/' + data['id'], JSON.stringify(data))
        .filter(resp => resp.json())
        .subscribe(data => this.onSaved(data));
    }
  }

  onSaved(data){

  }
}
