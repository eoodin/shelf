import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode, provide } from '@angular/core';
import { provideRouter } from '@angular/router';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { HTTP_PROVIDERS, RequestOptions, BaseRequestOptions, Headers }  from '@angular/http';
import { ShelfAppComponent, environment } from './app';
import { disableDeprecatedForms, provideForms } from '@angular/forms';

import {Projects} from './app/pages/projects';
import {Backlog} from './app/pages/backlog';
import {Plans} from './app/pages/plans';
import {WorkItems} from './app/pages/workitems';
import {SettingsPageComponent} from './app/settings-page';

if (environment.production) {
  enableProdMode();
}

let routes = [
  {path: '', terminal: true, redirectTo: 'plans'},
  {path: 'projects', component: Projects},
  {path: 'backlog', component: Backlog},
  {path: 'plans', component: Plans},
  {path: 'items', component: WorkItems},
  {path: 'settings', component: SettingsPageComponent }
];

class DefaultHttpOptions extends BaseRequestOptions {
  headers: Headers = new Headers({'Content-Type': 'application/json'});
}

bootstrap(ShelfAppComponent, [
  disableDeprecatedForms(),
  provideForms(),
  provideRouter(routes),
  HTTP_PROVIDERS,
  provide(RequestOptions, {useClass:DefaultHttpOptions}),
  provide(LocationStrategy, {useClass: HashLocationStrategy})
]);
