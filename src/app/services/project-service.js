"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var BehaviorSubject_1 = require('rxjs/BehaviorSubject');
var ProjectService = (function () {
    function ProjectService(jsonp, prf) {
        var _this = this;
        this.jsonp = jsonp;
        this.prf = prf;
        this.loading = false;
        this._current = new BehaviorSubject_1.BehaviorSubject(null);
        this._projects = new BehaviorSubject_1.BehaviorSubject([]);
        this._plans = new BehaviorSubject_1.BehaviorSubject([]);
        this._current
            .filter(function (p) { return p != null; })
            .map(function (p) { return p.id; })
            .do(function (pid) { return _this.loadPlans(pid); })
            .filter(function (p) { return !_this.loading; })
            .subscribe(function (id) { return _this.prf.setPreference("lastProjectId", id); });
        this.prf.values
            .filter(function (prefs) { return prefs['lastProjectId']; })
            .subscribe(function (prefs) { return _this.lastProjectId = prefs['lastProjectId']; });
        this._projects
            .filter(function (projects) { return !projects.length; })
            .subscribe(function () { return _this._current.next(null); });
        this._projects
            .filter(function (projects) { return projects.length; })
            .filter(function (projects) { return _this.loading; })
            .subscribe(function (projects) {
            var select = projects[0];
            _this.prf.values
                .filter(function (prefs) { return prefs['lastProjectId']; })
                .subscribe(function (prefs) {
                projects
                    .filter(function (p) { return p.id == prefs['lastProjectId']; })
                    .forEach(function (p) { return select = p; });
                if (select != _this._current.getValue()) {
                    _this._current.next(select);
                }
            });
        });
    }
    ProjectService.prototype.setCurrent = function (p) {
        this._current.next(p);
    };
    Object.defineProperty(ProjectService.prototype, "current", {
        get: function () {
            return this._current;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectService.prototype, "projects", {
        get: function () {
            return this._projects;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(ProjectService.prototype, "plans", {
        get: function () {
            return this._plans;
        },
        enumerable: true,
        configurable: true
    });
    ProjectService.prototype.load = function () {
        var _this = this;
        this.loading = true;
        this.jsonp.get('/api/projects/')
            .map(function (resp) { return resp.json(); })
            .subscribe(function (projects) {
            _this._projects.next(projects);
            _this.loading = false;
        }, function () { return _this.loading = false; }, function () { return _this.loading = false; });
    };
    ProjectService.prototype.loadPlans = function (pid) {
        var _this = this;
        this.jsonp.get('/api/plans/?project=' + pid)
            .map(function (resp) { return resp.json(); })
            .subscribe(function (plans) { return _this._plans.next(plans); });
    };
    ProjectService.prototype.reload = function () {
        return this.load();
    };
    ProjectService = __decorate([
        core_1.Injectable()
    ], ProjectService);
    return ProjectService;
}());
exports.ProjectService = ProjectService;
//# sourceMappingURL=project-service.js.map