"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var common_1 = require('@angular/common');
var modal_dialog_ts_1 = require("../components/modal-dialog.ts");
var Project = (function () {
    function Project() {
    }
    return Project;
}());
var Projects = (function () {
    function Projects(jsonp, prjs, teamService, us) {
        var _this = this;
        this.jsonp = jsonp;
        this.prjs = prjs;
        this.teamService = teamService;
        this.us = us;
        this.permitSA = false;
        this.ui = {
            createProjectDialog: { show: false, projectName: '' },
            createTeamDialog: { show: false }
        };
        this.teamService.reload();
        this.prjs.projects.subscribe(function (ps) {
            _this.projects = ps;
        });
        us.currentUser
            .subscribe(function (user) {
            _this.permitSA = user.roles.map(function (i) { return i.id; }).includes(1);
        });
    }
    Projects.prototype.deleteProject = function (p) {
        var _this = this;
        this.jsonp.delete('/api/projects/' + p.id)
            .subscribe(function () { return _this.prjs.reload(); });
    };
    Projects.prototype.onCreateProjectSubmit = function (data) {
        var _this = this;
        this.jsonp.post('/api/projects/', JSON.stringify(data))
            .subscribe(function () { return _this.prjs.reload(); });
        this.ui.createProjectDialog.show = false;
    };
    Projects.prototype.onCreateTeamSubmit = function (data) {
        var _this = this;
        data.users = data.users.split(',');
        this.jsonp.post('/api/teams/', JSON.stringify(data))
            .subscribe(function (resp) { return _this.teamService.reload(); });
        this.ui.createTeamDialog.show = false;
    };
    Projects.prototype.deleteTeam = function (team) {
        var _this = this;
        this.jsonp.delete('/api/teams/' + team.id)
            .subscribe(function (response) { return _this.teamService.reload(); });
    };
    Projects = __decorate([
        core_1.Component({
            selector: 'projects',
            directives: [modal_dialog_ts_1.ModalDialog, common_1.FORM_DIRECTIVES],
            template: "\n    <div class=\"row\">\n     <div class=\"col-sm-3\">\n      <div class=\"panel panel-default\">\n       <div class=\"panel-heading\">\n         <h3 class=\"panel-title\">Projects</h3>\n       </div>\n       <div class=\"panel-body\">\n        <ul class=\"sidebar-item-list\">\n            <li *ngFor=\"let project of projects\" >\n                <a href=\"#/plans?pid={{project.id}}\"><span class=\"main-title\">{{project.name}}</span></a>\n                <button *ngIf=\"permitSA\" class=\"btn btn-danger btn-sm\" (click)=\"deleteProject(project)\">Delete</button>\n            </li>\n        </ul>\n\n        <button *ngIf=\"permitSA\" class=\"btn btn-primary\" (click)=\"ui.createProjectDialog.show = true;\">New Project</button>\n       </div>\n      </div>\n\n\n      <div class=\"panel panel-default\">\n       <div class=\"panel-heading\">\n         <h3 class=\"panel-title\">Teams</h3>\n       </div>\n       <div class=\"panel-body\">\n        <ul class=\"sidebar-item-list\">\n            <li *ngFor=\"let team of teamService.teams\" >\n                <span class=\"main-title\">{{team.name}}</span>\n                <button *ngIf=\"permitSA\" class=\"btn btn-danger btn-sm\" (click)=\"deleteTeam(team)\">Delete</button>\n            </li>\n        </ul>\n        <button *ngIf=\"permitSA\" class=\"btn btn-primary\" (click)=\"ui.createTeamDialog.show = true;\">Add Team...</button>\n\n        <modal-dialog [(show)]=\"ui.createTeamDialog.show\" [title]=\"'Add New Team'\">\n            <div dialog-body>\n                <form #f=\"ngForm\" (ngSubmit)=\"onCreateTeamSubmit(f.value)\">\n                    <div class=\"row\">\n                        <div class=\"col-sm-3\">Team name:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"name\"></div>\n                    </div>\n    \n                    <div class=\"row\">\n                        <div class=\"col-sm-3\">Scrum master:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"scrumMaster\"></div>\n                    </div>\n    \n                    <div class=\"row\">\n                        <div class=\"col-sm-3\">Members:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"users\"></div>\n                    </div>\n                </form>\n            </div>\n            <div dialog-footer>\n                <button (click)=\"f.onSubmit()\" class=\"btn btn-default\" data-dismiss=\"modal\">Add</button>\n            </div>\n        </modal-dialog>\n        \n        <modal-dialog [(show)]=\"ui.createProjectDialog.show\" [title]=\"'Add New Project'\">\n            <div dialog-body>\n                <form #f=\"ngForm\" (ngSubmit)=\"onCreateProjectSubmit(f.value)\">\n                    <div class=\"row\">\n                        <div class=\"col-sm-3\">Project name:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"projectName\"></div>\n                    </div>\n                    <div class=\"row\">\n                        <div class=\"col-sm-3\">Team:</div>\n                        <div class=\"col-sm-5\">\n                           <select class=\"form-control\" required ngControl=\"teamId\">\n                              <option *ngFor=\"let t of teamService.teams\" [value]=\"t.id\">{{t.name}}</option>\n                           </select>\n                        </div>\n                    </div>\n                </form>\n            </div>\n            <div dialog-footer>\n                <button (click)=\"f.onSubmit()\" class=\"btn btn-default\" data-dismiss=\"modal\">Add</button>\n            </div>\n        </modal-dialog>\n       </div>\n      </div>\n\n      <div class=\"panel panel-default\">\n       <div class=\"panel-heading\">\n         <h3 class=\"panel-title\">References</h3>\n       </div>\n       <div class=\"panel-body\">\n        <ul class=\"project-list\">\n            <li *ngFor=\"let ref of [1,2,3,4]\" > Reference #{{ref}}</li>\n        </ul>\n       </div>\n      </div>\n     </div> <!-- col-sm-3 -->\n\n     <div class=\"col-sm-offset-3\">\n      <div class=\"panel panel-default\">\n       <div class=\"panel-heading\">\n         <h3 class=\"panel-title\">Project description</h3>\n       </div>\n       <div class=\"panel-body\" class=\"project-description\">\n        <p>This is description for the project TODO: add more meaningful description here.</p>\n       </div>\n      </div>\n\n      <div class=\"panel panel-default\">\n       <div class=\"panel-heading\">\n         <h3 class=\"panel-title\">Plans</h3>\n       </div>\n       <div class=\"panel-body project-plans\">\n        <ul class=\"project-list\">\n            <li *ngFor=\"let plan of ['Product backlog', 'Sprint 1', 'Sprint 2', 'Sprint 3']\" > &gt;&gt; {{plan}}</li>\n        </ul>\n       </div>\n      </div>\n\n     </div>\n    </div>\n    ",
            styles: ["\n    h1 {font-color: #aaa;}\n    .sidebar-item-list {padding: 0;}\n    .sidebar-item-list li { list-style: none; margin: 5px 0;}\n    .sidebar-item-list li button {float: right; }\n    .main-title { font-size: 1.6em; }\n    .sidebar-item-description {height: 120px;}\n    .sidebar-item-plans {height: 120px;}\n    "]
        })
    ], Projects);
    return Projects;
}());
exports.Projects = Projects;
//# sourceMappingURL=projects.js.map