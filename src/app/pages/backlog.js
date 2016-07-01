"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var ng2_bootstrap_1 = require('ng2-bootstrap/ng2-bootstrap');
var plan_list_ts_1 = require('../components/plan-list.ts');
var item_detail_ts_1 = require('../components/item-detail.ts');
var Backlog = (function () {
    function Backlog(ele, jsonp, prs, pref) {
        var _this = this;
        this.ele = ele;
        this.jsonp = jsonp;
        this.prs = prs;
        this.pref = pref;
        this.project = null;
        this.items = [];
        this.requesting = false;
        this.ui = {
            'loading': { 'show': false },
            'awd': { 'show': false, 'loading': false, 'item': {} },
            'mtd': { 'show': false },
            'rwd': { 'show': false }
        };
        prs.current
            .filter(function (p) { return p != _this.project; })
            .do(function (p) { return _this.project = p; })
            .subscribe(function (p) { return _this.loadItems(); });
    }
    Backlog.prototype.loadItems = function () {
        var _this = this;
        this.jsonp.get('/api/projects/' + this.project.id + '/backlog')
            .subscribe(function (b) { return _this.items = b.json(); });
    };
    Backlog.prototype.showAddItem = function (type) {
        this.ui.awd.type = type;
        this.ui.awd.item.type = type;
        if (this.project)
            this.ui.awd.item.projectId = this.project.id;
        if (type == 'Defect')
            this.ui.awd.item.severity = 'Major';
        this.ui.awd.show = true;
    };
    Backlog.prototype.startFix = function (item) {
        var _this = this;
        this.requesting = true;
        this.jsonp.post('/api/defects/' + item.id + '/fix', '{}')
            .subscribe(function () { return _this.loadItems(); }, function () { return window.alert('Error occurred.'); }, function () { return _this.requesting = false; });
    };
    Backlog.prototype.startTest = function (item) {
        var _this = this;
        this.requesting = true;
        this.jsonp.post('/api/defects/' + item.id + '/test', '{}')
            .subscribe(function () { return _this.loadItems(); }, function () { return window.alert('Error occurred.'); }, function () { return _this.requesting = false; });
    };
    Backlog.prototype.showItem = function (item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        this.ui.awd.show = true;
    };
    Backlog.prototype.removingItem = function (item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    };
    Backlog.prototype.removeItem = function (item) {
        var _this = this;
        this.jsonp.delete('/api/work-items/' + item.id)
            .subscribe(function (resp) {
            _this.loadItems();
            _this.ui.rwd.show = false;
        });
    };
    Backlog.prototype.sortResult = function (field) {
        if (field == this.sort.field)
            this.sort.order = this.sort.order == 'desc' ? 'asc' : 'desc';
        else
            this.sort.order = 'asc';
        this.sort.field = field;
        this.loadItems();
    };
    Backlog = __decorate([
        core_1.Component({
            selector: 'plans',
            directives: [plan_list_ts_1.PlanList, item_detail_ts_1.ItemDetail, ng2_bootstrap_1.DROPDOWN_DIRECTIVES, ng2_bootstrap_1.BUTTON_DIRECTIVES],
            template: "\n    <div class=\"plan-page\" *ngIf=\"project\">\n        <div class=\"project-info\">\n            <div class=\"project-operations\">\n                <button class=\"btn btn-primary\" (click)=\"showAddItem('UserStory')\">Write User Story...</button>\n                <button class=\"btn btn-warning\" (click)=\"showAddItem('Defect')\">Report Problem...</button>\n            </div>\n        </div>\n        <div class=\"plan-body\">\n            <div class=\"item-table\">\n                <div class=\"loading-mask\" *ngIf=\"ui.loading.show\">\n                    <div class=\"spinner-loader\"></div>\n                </div>\n                <div class=\"panel panel-default\">\n                    <table *ngIf=\"items\" class=\"table\">\n                        <tr>\n                            <th> ID </th>\n                            <th> Type </th>\n                            <th> State </th>\n                            <th> Title </th>\n                            <th> Owner </th>\n                            <th> Operations </th>\n                        </tr>\n                        <tr *ngFor=\"let item of items\">\n                            <td> {{item.id}} </td>\n                            <td> {{item.type}} </td>\n                            <td *ngIf=\"item.type != 'Defect'\"> {{item.status}} </td>\n                            <td *ngIf=\"item.type == 'Defect'\"> {{item.state}} </td>\n                            <td><a (click)=\"showItem(item)\"> {{item.title}} </a></td>\n                            <td *ngIf=\"item.owner\"> {{item.owner.name}} </td>\n                            <td *ngIf=\"!item.owner\"> Unassigned </td>\n                            <td>\n                                <button \n                                    *ngIf=\"item.type == 'Defect' && item.state == 'Created'\"\n                                    [disabled]=\"requesting\"\n                                    (click)=\"startFix(item)\"\n                                     class=\"btn btn-default btn-sm\">Start Fix</button>\n                                <button \n                                    *ngIf=\"item.type == 'Defect' && item.state == 'Fixed'\"\n                                    [disabled]=\"requesting\"\n                                    (click)=\"startTest(item)\"\n                                    class=\"btn btn-default btn-sm\">Start Test</button>\n                                <!--\n                                <button \n                                    *ngIf=\"item.type == 'Defect' && item.state == 'Testing'\"\n                                    [disabled]=\"requesting\"\n                                    (click)=\"markTestResult(true)\"\n                                    class=\"btn btn-default btn-sm\">Pass</button>\n                                <button \n                                    *ngIf=\"item.type == 'Defect' && item.state == 'Testing'\"\n                                    [disabled]=\"requesting\"\n                                    (click)=\"markTestResult(false)\"\n                                    class=\"btn btn-default btn-sm\">Fail</button>\n                                -->\n                            </td>\n                        </tr>\n                    </table>\n                </div>\n            </div>\n            <div>\n                <div class=\"col-sm-2\">\n                    \n                </div>\n            </div>\n        </div>\n    </div>\n    \n    <item-detail [item]=\"ui.awd.item\"\n                 [show]=\"ui.awd.show\"\n                 [type]=\"ui.awd.type\"\n                 (closed)=\"ui.awd.show = false\"\n                 (saved)=\"loadItems();\">\n    </item-detail>\n\n    <div class=\"modal fade in awd\" *ngIf=\"ui.mtd.show\" [style.display]=\"ui.mtd.show ? 'block' : 'block'\" role=\"dialog\">\n        <div class=\"modal-dialog\">\n            <div class=\"modal-content\">\n                <div class=\"modal-header\">\n                    <button type=\"button\" class=\"close\" (click)=\"ui.mtd.show = false\"\n                            data-dismiss=\"modal\">&times;</button>\n                    <h4 class=\"modal-title\">Move selected items to plan</h4>\n                </div>\n                <div class=\"modal-body\">\n                    <select #moveTo class=\"form-control\" required>\n                        <option *ngFor=\"let p of plans\" [value]=\"p.id\">{{p.name}}</option>\n                    </select>\n                </div>\n                <div class=\"modal-footer\">\n                    <button (click)=\"ui.mtd.show=false;\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n                    <button (click)=\"moveItemsToPlan(moveTo.value)\" class=\"btn btn-default\" data-dismiss=\"modal\">Move</button>\n                </div>\n            </div>\n        </div>\n    </div>\n    ",
            styles: ["\n    .project-info { height:40px; padding: 2px 0;}\n    .project-operations { float: right;}\n    .plan-page {padding-bottom: 15px;}\n    .work-items-heading > div{float:right;}\n    .work-items-heading { height: 38px; }\n    .right{ padding: 0 15px; }\n    .awd .modal-body .row {padding: 5px 0;}\n    a:hover {cursor: pointer;}\n    [ngcontrol='title'] { width: 100%; }\n    .plan-head h1 {font-size: 18px; margin: 0;}\n    .plan-head ul {padding-left: 0;}\n    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}\n    .plan-head ul li span {font-weight: normal}\n    .item-table{position:relative;}\n    .checkbox{margin:0; width: 22px; height: 22px;}\n    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}\n    .us.glyphicon{color: #050;}\n    .defect.glyphicon{color: #500;}\n    .task.glyphicon{color: #333;}\n    .type-and-id input { display: inline-block; }\n    "],
            styleUrls: ['../../deps/css/css-spinner.css']
        })
    ], Backlog);
    return Backlog;
}());
exports.Backlog = Backlog;
//# sourceMappingURL=backlog.js.map