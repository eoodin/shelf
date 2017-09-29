import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MdSidenav } from '@angular/material';

@Component({
  selector: 'admin-navbar',
  template: `
<md-sidenav-container>
  <md-sidenav #sidenav [opened]="true" [mode]="'side'">
    <nav *ngFor="let category of menus">
      <h3>{{category.name}}</h3>
      <ul>
        <li *ngFor="let component of category.items">
          <a [routerLink]="['/admin/', component.id]"
             routerLinkActive="docs-component-viewer-sidenav-item-selected">
            {{component.name}}
          </a>
        </li>
      </ul>
    </nav>
  </md-sidenav>
  <router-outlet></router-outlet>
</md-sidenav-container>
  `,
  styles: [`
:host {width: 100%; display: flex;}
md-sidenav-container {width: 100%;}
md-sidenav { position: absolute; top: 0; bottom: 0; padding-bottom: 72px; width: 240px;
   overflow: auto; height: 100%;
  box-shadow: 3px 0 6px rgba(0,0,0,.24);
}
md-sidenav h3 {
  background: rgba(0,0,0,.32);
  color: hsla(0,0%,100%,.87);
  border: none;
  font-size: 10px;
  letter-spacing: 1px;
  line-height: 24px;
  text-transform: uppercase;
  font-weight: 400;
  margin: 0;
  padding: 0 16px;
}
md-sidenav ul {
  list-style-type: none;
  margin: 0;
  padding: 0;
}
md-sidenav li {
  border-bottom-width: 1px;
  border-bottom-style: solid;
  margin: 0;
  padding: 0;
  border-color: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.54);
}
md-sidenav li>a {
  box-sizing: border-box;
  display: block;
  font-size: 14px;
  font-weight: 400;
  line-height: 47px;
  text-decoration: none;
  transition: all .3s;
  padding: 0 16px;
  position: relative;
  color: rgba(0, 0, 0, 0.54);
}
  `]
})
export class AdminPageComponent {
  public menus = [
    {
      name: 'General',
      items: [
        { name: 'System status', id: 'sysstat' },
        { name: 'Global settings', id: 'syssetting' }
      ]
    },
    {
      name: 'Production',
      items: [
        { name: 'Projects', id: 'projects' },
        { name: 'Teams', id: 'teams' }
      ]
    }
  ];
  constructor(private _router: Router) {
  }
}

