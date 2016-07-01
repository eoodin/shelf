import { bootstrap } from '@angular/platform-browser-dynamic';
import { enableProdMode, provide } from '@angular/core';
import {ROUTER_PROVIDERS} from '@angular/router';
import {LocationStrategy, HashLocationStrategy} from '@angular/common';
//import {HTTP_PROVIDERS} from '@angular/http';
import { JSONP_PROVIDERS }  from '@angular/http';
import { ShelfAppComponent, environment } from './app/';

if (environment.production) {
  enableProdMode();
}

bootstrap(ShelfAppComponent, [
  ROUTER_PROVIDERS,
//  HTTP_PROVIDERS,
  JSONP_PROVIDERS,
  provide(LocationStrategy, {useClass: HashLocationStrategy})
]);
