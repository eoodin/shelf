import { NgModule } from "@angular/core";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from "@angular/platform-browser";
import { ShelfAppComponent, AboutDialog } from "./shelf.component";
import { RouterModule } from "@angular/router";
import { HttpModule, RequestOptions, Headers } from "@angular/http";
import { PlanList } from "./components/plan-list";
import { Projects, CreateTeamDialog, CreateProjectDialog} from "./pages/projects";
import { Backlog } from "./pages/backlog";
import { Plans } from "./pages/plans";
import { WorkItems } from "./pages/workitems";
import { LocationStrategy, HashLocationStrategy } from "@angular/common";
import { MaterialModule } from "@angular/material";
import { FormsModule } from "@angular/forms";
import { CKEditorModule } from "ng2-ckeditor";
import { HttpService } from "./http.service";
import { LoginComponent } from './login.component';
import { NotifyService } from "./notify.service";
import { PlanContentComponent, ItemDetailDialog, MoveItemsDialog, RemoveConfirmDialog } from './plan-content.component';
import { PreferenceService } from "./preference.service";
import { DefectService } from "./defect.service";
import { TeamService } from "./team.service";
import { StoryService } from "./story.service";
import { ProjectService } from "./project.service";
import { PlanService } from "./plan.service";
import { UserService } from "./user.service";
import { TaskService } from "./task.service";
import { AppService } from "./app.service";
import { LoginService } from "./login.service";
import { PlanCreatorComponent } from './plan-creator.component';
import { StoryComponent } from './story.component';
import { BacklogComponent, DeleteConfirmDialog } from './backlog.component';
import { PageComponent as DefectPage } from './defect/page.component';
import { ContentComponent as DefectContent, SelectPlanDialog } from './defect/content.component';
import { DefectComponent as DefectDetail } from './defect/defect.component';
import { ProjectSelectorComponent } from './components/project-selector.component';

let routes = [
    { path: '', pathMatch: 'full', redirectTo: 'plans' },
    { path: 'projects', component: Projects },
    {
        path: 'backlog', component: Backlog,
        children: [
            { path: '', component: BacklogComponent },
            { path: 'story/new', component: StoryComponent },
            { path: 'story/:id', component: StoryComponent }
        ]
    },
    {
        path: 'plans', component: Plans,
        children: [
            { path: '', component: PlanContentComponent }
        ]
    },
    {
        path: 'defects', component: DefectPage,
        children: [
            { path: '', component: DefectContent },
            { path: ':id', component: DefectDetail }
        ]
    },
    { path: 'items', component: WorkItems },
    { path: 'login', component: LoginComponent },
];

export class ShelfRequestOptions extends RequestOptions {
    constructor() {
        super({
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: ''
        });
    }
}

@NgModule({
    declarations: [
        LoginComponent,
        PlanList,
        Projects,
        Backlog,
        Plans,
        WorkItems,
        ShelfAppComponent,
        PlanContentComponent,
        PlanCreatorComponent,
        StoryComponent,
        BacklogComponent,
        DeleteConfirmDialog,
        SelectPlanDialog,
        AboutDialog,
        ItemDetailDialog,
        MoveItemsDialog,
        RemoveConfirmDialog,
        CreateProjectDialog,
        CreateTeamDialog,
        DefectPage,
        DefectDetail,
        DefectContent,
        ProjectSelectorComponent
    ],
    providers: [
        NotifyService,
        HttpService,
        TeamService,
        ProjectService,
        StoryService,
        PreferenceService,
        PlanService,
        UserService,
        DefectService,
        TaskService,
        AppService,
        LoginService,
        { provide: RequestOptions, useClass: ShelfRequestOptions },
        { provide: LocationStrategy, useClass: HashLocationStrategy }
    ],
    imports: [
        BrowserModule,
        HttpModule,
        FormsModule,
        CKEditorModule,
        MaterialModule,
        RouterModule.forRoot(routes),
        BrowserAnimationsModule
    ],
    entryComponents: [
        DeleteConfirmDialog,
        SelectPlanDialog,
        AboutDialog,
        ItemDetailDialog,
        MoveItemsDialog,
        RemoveConfirmDialog,
        CreateProjectDialog,
        CreateTeamDialog
    ],
    bootstrap: [ShelfAppComponent],
})
export class ShelfModule {
}