import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode, provide } from '@angular/core';
import {provideRouter} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
import { JSONP_PROVIDERS, HTTP_PROVIDERS }  from '@angular/http';
import { ShelfAppComponent, environment } from './app/';

import {Projects} from './app/pages/projects';
import {Backlog} from './app/pages/backlog';
import {Plans} from './app/pages/plans';
import {WorkItems} from './app/pages/workitems';

if (environment.production) {
  enableProdMode();
}


let routes = [
  {path: '', terminal: true, redirectTo: 'plans'},
  {path: 'projects', component: Projects},
  {path: 'backlog', component: Backlog},
  {path: 'plans', component: Plans},
  {path: 'workitems', component: WorkItems}
];

bootstrap(ShelfAppComponent, [
  provideRouter(routes),
  JSONP_PROVIDERS, HTTP_PROVIDERS,
  provide(LocationStrategy, {useClass: HashLocationStrategy})
]);
