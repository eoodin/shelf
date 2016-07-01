"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
require('rxjs/add/operator/map');
require('rxjs/add/operator/do');
require('rxjs/add/operator/filter');
var PlanList = (function () {
    function PlanList(jsonp, pref, prjs) {
        var _this = this;
        this.jsonp = jsonp;
        this.pref = pref;
        this.prjs = prjs;
        this.project = {};
        this._plans = [];
        this.select = new core_1.EventEmitter();
        this.ui = { cpd: { show: false } };
        prjs.current
            .filter(function (id) { return id; })
            .do(function (p) { return _this.project = p; })
            .map(function (p) { return p.id; })
            .subscribe(function (id) { _this.loadPlans(id); });
    }
    PlanList.prototype.loadPlans = function (pid) {
        var _this = this;
        this.jsonp.get('/api/plans/?project=' + pid)
            .subscribe(function (data) { return _this.setPlans(data); });
    };
    PlanList.prototype.setPlans = function (plans) {
        this._plans = plans;
        this.selected = null;
        if (plans && plans.length) {
            var list = this;
            this.pref.values.subscribe(function (_) {
                var selectPlan = plans[0];
                if (_['lastSelectedPlan']) {
                    for (var _i = 0, plans_1 = plans; _i < plans_1.length; _i++) {
                        var p = plans_1[_i];
                        if (p.id == _['lastSelectedPlan']) {
                            selectPlan = p;
                            break;
                        }
                    }
                }
                list.selectPlan(selectPlan);
            });
        }
    };
    PlanList.prototype.createPlan = function (data) {
        var _this = this;
        data['projectId'] = this.project['id'];
        this.jsonp.post('/api/plans/', JSON.stringify(data))
            .subscribe(function (resp) { return _this.loadPlans(_this.project['id']); });
        this.ui.cpd.show = false;
    };
    PlanList.prototype.clickedPlan = function (plan) {
        var _this = this;
        this.pref.values
            .filter(function (p) { return p['lastSelectedPlan'] != plan.id; })
            .subscribe(function () { return _this.pref.setPreference('lastSelectedPlan', plan.id); });
        this.selectPlan(plan);
    };
    PlanList.prototype.selectPlan = function (plan) {
        this.selected = plan;
        this.select.next(plan);
    };
    __decorate([
        core_1.Output()
    ], PlanList.prototype, "select");
    PlanList = __decorate([
        core_1.Component({
            selector: 'plan-list',
            template: "\n    <div class=\"list-group\">\n      <a class=\"list-group-item\" *ngFor=\"let plan of _plans\" [class.active]=\"plan == selected\" (click)=\"clickedPlan(plan)\"> {{plan.name}} </a>\n    </div>\n\n    <button class=\"btn btn-primary\" (click)=\"ui.cpd.show = true;\">New Sprint...</button>\n    <div class=\"modal fade in\" [style.display]=\"ui.cpd.show ? 'block' : 'none'\" role=\"dialog\">\n        <div class=\"modal-dialog\">\n            <form #f=\"ngForm\" (ngSubmit)=\"createPlan(f.value)\">\n                <div class=\"modal-content\">\n                    <div class=\"modal-header\">\n                        <button type=\"button\" class=\"close\" (click)=\"ui.cpd.show = false\" data-dismiss=\"modal\">&times;</button>\n                        <h4 class=\"modal-title\">New Sprint</h4>\n                    </div>\n                    <div class=\"modal-body\">\n                        <div class=\"row plan-field-row\">\n                            <div class=\"col-sm-3\">Sprint name:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"name\"></div>\n                        </div>\n                        <div class=\"row plan-field-row\">\n                            <div class=\"col-sm-3\">Start from:</div><div class=\"col-sm-5\"> <input type=\"date\" ngControl=\"start\"></div>\n                        </div>\n                        <div class=\"row plan-field-row\">\n                            <div class=\"col-sm-3\">Due date:</div><div class=\"col-sm-5\"> <input type=\"date\" ngControl=\"end\"></div>\n                        </div>\n                        <div class=\"row\"></div>\n                        <div class=\"row plan-field-row\">\n                            <div class=\"col-sm-3\">Developer hours:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"devHours\"></div>\n                        </div>\n                        <div class=\"row plan-field-row\">\n                            <div class=\"col-sm-3\">Tester hours:</div><div class=\"col-sm-5\"> <input type=\"text\" ngControl=\"tstHours\"></div>\n                        </div>\n                    </div>\n                    <div class=\"modal-footer\">\n                        <button type=\"submit\" class=\"btn btn-default\" data-dismiss=\"modal\">Add</button>\n                    </div>\n                </div>\n            </form>\n        </div>\n    </div>\n    ",
            styles: ["\n    ul li { list-style: none; font-size: 1.4em;}\n    .plan-field-row {padding: 5px 0;}\n    "]
        })
    ], PlanList);
    return PlanList;
}());
exports.PlanList = PlanList;
//# sourceMappingURL=plan-list.js.map