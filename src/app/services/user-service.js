"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var BehaviorSubject_1 = require('rxjs/BehaviorSubject');
var UserService = (function () {
    function UserService(jsonp) {
        var _this = this;
        this.jsonp = jsonp;
        this._currentUser = new BehaviorSubject_1.BehaviorSubject(null);
        this.jsonp.get('/api/users/me')
            .map(function (resp) { return resp.json(); })
            .subscribe(function (user) { return _this._currentUser.next(user); });
    }
    Object.defineProperty(UserService.prototype, "currentUser", {
        get: function () {
            return this._currentUser.filter(function (u) { return u; });
        },
        enumerable: true,
        configurable: true
    });
    UserService = __decorate([
        core_1.Injectable()
    ], UserService);
    return UserService;
}());
exports.UserService = UserService;
//# sourceMappingURL=user-service.js.map