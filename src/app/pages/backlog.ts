import {Component, ElementRef} from '@angular/core';
import {ProjectService} from "../project.service";
import {PreferenceService} from "../preference.service";
import {Router, ActivatedRoute} from "@angular/router";

@Component({
    selector: 'backlog-page',
    template: `
    <div class="backlog-page">
        <div class="project-info">
           <div class="dropdown project-select" dropdown keyboard-nav>
               <a href="javascript:void(0);" class="dropdown-toggle" dropdownToggle>
                   <h5 style="display:inline-block;" *ngIf="project">{{project.name}}</h5><span class="caret"></span>
               </a>
               <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
                 <li *ngFor="let p of projects" role="menuitem">
                   <a (click)="prs.setCurrent(p)">{{p.name}}</a>
                 </li>
               </ul>
            </div>
            <div class="project-operations">
                <button class="btn btn-primary" (click)="newStory()">Add Story</button>
            </div>
        </div>
        <router-outlet></router-outlet>
    </div>
    `,
    styles: [`
    .backlog-page {padding: 10px;}
    .project-info { height:40px; padding: 2px 0;}
    .project-info .project-select{ display: inline-block;}
    .project-operations { float: right;}
    `]
})
export class Backlog {
    private projects = [];
    private project;

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
