import { Component } from '@angular/core';
import {ProjectService} from "../project.service";

@Component({
  selector: 'project-selector',
  template: `
  <div class="dropdown project-select" dropdown keyboard-nav>
    <a href="javascript:void(0);" class="dropdown-toggle" dropdownToggle>
        <h5 style="display:inline-block;" *ngIf="project">{{project.name}}</h5><span class="caret"></span>
    </a>
    <ul class="dropdown-menu" role="menu" aria-labelledby="simple-btn-keyboard-nav">
      <li *ngFor="let p of projects" role="menuitem">
        <a (click)="projService.setCurrent(p)">{{p.name}}</a>
      </li>
    </ul>
  </div>
  `,
  styles: [`.project-select{ display: inline-block;}`]
})
export class ProjectSelectorComponent {

  private projects = [];
  private project;

  constructor(
    private projService: ProjectService) {
    projService.projects.subscribe(ps => this.projects = ps);
    projService.current.subscribe(p => this.project = p);
  }
}
