import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { HttpService } from './http.service';
import { ProjectService } from './project.service';
import {StoryService, UserStory} from './story.service';
import {filter, finalize, map, switchMap } from 'rxjs/operators';

declare var CKEDITOR;

@Component({
    selector: 'story',
    template: `
  <div class="item-details">
    <form (ngSubmit)="save()">
        <div>
            <button (click)="goBack()" mat-button> <i class="material-icons">arrow_back</i> Back</button>
        </div>
        <div>
            <h4 *ngIf="parent && parent.id"> Adding child to: #{{parent.id}} {{parent.title}} </h4>
        </div>
        <div>
            <span>Points:</span> <input type="text" [(ngModel)]="_item.points" [ngModelOptions]="{standalone: true}" value="0">
        </div>
        <div class="title-row">
            <span>Title:</span> <input type="text" [(ngModel)]="_item.title" [ngModelOptions]="{standalone: true}"> 
        </div>
        <div>
            <rich-editor [(model)]="_item.description"></rich-editor>
        </div>
        <div>
            <button [disabled]="saving" mat-button>Save</button>
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
export class StoryComponent implements OnDestroy {
    saving = false;
    public _item: UserStory;
    public parent;

    constructor(private http: HttpService,
                private route: ActivatedRoute,
                private storyService: StoryService,
                private location: Location,
                private prjs: ProjectService) {
        this.route.params
            .pipe(
                filter(params => params['id']),
                switchMap((params: Params) => this.storyService.getStory(+params['id'])))
            .subscribe(item => this._item = item);

        this.route.url
            .pipe(
                filter(urls => urls.length > 0),
                map(urls => urls[urls.length - 1].path),
                filter(lastSeg => lastSeg == 'new')
            ).subscribe(_ => {
                this.route.queryParams
                    .pipe(
                        filter(params => params['parent']),
                        switchMap((params) => this.storyService.getStory(params['parent']))
                    ).subscribe(us => this.parent = us);
            });
    }

    ngOnDestroy() {
        // TODO: destroy editor instance?
    }

    save() {
        const data = JSON.parse(JSON.stringify(this._item));
        data.projectId = this.prjs.current.getValue()['id'];
        if (data.id) {
            this.saving = true;
            this.storyService.save(data)
                .pipe(finalize(() => this.saving = false))
                .subscribe(() => this.goBack());
        } else {
            this.saving = true;
            this.storyService.create(data, {parent: this.parent})
                .pipe(finalize(() => this.saving = false))
                .subscribe(() => this.goBack());
        }
    }

    onSaved(data) {
    }

    goBack() {
        this.location.back();
    }
}
