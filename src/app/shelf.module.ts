import {NgModule, provide}       from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ShelfAppComponent} from './shelf.component';

import {RouterModule} from '@angular/router';
import {HttpModule, RequestOptions, Headers} from '@angular/http';

import {PlanList} from './components/plan-list';
import {ItemDetail} from './components/item-detail';
import {ModalDialog} from './components/modal-dialog';

import {NotifyService} from './notify.service';

import {Projects} from './pages/projects';
import {Backlog} from './pages/backlog';
import {Plans} from './pages/plans';
import {WorkItems} from './pages/workitems';
import {SettingsPageComponent} from './settings-page';
import {LocationStrategy, HashLocationStrategy} from "@angular/common";

let routes = [
    {path: '', terminal: true, redirectTo: 'plans'},
    {path: 'projects', component: Projects},
    {path: 'backlog', component: Backlog},
    {path: 'plans', component: Plans},
    {path: 'items', component: WorkItems},
    {path: 'settings', component: SettingsPageComponent}
];

class DefaultHttpOptions extends RequestOptions {
    constructor() {
        super({
            headers: new Headers({'Content-Type': 'application/json'}),
            body: ''
        });
    }
}

@NgModule({
    declarations: [
        ShelfAppComponent,
        PlanList,
        ItemDetail,
        ModalDialog
    ],
    providers: [
        NotifyService,
        provide(RequestOptions, {useClass: DefaultHttpOptions}),
        provide(LocationStrategy, {useClass: HashLocationStrategy})
    ],
    imports: [
        BrowserModule,
        HttpModule,
        RouterModule.forRoot(routes)
    ],
    bootstrap: [ShelfAppComponent],
})
export class ShelfModule {
}

