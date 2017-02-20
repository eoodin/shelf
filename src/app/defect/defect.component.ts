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
    <div class="item-details">
    <form (ngSubmit)="save()">
        <div>
            <button (click)="location.back()" md-button> <i class="material-icons">arrow_back</i> Back</button>
        </div>
        <div>
            <span>Severity:</span> <input type="text" [(ngModel)]="defect.severity" [ngModelOptions]="{standalone: true}" value="0">
        </div>
        <div class="title-row">
            <span>Title:</span> <input type="text" [(ngModel)]="defect.title" [ngModelOptions]="{standalone: true}"> 
        </div>
        <div>
            <ckeditor [(ngModel)]="defect.description" [config]="editorConfig" [ngModelOptions]="{standalone: true}" debounce="400"></ckeditor>
        </div>
        <div>
            <button [disabled]="saving" md-button>Save</button>
        </div>
    </form>
  </div>
  `,
  styles: [`
  .item-details>form>div{margin: 5px 0;}
    .item-details>form>div>span {display: inline-block; width: 50px;}
    .title-row {display:flex; flex-direction: row;}
    .title-row input {flex-grow: 1; font-weight: 800;}
  `]
})
export class DefectComponent {
  private defect = {};
  private saving;

  private editorConfig = {
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
    private location: Location,
    private prjs: ProjectService) {
    this.route.params
      .filter(params => params['id'])
      .switchMap((params: Params) => this.defects.load({id: params['id']}))
      .filter(items => items.length)
      .map(items => items[0])
      .subscribe(item => this.defect = item);

    this.route.url
      .filter(urls => urls.length > 0)
      .map(urls => urls[urls.length - 1].path)
      .filter(lastSeg => lastSeg == 'new')
      .subscribe(_ => {
        console.log('Unimplemented.');
      });
  }

  private save() {
    var data = JSON.parse(JSON.stringify(this.defect));
    data.projectId = this.prjs.current.getValue()['id'];
    if (data.id) {
      this.saving = true;
      this.defects.save(data)
        .finally(() => this.saving = false)
        .subscribe(() => this.location.back())
    }

  }

}
