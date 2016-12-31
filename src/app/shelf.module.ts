import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {ShelfAppComponent} from "./shelf.component";
import {RouterModule} from "@angular/router";
import {HttpModule, RequestOptions, Headers} from "@angular/http";
import {PlanList} from "./components/plan-list";
import {ItemDetail} from "./components/item-detail";
import {ModalDialog} from "./components/modal-dialog";
import {Projects} from "./pages/projects";
import {Backlog} from "./pages/backlog";
import {Plans} from "./pages/plans";
import {WorkItems} from "./pages/workitems";
import {LocationStrategy, HashLocationStrategy} from "@angular/common";
import {Ng2BootstrapModule} from "ng2-bootstrap";
import {FormsModule} from "@angular/forms";
import {CKEditorModule} from "ng2-ckeditor";
import {HttpService} from "./http.service";
import { LoginComponent } from './login.component';
import {NotifyService} from "./notify.service";

let routes = [
    {path: '', pathMatch: 'full', redirectTo: 'plans'},
    {path: 'projects', component: Projects},
    {path: 'backlog', component: Backlog},
    {path: 'plans', component: Plans},
    {path: 'items', component: WorkItems},
    {path: 'login', component: LoginComponent},
];

export class ShelfRequestOptions extends RequestOptions {
    constructor() {
        super({
            headers: new Headers({'Content-Type': 'application/json'}),
            body: ''
        });
    }
}

@NgModule({
    declarations: [
        LoginComponent,
        ModalDialog,
        PlanList,
        ItemDetail,
        Projects,
        Backlog,
        Plans,
        WorkItems,
        ShelfAppComponent,
    ],
    providers: [
        NotifyService,
        HttpService,
        {provide: RequestOptions, useClass: ShelfRequestOptions},
        {provide: LocationStrategy, useClass: HashLocationStrategy}
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        CKEditorModule,
        RouterModule.forRoot(routes),
        Ng2BootstrapModule
    ],
    bootstrap: [ShelfAppComponent],
})
export class ShelfModule {
}

