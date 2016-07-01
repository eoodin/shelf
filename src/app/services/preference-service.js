"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var BehaviorSubject_1 = require('rxjs/BehaviorSubject');
var PreferenceService = (function () {
    function PreferenceService(jsonp, us) {
        var _this = this;
        this.jsonp = jsonp;
        this.us = us;
        this._currentUser = null;
        this._values = new BehaviorSubject_1.BehaviorSubject([]);
        us.currentUser
            .do(function (u) { return _this._currentUser = u; })
            .subscribe(function (u) { return _this.load(u); });
    }
    Object.defineProperty(PreferenceService.prototype, "values", {
        get: function () {
            return this._values;
        },
        enumerable: true,
        configurable: true
    });
    PreferenceService.prototype.load = function (user) {
        var _this = this;
        this.jsonp.get('/api/users/' + user.userId + '/preferences')
            .map(function (resp) { return resp.json(); })
            .subscribe(function (prefs) {
            _this._values.next(prefs);
        });
    };
    PreferenceService.prototype.setPreference = function (name, value) {
        var _this = this;
        this.us.currentUser.subscribe(function (user) {
            _this.jsonp.put('/api/users/' + user.userId + '/preferences?name=' + name + "&value=" + value, '{}')
                .subscribe();
        });
    };
    PreferenceService = __decorate([
        core_1.Injectable()
    ], PreferenceService);
    return PreferenceService;
}());
exports.PreferenceService = PreferenceService;
//# sourceMappingURL=preference-service.js.map