import {Component, ElementRef} from '@angular/core';
import {ProjectService} from '../project.service';
import {PreferenceService} from '../preference.service';
import {Router, ActivatedRoute} from '@angular/router';

@Component({
    selector: 'backlog-page',
    template: `
    <div class="project-info">
        <project-selector></project-selector>
        <div class="project-operations">
            <a mat-button routerLink="./new" (click)="newStory()">New Story</a>
        </div>
    </div>
    <router-outlet></router-outlet>
    `,
    styles: [`
    :host {flex: 1 1;}
    .project-info { height:40px; padding: 2px 0;}
    .project-operations { float: right;}
    `]
})
export class Backlog {
    projects = [];
    project;

    constructor(private ele: ElementRef,
                private router: Router,
                private route: ActivatedRoute,
                private prs: ProjectService,
                private pref: PreferenceService) {
        prs.projects.subscribe(ps => this.projects = ps);
        prs.current.subscribe(p => this.project = p);
    }

    newStory() {
        this.router.navigate(['/backlog/story/new']);
    }
}
