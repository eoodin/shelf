"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var router_1 = require('@angular/router');
var ng2_bootstrap_1 = require('ng2-bootstrap/ng2-bootstrap');
var project_service_ts_1 = require('./services/project-service.ts');
var preference_service_ts_1 = require('./services/preference-service.ts');
var team_service_ts_1 = require('./services/team-service.ts');
var app_service_ts_1 = require("./services/app-service.ts");
var user_service_ts_1 = require("./services/user-service.ts");
var ShelfAppComponent = (function () {
    function ShelfAppComponent(router, location, prjs, pfs, apps) {
        var _this = this;
        this.router = router;
        this.location = location;
        this.prjs = prjs;
        this.pfs = pfs;
        this.apps = apps;
        this.project = null;
        this.app = {};
        prjs.projects.subscribe(function (ps) { return _this.projects = ps; });
        prjs.current.subscribe(function (p) { return _this.project = p; });
        pfs.values.subscribe(function () { return _this.prjs.load(); });
        apps.info.subscribe(function (app) { return _this.app = app; });
        this.ui = { "nav": { "projectList": { "show": false } } };
    }
    ShelfAppComponent.prototype.getLinkStyle = function (path) {
        if (path === this.location.path()) {
            return true;
        }
        else if (path.length > 0) {
            return this.location.path().indexOf(path) > -1;
        }
    };
    ShelfAppComponent.prototype.switchProject = function (p) {
        this.prjs.setCurrent(p);
    };
    ShelfAppComponent = __decorate([
        core_1.Component({
            selector: '[shelf-app]',
            template: "\n    <div class=\"app-page\">\n        <nav class=\"navbar navbar-default navbar-fixed-top\">\n          <div class=\"container-fluid\">\n            <div class=\"navbar-header\">\n              <button type=\"button\" class=\"navbar-toggle collapsed\" data-toggle=\"collapse\" data-target=\"#navbar\" aria-expanded=\"false\" aria-controls=\"navbar\">\n                <span class=\"sr-only\">Toggle navigation</span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n                <span class=\"icon-bar\"></span>\n              </button>\n              <a class=\"navbar-brand\" href=\"javascript:void(0);\"><img class=\"nav-logo\" src=\"/app/images/icon-large.png\"/></a>\n            </div>\n            <div class=\"collapse navbar-collapse\">\n              <ul class=\"nav navbar-nav\">\n                <li [class.active]=\"getLinkStyle('/projects')\"><a [routerLink]=\"['/Projects']\" class=\"link\">Dashboard</a></li>\n                <li [class.active]=\"getLinkStyle('/backlog')\"><a [routerLink]=\"['/Backlog']\" class=\"link\">Backlog</a></li>\n                <li [class.active]=\"getLinkStyle('/plans')\"><a [routerLink]=\"['/Plans']\" class=\"link\">Plans</a></li>\n                <li [class.active]=\"getLinkStyle('/workitems')\"><a [routerLink]=\"['/WorkItems']\" class=\"link\">Work Items</a></li>\n                <li [class.active]=\"getLinkStyle('/my-task')\"><a href=\"javascript:void(0);\" class=\"link\">CI Status</a></li>\n                <li [class.active]=\"getLinkStyle('/my-task')\"><a href=\"javascript:void(0);\" class=\"link\">Promotion Status</a></li>\n                <li [class.active]=\"getLinkStyle('/my-task')\"><a href=\"javascript:void(0);\" class=\"link\">Reports</a></li>\n\n                <li *ngIf=\"!projects.length\"><a href=\"javascript:void(0);\">No Project</a></li>\n                <li *ngIf=\"projects.length\" class=\"dropdown\" dropdown keyboard-nav>\n                    <a href=\"javascript:void(0);\" class=\"dropdown-toggle\" dropdownToggle>\n                        <span *ngIf=\"project\">{{project.name}}</span><span class=\"caret\"></span>\n                    </a>\n                    <ul class=\"dropdown-menu\" role=\"menu\" aria-labelledby=\"simple-btn-keyboard-nav\">\n                      <li *ngFor=\"let p of projects\" role=\"menuitem\">\n                        <a (click)=\"switchProject(p)\">{{p.name}}</a>\n                      </li>\n                    </ul>\n                 </li>\n              </ul>\n              <form class=\"navbar-form navbar-right\">\n                <div ><a href=\"javascript:void(0);\" title=\"{{app.commit}} at {{app.update}}\">{{app.version}}</a></div>\n                <!-- TODO: show user name/user settings entry here\n                <div class=\"form-group\">\n                  <input type=\"text\" placeholder=\"Email\" class=\"form-control\">\n                </div>\n                <div class=\"form-group\">\n                  <input type=\"password\" placeholder=\"Password\" class=\"form-control\">\n                </div>\n                <button type=\"submit\" class=\"btn btn-success\">Sign in</button>\n                -->\n              </form>\n            </div><!--/.nav-collapse -->\n          </div>\n        </nav>\n\n        <div class=\"container-fluid\">\n        <!--\n            <alert [type]=\"'warning'\" dismissible=\"true\">\n                <p>Notice: This tool is under development. Help us by submitting idea to \"Shelf\" project.</p>\n            </alert>\n          -->\n            <router-outlet></router-outlet>\n        </div>\n    </div>\n",
            styles: ["\n    a:hover {cursor: pointer;}\n    .app-page { padding-top: 70px; }\n    .nav-logo {width: 32px; height:32px;}\n    "],
            directives: [router_1.ROUTER_DIRECTIVES, ng2_bootstrap_1.DROPDOWN_DIRECTIVES],
            providers: [project_service_ts_1.ProjectService, preference_service_ts_1.PreferenceService, team_service_ts_1.TeamService, app_service_ts_1.AppService, user_service_ts_1.UserService]
        })
    ], ShelfAppComponent);
    return ShelfAppComponent;
}());
exports.ShelfAppComponent = ShelfAppComponent;
//# sourceMappingURL=shelf.component.js.map