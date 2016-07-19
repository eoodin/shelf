"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var ng2_bootstrap_1 = require('ng2-bootstrap/ng2-bootstrap');
var moment = require('moment');
var plan_list_ts_1 = require('../components/plan-list.ts');
var item_detail_ts_1 = require('../components/item-detail.ts');
var modal_dialog_ts_1 = require('../components/modal-dialog.ts');
var Plans = (function () {
    function Plans(ele, jsonp, prjs, pref) {
        var _this = this;
        this.ele = ele;
        this.jsonp = jsonp;
        this.prjs = prjs;
        this.pref = pref;
        this.current = {};
        this.workItems = [];
        this.plans = [];
        this.sort = {};
        this.hideFinished = false;
        this.project = null;
        this.ui = {
            'loading': { 'show': false },
            'awd': { 'show': false, 'loading': false, 'item': {} },
            'mtd': { 'show': false },
            'rwd': { 'show': false },
            'calendar': { 'show': false }
        };
        prjs.current.subscribe(function (p) { return _this.project = p; });
        prjs.plans.subscribe(function (plans) { return _this.plans = plans; });
        pref.values.subscribe(function (ps) { return _this.hideFinished = ps.hideFinished; });
    }
    Plans.prototype.onSelect = function (plan) {
        var _this = this;
        if (this.current != plan) {
            this.current = plan;
            this.loadWorkItems();
            var current = this.project;
            if (!this.members && current && current.team) {
                this.jsonp.get('/api/teams/' + current.team['id'] + '/members')
                    .subscribe(function (resp) { return _this.members = resp.json(); });
            }
        }
    };
    Plans.prototype.onHideFinishedCheck = function () {
        this.pref.setPreference('hideFinished', !this.hideFinished);
    };
    Plans.prototype.moveItemsToPlan = function (planId) {
        var _this = this;
        var ids = this.getSelectedWorkItemIds();
        if (!ids.length) {
            alert("No selected work item.");
            return;
        }
        this.jsonp.post('/api/plans/' + planId + '/move-in', JSON.stringify(ids))
            .subscribe(function (resp) { return _this.onMoveToPlanResponse(resp); });
    };
    Plans.prototype.onMoveToPlanResponse = function (response) {
        this.ui.mtd.show = false;
        this.loadWorkItems();
    };
    Plans.prototype.showAddItem = function (type) {
        this.ui.awd.item = { 'planId': this.current['id'] };
        this.ui.awd.type = type;
        if (type) {
            this.ui.awd.item.type = type;
            this.ui.awd.item.severity = 'Major';
        }
        this.ui.awd.show = true;
    };
    Plans.prototype.showItem = function (item) {
        this.ui.awd.item = JSON.parse(JSON.stringify(item));
        this.ui.awd.show = true;
    };
    Plans.prototype.removingItem = function (item) {
        this.ui.rwd.item = item;
        this.ui.rwd.show = true;
    };
    Plans.prototype.removeItem = function (item) {
        var _this = this;
        this.jsonp.delete('/api/work-items/' + item.id)
            .subscribe(function (resp) {
            _this.loadWorkItems();
            _this.ui.rwd.show = false;
        });
    };
    Plans.prototype.getShowingItems = function () {
        if (this.hideFinished)
            return this.workItems.filter(function (i) { return i.status != 'Finished'; });
        else
            return this.workItems;
    };
    Plans.prototype.changeStatus = function (item, status) {
        var _this = this;
        this.ui.loading.show = true;
        var change = { 'status': status };
        this.jsonp.put('api/work-items/' + item.id, JSON.stringify(change))
            .subscribe(function (resp) { return _this.onStatusUpdate(resp); });
    };
    Plans.prototype.assignTo = function (item, member) {
        var _this = this;
        this.ui.loading.show = true;
        member = member || { userId: -1 };
        var change = { 'ownerId': member.userId };
        this.jsonp.put('api/work-items/' + item.id, JSON.stringify(change))
            .subscribe(function (resp) { return _this.onStatusUpdate(resp); });
    };
    Plans.prototype.onWorkSaved = function (resp) {
        this.ui.awd.show = false;
        this.loadWorkItems();
    };
    Plans.prototype.onStatusUpdate = function (resp) {
        this.ui.loading.show = false;
        this.loadWorkItems();
    };
    Plans.prototype.sortResult = function (field) {
        if (field == this.sort['field'])
            this.sort['order'] = this.sort['order'] == 'desc' ? 'asc' : 'desc';
        else
            this.sort['order'] = 'asc';
        this.sort['field'] = field;
        this.loadWorkItems();
    };
    Plans.prototype.detailClosed = function () {
        this.ui.awd.show = false;
    };
    Plans.prototype.loadWorkItems = function () {
        var _this = this;
        var fetchUrl = '/api/work-items/?planId=' + this.current['id'];
        if (this.sort['field']) {
            fetchUrl += '&sortBy=' + this.sort['field'];
            this.sort['order'] == 'desc' && (fetchUrl += '&desc=true');
        }
        this.jsonp.get(fetchUrl)
            .subscribe(function (resp) { return _this.workItems = resp.json(); });
    };
    Plans.prototype.date = function (epoch) {
        if (!epoch && epoch !== 0)
            return '----------';
        return moment(epoch).format("YYYY-MM-DD");
    };
    Plans.prototype.sumHours = function () {
        var total = 0;
        this.workItems.forEach(function (i) { total += i.estimation; });
        return total;
    };
    Plans.prototype.getSelectedWorkItemIds = function () {
        var selected = [];
        this.workItems.forEach(function (wi) {
            if (wi.checked) {
                selected.push(wi.id);
            }
        });
        return selected;
    };
    Plans = __decorate([
        core_1.Component({
            selector: 'plans',
            directives: [plan_list_ts_1.PlanList, item_detail_ts_1.ItemDetail, modal_dialog_ts_1.ModalDialog, ng2_bootstrap_1.DROPDOWN_DIRECTIVES, ng2_bootstrap_1.BUTTON_DIRECTIVES],
            template: "\n    <div class=\"row plan-page\" *ngIf=\"project\">\n        <div class=\"col-sm-2\">\n            <plan-list [project]=\"project\" (select)=\"onSelect($event)\"></plan-list>\n        </div>\n    \n        <div class=\"col-sm-offset-2 col-md-offset-2 right\">\n            <div class=\"plan-head\" *ngIf=\"current.id\">\n                <h1>{{current.name}} <a href=\"javascript: void(0);\" (click)=\"ui.calendar.show = true;\"><span class=\"glyphicon glyphicon-calendar\"></span></a></h1>\n                <ul class=\"summary\">\n                    <li *ngIf=\"current.start\">Start: <span>{{date(current.start)}}</span></li>\n                    <li *ngIf=\"current.end\">Deadline: <span>{{date(current.end)}}</span></li>\n                    <li *ngIf=\"current.allocation\">Time(remain/planned): <span>{{sumHours()}}/{{current.allocation.developerHours + current.allocation.testerHours}}</span></li>\n                    <li *ngIf=\"current.allocation\">Progress: <span> x/x </span></li>\n                </ul>\n            </div>\n            <div class=\"project-info\">\n                <div class=\"project-operations\">\n                    <button class=\"btn btn-warning\" (click)=\"showAddItem('Defect')\">Report A Problem</button>\n                </div>\n            </div>\n            <div class=\"plan-body\">\n                <div class=\"item-table\">\n                    <div class=\"loading-mask\" *ngIf=\"ui.loading.show\">\n                        <div class=\"spinner-loader\"></div>\n                    </div>\n                    <div class=\"panel panel-default\">\n                        <div class=\"panel-heading work-items-heading\">\n                            <div>\n                                <label  >\n                                    <input type=\"checkbox\" [(ngModel)]=\"hideFinished\"  (click)=\"loadWorkItems();\" (click)=\"onHideFinishedCheck()\"/>\n                                    Hide Finished\n                                </label>\n                            </div>\n                        </div>\n                        <table *ngIf=\"workItems\" class=\"table\">\n                            <tr>\n                                <th>\n                                    <a href=\"javascript:void(0);\" (click)=\"sortResult('id')\">ID\n                                    <span *ngIf=\"sort.field=='id'\">\n                                        <span class=\"glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}\"></span>\n                                    </span>\n                                    </a>\n                                </th>\n                                <th>\n                                    <a href=\"javascript:void(0);\" (click)=\"sortResult('title')\">Title\n                                    <span *ngIf=\"sort.field=='title'\">\n                                        <span class=\"glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}\"></span>\n                                    </span>\n                                    </a>\n                                </th>\n                                <th>\n                                    <a href=\"javascript:void(0);\" (click)=\"sortResult('status')\">Status\n                                    <span *ngIf=\"sort.field=='status'\">\n                                        <span class=\"glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}\"></span>\n                                    </span>\n                                    </a>\n                                </th>\n                                <th><a href=\"javascript:void(0);\" (click)=\"sortResult('owner')\">Owner\n                                    <span *ngIf=\"sort.field=='owner'\">\n                                        <span class=\"glyphicon glyphicon-triangle-{{sort.order=='desc' ? 'bottom' : 'top'}}\"></span>\n                                    </span>\n                                </a>\n                                </th>\n                                <th>Remaining</th>\n                                <th>Operations</th>\n                            </tr>\n                            <tr *ngFor=\"let item of getShowingItems()\">\n                                <td class=\"type-and-id\">\n                                    <label>\n                                        <input class=\"checkbox\" [(ngModel)]=\"item.checked\" type=\"checkbox\">\n                                        <span *ngIf=\"item.type=='UserStory'\" class=\"us glyphicon glyphicon-edit\"></span>\n                                        <span *ngIf=\"item.type=='Defect'\" class=\"defect glyphicon glyphicon-fire\"></span>\n                                        <span *ngIf=\"item.type=='Task'\" class=\"task glyphicon glyphicon-check\"></span>\n                                        {{item.id}}\n                                    </label>\n                                </td>\n                                <td><a (click)=\"showItem(item)\">{{item.title}}</a></td>\n                                <td>\n                                    <div class=\"btn-group\" dropdown keyboardNav>\n                                        <button class=\"btn btn-default btn-sm dropdown-toggle\" dropdownToggle type=\"button\"\n                                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                                            {{item.status}} <span class=\"caret\"></span>\n                                        </button>\n                                        <ul class=\"dropdown-menu\">\n                                            <li role=\"menuitem\"\n                                                *ngFor=\"let st of ['New','InProgress','','Finished','Pending','Dropped']\"\n                                                [class.hidden]=\"st == item.status\">\n                                                <a (click)=\"changeStatus(item, st)\">{{st}}</a>\n                                            </li>\n                                        </ul>\n                                    </div>\n                                </td>\n                                <td>\n                                    <div class=\"btn-group\" dropdown keyboardNav>\n                                        <button class=\"btn btn-default btn-sm dropdown-toggle\" dropdownToggle type=\"button\"\n                                                data-toggle=\"dropdown\" aria-haspopup=\"true\" aria-expanded=\"false\">\n                                            <span *ngIf=\"item.owner\">{{item.owner.name}}</span> \n                                            <span *ngIf=\"!item.owner\">Unassigned</span> <span class=\"caret\"></span>\n                                        </button>\n                                        <ul class=\"dropdown-menu\">\n                                            <li role=\"menuitem\"><a (click)=\"assignTo(item, null)\">Unassigned</a></li>\n                                            <li role=\"menuitem\"\n                                                *ngFor=\"let member of members\"\n                                                [class.hidden]=\"member == item.owner\"><a\n                                                    (click)=\"assignTo(item, member)\">{{member.name}}</a></li>\n                                        </ul>\n                                    </div>\n                                </td>\n                                <td>{{item.estimation}}</td>\n                                <td>\n                                    <a (click)=\"removingItem(item)\"><span class=\"glyphicon glyphicon-remove\"></span></a>\n                                </td>\n                            </tr>\n                        </table>\n                    </div>\n                </div>\n                <div>\n                    <div class=\"col-sm-2\">\n                        <button class=\"btn btn-primary\" (click)=\"showAddItem()\">Add Work Item...</button>\n                    </div>\n                    <div class=\"col-sm-6\">\n                        <button class=\"btn btn-primary\" (click)=\"ui.mtd.show = true\">Move To...</button>\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n    \n    <div class=\"row\" *ngIf=\"project == null\">\n        <h1 class=\"no-content-notice\">No project.</h1>\n    </div>\n    \n    <item-detail [item]=\"ui.awd.item\"\n                 [show]=\"ui.awd.show\"\n                 [type]=\"ui.awd.type\"\n                 (closed)=\"ui.awd.show = false\"\n                 (saved)=\"onWorkSaved();\">\n    </item-detail>\n    \n    <modal-dialog [(show)]=\"ui.mtd.show\" [title]=\"'Move selected items to plan'\">\n        <div dialog-body>\n            <select #moveTo class=\"form-control\" required>\n                <option *ngFor=\"let p of plans\" [value]=\"p.id\">{{p.name}}</option>\n            </select>\n        </div>\n        <div dialog-footer class=\"modal-footer\">\n            <button (click)=\"ui.mtd.show=false;\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n            <button (click)=\"moveItemsToPlan(moveTo.value)\" class=\"btn btn-default\" data-dismiss=\"modal\">Move</button>\n        </div>\n    </modal-dialog>\n\n    <modal-dialog [(show)]=\"ui.rwd.show\" [title]=\"'Confirm to remove work item'\">\n        <div dialog-body>\n            You are about to remove work item <span *ngIf=\"ui.rwd.item\">{{ui.rwd.item.id}}</span>. Are you sure?\n        </div>\n        <div dialog-footer class=\"modal-footer\">\n            <button (click)=\"ui.rwd.show =false;\" class=\"btn btn-default\" data-dismiss=\"modal\">Cancel</button>\n            <button (click)=\"removeItem(ui.rwd.item)\" class=\"btn btn-default\" data-dismiss=\"modal\">Remove</button>\n        </div>\n    </modal-dialog>\n    \n    <modal-dialog [(show)]=\"ui.calendar.show\" [title]=\"'Clendar'\">\n        <div dialog-body>\n            <table class=\"month\">\n                <tr>\n                    <th>Sun</th><th>Mon</th><th>Tue</th><th>Wen</th><th>Thu</th><th>Fri</th><th>Sat</th>\n                </tr>\n                <tr>\n                    <td></td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td>\n                </tr>\n                <tr>\n                    <td>7</td><td>8</td><td>9</td><td>10</td><td>11</td><td>12</td><td>13</td>\n                </tr>\n                <tr>\n                    <td>14</td><td>15</td><td>16</td><td>17</td><td>18</td><td>19</td><td>20</td>\n                </tr>\n                <tr>\n                    <td>21</td><td>22</td><td>23</td><td>24</td><td>25</td><td>26</td><td>27</td>\n                </tr>\n                <tr>\n                    <td>28</td><td>29</td><td>30</td><td>31</td><td></td><td></td><td></td>\n                </tr>\n            </table>\n        </div>\n    </modal-dialog>\n    ",
            styles: ["\n    .project-info { height:40px; padding: 2px 0;}\n    .project-operations { float: right;}\n    .plan-page {padding-bottom: 15px;}\n    .work-items-heading > div{float:right;}\n    .work-items-heading { height: 38px; }\n    .right{ padding: 0 15px; }\n    .awd .modal-body .row {padding: 5px 0;}\n    a:hover {cursor: pointer;}\n    [ngcontrol='title'] { width: 100%; }\n    .plan-head h1 {font-size: 18px; margin: 0;}\n    .plan-head ul {padding-left: 0;}\n    .plan-head ul li {list-style: none; font-weight: bold; display:inline-block; width: 218px}\n    .plan-head ul li span {font-weight: normal}\n    .item-table{position:relative;}\n    .checkbox{margin:0; width: 22px; height: 22px;}\n    .loading-mask {position: absolute; width: 100%; height: 100%; z-index: 1001; padding: 50px 50%; background-color: rgba(0,0,0,0.07);}\n    .type-and-id .glyphicon {margin-right: 8px;}\n    .us.glyphicon{color: #050;}\n    .defect.glyphicon{color: #500;}\n    .task.glyphicon{color: #333;}\n    .type-and-id input { display: inline-block; }\n    .month{width: 100%;}\n    "]
        })
    ], Plans);
    return Plans;
}());
exports.Plans = Plans;
//# sourceMappingURL=plans.js.map