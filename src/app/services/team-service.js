"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var TeamService = (function () {
    function TeamService(http) {
        this.http = http;
        this._teams = [];
    }
    Object.defineProperty(TeamService.prototype, "teams", {
        get: function () {
            return this._teams;
        },
        set: function (projects) {
            this._teams = projects;
        },
        enumerable: true,
        configurable: true
    });
    TeamService.prototype.load = function () {
        var _this = this;
        this.http.get('/api/teams/')
            .subscribe(function (resp) { return _this.teams = resp.json(); });
    };
    TeamService.prototype.reload = function () {
        //TODO: update only changed/added/removed.
        this.load();
    };
    TeamService = __decorate([
        core_1.Injectable()
    ], TeamService);
    return TeamService;
}());
exports.TeamService = TeamService;
//# sourceMappingURL=team-service.js.map